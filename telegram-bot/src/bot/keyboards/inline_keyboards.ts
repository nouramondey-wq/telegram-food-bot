import { Markup } from 'telegraf';
import { env } from '../../config/env';

/**
 * Rating buttons (1-5 stars)
 */
export function getRatingKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐', 'rate_1'),
      Markup.button.callback('⭐⭐', 'rate_2'),
      Markup.button.callback('⭐⭐⭐', 'rate_3'),
      Markup.button.callback('⭐⭐⭐⭐', 'rate_4'),
      Markup.button.callback('⭐⭐⭐⭐⭐', 'rate_5'),
    ],
  ]);
}

/**
 * Restaurant info buttons
 */
export function getRestaurantInfoKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📍 الموقع', 'location'),
      Markup.button.callback('📞 الاتصال', 'contact'),
    ],
    [
      Markup.button.callback('🕐 أوقات العمل', 'hours'),
    ],
    [
      Markup.button.webApp('🍔 فتح القائمة', env.miniApp.url),
    ],
  ]);
}

/**
 * Quick category order buttons
 */
export function getCategoryQuickOrderKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🥗 مقبلات', 'cat_appetizers'),
      Markup.button.callback('🍕 رئيسية', 'cat_main'),
    ],
    [
      Markup.button.callback('🥤 مشروبات', 'cat_drinks'),
      Markup.button.callback('🍰 حلويات', 'cat_desserts'),
    ],
    [Markup.button.webApp('📋 القائمة الكاملة', env.miniApp.url)],
  ]);
}
