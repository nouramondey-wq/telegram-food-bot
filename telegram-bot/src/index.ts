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
    const desc =
      'مطعم نور 🍽️\n\n' +
      'اطلب أشهى المأكولات بنقرات بسيطة!\n' +
      '🍔 قائمة متنوعة من المأكولات الشرقية والغربية.\n' +
      '⚡ توصيل سريع خلال ٢٠-٣٠ دقيقة.\n' +
      '💳 الدفع عند الاستلام.\n\n' +
      '📲 اضغط على زر القائمة لتبدأ طلبك!';

    const shortDesc = 'اطلب من مطعم نور 🍽️ — أشهى المأكولات بنقرة واحدة!';

    const commands = [
      { command: 'start',    description: 'القائمة الرئيسية' },
      { command: 'menu',     description: 'عرض قائمة الطعام' },
      { command: 'status',   description: 'حالة طلباتي' },
      { command: 'order',    description: 'تفاصيل طلب معين' },
      { command: 'cancel',   description: 'الغاء طلب' },
      { command: 'location', description: 'موقع المطعم' },
      { command: 'help',     description: 'المساعدة' },
    ];

    // ── ضبط الـ DEFAULT (لكل المستخدمين بغض النظر عن اللغة)
    await bot.telegram.setMyDescription(desc);
    await bot.telegram.setMyShortDescription(shortDesc);
    await bot.telegram.setMyCommands(commands);

    // ── ضبط النسخة العربية كذلك تحديداً
    await (bot.telegram as any).setMyDescription(desc, { language_code: 'ar' });
    await (bot.telegram as any).setMyShortDescription(shortDesc, { language_code: 'ar' });
    await bot.telegram.setMyCommands(commands, { language_code: 'ar' } as any);

    console.log('✅ Bot profile (description + commands) updated for all languages');
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
        console.warn(`🛑 Blocked user ${ctx.from?.id} attempted interaction`);
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
    await ctx.reply('تفضل بالدخول لتتبع طلباتك السابقة والحالية 📋👇', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 فتح طلباتي', web_app: { url: env.miniApp.url + '/orders' } }]
        ]
      }
    });
  });

  bot.hears('ℹ️ عن المطعم', async (ctx) => {
    await ctx.reply(
      `🏪 *عن ${env.restaurant.name || 'مطعم نور'}*\n\n` +
      `✨ خيارك الأول لأشهى المأكولات! نحن نقدم تشكيلة واسعة من الأطباق الشرقية والغربية المحضرة يومياً بأجود المكونات الطازجة.\n\n` +
      `📍 *موقعنا:* ${env.restaurant.address || 'القاهرة - مصر'}\n` +
      `🕒 *أوقات العمل:* ${env.restaurant.workingHours || 'يومياً من ١٠ صباحاً إلى ٢ فجراً'}\n` +
      `🛵 *التوصيل:* متاح وسريع\n\n` +
      `نسعد دائماً بخدمتكم وتلبية طلباتكم! 😊`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('📞 تواصل معنا', async (ctx) => {
    const phoneNumber = env.restaurant.phone || '+201000000000';
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    await ctx.reply(
      `📞 *تواصل مع فريق ${env.restaurant.name || 'مطعم نور'}:*\n\n` +
      `يسعدنا استقبال استفساراتكم واقتراحاتكم عبر القنوات التالية:\n\n` +
      `📱 *رقم الهاتف للطلبات:* ${phoneNumber}\n\n` +
      `نحن هنا لخدمتك دائماً! 💚`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 تواصل معنا عبر واتساب', url: `https://wa.me/${cleanPhone}` }]
          ]
        }
      }
    );
  });

  bot.hears('🏠 القائمة الرئيسية', async (ctx) => {
    const { getMainKeyboard } = require('./bot/keyboards/main_keyboard');
    const keyboard = getMainKeyboard();
    await ctx.reply('👇 القائمة الرئيسية:', {
      reply_markup: keyboard.reply_markup,
    });
  });

  // ============================================================
  // START API + WEBHOOK SERVER
  // ============================================================
  if (env.bot.mode === 'webhook') {
    startApiServer(bot);
    console.log(`📡 Webhook mode: waiting for Telegram updates via Express`);
  } else {
    startApiServer();
    console.log('📡 Bot starting in polling mode...');

    await bot.launch({
      dropPendingUpdates: true,
    });
    console.log('✅ Bot polling started');
  }

  console.log(`\n🎉 ${env.restaurant.name} is LIVE!`);
  console.log(`🤖 Telegram: https://t.me/${env.bot.username}`);
  console.log(`📱 Mini App: ${env.miniApp.url}`);
  console.log(`\n🛑 Press Ctrl+C to stop\n`);

  // ============================================================
  // GRACEFUL SHUTDOWN
  // ============================================================
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    if (env.bot.mode === 'webhook') {
      bot.stop(signal);
    } else {
      bot.stop(signal);
    }
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
