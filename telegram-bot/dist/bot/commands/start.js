"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStartCommand = setupStartCommand;
const main_keyboard_1 = require("../keyboards/main_keyboard");
const env_1 = require("../../config/env");
const order_service_1 = require("../../services/order_service");
function setupStartCommand(bot) {
    bot.start(async (ctx) => {
        const firstName = ctx.from?.first_name || 'عميلنا العزيز';
        const messageText = ctx.message?.text || '';
        const payload = messageText.split(' ')[1];
        // ── Deep Link: Order tracking ──
        if (payload?.startsWith('order_')) {
            const orderId = payload.replace('order_', '');
            try {
                const orderService = new order_service_1.OrderService();
                const order = await orderService.getOrder(orderId);
                if (order) {
                    const orderMsg = orderService.formatOrderForBot(order);
                    await ctx.reply(`👋 أهلاً بك يا ${firstName}!\n\n` +
                        `📋 *متابعة الطلب #${order.order_number}*\n\n` +
                        orderMsg, {
                        parse_mode: 'Markdown',
                        reply_markup: (0, main_keyboard_1.getMainKeyboard)().reply_markup,
                    });
                    return;
                }
            }
            catch {
                // Fall through to default welcome
            }
        }
        // ── Deep Link: Reorder ──
        if (payload?.startsWith('reorder_')) {
            const orderId = payload.replace('reorder_', '');
            try {
                const orderService = new order_service_1.OrderService();
                const session = ctx.session;
                if (session?.customerId) {
                    const reorder = await orderService.prepareReorder(orderId, session.customerId);
                    if (reorder) {
                        let msg = `👋 أهلاً بك يا ${firstName}!\n\n` +
                            `🔄 *إعادة الطلب #${reorder.originalOrderNumber}*\n\n`;
                        if (!reorder.allAvailable) {
                            msg += `⚠️ بعض الأصناف غير متوفرة حالياً: ${reorder.unavailableItems.join(', ')}\n\n`;
                        }
                        msg += `اضغط على الزر لفتح التطبيق وإعادة الطلب.`;
                        await ctx.reply(msg, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🔄 فتح التطبيق لإعادة الطلب', url: `${env_1.env.miniApp.url}?reorder=${orderId}` }],
                                ],
                            },
                        });
                        return;
                    }
                }
            }
            catch {
                // Fall through to default welcome
            }
        }
        // ── Default Welcome ──
        const welcomeMessage = `السلام عليكم! 👋\n\n` +
            `أهلاً بك يا *${firstName}* في *${env_1.env.restaurant.name}* 🏪\n\n` +
            `🍔 نقدم أشهى المأكولات الشرقية والغربية\n` +
            `⚡ اطلب الآن واستلم خلال ٢٠-٣٠ دقيقة\n` +
            `💳 الدفع عند الاستلام\n\n` +
            `👇 اختر من القائمة أدناه:`;
        await ctx.reply(welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: (0, main_keyboard_1.getMainKeyboard)().reply_markup,
        });
    });
}
//# sourceMappingURL=start.js.map