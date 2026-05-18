import { Context, Middleware } from 'telegraf';
/**
 * Validate webhook secret token from headers
 * Run this BEFORE bot.webhookCallback()
 */
export declare function validateWebhookSecret(expectedToken: string): (req: any, res: any, next: () => void) => void;
/**
 * Filter unwanted update types at middleware level
 * Prevents processing of irrelevant updates
 */
export declare function filterAllowedUpdates(): Middleware<Context>;
/**
 * Log incoming updates at DEBUG level
 * Useful for monitoring and debugging
 */
export declare function logUpdates(): Middleware<Context>;
/**
 * Validate that the bot is being used in a private chat
 * Prevents adding the bot to groups without proper configuration
 */
export declare function requirePrivateChat(): Middleware<Context>;
//# sourceMappingURL=security.d.ts.map