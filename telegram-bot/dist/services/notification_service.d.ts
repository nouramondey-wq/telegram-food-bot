export declare class NotificationService {
    private db;
    /**
     * Send FCM push notification to all admin devices (Flutter app)
     * Reads FCM tokens from the admins collection
     */
    sendFCMToAdmins(order: any): Promise<number>;
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