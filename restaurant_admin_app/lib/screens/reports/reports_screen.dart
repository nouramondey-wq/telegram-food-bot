import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/models/order_model.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  DateTimeRange? _selectedDateRange;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedDateRange = DateTimeRange(
      start: DateTime(now.year, now.month, now.day),
      end: DateTime(now.year, now.month, now.day, 23, 59, 59),
    );
  }

  List<OrderModel> _filterOrdersByDate(List<OrderModel> orders) {
    if (_selectedDateRange == null) return orders;
    return orders.where((o) {
      final createdAt = o.createdAt?.toDate();
      if (createdAt == null) return false;
      return createdAt.isAfter(_selectedDateRange!.start.subtract(const Duration(seconds: 1))) &&
          createdAt.isBefore(_selectedDateRange!.end);
    }).toList();
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: _selectedDateRange ?? DateTimeRange(
        start: now,
        end: now,
      ),
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now,
      locale: const Locale('ar', 'AE'),
      builder: (context, child) {
        return child!;
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDateRange = DateTimeRange(
          start: DateTime(picked.start.year, picked.start.month, picked.start.day),
          end: DateTime(picked.end.year, picked.end.month, picked.end.day, 23, 59, 59),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, _) {
        final filteredOrders = _filterOrdersByDate(provider.orders);

        final totalOrders = filteredOrders.length;
        final totalRevenue = filteredOrders.fold<double>(0, (sum, o) => sum + o.total);
        final avgOrderValue = totalOrders == 0 ? 0.0 : totalRevenue / totalOrders;

        // إحصائيات إضافية
        final int totalItems = filteredOrders.fold<int>(0, (sum, o) => sum + o.itemCount);
        final mostOrderedStatus = _getMostFrequentStatus(filteredOrders);

        return Scaffold(
          appBar: AppBar(
            title: const Text('التقارير'),
            actions: [
              IconButton(
                icon: const Icon(Icons.calendar_month),
                onPressed: _pickDateRange,
                tooltip: 'اختيار التاريخ',
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // ============================================================
              // شريط التاريخ
              // ============================================================
              _buildDateFilterBar(context),
              const SizedBox(height: 16),

              // ============================================================
              // ملخص الفترة
              // ============================================================
              Text(
                '📊 ملخص الفترة',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 12),

              _buildStatCard(
                icon: Icons.receipt_long,
                label: 'إجمالي الطلبات',
                value: '$totalOrders',
                color: AppTheme.primary,
              ),
              const SizedBox(height: 8),
              _buildStatCard(
                icon: Icons.shopping_bag_outlined,
                label: 'إجمالي الأصناف المباعة',
                value: '$totalItems',
                color: AppTheme.info,
              ),
              const SizedBox(height: 8),
              _buildStatCard(
                icon: Icons.currency_exchange,
                label: 'إجمالي الإيرادات',
                value: '${totalRevenue.toStringAsFixed(2)} ر.س',
                color: AppTheme.success,
              ),
              const SizedBox(height: 8),
              _buildStatCard(
                icon: Icons.trending_up,
                label: 'متوسط قيمة الطلب',
                value: '${avgOrderValue.toStringAsFixed(2)} ر.س',
                color: AppTheme.warning,
              ),

              const SizedBox(height: 24),

              // ============================================================
              // توزيع الطلبات حسب الحالة
              // ============================================================
              Text(
                '📈 توزيع الحالات',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
              if (mostOrderedStatus != null) ...[
                const SizedBox(height: 4),
                Text(
                  'الحالة الأكثر شيوعاً: ${AppTheme.getStatusText(mostOrderedStatus)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
              ],
              const SizedBox(height: 12),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildStatusRow('قيد الانتظار', _countByStatus(filteredOrders, 'pending'), AppTheme.statusPending, totalOrders),
                      const Divider(),
                      _buildStatusRow('مؤكد', _countByStatus(filteredOrders, 'confirmed'), AppTheme.statusConfirmed, totalOrders),
                      const Divider(),
                      _buildStatusRow('تحضير', _countByStatus(filteredOrders, 'preparing'), AppTheme.statusPreparing, totalOrders),
                      const Divider(),
                      _buildStatusRow('جاهز', _countByStatus(filteredOrders, 'ready'), AppTheme.statusReady, totalOrders),
                      const Divider(),
                      _buildStatusRow('تم التسليم', _countByStatus(filteredOrders, 'delivered'), AppTheme.statusDelivered, totalOrders),
                      const Divider(),
                      _buildStatusRow('ملغي', _countByStatus(filteredOrders, 'cancelled'), AppTheme.statusCancelled, totalOrders),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // ============================================================
              // آخر الطلبات
              // ============================================================
              Text(
                '🕐 آخر الطلبات',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 12),

              if (filteredOrders.isEmpty)
                _buildEmptyReports()
              else
                ...filteredOrders.take(5).map((order) => ListTile(
                      leading: Text(
                        '#${order.orderNumber}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.getStatusColor(order.status),
                        ),
                      ),
                      title: Text(
                        '${order.items.length} أصناف',
                        style: const TextStyle(fontSize: 14),
                      ),
                      subtitle: Text(
                        '${order.elapsedTime} - ${order.total.toStringAsFixed(2)} ر.س',
                        style: const TextStyle(fontSize: 12),
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.getStatusColor(order.status).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          AppTheme.getStatusText(order.status),
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.getStatusColor(order.status),
                          ),
                        ),
                      ),
                    )),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDateFilterBar(BuildContext context) {
    final dateFormat = DateFormat('yyyy/MM/dd', 'ar');
    final startStr = _selectedDateRange != null
        ? dateFormat.format(_selectedDateRange!.start)
        : 'الكل';
    final endStr = _selectedDateRange != null
        ? dateFormat.format(_selectedDateRange!.end)
        : '';

    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: _pickDateRange,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.date_range, color: AppTheme.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'الفترة الزمنية',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _selectedDateRange != null
                        ? '$startStr → $endStr'
                        : 'اختر الفترة',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Icon(Icons.arrow_back_ios, size: 16, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }

  int _countByStatus(List<OrderModel> orders, String status) {
    return orders.where((o) => o.status == status).length;
  }

  String? _getMostFrequentStatus(List<OrderModel> orders) {
    if (orders.isEmpty) return null;
    final counts = <String, int>{};
    for (final o in orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts.entries.reduce((a, b) => a.value > b.value ? a : b).key;
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(String label, int count, Color color, int total) {
    final percentage = total > 0 ? (count / total * 100).toStringAsFixed(1) : '0.0';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Expanded(child: Text(label, style: const TextStyle(fontSize: 14))),
              Text(
                '$count',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 50,
                child: Text(
                  '$percentage%',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
          if (total > 0) ...[
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: count / total,
                backgroundColor: Colors.grey.shade100,
                color: color,
                minHeight: 4,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyReports() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(
            'لا توجد طلبات في هذه الفترة',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}
