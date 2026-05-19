import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/services/auth_service.dart';
import 'package:restaurant_admin_app/services/notification_service.dart';
import 'package:restaurant_admin_app/services/print_service.dart';
import 'package:restaurant_admin_app/services/sound_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _printerAddressController = TextEditingController();
  final _printerPortController = TextEditingController(text: '9100');
  final _authService = AuthService();
  bool _notificationSoundEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadPrinterConfig();
    _loadSoundConfig();
  }

  void _loadSoundConfig() {
    _notificationSoundEnabled = SoundService().isSoundEnabled;
  }

  Future<void> _loadPrinterConfig() async {
    final ps = PrintService();
    await ps.loadSavedConfig();
    // إذا كان هناك إعدادات محفوظة، فعّلها في الحقول
    if (ps.isConfigured) {
      _printerAddressController.text = ps.printerAddress ?? '';
      _printerPortController.text = ps.printerPort.toString();
    }
  }

  @override
  void dispose() {
    _printerAddressController.dispose();
    _printerPortController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ============================================================
          // قسم الحساب
          // ============================================================
          _buildSectionHeader('👤 الحساب'),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.email_outlined, color: AppTheme.primary, size: 20),
                  ),
                  title: const Text('البريد الإلكتروني', style: TextStyle(fontSize: 14)),
                  subtitle: Text(
                    _authService.currentUser?.email ?? 'غير مسجل',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.logout, color: Colors.red, size: 20),
                  ),
                  title: const Text('تسجيل الخروج', style: TextStyle(fontSize: 14, color: Colors.red)),
                  onTap: () => _confirmLogout(context),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ============================================================
          // قسم الإشعارات والصوت
          // ============================================================
          _buildSectionHeader('🔔 الإشعارات'),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                SwitchListTile(
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      _notificationSoundEnabled ? Icons.volume_up : Icons.volume_off,
                      color: AppTheme.primary,
                      size: 20,
                    ),
                  ),
                  title: const Text('🔊 صوت التنبيه', style: TextStyle(fontSize: 14)),
                  subtitle: Text(
                    _notificationSoundEnabled
                        ? 'سيتم تشغيل صوت عند وصول طلب جديد'
                        : 'الصوت معطل',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                  value: _notificationSoundEnabled,
                  onChanged: (value) async {
                    await SoundService().setSoundEnabled(value);
                    setState(() => _notificationSoundEnabled = value);

                    // تشغيل صوت تجريبي عند التفعيل
                    if (value) {
                      SoundService().playNotificationSound();
                    }

                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(value
                              ? '🔊 تم تفعيل صوت التنبيه'
                              : '🔇 تم إيقاف صوت التنبيه'),
                          backgroundColor: value ? AppTheme.success : AppTheme.warning,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ============================================================
          // قسم الطابعة الحرارية
          // ============================================================
          _buildSectionHeader('🖨️ الطابعة الحرارية'),
          const SizedBox(height: 8),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'إعدادات الطابعة',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _printerAddressController,
                    decoration: const InputDecoration(
                      labelText: 'عنوان IP الطابعة',
                      hintText: 'مثال: 192.168.1.100',
                      prefixIcon: Icon(Icons.computer),
                    ),
                    keyboardType: TextInputType.url,
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _printerPortController,
                    decoration: const InputDecoration(
                      labelText: 'المنفذ (Port)',
                      hintText: 'المنفذ الافتراضي: 9100',
                      prefixIcon: Icon(Icons.settings_ethernet),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _testPrinter,
                      icon: const Icon(Icons.print, size: 18),
                      label: const Text('اختبار الطباعة'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.info,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // ============================================================
          // معلومات التطبيق
          // ============================================================
          _buildSectionHeader('ℹ️ معلومات التطبيق'),
          const SizedBox(height: 8),

          Card(
            child: Column(
              children: [
                _buildInfoTile('الإصدار', '1.0.0'),
                const Divider(height: 1),
                _buildInfoTile('المنصة', 'Flutter'),
                const Divider(height: 1),
                _buildInfoTile('قاعدة البيانات', 'Firebase Firestore'),
                const Divider(height: 1),
                _buildInfoTile('المصادقة', 'Firebase Auth'),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // زر حفظ الإعدادات
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saveSettings,
              child: const Text('💾 حفظ الإعدادات'),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return ListTile(
      title: Text(label, style: const TextStyle(fontSize: 14)),
      trailing: Text(
        value,
        style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
      ),
    );
  }

  void _testPrinter() {
    final address = _printerAddressController.text.trim();
    final port = int.tryParse(_printerPortController.text) ?? 9100;

    if (address.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ الرجاء إدخال عنوان IP الطابعة أولاً'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🖨️ جاري اختبار الطابعة...'),
        backgroundColor: AppTheme.info,
      ),
    );

    _runPrinterTest(address, port);
  }

  Future<void> _runPrinterTest(String address, int port) async {
    try {
      final socket = await Socket.connect(
        address,
        port,
        timeout: const Duration(seconds: 5),
      );

      // ESC/POS test: initialize + print test line + cut
      final List<int> bytes = [];
      bytes.addAll([0x1B, 0x40]); // ESC @ - Initialize
      bytes.addAll([0x1B, 0x61, 0x01]); // Center align
      bytes.addAll([0x1D, 0x21, 0x11]); // Double size
      bytes.addAll(utf8.encode('مطعم الذواقة\n'));
      bytes.addAll([0x1D, 0x21, 0x00]); // Normal size
      bytes.addAll(utf8.encode('═══════════════════════════\n'));
      bytes.addAll(utf8.encode('اختبار الطباعة - نجح ✅\n'));
      bytes.addAll(utf8.encode('تم الاتصال بالطابعة بنجاح\n'));
      bytes.addAll(utf8.encode('═══════════════════════════\n'));
      bytes.addAll([0x0A, 0x0A, 0x0A]);
      bytes.addAll([0x1D, 0x56, 0x00]); // Cut paper

      socket.add(bytes);
      await socket.flush();
      await socket.close();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ اختبار الطباعة نجح! تمت الطباعة بنجاح'),
          backgroundColor: AppTheme.success,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ فشل الاتصال بالطابعة: $e'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  void _saveSettings() {
    final address = _printerAddressController.text.trim();
    if (address.isNotEmpty) {
      final port = int.tryParse(_printerPortController.text) ?? 9100;
      PrintService().configure(address, port: port);
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ تم حفظ الإعدادات'),
        backgroundColor: AppTheme.success,
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من تسجيل الخروج؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              // إزالة جهاز الإدارة من الإشعارات
              await NotificationService().removeToken();
              await _authService.signOut();
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );
  }
}
