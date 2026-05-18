"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupOrderCommand = setupOrderCommand;
const order_service_1 = require("../../services/order_service");
const order_keyboard_1 = require("../keyboards/order_keyboard");
function setupOrderCommand(bot) {
    bot.command('order', async (ctx) => {
        const session = ctx.session;
        if (!session?.customerId) {
            await ctx.reply('⚠️ يرجى البدء أولاً via /start');
            return;
        }
        // استخراج رقم الطلب من الأمر
        const message = ctx.message;
        const args = message?.text?.split(' ');
        const orderNumber = args?.[1];
        if (!orderNumber) {
            // عرض آخر طلب
            const orderService = new order_service_1.OrderService();
            const orders = await orderService.getCustomerOrders(session.customerId, 1);
            if (orders.length === 0) {
                await ctx.reply('📋 لا توجد طلبات. استخدم /status لعرض كل الطلبات.');
                return;
            }
            const message = orderService.formatOrderForBot(orders[0]);
            const keyboard = (0, order_keyboard_1.getOrderInlineKeyboard)(orders[0].id, orders[0].status);
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup,
            });
            return;
        } // البحث عن طلب برقم محدد
        try {
            const orderService = new order_service_1.OrderService();
            const orders = await orderService.getCustomerOrders(session.customerId, 50);
            const order = orders.find((o) => o.order_number === parseInt(orderNumber));
            if (!order) {
                await ctx.reply(`❌ لا يوجد طلب برقم #${orderNumber}`);
                return;
            }
            const message = orderService.formatOrderForBot(order);
            const keyboard = (0, order_keyboard_1.getOrderInlineKeyboard)(order.id, order.status);
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard.reply_markup,
            });
        }
        catch (error) {
            console.error('Error in /order:', error);
            await ctx.reply('❌ عذراً، حدث خطأ.');
        }
    });
}
//# sourceMappingURL=order.js.map