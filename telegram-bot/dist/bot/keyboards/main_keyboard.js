"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainKeyboard = getMainKeyboard;
exports.getPostOrderKeyboard = getPostOrderKeyboard;
exports.getBackKeyboard = getBackKeyboard;
const telegraf_1 = require("telegraf");
const env_1 = require("../../config/env");
// ⌨️ لوحة المفاتيح الرئيسية (أسفل الشاشة)
function getMainKeyboard() {
    return telegraf_1.Markup.keyboard([
        [telegraf_1.Markup.button.webApp('🍔 فتح القائمة', env_1.env.miniApp.url)],
        [telegraf_1.Markup.button.text('📋 طلباتي'), telegraf_1.Markup.button.text('ℹ️ عن المطعم')],
        [telegraf_1.Markup.button.text('🕐 أوقات العمل'), telegraf_1.Markup.button.text('📞 تواصل معنا')],
    ])
        .resize()
        .persistent(); // تبقى حتى بعد إعادة تشغيل البوت
}
// ⌨️ لوحة المفاتيح بعد الطلب
function getPostOrderKeyboard() {
    return telegraf_1.Markup.keyboard([
        [telegraf_1.Markup.button.webApp('🍔 فتح القائمة', env_1.env.miniApp.url)],
        [telegraf_1.Markup.button.text('📋 طلباتي'), telegraf_1.Markup.button.text('🏠 القائمة الرئيسية')],
    ])
        .resize()
        .persistent();
}
// ⌨️ لوحة المفاتيح للرجعيين (اختياري)
function getBackKeyboard() {
    return telegraf_1.Markup.keyboard([
        [telegraf_1.Markup.button.text('🏠 القائمة الرئيسية')],
    ])
        .resize()
        .persistent();
}
//# sourceMappingURL=main_keyboard.js.map