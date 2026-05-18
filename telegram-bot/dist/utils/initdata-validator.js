"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTelegramInitData = validateTelegramInitData;
exports.parseTelegramUser = parseTelegramUser;
exports.isInitDataFresh = isInitDataFresh;
const crypto = __importStar(require("crypto"));
/**
 * Validate Telegram initData using HMAC-SHA256
 *
 * @param initData - The raw initData string from Telegram.WebApp.initData
 * @param botToken - Your bot's token from @BotFather
 * @returns Parsed + validation result
 */
function validateTelegramInitData(initData, botToken) {
    const parsed = new URLSearchParams(initData);
    const hash = parsed.get('hash');
    if (!hash) {
        return { data: Object.fromEntries(parsed), isValid: false };
    }
    // Remove hash from data
    parsed.delete('hash');
    // Create data check string: all key=value pairs sorted alphabetically, joined by \n
    const dataCheckString = Array.from(parsed.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    // Create secret key: HMAC-SHA256 of bot_token with key "WebAppData"
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    // Create HMAC-SHA256 of data_check_string with secret key
    const computedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    const isValid = computedHash === hash;
    // Parse user JSON if present
    const result = {};
    for (const [key, value] of parsed.entries()) {
        result[key] = value;
    }
    return { data: result, isValid };
}
/**
 * Parse the user JSON from validated initData
 */
function parseTelegramUser(initData) {
    if (!initData.user)
        return null;
    try {
        return JSON.parse(initData.user);
    }
    catch {
        return null;
    }
}
/**
 * Quick check if initData is recent (within tolerance ms)
 * Default: 5 minutes - prevents replay attacks
 */
function isInitDataFresh(initData, toleranceMs = 5 * 60 * 1000) {
    const authDate = parseInt(initData.auth_date || '0', 10) * 1000;
    return Date.now() - authDate < toleranceMs;
}
//# sourceMappingURL=initdata-validator.js.map