"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCancelCommand = setupCancelCommand;
const order_service_1 = require("../../services/order_service");
const order_keyboard_1 = require("../keyboards/order_keyboard");
function setupCancelCommand(bot) {
    bot.command('cancel', async (ctx) => {
        const session = ctx.session;
        if (!session?.customerId) {
            await ctx.reply('⚠️ يرجى البدء أولاً via /start');
            return;
        }
        const message = ctx.message;
        const args = message?.text?.split(' ');
        const orderNumber = args?.[1];
        if (!orderNumber) {
            // Show recent orders that can be cancelled
            try {
                const orderService = new order_service_1.OrderService();
                const orders = await orderService.getCustomerOrders(session.customerId, 5);
                const cancellableOrders = orders.filter((o) => ['pending', 'confirmed'].includes(o.status));
                if (cancellableOrders.length === 0) {
                    await ctx.reply('✅ لا توجد طلبات قابلة للإلغاء حالياً.\n\n' +
                        'استخدم /status لعرض طلباتك.');
                    return;
                }
                let msg = '📋 **الطلبات القابلة للإلغاء:**\n\n';
                const buttons = [];
                for (const order of cancellableOrders) {
                    msg += `🟡 #${order.order_number} — ${order.total.toFixed(2)} ر.س\n`;
                    msg += `   ${order.items?.map((i) => i.name_ar).join(', ') || ''}\n\n`;
                    buttons.push([
                        { text: `❌ إلغاء #${order.order_number}`, callback_data: `cancel_${order.id}` },
                    ]);
                }
                msg += '⚠️ الإلغاء لا يمكن التراجع عنه.';
                await ctx.reply(msg, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: buttons },
                });
            }
            catch (error) {
                console.error('Error in /cancel:', error);
                await ctx.reply('❌ عذراً، حدث خطأ.');
            }
            return;
        }
        // Cancel specific order by number
        try {
            const orderService = new order_service_1.OrderService();
            const orders = await orderService.getCustomerOrders(session.customerId, 50);
            const order = orders.find((o) => o.order_number === parseInt(orderNumber));
            if (!order) {
                await ctx.reply(`❌ لا يوجد طلب برقم #${orderNumber}`);
                return;
            }
            if (!['pending', 'confirmed'].includes(order.status)) {
                await ctx.reply(`❌ الطلب #${orderNumber} لا يمكن إلغاؤه (حالته: ${order.status})`);
                return;
            }
            await ctx.reply(`⚠️ هل أنت متأكد من إلغاء الطلب #${orderNumber}؟\n\nلا يمكن التراجع عن هذا الإجراء.`, {
                reply_markup: (0, order_keyboard_1.getConfirmCancelKeyboard)(order.id).reply_markup,
            });
        }
        catch (error) {
            console.error('Error in /cancel:', error);
            await ctx.reply('❌ عذراً، حدث خطأ.');
        }
    });
}
//# sourceMappingURL=cancel.js.map