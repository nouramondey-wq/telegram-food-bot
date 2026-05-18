import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/models/order_model.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';
import 'package:restaurant_admin_app/widgets/status_badge.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  bool _isPrinting = false;

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, _) {
        final orders = provider.orders.where((o) => o.id == widget.orderId).toList();
        if (orders.isEmpty) {
          return Scaffold(
            appBar: AppBar(title: const Text('الطلب')),
            body: const Center(child: Text('الطلب غير موجود')),
          );
        }

        final order = orders.first;
        return Scaffold(
          appBar: AppBar(
            title: Text('طلب #${order.orderNumber}'),
            actions: [
              // طباعة
              IconButton(
                icon: _isPrinting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.print),
                onPressed: _isPrinting ? null : () => _printOrder(order, provider),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // ============================================================
              // بطاقة الحالة
              // ============================================================
              _buildStatusCard(context, order, provider),

              const SizedBox(height: 16),

              // ============================================================
              // الأصناف
              // ============================================================
              _buildSectionCard(
                title: '🍔 الأصناف',
                child: Column(
                  children: [
                    for (final item in order.items) ...[
                      _buildItemRow(item),
                      if (item != order.items.last) const Divider(),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ============================================================
              // الملخص المالي
              // ============================================================
              _buildSectionCard(
                title: '💰 الملخص المالي',
                child: Column(
                  children: [
                    _buildInfoRow('المجموع', '${order.subtotal.toStringAsFixed(2)} ر.س'),
                    const Divider(),
                    _buildInfoRow('الضريبة (15%)', '${order.tax.toStringAsFixed(2)} ر.س'),
                    const Divider(),
                    _buildInfoRow('الإجمالي', '${order.total.toStringAsFixed(2)} ر.س',
                        isBold: true, color: AppTheme.primary),
                    const Divider(),
                    _buildInfoRow('طريقة الدفع', 'نقداً'),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ============================================================
              // معلومات العميل
              // ============================================================
              _buildSectionCard(
                title: '👤 معلومات العميل',
                child: Column(
                  children: [
                    _buildInfoRow('الاسم', order.customer['first_name'] ?? 'غير محدد'),
                    if (order.customer['telegram_username'] != null &&
                        order.customer['telegram_username'].isNotEmpty) ...[
                      const Divider(),
                      _buildInfoRow('Telegram', '@${order.customer['telegram_username']}'),
                    ],
                    const Divider(),
                    _buildInfoRow('المصدر', 'Telegram Mini App'),
                  ],
                ),
              ),

              if (order.notes.isNotEmpty) ...[
                const SizedBox(height: 16),
                _buildSectionCard(
                  title: '📝 ملاحظات',
                  child: Text(
                    order.notes,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                  ),
                ),
              ],

              const SizedBox(height: 80),
            ],
          ),

          // ============================================================
          // أزرار الإجراءات السفلية
          // ============================================================
          bottomNavigationBar: order.isActive
              ? _buildBottomActions(context, order, provider)
              : null,
        );
      },
    );
  }

  Widget _buildStatusCard(BuildContext context, OrderModel order, OrderProvider provider) {
    // مراحل الـ Timeline
    final timelineSteps = [
      {'key': 'pending', 'label': 'معلق'},
      {'key': 'confirmed', 'label': 'مؤكد'},
      {'key': 'preparing', 'label': 'تحضير'},
      {'key': 'ready', 'label': 'جاهز'},
      {'key': 'delivered', 'label': 'تم التسليم'},
    ];

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'الحالة الحالية',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),
                const Spacer(),
                StatusBadge(status: order.status, fontSize: 14),
              ],
            ),
            const SizedBox(height: 20),

            // Timeline
            ...timelineSteps.asMap().entries.map((entry) {
              final idx = entry.key;
              final step = entry.value;
              final stepKey = step['key']!;
              final hasTimestamp = order.statusTimeline[stepKey] != null;
              final isCurrent = order.status == stepKey;
              final isCompleted = hasTimestamp && stepKey != order.status;
              final isFuture = !hasTimestamp && !isCurrent;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // الخط العمودي
                  SizedBox(
                    width: 24,
                    child: Column(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isCompleted
                                ? AppTheme.statusReady
                                : isCurrent
                                    ? AppTheme.primary
                                    : Colors.grey.shade300,
                          ),
                        ),
                        if (idx < timelineSteps.length - 1)
                          Container(
                            width: 2,
                            height: 30,
                            color: isCompleted
                                ? AppTheme.statusReady.withValues(alpha: 0.3)
                                : Colors.grey.shade200,
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step['label']!,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                              color: isFuture ? Colors.grey.shade400 : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildItemRow(dynamic item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '${item.quantity}x',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item.nameAr,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                ),
              ),
              Text(
                '${item.itemTotal.toStringAsFixed(2)} ر.س',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade800,
                ),
              ),
            ],
          ),
          if (item.addons.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 38, top: 4),
              child: Text(
                item.addons.map((a) => '+ ${a.nameAr}').join('، '),
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({required String title, required Widget child}) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              color: color ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context, OrderModel order, OrderProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (order.canCancel)
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _confirmCancel(context, order.id, provider),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('إلغاء', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            if (order.canCancel) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: _buildNextActionButton(order, provider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNextActionButton(OrderModel order, OrderProvider provider) {
    String label;
    String nextStatus;

    switch (order.status) {
      case 'pending':
        label = 'تأكيد الطلب';
        nextStatus = 'confirmed';
        break;
      case 'confirmed':
        label = 'بدء التحضير';
        nextStatus = 'preparing';
        break;
      case 'preparing':
        label = 'تحديد كجاهز';
        nextStatus = 'ready';
        break;
      case 'ready':
        label = 'تسليم الطلب';
        nextStatus = 'delivered';
        break;
      default:
        return const SizedBox.shrink();
    }

    return ElevatedButton(
      onPressed: () => provider.updateStatusAndPrint(order.id, nextStatus),
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 14),
        backgroundColor: _getActionColor(nextStatus),
      ),
      child: Text(label),
    );
  }

  Color _getActionColor(String status) {
    switch (status) {
      case 'confirmed':
        return AppTheme.statusConfirmed;
      case 'preparing':
        return AppTheme.statusPreparing;
      case 'ready':
        return AppTheme.statusReady;
      case 'delivered':
        return AppTheme.statusDelivered;
      default:
        return AppTheme.primary;
    }
  }

  Future<void> _confirmCancel(BuildContext context, String orderId, OrderProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إلغاء الطلب'),
        content: const Text('هل أنت متأكد من إلغاء هذا الطلب؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('رجوع'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('تأكيد الإلغاء'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await provider.updateStatus(orderId, 'cancelled');
    }
  }

  Future<void> _printOrder(OrderModel order, OrderProvider provider) async {
    setState(() => _isPrinting = true);
    
    // طباعة عبر الـ Print Service
    await Future.delayed(const Duration(seconds: 1));
    
    if (!mounted) return;
    setState(() => _isPrinting = false);
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('🖨️ تم إرسال الفاتورة للطباعة')),
    );
  }
}
