import { Markup } from 'telegraf';
import { env } from '../../config/env';

/**
 * Inline keyboard for a specific order
 * Shows contextual action buttons based on order status
 */
export function getOrderInlineKeyboard(orderId: string, status: string) {
  const buttons: any[][] = [];

  // Track order link (always shown)
  buttons.push([
    Markup.button.url(
      '📋 متابعة الطلب',
      `https://t.me/${env.bot.username}?start=order_${orderId}`
    ),
  ]);

  // Cancel button (only for cancellable orders)
  if (['pending', 'confirmed'].includes(status)) {
    buttons.push([
      Markup.button.callback('❌ إلغاء الطلب', `cancel_${orderId}`),
    ]);
  }

  // Reorder button (only for delivered orders)
  if (status === 'delivered') {
    buttons.push([

      Markup.button.callback('🔄 إعادة الطلب', `reorder_${orderId}`),
    ]);
  }

  // Open menu (always)
  buttons.push([
    Markup.button.webApp('🍔 فتح القائمة', env.miniApp.url),
  ]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Confirm/cancel cancellation keyboard
 */
export function getConfirmCancelKeyboard(orderId: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ نعم، إلغاء', `confirm_cancel_${orderId}`),
      Markup.button.callback('🔙 تراجع', `no_cancel_${orderId}`),
    ],
  ]);
}

/**
 * Simple open menu button
 */
export function getOpenMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 فتح القائمة الكاملة', env.miniApp.url)],
  ]);
}

/**
 * Quick actions after an order
 */
export function getQuickActionsKeyboard(orderId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📋 متابعة الطلب', `track_${orderId}`)],
    [Markup.button.webApp('🍔 طلب جديد', env.miniApp.url)],
  ]);
}

/**
 * Order success keyboard (after placing)
 */
export function getOrderSuccessKeyboard(orderId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.url('📋 متابعة الطلب', `https://t.me/${env.bot.username}?start=order_${orderId}`)],
    [Markup.button.webApp('🍔 طلب إضافي', env.miniApp.url)],
  ]);
}
