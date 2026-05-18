"use strict";
/**
 * 🚀 Production API + Webhook Server for Telegram Bot
 *
 * Runs alongside the Telegram bot on Railway (single service).
 * - Serves Telegram webhook endpoint (POST /webhook)
 * - Handles Mini App API endpoints (POST /api/validate, /api/order/reorder)
 * - Health check for Railway monitoring (GET /health)
 *
 * Architecture: Single Express server handles everything on one PORT.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.startApiServer = startApiServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto = __importStar(require("crypto"));
const env_1 = require("./config/env");
const firebase_1 = require("./config/firebase");
// ============================================================
// Rate Limiter (in-memory, per-IP)
// ============================================================
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX)
        return false;
    entry.count++;
    return true;
}
// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt)
            rateLimitMap.delete(key);
    }
}, 5 * 60 * 1000);
// ============================================================
// Telegram initData Validation
// ============================================================
function validateTelegramInitData(initData, botToken) {
    const parsed = new URLSearchParams(initData);
    const hash = parsed.get('hash');
    if (!hash) {
        return { data: Object.fromEntries(parsed), isValid: false };
    }
    parsed.delete('hash');
    const dataCheckString = Array.from(parsed.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    const computedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    const isValid = computedHash === hash;
    const result = {};
    for (const [key, value] of parsed.entries()) {
        result[key] = value;
    }
    return { data: result, isValid };
}
// ============================================================
// CORS Origins
// ============================================================
function getAllowedOrigins() {
    const origins = [
        'https://my-restaurant-app-de879.web.app',
        'https://my-restaurant-app-de879.firebaseapp.com',
    ];
    if (env_1.env.miniApp.url)
        origins.push(env_1.env.miniApp.url);
    // Railway public URL (for webhook / CORS)
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        origins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    // Local development
    origins.push('http://localhost:3000', 'http://localhost:3001');
    return origins;
}
// ============================================================
// Create Express App
// ============================================================
function createApp(bot) {
    const app = (0, express_1.default)();
    // ── Global Middleware ──
    app.use((0, cors_1.default)({
        origin: getAllowedOrigins(),
        methods: ['POST', 'GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'X-Telegram-Bot-Api-Secret-Token'],
    }));
    app.use(express_1.default.json({ limit: '1mb' }));
    // Request logging
    app.use((req, _res, next) => {
        console.log(`[API] ${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
    // ── Health Check (for Railway / uptime monitoring) ──
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'restaurant-bot',
            mode: env_1.env.bot.mode,
            uptime: process.uptime(),
        });
    });
    // ── Root: basic info ──
    app.get('/', (_req, res) => {
        res.json({
            service: env_1.env.restaurant.name,
            bot: env_1.env.bot.username,
            version: '1.0.0',
            docs: '/health',
        });
    });
    // ── Telegram Webhook Endpoint (only if bot provided) ──
    if (bot && env_1.env.bot.mode === 'webhook') {
        // Debug: log what webhookSecret is set to
        console.log(`[WEBHOOK] webhookSecret from env: "${env_1.env.bot.webhookSecret}" (length: ${env_1.env.bot.webhookSecret.length})`);
        // Telegraf webhook callback (processes the update)
        app.post('/webhook', bot.webhookCallback('/webhook'));
    }
    // ── POST /api/validate — Validate Telegram initData ──
    app.post('/api/validate', async (req, res) => {
        try {
            // Rate limiting
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            if (!checkRateLimit(ip)) {
                res.status(429).json({
                    valid: false,
                    error: 'طلبات كثيرة جداً. حاول مرة أخرى لاحقاً.',
                });
                return;
            }
            const { initData } = req.body;
            if (!initData || typeof initData !== 'string') {
                res.status(400).json({ valid: false, error: 'initData مطلوب' });
                return;
            }
            const botToken = env_1.env.bot.token;
            if (!botToken) {
                console.error('[API] BOT_TOKEN not configured');
                res.status(500).json({ valid: false, error: 'خطأ في تكوين الخادم' });
                return;
            }
            const { data, isValid } = validateTelegramInitData(initData, botToken);
            if (!isValid) {
                res.status(401).json({
                    valid: false,
                    error: 'بيانات Telegram غير صالحة',
                });
                return;
            }
            // Check freshness (max 5 minutes — prevents replay attacks)
            const authDate = parseInt(data.auth_date || '0', 10) * 1000;
            const isFresh = Date.now() - authDate < 5 * 60 * 1000;
            if (!isFresh) {
                res.status(401).json({
                    valid: false,
                    error: 'انتهت صلاحية الجلسة، يرجى إعادة فتح التطبيق',
                });
                return;
            }
            // Parse user
            let user = null;
            if (data.user) {
                try {
                    user = JSON.parse(data.user);
                }
                catch { /* ignore */ }
            }
            res.json({
                valid: true,
                user,
                auth_date: parseInt(data.auth_date || '0', 10),
                query_id: data.query_id,
            });
        }
        catch (error) {
            console.error('[API] Validation error:', error);
            res.status(500).json({ valid: false, error: 'فشل التحقق' });
        }
    });
    // ── POST /api/seed — Seed database with categories and menu items ──
    // ⚠️ TEMPORARY: Remove after seeding. Call: curl -X POST https://your-url.up.railway.app/api/seed
    app.post('/api/seed', async (_req, res) => {
        try {
            const db = (0, firebase_1.getFirestore)();
            // Check if already seeded
            const existing = await db.collection('categories').limit(1).get();
            if (!existing.empty) {
                const count = (await db.collection('categories').get()).size;
                const itemCount = (await db.collection('menu_items').get()).size;
                return res.json({ message: '✅ Database already seeded', categories: count, items: itemCount });
            }
            console.log('[SEED] Starting database seed...');
            // Categories
            const categories = [
                { name_ar: 'مقبلات', name_en: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', sort_order: 1, is_active: true },
                { name_ar: 'سلطات', name_en: 'Salads', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', sort_order: 2, is_active: true },
                { name_ar: 'برغر', name_en: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', sort_order: 3, is_active: true },
                { name_ar: 'بيتزا', name_en: 'Pizza', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', sort_order: 4, is_active: true },
                { name_ar: 'مشاوي', name_en: 'Grilled', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', sort_order: 5, is_active: true },
                { name_ar: 'مشروبات', name_en: 'Drinks', image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', sort_order: 6, is_active: true },
                { name_ar: 'حلويات', name_en: 'Desserts', image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', sort_order: 7, is_active: true },
            ];
            const catRefs = {};
            for (const cat of categories) {
                const ref = await db.collection('categories').add({
                    ...cat,
                    created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
                });
                catRefs[cat.name_ar] = ref.id;
                console.log(`[SEED] Category: ${cat.name_ar} -> ${ref.id}`);
            }
            // Menu items with per-category sort_order
            const menuItemGroups = {
                'مقبلات': [
                    { name_ar: 'حمص', name_en: 'Hummus', desc_ar: 'حمص بالطحينة مع زيت الزيتون', price: 15, featured: true },
                    { name_ar: 'متبل', name_en: 'Mutabbal', desc_ar: 'باذنجان مشوي مع الطحينة', price: 18 },
                    { name_ar: 'ورق عنب', name_en: 'Stuffed Grape Leaves', desc_ar: 'ورق عنب محشي أرز وخضار', price: 22 },
                    { name_ar: 'سمبوسك', name_en: 'Samosas', desc_ar: 'سمبوسك مقلي بحشوة اللحم والجبنة (4 حبات)', price: 16 },
                ],
                'سلطات': [
                    { name_ar: 'فتوش', name_en: 'Fattoush', desc_ar: 'سلطة خضار مع خبز مقرمش', price: 20 },
                    { name_ar: 'تبولة', name_en: 'Tabbouleh', desc_ar: 'برغل مع بقدونس وطماطم', price: 18, featured: true },
                    { name_ar: 'سلطة يونانية', name_en: 'Greek Salad', desc_ar: 'خس، طماطم، خيار، زيتون وجبنة فيتا', price: 22 },
                ],
                'برغر': [
                    { name_ar: 'برغر كلاسيك', name_en: 'Classic Burger', desc_ar: 'لحم بقري 200 جرام مع جبن وخس وطماطم', price: 35, featured: true },
                    { name_ar: 'برغر دجاج', name_en: 'Chicken Burger', desc_ar: 'صدر دجاج مقرمش مع مايونيز وخس', price: 32 },
                    { name_ar: 'دبل برغر', name_en: 'Double Burger', desc_ar: 'طبقتين لحم بقري مع جبن مزدوج', price: 45 },
                ],
                'بيتزا': [
                    { name_ar: 'بيتزا مارغريتا', name_en: 'Margherita', desc_ar: 'صلصة طماطم، موزاريلا، ريحان', price: 40, featured: true },
                    { name_ar: 'بيتزا بيبروني', name_en: 'Pepperoni', desc_ar: 'صلصة طماطم، موزاريلا، بيبروني', price: 45 },
                    { name_ar: 'بيتزا خضار', name_en: 'Vegetable Pizza', desc_ar: 'فلفل، زيتون، مشروم، بصل', price: 42 },
                ],
                'مشاوي': [
                    { name_ar: 'شيش طاووق', name_en: 'Shish Tawook', desc_ar: 'أسياخ دجاج مشوية مع الخضار', price: 38, featured: true },
                    { name_ar: 'كفتة', name_en: 'Kofta', desc_ar: 'كفتة لحم مشوية على الفحم', price: 35 },
                    { name_ar: 'شيش كباب', name_en: 'Shish Kebab', desc_ar: 'لحم بقري مشوي مع الأرز', price: 42 },
                ],
                'مشروبات': [
                    { name_ar: 'عصير برتقال طازج', name_en: 'Orange Juice', desc_ar: 'عصير برتقال طبيعي 100%', price: 12 },
                    { name_ar: 'كوكتيل', name_en: 'Fruit Cocktail', desc_ar: 'كوكتيل فواكه مشكلة', price: 15 },
                    { name_ar: 'ميرندا', name_en: 'Mirinda', desc_ar: 'مشروب غازي بنكهة البرتقال', price: 5 },
                    { name_ar: 'مياه معدنية', name_en: 'Water', desc_ar: 'مياه معدنية 500 مل', price: 3 },
                ],
                'حلويات': [
                    { name_ar: 'كنافة', name_en: 'Kunafa', desc_ar: 'كنافة نابلسية بالجبن', price: 25, featured: true },
                    { name_ar: 'أم علي', name_en: 'Om Ali', desc_ar: 'حلى أم علي بالعجين والمكسرات', price: 22 },
                    { name_ar: 'تشيز كيك', name_en: 'Cheesecake', desc_ar: 'تشيز كيك طبقة علوية من التوت', price: 28 },
                ],
            };
            let itemCount = 0;
            for (const [catName, items] of Object.entries(menuItemGroups)) {
                const catId = catRefs[catName];
                if (!catId) {
                    console.warn(`[SEED] No category ID for "${catName}"`);
                    continue;
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    await db.collection('menu_items').add({
                        category_id: catId,
                        name_ar: item.name_ar,
                        name_en: item.name_en,
                        description_ar: item.desc_ar,
                        description_en: '',
                        price: item.price,
                        image_url: '',
                        is_available: true,
                        is_featured: item.featured || false,
                        sort_order: i + 1,
                        has_addons: false,
                        created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
                        updated_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
                    });
                    itemCount++;
                }
            }
            console.log(`[SEED] Done: ${categories.length} categories, ${itemCount} items`);
            res.json({ success: true, categories: categories.length, items: itemCount });
        }
        catch (error) {
            console.error('[SEED] Error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    // ── POST /api/order/reorder — Reorder endpoint ──
    app.post('/api/order/reorder', async (req, res) => {
        try {
            const { initData, orderId } = req.body;
            if (!initData || !orderId) {
                res.status(400).json({ error: 'initData و orderId مطلوبان' });
                return;
            }
            // Validate initData
            const { isValid, data } = validateTelegramInitData(initData, env_1.env.bot.token);
            if (!isValid) {
                res.status(401).json({ error: 'بيانات غير صالحة' });
                return;
            }
            // Get the order from Firestore
            const orderSnap = await (0, firebase_1.getFirestore)()
                .collection('orders')
                .doc(orderId)
                .get();
            if (!orderSnap.exists) {
                res.status(404).json({ error: 'الطلب غير موجود' });
                return;
            }
            const orderData = orderSnap.data();
            if (!orderData) {
                res.status(404).json({ error: 'بيانات الطلب غير متوفرة' });
                return;
            }
            // Verify ownership
            const telegramId = data.user ? JSON.parse(data.user).id?.toString() : null;
            if (telegramId && orderData.customer?.telegram_id !== telegramId) {
                res.status(403).json({ error: 'هذا الطلب ليس لك' });
                return;
            }
            res.json({
                success: true,
                items: orderData.items || [],
                notes: orderData.notes || '',
            });
        }
        catch (error) {
            console.error('[API] Reorder error:', error);
            res.status(500).json({ error: 'فشل إعادة الطلب' });
        }
    });
    return app;
}
// ============================================================
// Start Server (used by index.ts)
// ============================================================
function startApiServer(bot) {
    const PORT = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);
    const app = createApp(bot);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🌐 Server listening on port ${PORT}`);
        if (bot && env_1.env.bot.mode === 'webhook') {
            const publicUrl = env_1.env.deployment.publicUrl;
            if (publicUrl) {
                const webhookUrl = `${publicUrl.replace(/\/$/, '')}/webhook`;
                console.log(`🔗 Setting webhook to: ${webhookUrl}`);
                bot.telegram.setWebhook(webhookUrl, {
                    secret_token: env_1.env.bot.webhookSecret || undefined,
                    allowed_updates: ['message', 'callback_query', 'my_chat_member'],
                    drop_pending_updates: true,
                })
                    .then(() => {
                    console.log('✅ Webhook registered with Telegram');
                    return bot.telegram.getWebhookInfo();
                })
                    .then((info) => {
                    console.log(`📊 Webhook: ${info.url}`);
                    console.log(`📌 Pending updates: ${info.pending_update_count}`);
                })
                    .catch((err) => {
                    console.error('❌ Failed to set webhook:', err.message);
                });
            }
            else {
                console.warn('⚠️ PUBLIC_URL not set — webhook not configured. Use polling mode for local dev.');
            }
        }
        console.log(`✅ [API] /health`);
        console.log(`✅ [API] POST /api/validate`);
        console.log(`✅ [API] POST /api/order/reorder`);
        if (bot && env_1.env.bot.mode === 'webhook') {
            console.log(`✅ [BOT] POST /webhook (Telegram updates — no secret check)`);
        }
    });
}
//# sourceMappingURL=server.js.map