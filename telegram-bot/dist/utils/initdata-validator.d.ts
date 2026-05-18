/**
 * Telegram Mini App initData Validator
 *
 * Securely validates Telegram.WebApp.initData on the server side.
 * This prevents spoofed requests from outside Telegram.
 *
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export interface ValidatedInitData {
    query_id?: string;
    user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        is_premium?: boolean;
    };
    auth_date: string;
    hash: string;
    isValid: boolean;
    chat_type?: string;
    chat_instance?: string;
}
/**
 * Validate Telegram initData using HMAC-SHA256
 *
 * @param initData - The raw initData string from Telegram.WebApp.initData
 * @param botToken - Your bot's token from @BotFather
 * @returns Parsed + validation result
 */
export declare function validateTelegramInitData(initData: string, botToken: string): {
    data: Record<string, string>;
    isValid: boolean;
};
/**
 * Parse the user JSON from validated initData
 */
export declare function parseTelegramUser(initData: Record<string, string>): ValidatedInitData['user'] | null;
/**
 * Quick check if initData is recent (within tolerance ms)
 * Default: 5 minutes - prevents replay attacks
 */
export declare function isInitDataFresh(initData: Record<string, string>, toleranceMs?: number): boolean;
//# sourceMappingURL=initdata-validator.d.ts.map