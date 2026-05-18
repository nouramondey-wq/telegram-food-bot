"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookSecret = validateWebhookSecret;
exports.filterAllowedUpdates = filterAllowedUpdates;
exports.logUpdates = logUpdates;
exports.requirePrivateChat = requirePrivateChat;
/**
 * Webhook Security Middleware
 *
 * Validates incoming webhook requests using Telegram's secret_token mechanism.
 * When you set a webhook with a secret_token, Telegram sends it as
 * the X-Telegram-Bot-Api-Secret-Token header on every request.
 */
const ALLOWED_UPDATES = [
    'message',
    'callback_query',
    'inline_query',
    'my_chat_member',
];
/**
 * Validate webhook secret token from headers
 * Run this BEFORE bot.webhookCallback()
 */
function validateWebhookSecret(expectedToken) {
    return (req, res, next) => {
        const receivedToken = req.headers['x-telegram-bot-api-secret-token'];
        if (!receivedToken || receivedToken !== expectedToken) {
            console.warn('⚠️ Invalid webhook secret token received');
            res.status(403).send('Forbidden');
            return;
        }
        next();
    };
}
/**
 * Filter unwanted update types at middleware level
 * Prevents processing of irrelevant updates
 */
function filterAllowedUpdates() {
    return (ctx, next) => {
        if (ctx.updateType && ALLOWED_UPDATES.includes(ctx.updateType)) {
            return next();
        }
        // Silently ignore irrelevant updates
        return;
    };
}
/**
 * Log incoming updates at DEBUG level
 * Useful for monitoring and debugging
 */
function logUpdates() {
    return (ctx, next) => {
        const userId = ctx.from?.id;
        const username = ctx.from?.username || 'no-username';
        const updateType = ctx.updateType;
        console.log(`[${new Date().toISOString()}] ${updateType} from ${userId} (@${username})`);
        return next();
    };
}
/**
 * Validate that the bot is being used in a private chat
 * Prevents adding the bot to groups without proper configuration
 */
function requirePrivateChat() {
    return (ctx, next) => {
        if (ctx.chat?.type !== 'private') {
            // In group chats, just ignore silently
            return;
        }
        return next();
    };
}
//# sourceMappingURL=security.js.map