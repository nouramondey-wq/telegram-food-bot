import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/config/firebase_config.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';
import 'package:restaurant_admin_app/providers/menu_provider.dart';
import 'package:restaurant_admin_app/screens/auth/login_screen.dart';
import 'package:restaurant_admin_app/screens/dashboard/dashboard_screen.dart';
import 'package:restaurant_admin_app/screens/orders/orders_queue_screen.dart';
import 'package:restaurant_admin_app/screens/orders/order_detail_screen.dart';
import 'package:restaurant_admin_app/screens/menu/menu_management_screen.dart';
import 'package:restaurant_admin_app/screens/reports/reports_screen.dart';
import 'package:restaurant_admin_app/screens/settings/settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة Firebase
  await FirebaseConfig.init();

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
          '/dashboard': (context) => const DashboardScreen(),
          '/orders': (context) => const OrdersQueueScreen(),
          '/menu': (context) => const MenuManagementScreen(),
          '/reports': (context) => const ReportsScreen(),
          '/settings': (context) => const SettingsScreen(),
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
