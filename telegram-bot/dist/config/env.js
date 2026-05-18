"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.env = {
    bot: {
        token: process.env.BOT_TOKEN || '',
        username: process.env.BOT_USERNAME || '',
        mode: process.env.BOT_MODE || 'polling', // 'polling' | 'webhook'
        webhookUrl: process.env.WEBHOOK_URL || '',
        webhookSecret: process.env.WEBHOOK_SECRET || '', // Secret token for webhook validation
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    },
    miniApp: {
        url: process.env.MINI_APP_URL || '',
    },
    restaurant: {
        name: process.env.RESTAURANT_NAME || 'مطعم الذواقة',
        phone: process.env.RESTAURANT_PHONE || '',
        address: process.env.RESTAURANT_ADDRESS || '',
        latitude: parseFloat(process.env.RESTAURANT_LATITUDE || '24.7136'),
        longitude: parseFloat(process.env.RESTAURANT_LONGITUDE || '46.6753'),
        workingHours: process.env.RESTAURANT_HOURS || 'السبت - الخميس: ٨:٠٠ صباحاً - ١١:٠٠ مساءً\nالجمعة: مغلق',
        instagram: process.env.RESTAURANT_INSTAGRAM || '',
    },
    admin: {
        chatIds: (process.env.ADMIN_CHAT_IDS || '').split(',').filter(Boolean),
    },
    security: {
        rateLimitMaxPerSecond: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
        rateLimitBlockSeconds: parseInt(process.env.RATE_LIMIT_BLOCK || '30', 10),
    },
    deployment: {
        // Railway automatically sets RAILWAY_PUBLIC_DOMAIN (e.g. my-app.up.railway.app)
        // Prepends https:// for the full URL
        publicUrl: process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
            : process.env.PUBLIC_URL || '',
    },
};
// Validation
function validateEnv() {
    const missing = [];
    if (!exports.env.bot.token)
        missing.push('BOT_TOKEN');
    if (!exports.env.firebase.projectId)
        missing.push('FIREBASE_PROJECT_ID');
    if (!exports.env.firebase.privateKey)
        missing.push('FIREBASE_PRIVATE_KEY');
    if (!exports.env.firebase.clientEmail)
        missing.push('FIREBASE_CLIENT_EMAIL');
    if (!exports.env.miniApp.url)
        missing.push('MINI_APP_URL');
    if (exports.env.bot.mode === 'webhook' && !exports.env.bot.webhookUrl && !exports.env.deployment.publicUrl) {
        missing.push('WEBHOOK_URL or RAILWAY_PUBLIC_DOMAIN (required in webhook mode)');
    }
    if (missing.length > 0) {
        console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
        console.error('📄 Please copy .env.example to .env and fill in the values');
        process.exit(1);
    }
    if (exports.env.bot.mode === 'webhook' && !exports.env.deployment.publicUrl) {
        console.warn('⚠️ RAILWAY_PUBLIC_DOMAIN not set — webhook will not be configured');
        console.warn('   Set it in Railway Dashboard: https://railway.app/dashboard');
    }
}
//# sourceMappingURL=env.js.map