"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const bot_1 = require("../config/bot");
const firebase_1 = require("../config/firebase");
const env_1 = require("../config/env");
const DIVIDER = '─'.repeat(20);
class NotificationService {
    db = (0, firebase_1.getFirestore)();
    /**
     * Send order confirmation with full receipt
     */
    async sendOrderConfirmed(chatId, order) {
        const itemsList = order.items.map((item) => {
            let line = `• ${item.name_ar} × ${item.quantity} — ${item.item_total.toFixed(2)} ر.س`;
            if (item.addons?.length > 0) {
                line += `\n  ${item.addons.map((a) => `➕ ${a.name_ar}`).join('\n  ')}`;
            }
            return line;
        }).join('\n');
        const message = `✅ *تم استلام طلبك #${order.order_number} بنجاح!* 🎉\n\n` +
            `${DIVIDER}\n` +
            `📋 *ملخص الطلب:*\n${itemsList}\n` +
            `${DIVIDER}\n` +
            `💰 *الإجمالي:* ${order.total.toFixed(2)} ر.س\n` +
            `💳 *الدفع:* كاش عند الاستلام\n` +
            `📝 *ملاحظات:* ${order.notes || 'لا يوجد'}\n\n` +
            `🔵 *الحالة:* قيد الانتظار\n\n` +
            `سنقوم بإشعارك فور البدء في التحضير. 🙌\n` +
            `الوقت المتوقع: ٢٠-٣٠ دقيقة ⏱️`;
        try {
            await (0, bot_1.getBot)().telegram.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📋 متابعة الطلب', callback_data: `track_${order.id}` }],
                        [{ text: '🍔 طلب إضافي', web_app: { url: env_1.env.miniApp.url } }],
                    ],
                },
            });
        }
        catch (error) {
            console.error(`Failed to send confirmation to ${chatId}:`, error);
        }
    }
    /**
     * Send professional status update with timeline context
     */
    async sendStatusUpdate(chatId, order) {
        const templates = {
            confirmed: `✅ *تم تأكيد طلبك #${order.order_number}!*\n\n` +
                `${DIVIDER}\n` +
                `👨‍🍳 سيبدأ الطهاة في تجهيز طلبك قريباً.\n` +
                `⏱️ الوقت المتوقع: ٢٠-٣٠ دقيقة\n\n` +
                `💡 ننصحك بالتوجه إلى المطعم بعد ٢٠ دقيقة.`,
            preparing: `🔵 *طلبك #${order.order_number} على النار!* 🔥\n\n` +
                `${DIVIDER}\n` +
                `👨‍🍳 الطهاة يعملون على تحضير طلبك الآن.\n` +
                `⏱️ الوقت المتبقي: حوالي ١٠-١٥ دقيقة\n\n` +
                `⚡ استعد، طلبك شيك يكون جاهز!`,
            ready: `🎉 *طلبك #${order.order_number} جاهز!* 🎉\n\n` +
                `${DIVIDER}\n` +
                `⚡ يرجى التوجه للمطعم لاستلام طلبك!\n\n` +
                `📍 ${env_1.env.restaurant.address}\n` +
                `💰 المبلغ المطلوب: ${order.total.toFixed(2)} ر.س\n` +
                `💳 طريقة الدفع: كاش\n\n` +
                `😊 استمتع بوجبتك!`,
            delivered: `✅ *تم استلام الطلب #${order.order_number}*\n\n` +
                `${DIVIDER}\n` +
                `شكراً لطلبك من ${env_1.env.restaurant.name}! 🙏\n\n` +
                `نتمنى أن تنال وجبتك إعجابك 😊🍽️\n\n` +
                `⭐ *هل أعجبك الطلب؟*`,
            cancelled: `❌ *تم إلغاء الطلب #${order.order_number}*\n\n` +
                `${DIVIDER}\n` +
                `لا تقلق، يمكنك طلب وجبة جديدة في أي وقت! 😊\n` +
                `نحن هنا لخدمتك دائماً. 💚`,
        };
        const message = templates[order.status];
        if (!message)
            return;
        // Build contextual buttons based on status
        const buttons = [];
        switch (order.status) {
            case 'ready':
                buttons.push([{ text: '📍 عرض الموقع', callback_data: 'location' }], [{ text: '📞 الاتصال بالمطعم', callback_data: 'contact' }], [{ text: '🍔 طلب جديد', web_app: { url: env_1.env.miniApp.url } }]);
                break;
            case 'delivered':
                buttons.push([
                    { text: '⭐', callback_data: 'rate_5' },
                    { text: '⭐⭐', callback_data: 'rate_4' },
                    { text: '⭐⭐⭐', callback_data: 'rate_3' },
                    { text: '⭐⭐⭐⭐', callback_data: 'rate_2' },
                    { text: '⭐⭐⭐⭐⭐', callback_data: 'rate_1' },
                ], [{ text: '🔄 إعادة الطلب', callback_data: `reorder_${order.id}` }], [{ text: '🍔 طلب جديد', web_app: { url: env_1.env.miniApp.url } }]);
                break;
            default:
                buttons.push([{ text: '📋 متابعة الطلب', callback_data: `track_${order.id}` }], [{ text: '🍔 قائمة الطعام', web_app: { url: env_1.env.miniApp.url } }]);
        }
        try {
            await (0, bot_1.getBot)().telegram.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: buttons },
            });
        }
        catch (error) {
            console.error(`Failed to send status update to ${chatId}:`, error);
        }
    }
    /**
     * Send admin alert for new orders — sent to all admin chat IDs
     */
    async sendAdminAlert(order) {
        const message = `🔔 *طلب جديد!*\n\n` +
            `📋 #${order.order_number}\n` +
            `👤 العميل: ${order.customer_name || 'عميل'}\n` +
            `${DIVIDER}\n` +
            order.items.map((item) => `• ${item.name_ar} × ${item.quantity}`).join('\n') + '\n' +
            `${DIVIDER}\n` +
            `💰 ${order.total.toFixed(2)} ر.س\n` +
            `💳 كاش\n` +
            `📝 ${order.notes || 'لا يوجد ملاحظات'}\n\n` +
            `⚡ يرجى تأكيد الطلب من لوحة التحكم.`;
        // Send to all configured admin chat IDs
        for (const adminChatId of env_1.env.admin.chatIds) {
            if (!adminChatId)
                continue;
            try {
                await (0, bot_1.getBot)().telegram.sendMessage(adminChatId.trim(), message, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ تأكيد', callback_data: `admin_confirm_${order.id}` },
                                { text: '❌ رفض', callback_data: `admin_reject_${order.id}` },
                            ],
                        ],
                    },
                });
            }
            catch (error) {
                console.error(`Failed to send admin alert to ${adminChatId}:`, error);
            }
        }
        // Also write to Firestore bot_notifications for polling
        try {
            await this.db.collection('bot_notifications').add({
                type: 'new_order',
                order_id: order.id,
                order_number: order.order_number,
                created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
                sent: false,
            });
        }
        catch (error) {
            console.error('Failed to save notification:', error);
        }
    }
    /**
     * Send pickup reminder (15 minutes after ready)
     */
    async sendPickupReminder(chatId, orderNumber) {
        const message = `🔔 *تذكير: طلبك #${orderNumber} لا زال بانتظارك!*\n\n` +
            `الطلب جاهز منذ فترة 🕐\n\n` +
            `يرجى التوجه للمطعم لاستلام طلبك! 😄\n` +
            `📍 ${env_1.env.restaurant.address}`;
        try {
            await (0, bot_1.getBot)().telegram.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📍 الموقع', callback_data: 'location' }],
                        [{ text: '📞 الاتصال بالمطعم', callback_data: 'contact' }],
                    ],
                },
            });
        }
        catch (error) {
            console.error(`Failed to send reminder to ${chatId}:`, error);
        }
    }
    /**
     * Send returning customer welcome-back message
     */
    async sendWelcomeBack(chatId, customer) {
        const orderCount = customer.total_orders || 0;
        const message = `👋 *مرحباً بعودتك يا ${customer.first_name || 'عميلنا العزيز'}!*\n\n` +
            `شكراً لثقتك ب ${env_1.env.restaurant.name} 🙏\n\n` +
            (orderCount > 0
                ? `📊 لديك ${orderCount} طلب${orderCount > 2 ? 'ات' : ''} سابقة معنا.\n\n`
                : '') +
            `🍔 اطلب الآن واستمتع بألذ المأكولات!`;
        try {
            await (0, bot_1.getBot)().telegram.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🍔 فتح القائمة', web_app: { url: env_1.env.miniApp.url } }],
                        [{ text: '📋 طلباتي السابقة', callback_data: 'my_orders' }],
                    ],
                },
            });
        }
        catch (error) {
            console.error(`Failed to send welcome back to ${chatId}:`, error);
        }
    }
    /**
     * Broadcast message to all customers (admin use only)
     */
    async broadcastToCustomers(message) {
        let sent = 0;
        try {
            const snapshot = await this.db.collection('customers').get();
            for (const doc of snapshot.docs) {
                const customer = doc.data();
                if (customer.telegram_chat_id && !customer.is_blocked) {
                    try {
                        await (0, bot_1.getBot)().telegram.sendMessage(customer.telegram_chat_id, message, {
                            parse_mode: 'Markdown',
                        });
                        sent++;
                    }
                    catch {
                        // Skip customers who've blocked the bot
                    }
                }
            }
        }
        catch (error) {
            console.error('Broadcast error:', error);
        }
        return sent;
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification_service.js.map