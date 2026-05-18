"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const firebase_1 = require("./config/firebase");
const bot_1 = require("./config/bot");
const auth_1 = require("./bot/middleware/auth");
const rate_limiter_1 = require("./bot/middleware/rate-limiter");
const security_1 = require("./bot/middleware/security");
const env_2 = require("./config/env");
// Commands
const start_1 = require("./bot/commands/start");
const menu_1 = require("./bot/commands/menu");
const status_1 = require("./bot/commands/status");
const order_1 = require("./bot/commands/order");
const cancel_1 = require("./bot/commands/cancel");
const help_1 = require("./bot/commands/help");
const location_1 = require("./bot/commands/location");
// Handlers
const callback_query_1 = require("./bot/handlers/callback_query");
// API + Webhook Server
const server_1 = require("./server");
// ============================================================
// Production Bot + API Launcher
// ============================================================
async function main() {
    console.log('🚀 Starting Restaurant Bot...\n');
    // 1. Validate environment
    (0, env_1.validateEnv)();
    console.log('✅ Environment validated');
    // 2. Initialize Firebase
    (0, firebase_1.initFirebase)();
    console.log('✅ Firebase Admin SDK initialized');
    // 3. Initialize bot with all middleware and commands
    const bot = (0, bot_1.initBot)();
    // ============================================================
    // MIDDLEWARE PIPELINE (ORDER MATTERS)
    // ============================================================
    // Layer 1: Log all updates (debugging)
    bot.use((0, security_1.logUpdates)());
    // Layer 2: Only process private chats (ignore groups)
    bot.use((0, security_1.requirePrivateChat)());
    // Layer 3: Rate limiting (anti-spam)
    bot.use((0, rate_limiter_1.rateLimiter)({
        maxRequests: env_2.env.security.rateLimitMaxPerSecond,
        windowMs: 2000,
        blockDurationMs: env_2.env.security.rateLimitBlockSeconds * 1000,
    }));
    // Layer 4: Filter allowed update types
    bot.use((0, security_1.filterAllowedUpdates)());
    // Layer 5: Customer authentication (Firestore lookup)
    bot.use(auth_1.ensureCustomer);
    // Layer 6: Blocked user check (abuse prevention)
    bot.use(async (ctx, next) => {
        const session = ctx.session;
        if (session?.customerId) {
            const blocked = await (0, auth_1.isCustomerBlocked)(session.customerId);
            if (blocked) {
                console.warn(`🚫 Blocked user ${ctx.from?.id} attempted interaction`);
                return; // Silently ignore blocked users
            }
        }
        await next();
    });
    // ============================================================
    // COMMANDS
    // ============================================================
    (0, start_1.setupStartCommand)(bot);
    (0, menu_1.setupMenuCommand)(bot);
    (0, status_1.setupStatusCommand)(bot);
    (0, order_1.setupOrderCommand)(bot);
    (0, cancel_1.setupCancelCommand)(bot);
    (0, help_1.setupHelpCommand)(bot);
    (0, location_1.setupLocationCommand)(bot);
    // ============================================================
    // CALLBACK HANDLERS
    // ============================================================
    (0, callback_query_1.setupCallbackHandler)(bot);
    // ============================================================
    // TEXT HANDLERS (non-command messages)
    // ============================================================
    bot.hears('📋 طلباتي', async (ctx) => {
        ctx.state['command'] = 'status';
        await ctx.reply('/status');
    });
    bot.hears('ℹ️ عن المطعم', async (ctx) => {
        await ctx.reply(`🏪 **${env_2.env.restaurant.name}**\n\n` +
            `نقدم ألذ المأكولات الشرقية والغربية.\n` +
            `📍 ${env_2.env.restaurant.address}\n` +
            `📞 ${env_2.env.restaurant.phone}\n\n` +
            `اطلب الآن بنقرات بسيطة! 😊`, { parse_mode: 'Markdown' });
    });
    bot.hears('🕐 أوقات العمل', async (ctx) => {
        await ctx.reply(`🕐 **أوقات العمل**\n\n` +
            `${env_2.env.restaurant.workingHours}`, { parse_mode: 'Markdown' });
    });
    bot.hears('📞 تواصل معنا', async (ctx) => {
        await ctx.reply(`📞 **للتواصل معنا:**\n\n` +
            `${env_2.env.restaurant.phone}\n\n` +
            `نحن هنا لخدمتك! 😊`, { parse_mode: 'Markdown' });
    });
    bot.hears('🏠 القائمة الرئيسية', async (ctx) => {
        const { getMainKeyboard } = require('./bot/keyboards/main_keyboard');
        const keyboard = getMainKeyboard();
        await ctx.reply('🏠 القائمة الرئيسية:', {
            reply_markup: keyboard.reply_markup,
        });
    });
    // ============================================================
    // START API + WEBHOOK SERVER
    // ============================================================
    // For production (Render): Express handles Telegram webhook + API
    // For development (local): Express handles API, Telegraf handles polling
    if (env_2.env.bot.mode === 'webhook') {
        // Production: Express handles both API and Telegram webhook
        (0, server_1.startApiServer)(bot);
        console.log(`🌐 Webhook mode: waiting for Telegram updates via Express`);
    }
    else {
        // Development: API server without bot (bot uses polling)
        (0, server_1.startApiServer)();
        console.log('🤖 Bot starting in polling mode...');
        await bot.launch({
            dropPendingUpdates: true,
        });
        console.log('✅ Bot polling started');
    }
    console.log(`\n🎉 ${env_2.env.restaurant.name} is LIVE!`);
    console.log(`📱 Telegram: https://t.me/${env_2.env.bot.username}`);
    console.log(`🌐 Mini App: ${env_2.env.miniApp.url}`);
    console.log(`\n🚀 Press Ctrl+C to stop\n`);
    // ============================================================
    // GRACEFUL SHUTDOWN
    // ============================================================
    const shutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
        if (env_2.env.bot.mode === 'webhook') {
            // In webhook mode, bot doesn't "launch" — just stop the process
            bot.stop(signal);
        }
        else {
            bot.stop(signal);
        }
        // Allow pending operations to complete
        setTimeout(() => {
            console.log('👋 Goodbye!');
            process.exit(0);
        }, 2000);
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}
main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map