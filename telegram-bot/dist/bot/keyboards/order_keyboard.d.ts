import { Markup } from 'telegraf';
/**
 * Inline keyboard for a specific order
 * Shows contextual action buttons based on order status
 */
export declare function getOrderInlineKeyboard(orderId: string, status: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
/**
 * Confirm/cancel cancellation keyboard
 */
export declare function getConfirmCancelKeyboard(orderId: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
/**
 * Simple open menu button
 */
export declare function getOpenMenuKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
/**
 * Quick actions after an order
 */
export declare function getQuickActionsKeyboard(orderId: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
/**
 * Order success keyboard (after placing)
 */
export declare function getOrderSuccessKeyboard(orderId: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
//# sourceMappingURL=order_keyboard.d.ts.map