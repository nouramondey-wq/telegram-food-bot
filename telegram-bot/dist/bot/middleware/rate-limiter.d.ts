import { Context, Middleware } from 'telegraf';
interface RateLimitConfig {
    /** Max requests allowed in the window */
    maxRequests: number;
    /** Time window in milliseconds (default: 1 second) */
    windowMs: number;
    /** Block duration in ms after exceeding limit (default: 60 seconds) */
    blockDurationMs: number;
    /** Whether to send warning messages */
    sendWarnings: boolean;
    /** Cooldown between warning messages (ms) */
    warningCooldownMs: number;
}
/**
 * Create rate limiter middleware
 */
export declare function rateLimiter(config?: Partial<RateLimitConfig>): Middleware<Context>;
/**
 * Rate limiter specifically for commands (stricter)
 */
export declare const commandRateLimiter: Middleware<Context<import("@telegraf/types").Update>>;
/**
 * Rate limiter for callback queries (more lenient)
 */
export declare const callbackRateLimiter: Middleware<Context<import("@telegraf/types").Update>>;
export {};
//# sourceMappingURL=rate-limiter.d.ts.map