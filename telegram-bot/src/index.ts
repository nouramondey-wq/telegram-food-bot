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
  console.log('ðŸš€ Starting Restaurant Bot...\n');

  // 1. Validate environment
  validateEnv();
  console.log('âœ… Environment validated');

  // 2. Initialize Firebase
  initFirebase();
  console.log('âœ… Firebase Admin SDK initialized');

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
      'Ù…Ø·Ø¹Ù… Ù†ÙˆØ± ðŸ½ï¸\n\n' +
      'Ø§Ø·Ù„Ø¨ Ø£Ø´Ù‡Ù‰ Ø§Ù„Ù…Ø£ÙƒÙˆÙ„Ø§Øª Ø¨Ù†Ù‚Ø±Ø§Øª Ø¨Ø³ÙŠØ·Ø©!\n' +
      'ðŸ” Ù‚Ø§Ø¦Ù…Ø© Ù…ØªÙ†ÙˆØ¹Ø© Ù…Ù† Ø§Ù„Ù…Ø£ÙƒÙˆÙ„Ø§Øª Ø§Ù„Ø´Ø±Ù‚ÙŠØ© ÙˆØ§Ù„ØºØ±Ø¨ÙŠØ©.\n' +
      'âš¡ ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ø®Ù„Ø§Ù„ Ù¢Ù -Ù£Ù  Ø¯Ù‚ÙŠÙ‚Ø©.\n' +
      'ðŸ’³ Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù….\n\n' +
      'ðŸ“² Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ Ø²Ø± Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ù„ØªØ¨Ø¯Ø£ Ø·Ù„Ø¨Ùƒ!';

    const shortDesc = 'Ø§Ø·Ù„Ø¨ Ù…Ù† Ù…Ø·Ø¹Ù… Ù†ÙˆØ± ðŸ½ï¸ â€” Ø£Ø´Ù‡Ù‰ Ø§Ù„Ù…Ø£ÙƒÙˆÙ„Ø§Øª Ø¨Ù†Ù‚Ø±Ø© ÙˆØ§Ø­Ø¯Ø©!';

    const commands = [
      { command: 'start',    description: 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' },
      { command: 'menu',     description: 'Ø¹Ø±Ø¶ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø·Ø¹Ø§Ù…' },
      { command: 'status',   description: 'Ø­Ø§Ù„Ø© Ø·Ù„Ø¨Ø§ØªÙŠ' },
      { command: 'order',    description: 'ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨ Ù…Ø¹ÙŠÙ†' },
      { command: 'cancel',   description: 'Ø§Ù„ØºØ§Ø¡ Ø·Ù„Ø¨' },
      { command: 'location', description: 'Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…Ø·Ø¹Ù…' },
      { command: 'help',     description: 'Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©' },
    ];

    // â”€â”€ Ø¶Ø¨Ø· Ø§Ù„Ù€ DEFAULT (Ù„ÙƒÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¨ØºØ¶ Ø§Ù„Ù†Ø¸Ø± Ø¹Ù† Ø§Ù„Ù„ØºØ©)
    await bot.telegram.setMyDescription(desc);
    await bot.telegram.setMyShortDescription(shortDesc);
    await bot.telegram.setMyCommands(commands);

    // â”€â”€ Ø¶Ø¨Ø· Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙƒØ°Ù„Ùƒ ØªØ­Ø¯ÙŠØ¯Ø§Ù‹
    await (bot.telegram as any).setMyDescription(desc, { language_code: 'ar' });
    await (bot.telegram as any).setMyShortDescription(shortDesc, { language_code: 'ar' });
    await bot.telegram.setMyCommands(commands, { language_code: 'ar' } as any);

    console.log('âœ… Bot profile (description + commands) updated for all languages');
  } catch (err) {
    console.warn('âš ï¸ Could not update bot profile:', err);
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
        console.warn(`ðŸ›‘ Blocked user ${ctx.from?.id} attempted interaction`);
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
  bot.hears('ðŸ“‹ Ø·Ù„Ø¨Ø§ØªÙŠ', async (ctx) => {
    await ctx.reply('ØªÙØ¶Ù„ Ø¨Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„ØªØªØ¨Ø¹ Ø·Ù„Ø¨Ø§ØªÙƒ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© ÙˆØ§Ù„Ø­Ø§Ù„ÙŠØ© ðŸ“‹ðŸ‘‡', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'ðŸ“‹ ÙØªØ­ Ø·Ù„Ø¨Ø§ØªÙŠ', web_app: { url: env.miniApp.url + '/orders' } }]
        ]
      }
    });
  });

  bot.hears('â„¹ï¸ Ø¹Ù† Ø§Ù„Ù…Ø·Ø¹Ù…', async (ctx) => {
    await ctx.reply(
      `ðŸª **${env.restaurant.name}**\n\n` +
      `Ù†Ù‚Ø¯Ù… Ø£Ø´Ù‡Ù‰ Ø§Ù„Ù…Ø£ÙƒÙˆÙ„Ø§Øª Ø§Ù„Ø´Ø±Ù‚ÙŠØ© ÙˆØ§Ù„ØºØ±Ø¨ÙŠØ©.\n` +
      `ðŸ“ ${env.restaurant.address}\n` +
      `ðŸ“ž ${env.restaurant.phone}\n\n` +
      `Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ø®Ø¯Ù…ØªÙƒ Ø¯Ø§Ø¦Ù…Ø§Ù‹! ðŸ˜Š`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('ðŸ• Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„', async (ctx) => {
    await ctx.reply(
      `ðŸ•’ **Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„**\n\n` +
      `${env.restaurant.workingHours}`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('ðŸ“ž ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§', async (ctx) => {
    await ctx.reply(
      `ðŸ“ž **Ù„Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§:**\n\n` +
      `${env.restaurant.phone}\n\n` +
      `Ù†Ø³Ø¹Ø¯ Ø¨Ø®Ø¯Ù…ØªÙƒÙ…! ðŸ’š`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.hears('ðŸ  Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', async (ctx) => {
    const { getMainKeyboard } = require('./bot/keyboards/main_keyboard');
    const keyboard = getMainKeyboard();
    await ctx.reply('ðŸ‘‡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©:', {
      reply_markup: keyboard.reply_markup,
    });
  });

  // ============================================================
  // START API + WEBHOOK SERVER
  // ============================================================
  if (env.bot.mode === 'webhook') {
    startApiServer(bot);
    console.log(`ðŸ“¡ Webhook mode: waiting for Telegram updates via Express`);
  } else {
    startApiServer();
    console.log('ðŸ“¡ Bot starting in polling mode...');

    await bot.launch({
      dropPendingUpdates: true,
    });
    console.log('âœ… Bot polling started');
  }

  console.log(`\nðŸŽ‰ ${env.restaurant.name} is LIVE!`);
  console.log(`ðŸ¤– Telegram: https://t.me/${env.bot.username}`);
  console.log(`ðŸ“± Mini App: ${env.miniApp.url}`);
  console.log(`\nðŸ›‘ Press Ctrl+C to stop\n`);

  // ============================================================
  // GRACEFUL SHUTDOWN
  // ============================================================
  const shutdown = async (signal: string) => {
    console.log(`\nðŸ›‘ Received ${signal}. Shutting down gracefully...`);
    if (env.bot.mode === 'webhook') {
      bot.stop(signal);
    } else {
      bot.stop(signal);
    }
    setTimeout(() => {
      console.log('ðŸ‘‹ Goodbye!');
      process.exit(0);
    }, 2000);
  };

  const shutdownWithCleanup = async (signal: string) => {
    console.log(`\nðŸ›‘ Received ${signal}. Shutting down gracefully...`);
    orderListener.stop();
    bot.stop(signal);
    setTimeout(() => {
      console.log('ðŸ‘‹ Goodbye!');
      process.exit(0);
    }, 2000);
  };

  process.once('SIGINT', () => shutdownWithCleanup('SIGINT'));
  process.once('SIGTERM', () => shutdownWithCleanup('SIGTERM'));
}

main().catch((error) => {
  console.error('âŒ Fatal error:', error);
  process.exit(1);
});

