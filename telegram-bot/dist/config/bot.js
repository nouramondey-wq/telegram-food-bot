"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBot = initBot;
exports.getBot = getBot;
exports.setupWebhook = setupWebhook;
const telegraf_1 = require("telegraf");
const env_1 = require("./env");
let bot;
function initBot() {
    if (bot)
        return bot;
    bot = new telegraf_1.Telegraf(env_1.env.bot.token, {
        handlerTimeout: 30_000, // 30 second timeout per handler (prevents hanging)
        telegram: {
            apiRoot: 'https://api.telegram.org',
            // Production: you can set a custom API root if using a local bot API server
        },
    });
    // Global error handler
    bot.catch((err, ctx) => {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        const updateId = ctx.update?.update_id;
        const userId = ctx.from?.id;
        console.error(`❌ Bot error (update:${updateId}, user:${userId}): ${errorMsg}`);
        // Don't spam errors - just log them
        if (process.env.NODE_ENV === 'production') {
            // In production, we silently handle errors
            // Optionally send error to admin monitoring channel
        }
    });
    // Bot info logging
    bot.telegram.getMe().then((botInfo) => {
        console.log(`🤖 Bot: @${botInfo.username} (ID: ${botInfo.id})`);
    }).catch((err) => {
        console.error('❌ Failed to get bot info:', err.message);
    });
    console.log('🤖 Telegram Bot initialized');
    return bot;
}
function getBot() {
    if (!bot) {
        throw new Error('Bot not initialized. Call initBot() first.');
    }
    return bot;
}
/**
 * Set webhook with secret token for production
 */
async function setupWebhook() {
    if (!env_1.env.bot.webhookUrl) {
        throw new Error('WEBHOOK_URL is required for webhook mode');
    }
    const bot = getBot();
    // Delete existing webhook first (clean slate)
    await bot.telegram.deleteWebhook();
    // Set new webhook with secret token
    await bot.telegram.setWebhook(env_1.env.bot.webhookUrl, {
        secret_token: env_1.env.bot.webhookSecret || undefined,
        // Only receive relevant update types
        allowed_updates: ['message', 'callback_query', 'my_chat_member'],
        // Drop pending updates from when bot was offline
        drop_pending_updates: true,
    });
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log(`✅ Webhook set to: ${webhookInfo.url}`);
    console.log(`🔒 Secret token: ${webhookInfo.has_custom_certificate ? 'Configured' : 'Not set'}`);
    console.log(`📊 Pending updates: ${webhookInfo.pending_update_count}`);
}
//# sourceMappingURL=bot.js.map