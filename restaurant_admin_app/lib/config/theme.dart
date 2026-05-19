import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ============================================================
  // الألوان الأساسية - مستوحاة من العلامة التجارية للمطعم
  // ============================================================
  static const Color primary = Color(0xFF059669); // emerald-600
  static const Color primaryLight = Color(0xFF34D399); // emerald-400
  static const Color primaryDark = Color(0xFF047857); // emerald-700
  static const Color secondary = Color(0xFFF59E0B); // amber-500
  static const Color background = Color(0xFFF9FAFB); // gray-50
  static const Color surface = Color(0xFFFFFFFF); // white
  static const Color error = Color(0xFFEF4444); // red-500
  static const Color success = Color(0xFF10B981); // emerald-500
  static const Color warning = Color(0xFFF59E0B); // amber-500
  static const Color info = Color(0xFF3B82F6); // blue-500

  // ============================================================
  // ألوان حالات الطلب
  // ============================================================
  static const Color statusPending = Color(0xFFF59E0B); // pending - برتقالي
  static const Color statusConfirmed = Color(0xFF3B82F6); // confirmed - أزرق
  static const Color statusPreparing = Color(0xFF8B5CF6); // preparing - بنفسجي
  static const Color statusReady = Color(0xFF10B981); // ready - أخضر
  static const Color statusDelivered = Color(0xFF6B7280); // delivered - رمادي
  static const Color statusCancelled = Color(0xFFEF4444); // cancelled - أحمر

  static Color getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return statusPending;
      case 'confirmed':
        return statusConfirmed;
      case 'preparing':
        return statusPreparing;
      case 'ready':
        return statusReady;
      case 'delivered':
        return statusDelivered;
      case 'cancelled':
        return statusCancelled;
      default:
        return Colors.grey;
    }
  }

  static String getStatusText(String status) {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'تم التأكيد';
      case 'preparing':
        return 'جاري التحضير';
      case 'ready':
        return 'جاهز';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }

  static String getStatusEmoji(String status) {
    switch (status) {
      case 'pending':
        return '🟡';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '🔵';
      case 'ready':
        return '🟢';
      case 'delivered':
        return '✔️';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  }

  // ============================================================
  // الثيم الكامل
  // ============================================================
  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.cairoTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: secondary,
        error: error,
        surface: surface,
      ),
      scaffoldBackgroundColor: background,

      // ============================================================
      // الخطوط - Arabic First (Cairo)
      // ============================================================
      textTheme: textTheme.copyWith(
        displayLarge: textTheme.displayLarge?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: textTheme.displayMedium?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.bold,
        ),
        headlineLarge: textTheme.headlineLarge?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
        ),
        bodyMedium: textTheme.bodyMedium?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
        ),
        bodySmall: textTheme.bodySmall?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
        ),
        labelLarge: textTheme.labelLarge?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
          fontWeight: FontWeight.w600,
        ),
        labelSmall: textTheme.labelSmall?.copyWith(
          fontFamily: GoogleFonts.cairo().fontFamily,
        ),
      ),

      // ============================================================
      // RTL Directionality
      // ============================================================
      // Flutter's Material will automatically apply RTL when locale is Arabic

      // ============================================================
      // AppBar
      // ============================================================
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: Colors.black87,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.cairo(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
        iconTheme: const IconThemeData(color: Colors.black87),
      ),

      // ============================================================
      // Cards
      // ============================================================
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade100),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),

      // ============================================================
      // Buttons
      // ============================================================
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.cairo(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ============================================================
      // Navigation Bar (Bottom)
      // ============================================================
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        elevation: 0,
        indicatorColor: primary.withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.cairo(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: primary,
            );
          }
          return GoogleFonts.cairo(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Colors.grey,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primary, size: 24);
          }
          return const IconThemeData(color: Colors.grey, size: 24);
        }),
      ),

      // ============================================================
      // Input Fields
      // ============================================================
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.cairo(color: Colors.grey.shade400, fontSize: 14),
        labelStyle: GoogleFonts.cairo(color: Colors.grey.shade600, fontSize: 14),
      ),

      // ============================================================
      // Bottom Sheet
      // ============================================================
      bottomSheetTheme: const BottomSheetThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
      ),

      // ============================================================
      // Dialog
      // ============================================================
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        titleTextStyle: GoogleFonts.cairo(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),

      // ============================================================
      // Snackbar / Toast
      // ============================================================
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentTextStyle: GoogleFonts.cairo(fontSize: 14),
      ),

      // ============================================================
      // Divider
      // ============================================================
      dividerTheme: DividerThemeData(
        color: Colors.grey.shade100,
        thickness: 1,
        space: 1,
      ),

      // ============================================================
      // Floating Action Button
      // ============================================================
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
