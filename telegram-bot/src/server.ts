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

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Telegraf } from 'telegraf';
import * as crypto from 'crypto';
import { env } from './config/env';
import { getFirestore } from './config/firebase';

// ============================================================
// Rate Limiter (in-memory, per-IP)
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ============================================================
// Telegram initData Validation
// ============================================================
function validateTelegramInitData(
  initData: string,
  botToken: string
): { data: Record<string, string>; isValid: boolean } {
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

  const result: Record<string, string> = {};
  for (const [key, value] of parsed.entries()) {
    result[key] = value;
  }

  return { data: result, isValid };
}

// ============================================================
// CORS Origins
// ============================================================
function getAllowedOrigins(): string[] {
  const origins = [
    'https://my-restaurant-app-de879.web.app',
    'https://my-restaurant-app-de879.firebaseapp.com',
  ];

  if (env.miniApp.url) origins.push(env.miniApp.url);

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
export function createApp(bot?: Telegraf): express.Application {
  const app = express();

  // ── Global Middleware ──
  app.use(cors({
    origin: getAllowedOrigins(),
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Telegram-Bot-Api-Secret-Token'],
  }));
  app.use(express.json({ limit: '1mb' }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[API] ${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // ── Health Check (for Railway / uptime monitoring) ──
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'restaurant-bot',
      mode: env.bot.mode,
      uptime: process.uptime(),
    });
  });

  // ── Root: basic info ──
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: env.restaurant.name,
      bot: env.bot.username,
      version: '1.0.0',
      docs: '/health',
    });
  });

  // ── Telegram Webhook Endpoint (only if bot provided) ──
  if (bot && env.bot.mode === 'webhook') {
    // Debug: log what webhookSecret is set to
    console.log(`[WEBHOOK] webhookSecret from env: "${env.bot.webhookSecret}" (length: ${env.bot.webhookSecret.length})`);

    // Telegraf webhook callback (processes the update)
    app.post('/webhook', bot.webhookCallback('/webhook'));
  }

  // ── POST /api/validate — Validate Telegram initData ──
  app.post('/api/validate', async (req: Request, res: Response) => {
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

      const botToken = env.bot.token;
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
        try { user = JSON.parse(data.user); } catch { /* ignore */ }
      }

      res.json({
        valid: true,
        user,
        auth_date: parseInt(data.auth_date || '0', 10),
        query_id: data.query_id,
      });
    } catch (error) {
      console.error('[API] Validation error:', error);
      res.status(500).json({ valid: false, error: 'فشل التحقق' });
    }
  });

  // ── POST /api/order/reorder — Reorder endpoint ──
  app.post('/api/order/reorder', async (req: Request, res: Response) => {
    try {
      const { initData, orderId } = req.body;

      if (!initData || !orderId) {
        res.status(400).json({ error: 'initData و orderId مطلوبان' });
        return;
      }

      // Validate initData
      const { isValid, data } = validateTelegramInitData(initData, env.bot.token);
      if (!isValid) {
        res.status(401).json({ error: 'بيانات غير صالحة' });
        return;
      }

      // Get the order from Firestore
      const orderSnap = await getFirestore()
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
    } catch (error) {
      console.error('[API] Reorder error:', error);
      res.status(500).json({ error: 'فشل إعادة الطلب' });
    }
  });

  return app;
}

// ============================================================
// Start Server (used by index.ts)
// ============================================================
export function startApiServer(bot?: Telegraf): void {
  const PORT = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);
  const app = createApp(bot);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 Server listening on port ${PORT}`);

    if (bot && env.bot.mode === 'webhook') {
      const publicUrl = env.deployment.publicUrl;

      if (publicUrl) {
        const webhookUrl = `${publicUrl.replace(/\/$/, '')}/webhook`;
        console.log(`🔗 Setting webhook to: ${webhookUrl}`);

        bot.telegram.setWebhook(webhookUrl, {
          secret_token: env.bot.webhookSecret || undefined,
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
      } else {
        console.warn('⚠️ PUBLIC_URL not set — webhook not configured. Use polling mode for local dev.');
      }
    }

    console.log(`✅ [API] /health`);
    console.log(`✅ [API] POST /api/validate`);
    console.log(`✅ [API] POST /api/order/reorder`);
    if (bot && env.bot.mode === 'webhook') {
      console.log(`✅ [BOT] POST /webhook (Telegram updates — no secret check)`);
    }
  });
}
