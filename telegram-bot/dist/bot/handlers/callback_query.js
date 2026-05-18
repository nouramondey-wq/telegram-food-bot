"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCallbackHandler = setupCallbackHandler;
const order_service_1 = require("../../services/order_service");
const notification_service_1 = require("../../services/notification_service");
const order_keyboard_1 = require("../keyboards/order_keyboard");
const env_1 = require("../../config/env");
function setupCallbackHandler(bot) {
    const orderService = new order_service_1.OrderService();
    const notificationService = new notification_service_1.NotificationService();
    // ── Track Order ──
    bot.action(/track_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const orderId = ctx.match[1];
        try {
            const order = await orderService.getOrder(orderId);
            if (!order) {
                await ctx.reply('❌ الطلب غير موجود.');
                return;
            }
            const message = orderService.formatOrderForBot(order);
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🍔 طلب جديد', web_app: { url: env_1.env.miniApp.url } }],
                    ],
                },
            });
        }
        catch (error) {
            console.error('Error tracking order:', error);
            await ctx.reply('❌ عذراً، حدث خطأ.');
        }
    });
    // ── Cancel Step 1: Confirmation ──
    bot.action(/cancel_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const orderId = ctx.match[1];
        await ctx.reply(`⚠️ هل أنت متأكد من إلغاء الطلب؟\n\nلا يمكن التراجع عن هذا الإجراء.`, {
            reply_markup: (0, order_keyboard_1.getConfirmCancelKeyboard)(orderId).reply_markup,
        });
    });
    // ── Cancel Step 2: Confirm ──
    bot.action(/confirm_cancel_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const session = ctx.session;
        const orderId = ctx.match[1];
        if (!session?.customerId) {
            await ctx.reply('⚠️ يرجى البدء أولاً via /start');
            return;
        }
        try {
            const success = await orderService.cancelOrder(orderId, session.customerId);
            if (success) {
                await ctx.editMessageText('✅ تم إلغاء الطلب بنجاح.');
                await ctx.reply('📋 لا تقلق، يمكنك طلب وجبة جديدة في أي وقت! 😊', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🍔 فتح القائمة', web_app: { url: env_1.env.miniApp.url } }],
                        ],
                    },
                });
            }
            else {
                await ctx.editMessageText('❌ عذراً، لا يمكن إلغاء الطلب. الطلب إما قيد التحضير أو تم تسليمه.');
            }
        }
        catch (error) {
            console.error('Error cancelling order:', error);
            await ctx.reply('❌ عذراً، حدث خطأ أثناء إلغاء الطلب.');
        }
    });
    // ── Cancel Step 2: No ──
    bot.action(/no_cancel_(.+)/, async (ctx) => {
        await ctx.answerCbQuery('تم التراجع ✅');
        await ctx.editMessageText('✅ تم التراجع عن الإلغاء.');
    });
    // ── Reorder ──
    bot.action(/reorder_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const orderId = ctx.match[1];
        const username = env_1.env.bot.username;
        const reorderUrl = `https://t.me/${username}?start=reorder_${orderId}`;
        try {
            const order = await orderService.getOrder(orderId);
            if (!order) {
                await ctx.reply('❌ الطلب غير موجود.');
                return;
            }
            await ctx.reply(`🔄 *إعادة الطلب #${order.order_number}*\n\n` +
                `تم تجهيز طلبك السابق لإعادة الطلب.\n` +
                `اضغط على الزر لفتح التطبيق وتأكيد الطلب.`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔄 إعادة الطلب', url: reorderUrl }],
                        [{ text: '🍔 فتح القائمة', web_app: { url: env_1.env.miniApp.url } }],
                    ],
                },
            });
        }
        catch (error) {
            console.error('Error reordering:', error);
            await ctx.reply('❌ عذراً، حدث خطأ.');
        }
    });
    // ── My Orders ──
    bot.action('my_orders', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.reply('/status');
    });
    // ── Location ──
    bot.action('location', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.replyWithLocation(env_1.env.restaurant.latitude, env_1.env.restaurant.longitude);
        await ctx.reply(`📍 **${env_1.env.restaurant.name}**\n${env_1.env.restaurant.address}`, { parse_mode: 'Markdown' });
    });
    // ── Contact ──
    bot.action('contact', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.reply(`📞 **للتواصل مع ${env_1.env.restaurant.name}:**\n\n` +
            `${env_1.env.restaurant.phone}\n\n` +
            `نرحب باستفساراتك! 😊`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📍 الموقع', callback_data: 'location' }],
                ],
            },
        });
    });
    // ── Hours ──
    bot.action('hours', async (ctx) => {
        await ctx.answerCbQuery();
        const message = `🕐 **أوقات عمل ${env_1.env.restaurant.name}**\n\n` +
            `${env_1.env.restaurant.workingHours}\n\n` +
            `🍽️ ننتظركم!`;
        await ctx.reply(message, { parse_mode: 'Markdown' });
    });
    // ── Rating ──
    bot.action(/rate_(\d)/, async (ctx) => {
        await ctx.answerCbQuery();
        const rating = ctx.match[1];
        await ctx.reply(`⭐ شكراً لتقييمك! تقييمك (${rating}/5) سيساعدنا على تحسين خدماتنا. 😊`);
    });
}
//# sourceMappingURL=callback_query.js.map