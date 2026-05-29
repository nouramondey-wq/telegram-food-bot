import { validateEnv } from './config/env';
import { initFirebase } from './config/firebase';
import { initBot, getBot, setupWebhook } from './config/bot';
import { ensureCustomer, isCustomerBlocked } from './bot/middleware/auth';
import { rateLimiter } from './bot/middleware/rate-limiter';
import { filterAllowedUpdates, logUpdates, requirePrivateChat } from './bot/middleware/security';
import { env } from './config/env';

// Commands
import { setupStartCommand } from './bot/commands/start';
import { setupMenuCommand } from './bot/commands/menu';
import { setupStatusCommand } from './bot/commands/status';
import { setupOrderCommand } from './bot/commands/order';
import { setupCancelCommand } from './bot/commands/cancel';
import { setupHelpCommand } from './bot/commands/help';
import { setupLocationCommand } from './bot/commands/location';

// Handlers
import { setupCallbackHandler } from './bot/handlers/callback_query';

// API + Webhook Server
import { startApiServer } from './server';

// Firestore Listener (replaces Firebase Cloud Functions)
import { FirestoreOrderListener } from './services/firestore_listener';

// ============================================================
// Production Bot + API Launcher
// ============================================================
async function main() {
  console.log('🚀 Starting Restaurant Bot...\n');

  // 1. Validate environment
  validateEnv();
  console.log('✅ Environment validated');

  // 2. Initialize Firebase
  initFirebase();
  console.log('✅ Firebase Admin SDK initialized');

  // 3. Start Firestore order listener (replaces Cloud Functions)
  const orderListener = new FirestoreOrderListener();
  orderListener.start();

  // 4. Initialize bot with all middleware and commands
  const bot = initBot();

  // ============================================================
  // BOT PROFILE SETUP (Description + Commands via Telegram API)
  // ============================================================
  try {
    // وصف البوت الكامل (يظهر في "What can this bot do?")
    await bot.telegram.setMyDescription(
      'مطعم نور 🍽️\n\n' +
      'اطلب أشهى المأكولات بنقرات بسيطة!\n' +
      '🍔 قائمة متنوعة من المأكولات الشرقية والغربية.\n' +
      '⚡ توصيل سريع خلال ٢٠-٣٠ دقيقة.\n' +
      '💳 الدفع عند الاستلام.\n\n' +
      '📲 اضغط على زر القائمة لتبدأ طلبك!',
      { language_code: 'ar' }
    );

    // وصف قصير (يظهر في قائمة البوتات)
    await bot.telegram.setMyShortDescription(
      'اطلب من مطعم نور 🍽️ — أشهى المأكولات بنقرة واحدة!',
      { language_code: 'ar' }
    );

    // أوامر البوت (تظهر في قائمة / )
    await bot.telegram.setMyCommands([
      { command: 'start',    description: '🏠 القائمة الرئيسية' },
      { command: 'menu',     description: '🍔 عرض قائمة الطعام' },
      { command: 'status',   description: '📋 حالة طلباتي' },
      { command: 'order',    description: '📝 تفاصيل طلب معين' },
      { command: 'cancel',   description: '❌ إلغاء طلب' },
      { command: 'location', description: '📍 موقع المطعم' },
      { command: 'help',     description: 'ℹ️ المساعدة' },
    ]);

    console.log('✅ Bot profile (description + commands) updated');
  } catch (err) {
    console.warn('⚠️ Could not update bot profile:', err);
  }

  // ============================================================
  // MIDDLEWARE PIPELINE (ORDER MATTERS)
  // ============================================================

  // Layer 1: Log all updates (debugging)
  bot.use(logUpdates());

  // Layer 2: Only process private chats (ignore groups)
  bot.use(requirePrivateChat());

  // Layer 3: Rate limiting (anti-spam)
  bot.use(rateLimiter({
    maxRequests: env.security.rateLimitMaxPerSecond,
    windowMs: 2000,
    blockDurationMs: env.security.rateLimitBlockSeconds * 1000,
  }));

  // Layer 4: Filter allowed update types
  bot.use(filterAllowedUpdates());

  // Layer 5: Customer authentication (Firestore lookup)
  bot.use(ensureCustomer);

  // Layer 6: Blocked user check (abuse prevention)
  bot.use(async (ctx, next) => {
    const session = (ctx as any).session;
    if (session?.customerId) {
      const blocked = await isCustomerBlocked(session.customerId);
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
  setupStartCommand(bot);
  setupMenuCommand(bot);
  setupStatusCommand(bot);
  setupOrderCommand(bot);
  setupCancelCommand(bot);
  setupHelpCommand(bot);
  setupLocationCommand(bot);

  // ============================================================
  // CALLBACK HANDLERS
  // ============================================================
  setupCallbackHandler(bot);

  // ============================================================
  // TEXT HANDLERS (non-command messages)
  // ============================================================
  bot.hears('📋 طلباتي', async (ctx) => {
    ctx.state['command'] = 'status';
    await ctx.reply('/status');
  });

  bot.hears('ℹ️ عن المطعم', async (ctx) => {
    await ctx.reply(
      `🏪 **${env.restaurant.name}**\n\n` +
      `نقدم ألذ المأكولات الشرقية والغربية.\n` +
      `📍 ${env.restaurant.address}\n` +
      `📞 ${env.restaurant.phone}\n\n` +
      `اطلب الآن بنقرات بسيطة! 😊`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('🕐 أوقات العمل', async (ctx) => {
    await ctx.reply(
      `🕐 **أوقات العمل**\n\n` +
      `${env.restaurant.workingHours}`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('📞 تواصل معنا', async (ctx) => {
    await ctx.reply(
      `📞 **للتواصل معنا:**\n\n` +
      `${env.restaurant.phone}\n\n` +
      `نحن هنا لخدمتك! 😊`,
      { parse_mode: 'Markdown' }
    );
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
  if (env.bot.mode === 'webhook') {
    // Production: Express handles both API and Telegram webhook
    startApiServer(bot);
    console.log(`🌐 Webhook mode: waiting for Telegram updates via Express`);
  } else {
    // Development: API server without bot (bot uses polling)
    startApiServer();
    console.log('🤖 Bot starting in polling mode...');

    await bot.launch({
      dropPendingUpdates: true,
    });
    console.log('✅ Bot polling started');
  }

  console.log(`\n🎉 ${env.restaurant.name} is LIVE!`);
  console.log(`📱 Telegram: https://t.me/${env.bot.username}`);
  console.log(`🌐 Mini App: ${env.miniApp.url}`);
  console.log(`\n🚀 Press Ctrl+C to stop\n`);

  // ============================================================
  // GRACEFUL SHUTDOWN
  // ============================================================
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    if (env.bot.mode === 'webhook') {
      // In webhook mode, bot doesn't "launch" — just stop the process
      bot.stop(signal);
    } else {
      bot.stop(signal);
    }

    // Allow pending operations to complete
    setTimeout(() => {
      console.log('👋 Goodbye!');
      process.exit(0);
    }, 2000);
  };

  const shutdownWithCleanup = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    orderListener.stop();
    bot.stop(signal);
    setTimeout(() => {
      console.log('👋 Goodbye!');
      process.exit(0);
    }, 2000);
  };

  process.once('SIGINT', () => shutdownWithCleanup('SIGINT'));
  process.once('SIGTERM', () => shutdownWithCleanup('SIGTERM'));
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
