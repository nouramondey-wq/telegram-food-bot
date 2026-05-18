import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, _) {
        final today = DateTime.now();
        final todayOrders = provider.orders.where((o) {
          final createdAt = o.createdAt?.toDate();
          if (createdAt == null) return false;
          return createdAt.year == today.year &&
              createdAt.month == today.month &&
              createdAt.day == today.day;
        }).toList();

        final totalRevenue = todayOrders.fold<double>(0, (sum, o) => sum + o.total);
        final avgOrderValue = todayOrders.isEmpty ? 0.0 : totalRevenue / todayOrders.length;

        return Scaffold(
          appBar: AppBar(title: const Text('التقارير')),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // ============================================================
              // ملخص اليوم
              // ============================================================
              Text(
                '📊 تقارير اليوم',
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
                value: '${todayOrders.length}',
                color: AppTheme.primary,
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
                color: AppTheme.info,
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
              const SizedBox(height: 12),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildStatusRow('معلق', provider.statusCounts['pending'] ?? 0, AppTheme.statusPending),
                      const Divider(),
                      _buildStatusRow('مؤكد', provider.statusCounts['confirmed'] ?? 0, AppTheme.statusConfirmed),
                      const Divider(),
                      _buildStatusRow('تحضير', provider.statusCounts['preparing'] ?? 0, AppTheme.statusPreparing),
                      const Divider(),
                      _buildStatusRow('جاهز', provider.statusCounts['ready'] ?? 0, AppTheme.statusReady),
                      const Divider(),
                      _buildStatusRow('ملغي', provider.statusCounts['cancelled'] ?? 0, AppTheme.statusCancelled),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // ============================================================
              // آخر النشاطات
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

              ...provider.orders.take(5).map((order) => ListTile(
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

  Widget _buildStatusRow(String label, int count, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
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
        ],
      ),
    );
  }
}
