"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingKeyboard = getRatingKeyboard;
exports.getRestaurantInfoKeyboard = getRestaurantInfoKeyboard;
exports.getCategoryQuickOrderKeyboard = getCategoryQuickOrderKeyboard;
const telegraf_1 = require("telegraf");
const env_1 = require("../../config/env");
/**
 * Rating buttons (1-5 stars)
 */
function getRatingKeyboard() {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('⭐', 'rate_1'),
            telegraf_1.Markup.button.callback('⭐⭐', 'rate_2'),
            telegraf_1.Markup.button.callback('⭐⭐⭐', 'rate_3'),
            telegraf_1.Markup.button.callback('⭐⭐⭐⭐', 'rate_4'),
            telegraf_1.Markup.button.callback('⭐⭐⭐⭐⭐', 'rate_5'),
        ],
    ]);
}
/**
 * Restaurant info buttons
 */
function getRestaurantInfoKeyboard() {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('📍 الموقع', 'location'),
            telegraf_1.Markup.button.callback('📞 الاتصال', 'contact'),
        ],
        [
            telegraf_1.Markup.button.callback('🕐 أوقات العمل', 'hours'),
        ],
        [
            telegraf_1.Markup.button.webApp('🍔 فتح القائمة', env_1.env.miniApp.url),
        ],
    ]);
}
/**
 * Quick category order buttons
 */
function getCategoryQuickOrderKeyboard() {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('🥗 مقبلات', 'cat_appetizers'),
            telegraf_1.Markup.button.callback('🍕 رئيسية', 'cat_main'),
        ],
        [
            telegraf_1.Markup.button.callback('🥤 مشروبات', 'cat_drinks'),
            telegraf_1.Markup.button.callback('🍰 حلويات', 'cat_desserts'),
        ],
        [telegraf_1.Markup.button.webApp('📋 القائمة الكاملة', env_1.env.miniApp.url)],
    ]);
}
//# sourceMappingURL=inline_keyboards.js.map