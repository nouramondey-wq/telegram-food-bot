import { Context, Middleware } from 'telegraf';

/**
 * Production-Grade Rate Limiter
 * 
 * Prevents spam and abuse by limiting requests per user per time window.
 * Uses in-memory storage - suitable for single-instance deployments.
 * For multi-instance, replace with Redis-based storage.
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastWarning?: number;
}

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

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 3,        // 3 requests per...
  windowMs: 1000,        // ...1 second
  blockDurationMs: 60000, // Block for 60 seconds after limit exceeded
  sendWarnings: true,
  warningCooldownMs: 10000, // Don't spam warnings within 10 seconds
};

const userRequests = new Map<number, RateLimitEntry>();
const blockedUsers = new Map<number, number>(); // userId -> unblock timestamp

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  
  for (const [userId, entry] of userRequests.entries()) {
    if (now - entry.firstRequest > DEFAULT_CONFIG.windowMs * 2) {
      userRequests.delete(userId);
    }
  }
  
  for (const [userId, unblockAt] of blockedUsers.entries()) {
    if (now > unblockAt) {
      blockedUsers.delete(userId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create rate limiter middleware
 */
export function rateLimiter(
  config: Partial<RateLimitConfig> = {}
): Middleware<Context> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await next();
      return;
    }

    const now = Date.now();

    // Check if user is blocked
    const unblockAt = blockedUsers.get(userId);
    if (unblockAt && now < unblockAt) {
      const remainingSeconds = Math.ceil((unblockAt - now) / 1000);
      
      // Send warning only if cooldown has passed
      const entry = userRequests.get(userId);
      if (
        cfg.sendWarnings &&
        (!entry?.lastWarning || now - entry.lastWarning > cfg.warningCooldownMs)
      ) {
        try {
          await ctx.reply(
            `⚠️ أنت تتصل بسرعة كبيرة. الرجاء الانتظار ${remainingSeconds} ثانية.`
          );
        } catch {
          // Ignore send errors to prevent crashes
        }
        if (entry) {
          entry.lastWarning = now;
        }
      }
      return; // Block the request
    }

    // Get or create entry
    let entry = userRequests.get(userId);
    
    if (!entry || now - entry.firstRequest > cfg.windowMs) {
      // Reset: new window
      userRequests.set(userId, { count: 1, firstRequest: now });
      await next();
      return;
    }

    // Increment count
    entry.count++;

    if (entry.count > cfg.maxRequests) {
      // Block user
      blockedUsers.set(userId, now + cfg.blockDurationMs);
      
      if (cfg.sendWarnings) {
        try {
          await ctx.reply(
            `❌ تم حظرك مؤقتاً لمدة ${cfg.blockDurationMs / 1000} ثانية بسبب السرعة الزائدة. الرجاء الانتظار.`
          );
        } catch {
          // Ignore send errors
        }
        entry.lastWarning = now;
      }
      return; // Block the request
    }

    await next();
  };
}

/**
 * Rate limiter specifically for commands (stricter)
 */
export const commandRateLimiter = rateLimiter({
  maxRequests: 5,
  windowMs: 2000,     // 5 commands per 2 seconds
  blockDurationMs: 30000, // 30 second block
});

/**
 * Rate limiter for callback queries (more lenient)
 */
export const callbackRateLimiter = rateLimiter({
  maxRequests: 10,
  windowMs: 2000,     // 10 callbacks per 2 seconds
  blockDurationMs: 15000, // 15 second block
  sendWarnings: false, // No warning for callbacks (silent block)
});
