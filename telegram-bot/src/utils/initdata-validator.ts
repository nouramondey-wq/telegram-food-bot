import * as crypto from 'crypto';

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
export function validateTelegramInitData(
  initData: string,
  botToken: string
): { data: Record<string, string>; isValid: boolean } {
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
  const result: Record<string, string> = {};
  for (const [key, value] of parsed.entries()) {
    result[key] = value;
  }

  return { data: result, isValid };
}

/**
 * Parse the user JSON from validated initData
 */
export function parseTelegramUser(
  initData: Record<string, string>
): ValidatedInitData['user'] | null {
  if (!initData.user) return null;
  try {
    return JSON.parse(initData.user);
  } catch {
    return null;
  }
}

/**
 * Quick check if initData is recent (within tolerance ms)
 * Default: 5 minutes - prevents replay attacks
 */
export function isInitDataFresh(
  initData: Record<string, string>,
  toleranceMs: number = 5 * 60 * 1000
): boolean {
  const authDate = parseInt(initData.auth_date || '0', 10) * 1000;
  return Date.now() - authDate < toleranceMs;
}
