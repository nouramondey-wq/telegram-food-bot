export declare class NotificationService {
    private db;
    /**
     * Send order confirmation with full receipt
     */
    sendOrderConfirmed(chatId: string, order: any): Promise<void>;
    /**
     * Send professional status update with timeline context
     */
    sendStatusUpdate(chatId: string, order: any): Promise<void>;
    /**
     * Send admin alert for new orders — sent to all admin chat IDs
     */
    sendAdminAlert(order: any): Promise<void>;
    /**
     * Send pickup reminder (15 minutes after ready)
     */
    sendPickupReminder(chatId: string, orderNumber: number): Promise<void>;
    /**
     * Send returning customer welcome-back message
     */
    sendWelcomeBack(chatId: string, customer: any): Promise<void>;
    /**
     * Broadcast message to all customers (admin use only)
     */
    broadcastToCustomers(message: string): Promise<number>;
}
//# sourceMappingURL=notification_service.d.ts.map