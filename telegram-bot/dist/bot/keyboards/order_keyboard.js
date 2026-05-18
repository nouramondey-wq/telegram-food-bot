"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderInlineKeyboard = getOrderInlineKeyboard;
exports.getConfirmCancelKeyboard = getConfirmCancelKeyboard;
exports.getOpenMenuKeyboard = getOpenMenuKeyboard;
exports.getQuickActionsKeyboard = getQuickActionsKeyboard;
exports.getOrderSuccessKeyboard = getOrderSuccessKeyboard;
const telegraf_1 = require("telegraf");
const env_1 = require("../../config/env");
/**
 * Inline keyboard for a specific order
 * Shows contextual action buttons based on order status
 */
function getOrderInlineKeyboard(orderId, status) {
    const buttons = [];
    // Track order link (always shown)
    buttons.push([
        telegraf_1.Markup.button.url('📋 متابعة الطلب', `https://t.me/${env_1.env.bot.username}?start=order_${orderId}`),
    ]);
    // Cancel button (only for cancellable orders)
    if (['pending', 'confirmed'].includes(status)) {
        buttons.push([
            telegraf_1.Markup.button.callback('❌ إلغاء الطلب', `cancel_${orderId}`),
        ]);
    }
    // Reorder button (only for delivered orders)
    if (status === 'delivered') {
        buttons.push([
            telegraf_1.Markup.button.callback('🔄 إعادة الطلب', `reorder_${orderId}`),
        ]);
    }
    // Open menu (always)
    buttons.push([
        telegraf_1.Markup.button.webApp('🍔 فتح القائمة', env_1.env.miniApp.url),
    ]);
    return telegraf_1.Markup.inlineKeyboard(buttons);
}
/**
 * Confirm/cancel cancellation keyboard
 */
function getConfirmCancelKeyboard(orderId) {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('✅ نعم، إلغاء', `confirm_cancel_${orderId}`),
            telegraf_1.Markup.button.callback('🔙 تراجع', `no_cancel_${orderId}`),
        ],
    ]);
}
/**
 * Simple open menu button
 */
function getOpenMenuKeyboard() {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.webApp('🚀 فتح القائمة الكاملة', env_1.env.miniApp.url)],
    ]);
}
/**
 * Quick actions after an order
 */
function getQuickActionsKeyboard(orderId) {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('📋 متابعة الطلب', `track_${orderId}`)],
        [telegraf_1.Markup.button.webApp('🍔 طلب جديد', env_1.env.miniApp.url)],
    ]);
}
/**
 * Order success keyboard (after placing)
 */
function getOrderSuccessKeyboard(orderId) {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.url('📋 متابعة الطلب', `https://t.me/${env_1.env.bot.username}?start=order_${orderId}`)],
        [telegraf_1.Markup.button.webApp('🍔 طلب إضافي', env_1.env.miniApp.url)],
    ]);
}
//# sourceMappingURL=order_keyboard.js.map