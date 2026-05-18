"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const firebase_1 = require("../config/firebase");
class OrderService {
    db = (0, firebase_1.getFirestore)();
    // ──────────────────────────────────────────────
    // Customer Orders
    // ──────────────────────────────────────────────
    async getCustomerOrders(customerId, limit = 10) {
        const snapshot = await this.db
            .collection('orders')
            .where('customer_id', '==', customerId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                created_at: data.created_at?.toDate(),
                updated_at: data.updated_at?.toDate(),
            };
        });
    }
    async getOrder(orderId) {
        const doc = await this.db.collection('orders').doc(orderId).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate(),
            updated_at: data.updated_at?.toDate(),
        };
    }
    async getOrderByNumber(orderNumber) {
        const snapshot = await this.db
            .collection('orders')
            .where('order_number', '==', orderNumber)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate(),
            updated_at: data.updated_at?.toDate(),
        };
    }
    // ──────────────────────────────────────────────
    // Order Mutations
    // ──────────────────────────────────────────────
    async cancelOrder(orderId, customerId) {
        const order = await this.getOrder(orderId);
        if (!order)
            return false;
        if (order.customer_id !== customerId)
            return false;
        if (!['pending', 'confirmed'].includes(order.status))
            return false;
        const now = firebase_1.admin.firestore.FieldValue.serverTimestamp();
        await this.db.collection('orders').doc(orderId).update({
            status: 'cancelled',
            'status_timeline.cancelled': now,
            updated_at: now,
        });
        // Log cancellation event
        await this.db.collection('order_history').add({
            order_id: orderId,
            order_number: order.order_number,
            from_status: order.status,
            to_status: 'cancelled',
            changed_by: 'customer',
            changed_by_id: customerId,
            timestamp: now,
            note: 'تم إلغاء الطلب بواسطة العميل',
        });
        return true;
    }
    /**
     * Reorder: returns a pre-built cart structure from a previous order
     */
    async prepareReorder(orderId, customerId) {
        const order = await this.getOrder(orderId);
        if (!order)
            return null;
        if (order.customer_id !== customerId)
            return null;
        // Build items for reorder
        const items = order.items.map((item) => ({
            menu_item_id: item.menu_item_id,
            name_ar: item.name_ar,
            quantity: item.quantity,
            unit_price: item.unit_price,
            addons: item.addons || [],
        }));
        // Check if all items are still available
        const unavailableItems = [];
        for (const item of items) {
            const menuDoc = await this.db.collection('menu_items').doc(item.menu_item_id).get();
            if (!menuDoc.exists || menuDoc.data()?.is_available === false) {
                unavailableItems.push(item.name_ar);
            }
        }
        return {
            originalOrderNumber: order.order_number,
            items,
            unavailableItems,
            allAvailable: unavailableItems.length === 0,
        };
    }
    // ──────────────────────────────────────────────
    // Formatting
    // ──────────────────────────────────────────────
    formatOrderForBot(order) {
        const statusMap = {
            pending: { emoji: '🟡', text: 'قيد الانتظار' },
            confirmed: { emoji: '✅', text: 'تم التأكيد' },
            preparing: { emoji: '🔵', text: 'جاري التحضير 🔥' },
            ready: { emoji: '🟢', text: 'جاهز للتسليم 🎉' },
            delivered: { emoji: '✅', text: 'تم الاستلام' },
            cancelled: { emoji: '❌', text: 'ملغي' },
        };
        const s = statusMap[order.status] || { emoji: '🟡', text: order.status };
        let message = `${s.emoji} *الطلب #${order.order_number}*\n`;
        message += `الحالة: ${s.text}\n`;
        message += `${'─'.repeat(20)}\n`;
        for (const item of order.items || []) {
            message += `• ${item.name_ar} × ${item.quantity} — ${item.item_total.toFixed(2)} ر.س\n`;
            if (item.addons?.length > 0) {
                for (const addon of item.addons) {
                    message += `  + ${addon.name_ar}: ${addon.price.toFixed(2)} ر.س\n`;
                }
            }
        }
        message += `${'─'.repeat(20)}\n`;
        message += `💰 *الإجمالي: ${order.total.toFixed(2)} ر.س*\n`;
        message += `💳 الدفع: كاش\n`;
        if (order.notes) {
            message += `📝 ملاحظات: ${order.notes}\n`;
        }
        if (order.created_at) {
            const date = new Date(order.created_at).toLocaleString('ar-SA');
            message += `\n⏰ ${date}`;
        }
        return message;
    }
    formatOrdersList(orders) {
        if (orders.length === 0) {
            return '📋 لا توجد طلبات سابقة. ابدأ أول طلب لك! 🍽️';
        }
        const statusEmojis = {
            pending: '🟡', confirmed: '✅', preparing: '🔵',
            ready: '🟢', delivered: '✅', cancelled: '❌',
        };
        let message = '📋 *طلباتك الأخيرة:*\n\n';
        for (const order of orders) {
            const emoji = statusEmojis[order.status] || '🟡';
            const date = order.created_at
                ? new Date(order.created_at).toLocaleDateString('ar-SA')
                : '';
            message += `${emoji} #${order.order_number} — ${order.total.toFixed(2)} ر.س — ${date}\n`;
            const itemsSummary = order.items?.map((i) => i.name_ar).join(', ') || '';
            message += `   ${itemsSummary.length > 50 ? itemsSummary.substring(0, 50) + '...' : itemsSummary}\n\n`;
        }
        return message;
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order_service.js.map