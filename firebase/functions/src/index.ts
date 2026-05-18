// ============================================================
// Firebase Cloud Functions - مطعم الذواقة
// ============================================================
// هذه الدوال تتعامل مع الإشعارات التلقائية والبوت
// ============================================================

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// إشعار الطلب الجديد - إرسال إشعار للمطعم
// ============================================================
export const onNewOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    console.log(`📦 طلب جديد: #${order.order_number}`, { orderId, order });

    try {
      // 1. إرسال إشعار إلى أجهزة المطعم عبر FCM
      const adminTokens = await getAdminDeviceTokens();
      if (adminTokens.length > 0) {
        const notificationPayload: admin.messaging.MessagingPayload = {
          notification: {
            title: `📦 طلب جديد #${order.order_number}`,
            body: `طلب بقيمة ${order.total} ر.س - ${order.items?.length || 0} أصناف`,
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
        item_count: order.items?.length || 0,
        source: order.source || 'telegram_mini_app',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ تمت معالجة الطلب #${order.order_number}`);
    } catch (error) {
      console.error(`❌ خطأ في معالجة الطلب #${order.order_number}:`, error);
    }
  });

// ============================================================
// إشعار تحديث حالة الطلب
// ============================================================
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // تجاهل إذا لم تتغير الحالة
    if (before.status === after.status) return;

    console.log(`🔄 تحديث حالة الطلب #${after.order_number}: ${before.status} → ${after.status}`);

    try {
      // إشعار العميل
      const telegramId = after.customer?.telegram_id;
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

    } catch (error) {
      console.error('❌ خطأ في تحديث الإشعار:', error);
    }
  });

// ============================================================
// دوال مساعدة
// ============================================================

// الحصول على أجهزة الإدارة المسجلة
async function getAdminDeviceTokens(): Promise<string[]> {
  try {
    const adminsSnap = await db.collection('admins').get();
    const tokens: string[] = [];

    adminsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcm_tokens && Array.isArray(data.fcm_tokens)) {
        tokens.push(...data.fcm_tokens.filter((t: string) => typeof t === 'string' && t.length > 0));
      }
    });

    return [...new Set(tokens)]; // إزالة التكرار
  } catch (error) {
    console.error('❌ فشل في جلب أجهزة الإدارة:', error);
    return [];
  }
}

// إرسال إشعار لـ Telegram Bot
async function sendNotificationToBot(
  orderNumber: number,
  status: string,
  telegramId: string,
  orderId: string,
): Promise<void> {
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
  } catch (error) {
    console.error('❌ فشل في تخزين الإشعار:', error);
  }
}

// ============================================================
// دوال HTTP للاختبار والإدارة
// ============================================================

// Health Check
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'مطعم الذواقة - Cloud Functions',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// إحصاءات سريعة (للتطبيقات الخارجية)
export const getStats = functions.https.onCall(async (data) => {
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
      if (order.status === 'pending') pendingCount++;
    });

    return {
      today_orders: todayOrders.size,
      today_revenue: totalRevenue,
      pending_orders: pendingCount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'فشل في جلب الإحصاءات',
    );
  }
});

// وظيفة مجدولة: تنظيف الإشعارات القديمة
export const cleanOldNotifications = functions.pubsub
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
