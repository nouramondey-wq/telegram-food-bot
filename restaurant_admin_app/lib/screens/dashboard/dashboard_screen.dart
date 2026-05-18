import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';
import 'package:restaurant_admin_app/widgets/status_badge.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('لوحة التحكم'),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: provider.refresh,
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async => provider.refresh(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ============================================================
                // بطاقات الإحصائيات السريعة
                // ============================================================
                _buildStatsGrid(context, provider),

                const SizedBox(height: 20),

                // ============================================================
                // قسم الطلبات النشطة
                // ============================================================
                _buildSectionHeader(context, 'الطلبات النشطة',
                    '${provider.activeOrdersCount} طلب'),
                const SizedBox(height: 12),

                if (provider.isLoading)
                  ...List.generate(
                    3,
                    (_) => _buildSkeletonCard(),
                  )
                else if (provider.activeOrdersCount == 0)
                  _buildEmptyState(context, 'لا توجد طلبات نشطة',
                      'الطلبات الجديدة ستظهر هنا')
                else
                  ...provider.orders
                      .where((o) => o.isActive)
                      .take(5)
                      .map((order) => _buildActiveOrderCard(context, order)),

                const SizedBox(height: 20),

                // ============================================================
                // إحصائيات الحالات
                // ============================================================
                _buildSectionHeader(context, 'حالات الطلبات',
                    'حسب الحالة'),
                const SizedBox(height: 12),
                _buildStatusPie(context, provider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatsGrid(BuildContext context, OrderProvider provider) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: [
        _buildStatCard(
          context,
          icon: Icons.receipt_long,
          label: 'إجمالي الطلبات',
          value: '${provider.orders.length}',
          color: AppTheme.primary,
        ),
        _buildStatCard(
          context,
          icon: Icons.hourglass_empty,
          label: 'قيد الانتظار',
          value: '${provider.pendingCount}',
          color: AppTheme.statusPending,
        ),
        _buildStatCard(
          context,
          icon: Icons.restaurant,
          label: 'قيد التحضير',
          value: '${provider.statusCounts['preparing'] ?? 0}',
          color: AppTheme.statusPreparing,
        ),
        _buildStatCard(
          context,
          icon: Icons.check_circle_outline,
          label: 'جاهزة',
          value: '${provider.statusCounts['ready'] ?? 0}',
          color: AppTheme.statusReady,
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, String subtitle) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const Spacer(),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _buildActiveOrderCard(BuildContext context, dynamic order) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppTheme.getStatusColor(order.status).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              '#${order.orderNumber}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: AppTheme.getStatusColor(order.status),
                fontSize: 16,
              ),
            ),
          ),
        ),
        title: Text(
          'طلب #${order.orderNumber}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${order.items.length} أصناف • ${order.elapsedTime}',
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
        trailing: StatusBadge(status: order.status),
        onTap: () {
          Navigator.pushNamed(context, '/orders/${order.id}');
        },
      ),
    );
  }

  Widget _buildSkeletonCard() {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 100,
                  height: 14,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  width: 80,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(fontSize: 13, color: Colors.grey.shade400),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusPie(BuildContext context, OrderProvider provider) {
    final statuses = provider.statusCounts;
    final total = provider.orders.length;
    if (total == 0) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            for (final entry in statuses.entries)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppTheme.getStatusColor(entry.key),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      AppTheme.getStatusText(entry.key),
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                    ),
                    const Spacer(),
                    Text(
                      '${entry.value}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 100,
                      child: LinearProgressIndicator(
                        value: entry.value / total,
                        backgroundColor: Colors.grey.shade100,
                        color: AppTheme.getStatusColor(entry.key),
                        minHeight: 6,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
