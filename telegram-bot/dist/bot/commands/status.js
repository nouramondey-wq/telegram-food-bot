"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStatusCommand = setupStatusCommand;
const order_service_1 = require("../../services/order_service");
const env_1 = require("../../config/env");
const order_keyboard_1 = require("../keyboards/order_keyboard");
function setupStatusCommand(bot) {
    bot.command('status', async (ctx) => {
        const session = ctx.session;
        if (!session?.customerId) {
            await ctx.reply('⚠️ يرجى البدء أولاً via /start');
            return;
        }
        await ctx.reply('⏳ جاري تحميل طلباتك...');
        try {
            const orderService = new order_service_1.OrderService();
            const orders = await orderService.getCustomerOrders(session.customerId, 5);
            if (orders.length === 0) {
                await ctx.reply('📋 لا توجد طلبات سابقة.\n\n' +
                    '🍔 ابدأ أول طلب لك من القائمة!', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🍔 فتح القائمة', web_app: { url: env_1.env.miniApp.url } }],
                        ],
                    },
                });
                return;
            }
            // Show summary + last order detail
            const summary = orderService.formatOrdersList(orders);
            await ctx.reply(summary, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🍔 طلب جديد', web_app: { url: env_1.env.miniApp.url } }],
                    ],
                },
            });
            // If there's an active order, show it in detail with action buttons
            const activeOrder = orders.find((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
            if (activeOrder) {
                const detail = orderService.formatOrderForBot(activeOrder);
                const keyboard = (0, order_keyboard_1.getOrderInlineKeyboard)(activeOrder.id, activeOrder.status);
                await ctx.reply(detail, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard.reply_markup,
                });
            }
        }
        catch (error) {
            console.error('Error in /status:', error);
            await ctx.reply('❌ عذراً، حدث خطأ أثناء تحميل طلباتك. الرجاء المحاولة مرة أخرى.');
        }
    });
}
//# sourceMappingURL=status.js.map