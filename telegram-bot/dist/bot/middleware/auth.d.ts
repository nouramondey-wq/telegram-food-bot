import { Context } from 'telegraf';
export interface SessionContext extends Context {
    session?: {
        customerId?: string;
        chatId?: string;
    };
}
export interface BotContext extends SessionContext {
}
/**
 * Customer middleware - ensures every user has a Firestore customer record.
 * Creates new customers on first interaction, updates existing ones.
 */
export declare function ensureCustomer(ctx: BotContext, next: () => Promise<void>): Promise<void>;
/**
 * Check if a customer is blocked (abuse prevention)
 */
export declare function isCustomerBlocked(customerId: string): Promise<boolean>;
//# sourceMappingURL=auth.d.ts.map