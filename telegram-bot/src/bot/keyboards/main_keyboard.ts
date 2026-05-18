import { Markup } from 'telegraf';
import { env } from '../../config/env';

// ⌨️ لوحة المفاتيح الرئيسية (أسفل الشاشة)
export function getMainKeyboard() {
  return Markup.keyboard([
    [Markup.button.webApp('🍔 فتح القائمة', env.miniApp.url)],
    [Markup.button.text('📋 طلباتي'), Markup.button.text('ℹ️ عن المطعم')],
    [Markup.button.text('🕐 أوقات العمل'), Markup.button.text('📞 تواصل معنا')],
  ])
    .resize()
    .persistent(); // تبقى حتى بعد إعادة تشغيل البوت
}

// ⌨️ لوحة المفاتيح بعد الطلب
export function getPostOrderKeyboard() {
  return Markup.keyboard([
    [Markup.button.webApp('🍔 فتح القائمة', env.miniApp.url)],
    [Markup.button.text('📋 طلباتي'), Markup.button.text('🏠 القائمة الرئيسية')],
  ])
    .resize()
    .persistent();
}

// ⌨️ لوحة المفاتيح للرجعيين (اختياري)
export function getBackKeyboard() {
  return Markup.keyboard([
    [Markup.button.text('🏠 القائمة الرئيسية')],
  ])
    .resize()
    .persistent();
}
