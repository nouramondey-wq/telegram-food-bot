"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupHelpCommand = setupHelpCommand;
const env_1 = require("../../config/env");
function setupHelpCommand(bot) {
    bot.command('help', async (ctx) => {
        const message = `ℹ️ *المساعدة السريعة* 📖\n\n` +
            `*الأوامر المتاحة:*\n` +
            `/start 🏠 - القائمة الرئيسية\n` +
            `/menu 🍔 - عرض قائمة الطعام\n` +
            `/status 📋 - حالة طلباتك الحالية\n` +
            `/order [رقم] 📝 - تفاصيل طلب معين\n` +
            `/cancel [رقم] ❌ - إلغاء طلب (penging/confirmed)\n` +
            `/location 📍 - موقع المطعم\n` +
            `/help ℹ️ - هذه المساعدة\n\n` +
            `━━━━━━━━━━━━━━━━\n\n` +
            `💡 *نصائح سريعة:*\n` +
            `• اضغط على 🍔 فتح القائمة لتصفح جميع الأصناف\n` +
            `• استخدم تطبيق الطلب السريع لتجربة أفضل\n` +
            `• يمكنك متابعة طلبك المباشر من خلال /status\n` +
            `• نستقبل طلباتكم من السبت إلى الخميس\n\n` +
            `━━━━━━━━━━━━━━━━\n\n` +
            `📞 *للتواصل:* ${env_1.env.restaurant.phone}\n` +
            `📍 ${env_1.env.restaurant.address}\n\n` +
            `نحن هنا لخدمتك! 😊💚`;
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🍔 فتح القائمة', web_app: { url: env_1.env.miniApp.url } }],
                    [
                        { text: '📞 التواصل', callback_data: 'contact' },
                        { text: '📍 الموقع', callback_data: 'location' },
                    ],
                ],
            },
        });
    });
}
//# sourceMappingURL=help.js.map