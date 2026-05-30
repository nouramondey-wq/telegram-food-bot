import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/providers/order_provider.dart';
import 'package:restaurant_admin_app/widgets/status_badge.dart';

class OrdersQueueScreen extends StatefulWidget {
  const OrdersQueueScreen({super.key});

  @override
  State<OrdersQueueScreen> createState() => _OrdersQueueScreenState();
}

class _OrdersQueueScreenState extends State<OrdersQueueScreen> {
  final ScrollController _scrollController = ScrollController();
  String _selectedFilter = 'all';

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلبات'),
        actions: [
          Consumer<OrderProvider>(
            builder: (context, provider, _) => Center(
              child: Padding(
                padding: const EdgeInsets.only(left: 16),
                child: Text(
                  '${provider.activeOrdersCount} نشط',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ============================================================
          // شريط التصفية
          // ============================================================
          _buildFilterBar(context),

          // ============================================================
          // قائمة الطلبات
          // ============================================================
          Expanded(
            child: Consumer<OrderProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final orders = provider.filteredOrders;

                if (orders.isEmpty) {
                  return _buildEmptyState(context);
                }

                return RefreshIndicator(
                  onRefresh: () async => provider.refresh(),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _buildOrderCard(context, order, provider);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar(BuildContext context) {
    final filters = [
      {'key': 'all', 'label': 'الكل'},
      {'key': 'pending', 'label': 'معلق'},
      {'key': 'confirmed', 'label': 'مؤكد'},
      {'key': 'preparing', 'label': 'تحضير'},
      {'key': 'ready', 'label': 'جاهز'},
      {'key': 'delivered', 'label': 'منتهي'},
      {'key': 'cancelled', 'label': 'ملغي'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: filters.map((f) {
            final isSelected = _selectedFilter == f['key'];
            return Padding(
              padding: const EdgeInsets.only(left: 6),
              child: FilterChip(
                label: Text(f['label']!),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() => _selectedFilter = f['key']!);
                  context.read<OrderProvider>().setStatusFilter(f['key']!);
                },
                selectedColor: AppTheme.primary.withValues(alpha: 0.1),
                checkmarkColor: AppTheme.primary,
                labelStyle: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? AppTheme.primary : Colors.grey.shade700,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                side: BorderSide(
                  color: isSelected ? AppTheme.primary : Colors.grey.shade200,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, dynamic order, OrderProvider provider) {
    final isNewOrder = order.status == 'pending';
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.pushNamed(context, '/orders/${order.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // === السطر العلوي: رقم الطلب + الحالة + الوقت ===
              Row(
                children: [
                  // إشارة طلب جديد
                  if (isNewOrder)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.statusPending,
                        shape: BoxShape.circle,
                      ),
                    ),
                  if (isNewOrder) const SizedBox(width: 8),

                  // رقم الطلب
                  Text(
                    order.displayOrderNumber,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isNewOrder ? AppTheme.statusPending : Colors.black87,
                    ),
                  ),
                  const Spacer(),

                  // الحالة
                  StatusBadge(status: order.status),

                  const SizedBox(width: 12),

                  // الوقت المنقضي
                  Text(
                    order.elapsedTime,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // === الأصناف ===
              ...order.items.take(3).map<Widget>((item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Center(
                        child: Text(
                          '${item.quantity}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.nameAr,
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
                      ),
                    ),
                    if (item.addons.isNotEmpty)
                      Text(
                        '+${item.addons.length}',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
                      ),
                  ],
                ),
              )),

              if (order.items.length > 3)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '+${order.items.length - 3} أصناف أخرى',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                  ),
                ),

              const SizedBox(height: 10),

              // === معلومات العميل والملاحظات ===
              Row(
                children: [
                  Icon(Icons.person_outline, size: 14, color: Colors.grey.shade400),
                  const SizedBox(width: 4),
                  Text(
                    order.customer['first_name'] ?? 'عميل',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  if (order.notes.isNotEmpty) ...[
                    const SizedBox(width: 12),
                    Icon(Icons.notes, size: 14, color: Colors.grey.shade400),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        order.notes,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ),
                  ],
                ],
              ),

              // === أزرار الإجراءات السريعة ===
              if (order.isActive) ...[
                const SizedBox(height: 12),
                _buildQuickActions(context, order, provider),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, dynamic order, OrderProvider provider) {
    final actions = <Widget>[];

    switch (order.status) {
      case 'pending':
        actions.addAll([
          _actionButton(
            label: 'تأكيد',
            icon: Icons.check,
            color: AppTheme.statusConfirmed,
            onTap: () => _updateStatus(order.id, 'confirmed', provider),
          ),
          const SizedBox(width: 8),
          _actionButton(
            label: 'رفض',
            icon: Icons.close,
            color: Colors.red,
            onTap: () => _updateStatus(order.id, 'cancelled', provider),
          ),
        ]);
        break;
      case 'confirmed':
        actions.add(
          _actionButton(
            label: 'بدء التحضير',
            icon: Icons.restaurant,
            color: AppTheme.statusPreparing,
            onTap: () => _updateStatus(order.id, 'preparing', provider),
          ),
        );
        break;
      case 'preparing':
        actions.addAll([
          _actionButton(
            label: 'جاهز',
            icon: Icons.check_circle,
            color: AppTheme.statusReady,
            onTap: () => _updateStatus(order.id, 'ready', provider),
          ),
        ]);
        break;
      case 'ready':
        actions.add(
          _actionButton(
            label: 'تم التسليم',
            icon: Icons.done_all,
            color: AppTheme.statusDelivered,
            onTap: () => _updateStatus(order.id, 'delivered', provider),
          ),
        );
        break;
    }

    return Row(
      children: [
        const Spacer(),
        ...actions,
      ],
    );
  }

  Widget _actionButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      height: 36,
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16),
        label: Text(label, style: const TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    );
  }

  Future<void> _updateStatus(String orderId, String newStatus, OrderProvider provider) async {
    final success = await provider.updateStatus(orderId, newStatus);
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? '✅ تم تحديث الحالة' : '❌ فشل التحديث'),
        backgroundColor: success ? AppTheme.success : AppTheme.error,
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            'لا توجد طلبات',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'عند وصول طلبات جديدة ستظهر هنا',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade400),
          ),
        ],
      ),
    );
  }
}
