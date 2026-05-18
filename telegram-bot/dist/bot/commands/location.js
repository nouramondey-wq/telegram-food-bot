"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLocationCommand = setupLocationCommand;
const env_1 = require("../../config/env");
function setupLocationCommand(bot) {
    bot.command('location', async (ctx) => {
        await ctx.replyWithLocation(env_1.env.restaurant.latitude, env_1.env.restaurant.longitude);
        await ctx.reply(`📍 **${env_1.env.restaurant.name}**\n\n` +
            `${env_1.env.restaurant.address}\n\n` +
            `🕐 السبت - الخميس: ٨:٠٠ صباحاً - ١١:٠٠ مساءً\n` +
            `🚗 مواقف متوفرة أمام المطعم`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📞 الاتصال', callback_data: 'contact' }],
                    [{ text: '🍔 فتح القائمة', url: env_1.env.miniApp.url }],
                ],
            },
        });
    });
}
//# sourceMappingURL=location.js.map