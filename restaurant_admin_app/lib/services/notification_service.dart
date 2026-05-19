import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:restaurant_admin_app/config/firebase_config.dart';
import 'package:restaurant_admin_app/services/auth_service.dart';
import 'package:restaurant_admin_app/services/sound_service.dart';

/// خدمة الإشعارات عبر Firebase Cloud Messaging
/// تدير طلب الأذونات، تسجيل التوكن، معالجة الإشعارات الواردة
class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final FirebaseMessaging _messaging = FirebaseConfig.instance.messaging;
  final FirebaseFirestore _firestore = FirebaseConfig.instance.firestore;
  final AuthService _auth = AuthService();

  StreamSubscription<RemoteMessage>? _foregroundSub;
  StreamSubscription<String>? _tokenRefreshSub;

  /// مراقب النقر على الإشعارات (للاتجاه للطلب)
  void Function(String orderId)? onOrderNotificationTap;

  bool _initialized = false;

  /// تهيئة الإشعارات
  Future<void> initialize() async {
    if (_initialized) return;

    // طلب أذونات الإشعارات
    await _requestPermissions();

    // حفظ التوكن الحالي
    await _saveCurrentToken();

    // متابعة تحديث التوكن
    try {
      _tokenRefreshSub = _messaging.onTokenRefresh.listen(_saveTokenToFirestore,
        onError: (e) => debugPrint('⚠️ Token refresh listener error: $e'),
      );
    } catch (e) {
      debugPrint('⚠️ Could not listen to token refresh (unsupported platform): $e');
    }

    // معالجة الإشعارات في الواجهة (foreground)
    _setupForegroundHandler();

    // معالجة النقر على الإشعار عند فتح التطبيق من الخلفية
    _setupInitialNotificationTap();

    _initialized = true;
    debugPrint('✅ NotificationService initialized');
  }

  /// طلب أذونات الإشعارات
  Future<void> _requestPermissions() async {
    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        announcement: true,
        criticalAlert: true,
        provisional: false,
      );

      debugPrint('🔔 Notification permission: ${settings.authorizationStatus}');
    } catch (e) {
      debugPrint('⚠️ Could not request notification permission: $e');
      // على Windows/web قد لا تكون الأذونات مدعومة بنفس الطريقة
    }
  }

  /// حفظ التوكن الحالي في Firestore
  Future<void> _saveCurrentToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null && token.isNotEmpty) {
        await _saveTokenToFirestore(token);
      }
    } catch (e) {
      debugPrint('⚠️ Could not get FCM token: $e');
    }
  }

  /// حفظ التوكن في مجموعة admins/tokens
  Future<void> _saveTokenToFirestore(String token, {String? uid}) async {
    final adminUid = uid ?? _auth.currentUser?.uid;
    if (adminUid == null || adminUid.isEmpty) return;

    try {
      // استخدام arrayUnion لإضافة التوكن بدون تكرار
      await _firestore.collection('admins').doc(adminUid).set(
        {
          'fcm_tokens': FieldValue.arrayUnion([token]),
          'email': _auth.currentUser?.email ?? '',
          'last_active': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
      debugPrint('✅ FCM token saved for admin: $adminUid');
    } catch (e) {
      debugPrint('⚠️ Failed to save FCM token: $e');
    }
  }

  /// إزالة التوكن عند تسجيل الخروج
  Future<void> removeToken() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null || uid.isEmpty) return;

    try {
      final token = await _messaging.getToken();
      if (token != null && token.isNotEmpty) {
        await _firestore.collection('admins').doc(uid).update({
          'fcm_tokens': FieldValue.arrayRemove([token]),
        });
        debugPrint('✅ FCM token removed for admin: $uid');
      }
    } catch (e) {
      debugPrint('⚠️ Failed to remove FCM token: $e');
    }
  }

  /// تسجيل جهاز الإدارة للإشعارات (يُستدعى بعد تسجيل الدخول)
  /// لا يعتمد على _initialized لضمان حفظ التوكن عند كل تسجيل دخول
  Future<void> registerDevice() async {
    // طلب أذونات الإشعارات (إن لم تكن قد طُلبت بعد)
    await _requestPermissions();

    // حفظ التوكن الحالي
    await _saveCurrentToken();

    // متابعة تحديث التوكن
    try {
      _tokenRefreshSub?.cancel();
      _tokenRefreshSub = _messaging.onTokenRefresh.listen(_saveTokenToFirestore,
        onError: (e) => debugPrint('⚠️ Token refresh listener error: $e'),
      );
    } catch (e) {
      debugPrint('⚠️ Could not listen to token refresh (unsupported platform): $e');
    }

    // معالجة الإشعارات في الواجهة (foreground) — إذا لم تكن قد فُعّلت
    if (_foregroundSub == null) {
      _setupForegroundHandler();
    }

    // معالجة النقر على الإشعار عند فتح التطبيق من الخلفية
    _setupInitialNotificationTap();

    _initialized = true;
    debugPrint('✅ NotificationService device registered');
  }

  /// معالجة الإشعارات الواردة أثناء استخدام التطبيق
  void _setupForegroundHandler() {
    try {
      _foregroundSub?.cancel();
      _foregroundSub = FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('📨 Foreground notification received: ${message.messageId}');

        final data = message.data;
        final orderId = data['orderId'];
        final orderNumber = data['orderNumber'];

        // تشغيل صوت التنبيه
        SoundService().playNotificationSound();

        if (orderId != null && _onNotificationCallback != null) {
          _onNotificationCallback!(
            title: message.notification?.title ?? '📦 طلب جديد',
            body: message.notification?.body ?? '',
            orderId: orderId as String,
            orderNumber: orderNumber as String? ?? '',
          );
        }
      });
    } catch (e) {
      debugPrint('⚠️ Could not setup foreground handler (unsupported platform): $e');
    }
  }

  bool _initialNotificationTapSetup = false;

  /// معالجة النقر على الإشعار عند فتح التطبيق من الخلفية
  void _setupInitialNotificationTap() {
    if (_initialNotificationTapSetup) return;
    _initialNotificationTapSetup = true;

    // إذا فتح التطبيق من إشعار (terminated/killed state)
    _messaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        _handleNotificationTap(message);
      }
    }).catchError((e) {
      debugPrint('⚠️ Could not get initial message (unsupported platform): $e');
    });

    // إذا كان التطبيق في الخلفية وتم النقر على الإشعار
    try {
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    } catch (e) {
      debugPrint('⚠️ Could not setup onMessageOpenedApp (unsupported platform): $e');
    }
  }

  /// التوجيه إلى صفحة تفاصيل الطلب عند النقر على الإشعار
  void _handleNotificationTap(RemoteMessage message) {
    final orderId = message.data['orderId'] as String?;
    if (orderId != null && orderId.isNotEmpty && onOrderNotificationTap != null) {
      onOrderNotificationTap!(orderId);
    }
  }

  /// رد نداء للإشعارات في الواجهة (يتم تعيينه من main)
  InAppNotificationCallback? _onNotificationCallback;

  set onNotification(InAppNotificationCallback callback) {
    _onNotificationCallback = callback;
  }

  /// تنظيف الـ subscriptions
  void dispose() {
    _foregroundSub?.cancel();
    _tokenRefreshSub?.cancel();
  }

  /// ============================================================
  /// 🧪 محاكاة الإشعار الوارد (لأغراض الاختبار)
  /// ============================================================
  /// تُستخدم من DashboardScreen لاختبار الـ UI بدون الحاجة إلى FCM
  /// @returns true إذا تم التنفيذ بنجاح، false إذا لم يُهيّأ الـ callback
  static bool simulateForegroundNotification({
    required String title,
    required String body,
    required String orderId,
    required String orderNumber,
  }) {
    // تشغيل صوت التنبيه في المحاكاة أيضاً
    SoundService().playNotificationSound();

    final instance = NotificationService();
    final callback = instance._onNotificationCallback;
    if (callback == null) return false;

    callback(
      title: title,
      body: body,
      orderId: orderId,
      orderNumber: orderNumber,
    );
    return true;
  }
}

typedef InAppNotificationCallback = void Function({
  required String title,
  required String body,
  required String orderId,
  required String orderNumber,
});
