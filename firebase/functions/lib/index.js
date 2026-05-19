"use strict";
// ============================================================
// Firebase Cloud Functions - مطعم الذواقة
// ============================================================
// هذه الدوال تتعامل مع الإشعارات التلقائية والبوت
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOldNotifications = exports.getStats = exports.healthCheck = exports.onOrderStatusUpdate = exports.onNewOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// ============================================================
// إشعار الطلب الجديد - إرسال إشعار للمطعم
// ============================================================
exports.onNewOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
    var _a, _b;
    const order = snap.data();
    const orderId = context.params.orderId;
    console.log(`📦 طلب جديد: #${order.order_number}`, { orderId, order });
    try {
        // 1. إرسال إشعار إلى أجهزة المطعم عبر FCM
        const adminTokens = await getAdminDeviceTokens();
        if (adminTokens.length > 0) {
            const notificationPayload = {
                notification: {
                    title: `📦 طلب جديد #${order.order_number}`,
                    body: `طلب بقيمة ${order.total} ر.س - ${((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 0} أصناف`,
                    sound: 'default',
                },
                data: {
                    type: 'new_order',
                    orderId: orderId,
                    orderNumber: `${order.order_number}`,
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            };
            await admin.messaging().sendToDevice(adminTokens, notificationPayload);
        }
        // 2. تحديث عداد الطلبات
        await db.doc('settings/order_counter').set({
            current_number: order.order_number,
            last_update: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 3. تسجيل الحدث للتحليلات
        await db.collection('analytics').add({
            type: 'order_created',
            order_id: orderId,
            order_number: order.order_number,
            total: order.total,
            item_count: ((_b = order.items) === null || _b === void 0 ? void 0 : _b.length) || 0,
            source: order.source || 'telegram_mini_app',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ تمت معالجة الطلب #${order.order_number}`);
    }
    catch (error) {
        console.error(`❌ خطأ في معالجة الطلب #${order.order_number}:`, error);
    }
});
// ============================================================
// إشعار تحديث حالة الطلب
// ============================================================
exports.onOrderStatusUpdate = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    var _a;
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;
    // تجاهل إذا لم تتغير الحالة
    if (before.status === after.status)
        return;
    console.log(`🔄 تحديث حالة الطلب #${after.order_number}: ${before.status} → ${after.status}`);
    try {
        // إشعار العميل
        const telegramId = (_a = after.customer) === null || _a === void 0 ? void 0 : _a.telegram_id;
        if (telegramId) {
            // سيتم إرسال إشعار Telegram عبر الـ Bot
            await sendNotificationToBot(after.order_number, after.status, telegramId, orderId);
        }
        // تسجيل التغيير
        await db.collection('analytics').add({
            type: 'status_update',
            order_id: orderId,
            order_number: after.order_number,
            old_status: before.status,
            new_status: after.status,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (error) {
        console.error('❌ خطأ في تحديث الإشعار:', error);
    }
});
// ============================================================
// دوال مساعدة
// ============================================================
// الحصول على أجهزة الإدارة المسجلة
async function getAdminDeviceTokens() {
    try {
        const adminsSnap = await db.collection('admins').get();
        const tokens = [];
        adminsSnap.forEach((doc) => {
            const data = doc.data();
            if (data.fcm_tokens && Array.isArray(data.fcm_tokens)) {
                tokens.push(...data.fcm_tokens.filter((t) => typeof t === 'string' && t.length > 0));
            }
        });
        return [...new Set(tokens)]; // إزالة التكرار
    }
    catch (error) {
        console.error('❌ فشل في جلب أجهزة الإدارة:', error);
        return [];
    }
}
// إرسال إشعار لـ Telegram Bot
async function sendNotificationToBot(orderNumber, status, telegramId, orderId) {
    try {
        // تخزين الإشعار في Firestore ليقرأه الـ Bot
        await db.collection('bot_notifications').add({
            telegram_id: telegramId,
            order_number: orderNumber,
            status: status,
            order_id: orderId,
            sent: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ تم تخزين إشعار لـ @${telegramId}`);
    }
    catch (error) {
        console.error('❌ فشل في تخزين الإشعار:', error);
    }
}
// ============================================================
// دوال HTTP للاختبار والإدارة
// ============================================================
// Health Check
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'مطعم الذواقة - Cloud Functions',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// إحصاءات سريعة (للتطبيقات الخارجية)
exports.getStats = functions.https.onCall(async (data) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayOrders = await db
            .collection('orders')
            .where('created_at', '>=', today)
            .where('created_at', '<', tomorrow)
            .get();
        let totalRevenue = 0;
        let pendingCount = 0;
        todayOrders.forEach((doc) => {
            const order = doc.data();
            totalRevenue += order.total || 0;
            if (order.status === 'pending')
                pendingCount++;
        });
        return {
            today_orders: todayOrders.size,
            today_revenue: totalRevenue,
            pending_orders: pendingCount,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'فشل في جلب الإحصاءات');
    }
});
// وظيفة مجدولة: تنظيف الإشعارات القديمة
exports.cleanOldNotifications = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const oldNotifications = await db
        .collection('bot_notifications')
        .where('created_at', '<', threeDaysAgo)
        .get();
    let deleted = 0;
    const batch = db.batch();
    oldNotifications.forEach((doc) => {
        batch.delete(doc.ref);
        deleted++;
    });
    await batch.commit();
    console.log(`🧹 تم حذف ${deleted} إشعار قديم`);
});
//# sourceMappingURL=index.js.map