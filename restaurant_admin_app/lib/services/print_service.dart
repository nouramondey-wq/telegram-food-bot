import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:restaurant_admin_app/models/order_model.dart';

/// ESC/POS thermal printer service
class PrintService {
  static final PrintService _instance = PrintService._();
  factory PrintService() => _instance;
  PrintService._();

  String? _printerAddress;
  int _printerPort = 9100;

  /// إعداد الطابعة
  void configure(String address, {int port = 9100}) {
    _printerAddress = address;
    _printerPort = port;
    _savePrinterConfig(address, port);
  }

  String? get printerAddress => _printerAddress;
  int get printerPort => _printerPort;
  bool get isConfigured => _printerAddress != null;

  /// طباعة فاتورة الطلب
  Future<bool> printOrder(OrderModel order) async {
    if (kIsWeb) {
      debugPrint('⚠️ الطباعة الحرارية غير متوفرة على الويب');
      return false;
    }

    if (!isConfigured) {
      debugPrint('⚠️ الطابعة غير مهيأة');
      return false;
    }

    try {
      final bytes = _generateReceipt(order);
      await _sendToPrinter(bytes);
      return true;
    } catch (e) {
      debugPrint('❌ خطأ في الطباعة: $e');
      return false;
    }
  }

  /// توليد محتوى الفاتورة بصيغة ESC/POS
  List<int> _generateReceipt(OrderModel order) {
    final List<int> bytes = [];

    // Initialize printer
    bytes.addAll([0x1B, 0x40]); // ESC @

    // Center align
    bytes.addAll([0x1B, 0x61, 0x01]);

    // Character size: double height & width for header
    bytes.addAll([0x1D, 0x21, 0x11]);

    // Restaurant name
    bytes.addAll(utf8.encode('مطعم الذواقة\n'));
    bytes.addAll([0x0A]);

    // Normal size
    bytes.addAll([0x1D, 0x21, 0x00]);

    // Divider
    bytes.addAll(utf8.encode('═══════════════════════════\n'));
    bytes.addAll([0x0A]);

    // Order info
    bytes.addAll(utf8.encode('📋 طلب رقم: #${order.orderNumber}\n'));
    bytes.addAll(utf8.encode('${_formatDateTime(order.createdAt?.toDate())}\n'));
    bytes.addAll([0x0A]);

    // Customer info
    final customerName = order.customer['first_name'] ?? '';
    if (customerName.isNotEmpty) {
      bytes.addAll(utf8.encode('👤 $customerName\n'));
    }
    bytes.addAll([0x0A]);

    // Items header
    bytes.addAll([0x1B, 0x61, 0x00]); // Left align
    bytes.addAll(utf8.encode('الصنف              الكمية   السعر\n'));
    bytes.addAll(utf8.encode('───────────────────────────────\n'));

    // Items
    for (final item in order.items) {
      bytes.addAll(utf8.encode(
          '${item.nameAr.padRight(16)} ${item.quantity.toString().padLeft(3)}   ${item.itemTotal.toStringAsFixed(2)}\n'));

      // Addons
      for (final addon in item.addons) {
        bytes.addAll(utf8.encode('  + ${addon.nameAr}\n'));
      }
    }

    // Divider
    bytes.addAll(utf8.encode('───────────────────────────────\n'));
    bytes.addAll([0x0A]);

    // Total
    bytes.addAll([0x1B, 0x61, 0x01]); // Center align
    bytes.addAll([0x1D, 0x21, 0x11]); // Double size
    bytes.addAll(utf8.encode('الإجمالي: ${order.total.toStringAsFixed(2)} ر.س\n'));
    bytes.addAll([0x1D, 0x21, 0x00]); // Normal size
    bytes.addAll([0x0A]);

    // Payment method
    bytes.addAll(utf8.encode('💳 دفع: ${order.payment['method'] == 'cash' ? 'نقداً' : order.payment['method']}\n'));
    bytes.addAll([0x0A]);

    // Notes
    if (order.notes.isNotEmpty) {
      bytes.addAll(utf8.encode('📝 ملاحظات: ${order.notes}\n'));
      bytes.addAll([0x0A]);
    }

    // Footer
    bytes.addAll(utf8.encode('═══════════════════════════\n'));
    bytes.addAll(utf8.encode('شكراً لطلبك! نتمنى لك وجبة شهية 😊\n'));
    bytes.addAll([0x0A, 0x0A, 0x0A]);

    // Cut paper
    bytes.addAll([0x1D, 0x56, 0x00]); // GS V 0 - full cut

    return bytes;
  }

  /// إرسال البيانات إلى الطابعة
  Future<void> _sendToPrinter(List<int> data) async {
    try {
      final socket = await Socket.connect(
        _printerAddress!,
        _printerPort,
        timeout: const Duration(seconds: 5),
      );
      socket.add(data);
      await socket.flush();
      await socket.close();
    } catch (e) {
      debugPrint('❌ فشل الاتصال بالطابعة: $e');
      rethrow;
    }
  }

  String _formatDateTime(DateTime? dt) {
    if (dt == null) return '';
    return '${dt.year}/${dt.month.toString().padLeft(2, '0')}/${dt.day.toString().padLeft(2, '0')} '
        '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  /// حفظ إعدادات الطابعة
  void _savePrinterConfig(String address, int port) {
    _saveToLocal(address, port);
  }

  /// تحميل الإعدادات المحفوظة
  Future<void> loadSavedConfig() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedAddress = prefs.getString('printer_address');
      final savedPort = prefs.getInt('printer_port');
      if (savedAddress != null) {
        _printerAddress = savedAddress;
        _printerPort = savedPort ?? 9100;
      }
    } catch (e) {
      debugPrint('⚠️ فشل تحميل إعدادات الطابعة: $e');
    }
  }

  /// حفظ الإعدادات محلياً
  void _saveToLocal(String address, int port) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('printer_address', address);
      await prefs.setInt('printer_port', port);
    } catch (e) {
      debugPrint('⚠️ فشل حفظ إعدادات الطابعة: $e');
    }
  }
}
