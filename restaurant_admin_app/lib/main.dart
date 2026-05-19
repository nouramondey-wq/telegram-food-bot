import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/config/firebase_config.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';
import 'package:restaurant_admin_app/providers/menu_provider.dart';
import 'package:restaurant_admin_app/screens/auth/login_screen.dart';
import 'package:restaurant_admin_app/screens/main_shell.dart';
import 'package:restaurant_admin_app/screens/orders/order_detail_screen.dart';
import 'package:restaurant_admin_app/services/notification_service.dart';
import 'package:restaurant_admin_app/services/sound_service.dart';

/// مفتاح التنقل العام لعرض SnackBar من أي مكان
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة Firebase
  await FirebaseConfig.init();

  // تهيئة خدمة الإشعارات
  final notificationService = NotificationService();
  await notificationService.initialize();

  // تهيئة خدمة الصوت
  await SoundService().initialize();

  // ============================================================
  // إعداد معالج الإشعارات في الواجهة (foreground)
  // ============================================================
  notificationService.onNotification = ({
    required String title,
    required String body,
    required String orderId,
    required String orderNumber,
  }) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Text('📦 ', style: TextStyle(fontSize: 18)),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  if (body.isNotEmpty)
                    Text(
                      body,
                      style: const TextStyle(fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                Navigator.of(context).pushNamed('/orders/$orderId');
              },
              child: const Text(
                'عرض',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: AppTheme.primary,
        duration: const Duration(seconds: 6),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  };

  // ============================================================
  // معالج النقر على الإشعار (من الخلفية)
  // ============================================================
  notificationService.onOrderNotificationTap = (String orderId) {
    final context = navigatorKey.currentContext;
    if (context != null) {
      Navigator.of(context).pushNamed('/orders/$orderId');
    }
  };

  runApp(const RestaurantAdminApp());
}

class RestaurantAdminApp extends StatelessWidget {
  const RestaurantAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => MenuProvider()),
      ],
      child: MaterialApp(
        title: 'مطعم الذواقة - إدارة',
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,

        // ============================================================
        // دعم اللغة العربية (RTL)
        // ============================================================
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('ar', 'AE'), // العربية
        ],
        locale: const Locale('ar', 'AE'),

        // ============================================================
        // الثيم
        // ============================================================
        theme: AppTheme.lightTheme,

        // ============================================================
        // الشاشة الرئيسية - تسجيل الدخول
        // ============================================================
        home: const LoginScreen(),

        // ============================================================
        // المسارات
        // ============================================================
        routes: {
          '/main': (context) => const MainShell(),
        },

        onGenerateRoute: (settings) {
          // معالجة المسار الديناميكي /orders/:id
          if (settings.name != null && settings.name!.startsWith('/orders/')) {
            final orderId = settings.name!.substring(8); // بعد '/orders/'
            return MaterialPageRoute(
              builder: (context) => OrderDetailScreen(orderId: orderId),
            );
          }
          return null;
        },
      ),
    );
  }
}
