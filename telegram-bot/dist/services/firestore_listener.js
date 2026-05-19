"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreOrderListener = void 0;
const firebase_1 = require("../config/firebase");
const notification_service_1 = require("./notification_service");
class FirestoreOrderListener {
    db = (0, firebase_1.getFirestore)();
    notifier = new notification_service_1.NotificationService();
    orders = new Map();
    ready = false;
    unsubscribe = null;
    /**
     * Start listening to orders collection
     */
    start() {
        console.log('🔥 Starting Firestore order listener...');
        // Listen to orders collection in real-time
        this.unsubscribe = this.db
            .collection('orders')
            .orderBy('created_at', 'desc')
            .limit(100)
            .onSnapshot((snapshot) => {
            // Process each document change
            snapshot.docChanges().forEach((change) => {
                const orderId = change.doc.id;
                const data = change.doc.data();
                const order = { id: orderId, ...data };
                switch (change.type) {
                    case 'added':
                        this.handleNewOrder(order, orderId);
                        break;
                    case 'modified':
                        this.handleOrderUpdate(order, orderId);
                        break;
                    case 'removed':
                        this.orders.delete(orderId);
                        break;
                }
            });
            // Mark as ready after first batch is processed
            if (!this.ready) {
                this.ready = true;
                console.log(`🔥 Firestore listener ready — monitoring ${this.orders.size} orders`);
            }
        }, (error) => {
            console.error('🔥 Firestore listener error:', error);
            // Auto-reconnect after 5 seconds
            setTimeout(() => {
                console.log('🔥 Reconnecting Firestore listener...');
                this.stop();
                this.start();
            }, 5000);
        });
    }
    /**
     * Handle a new order document
     */
    handleNewOrder(order, orderId) {
        // Skip if we already know about this order
        if (this.orders.has(orderId))
            return;
        const state = {
            status: order.status || 'pending',
            notifiedNew: false,
            notifiedStatus: false,
        };
        this.orders.set(orderId, state);
        // If not ready yet (initial load), just track — don't send notifications
        if (!this.ready)
            return;
        // Only notify if it's truly a new order (not older than 2 minutes and has source)
        const createdAt = order.created_at?.toDate?.() || new Date(0);
        const isRecent = Date.now() - createdAt.getTime() < 2 * 60 * 1000;
        const hasSource = order.source && order.source !== 'admin_test';
        if (isRecent && hasSource) {
            this.notifyNewOrder(order, orderId, state);
        }
    }
    /**
     * Handle an order status update
     */
    handleOrderUpdate(order, orderId) {
        const prevState = this.orders.get(orderId);
        const newStatus = order.status || 'pending';
        // If we don't have previous state, track it and return
        if (!prevState) {
            this.orders.set(orderId, {
                status: newStatus,
                notifiedNew: false,
                notifiedStatus: false,
            });
            return;
        }
        // Check if status actually changed
        if (prevState.status === newStatus)
            return;
        // Update stored state
        prevState.status = newStatus;
        prevState.notifiedStatus = false;
        // Send status update notification to customer
        if (!this.ready)
            return;
        const telegramId = order.customer?.telegram_id || order.customer?.telegramId;
        if (telegramId) {
            console.log(`📨 Sending status update for #${order.order_number}: ${prevState.status} → ${newStatus}`);
            this.notifier.sendStatusUpdate(telegramId, order).catch((err) => {
                console.error(`Failed to send status update for #${order.order_number}:`, err);
            });
            prevState.notifiedStatus = true;
        }
        // Log analytics
        this.logAnalyticsEvent(order, orderId, 'status_update', {
            old_status: prevState.status,
            new_status: newStatus,
        }).catch(() => { });
    }
    /**
     * Notify admins about a new order (FCM + Telegram)
     */
    async notifyNewOrder(order, orderId, state) {
        if (state.notifiedNew)
            return;
        console.log(`📦 New order #${order.order_number} — sending notifications...`);
        try {
            // 1. Send FCM push to admin Flutter app (devices)
            const fcmSent = await this.notifier.sendFCMToAdmins(order);
            console.log(`[FCM] Push sent to ${fcmSent} device(s)`);
            // 2. Send Telegram alert to admin chat IDs
            await this.notifier.sendAdminAlert(order);
            console.log(`📨 Admin Telegram alert sent for #${order.order_number}`);
            // 3. Update order counter
            await this.db
                .doc('settings/order_counter')
                .set({
                current_number: order.order_number,
                last_update: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            // 4. Log analytics
            await this.logAnalyticsEvent(order, orderId, 'order_created', {
                total: order.total,
                item_count: order.items?.length || 0,
                source: order.source || 'telegram_mini_app',
            });
            state.notifiedNew = true;
            console.log(`✅ Order #${order.order_number} fully processed`);
        }
        catch (error) {
            console.error(`❌ Failed to process new order #${order.order_number}:`, error);
        }
    }
    /**
     * Log analytics event to Firestore
     */
    async logAnalyticsEvent(order, orderId, type, extra = {}) {
        try {
            await this.db.collection('analytics').add({
                type,
                order_id: orderId,
                order_number: order.order_number,
                ...extra,
                created_at: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        catch (error) {
            console.error('Failed to log analytics:', error);
        }
    }
    /**
     * Stop listening
     */
    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.orders.clear();
        this.ready = false;
        console.log('🔥 Firestore listener stopped');
    }
}
exports.FirestoreOrderListener = FirestoreOrderListener;
//# sourceMappingURL=firestore_listener.js.map