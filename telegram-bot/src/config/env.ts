import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
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
export function validateEnv(): void {
  const missing: string[] = [];
  if (!env.bot.token) missing.push('BOT_TOKEN');
  if (!env.firebase.projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!env.firebase.privateKey) missing.push('FIREBASE_PRIVATE_KEY');
  if (!env.firebase.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!env.miniApp.url) missing.push('MINI_APP_URL');

  if (env.bot.mode === 'webhook' && !env.bot.webhookUrl && !env.deployment.publicUrl) {
    missing.push('WEBHOOK_URL or RAILWAY_PUBLIC_DOMAIN (required in webhook mode)');
  }
  
  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    console.error('📄 Please copy .env.example to .env and fill in the values');
    process.exit(1);
  }

  if (env.bot.mode === 'webhook' && !env.deployment.publicUrl) {
    console.warn('⚠️ RAILWAY_PUBLIC_DOMAIN not set — webhook will not be configured');
    console.warn('   Set it in Railway Dashboard: https://railway.app/dashboard');
  }
}
