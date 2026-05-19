/**
 * 🔥 Firestore Listener — Real-time order monitoring
 *
 * Replaces Firebase Cloud Functions (onNewOrder, onOrderStatusUpdate).
 * Runs inside the Telegram Bot server on Railway.
 *
 * - Detects new orders → sends FCM push + Telegram admin alert
 * - Detects status changes → sends Telegram notification to customer
 * - Updates order counter + logs analytics
 */
export declare class FirestoreOrderListener {
    private db;
    private notifier;
    private orders;
    private ready;
    private unsubscribe;
    /**
     * Start listening to orders collection
     */
    start(): void;
    /**
     * Handle a new order document
     */
    private handleNewOrder;
    /**
     * Handle an order status update
     */
    private handleOrderUpdate;
    /**
     * Notify admins about a new order (FCM + Telegram)
     */
    private notifyNewOrder;
    /**
     * Log analytics event to Firestore
     */
    private logAnalyticsEvent;
    /**
     * Stop listening
     */
    stop(): void;
}
//# sourceMappingURL=firestore_listener.d.ts.map