import { BotContext } from '../middleware/auth';
import { env } from '../../config/env';

export function setupLocationCommand(bot: any) {
  bot.command('location', async (ctx: BotContext) => {
    await ctx.replyWithLocation(env.restaurant.latitude, env.restaurant.longitude);
    
    await ctx.reply(
      `📍 **${env.restaurant.name}**\n\n` +
      `${env.restaurant.address}\n\n` +
      `🕐 السبت - الخميس: ٨:٠٠ صباحاً - ١١:٠٠ مساءً\n` +
      `🚗 مواقف متوفرة أمام المطعم`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📞 الاتصال', callback_data: 'contact' }],
            [{ text: '🍔 فتح القائمة', url: env.miniApp.url }],
          ],
        },
      }
    );
  });
}
