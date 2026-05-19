import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:restaurant_admin_app/models/order_model.dart';
import 'package:restaurant_admin_app/services/firestore_service.dart';
import 'package:restaurant_admin_app/services/print_service.dart';

class OrderProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();
  final PrintService _printer = PrintService();

  List<OrderModel> _orders = [];
  List<OrderModel> get orders => _orders;

  String _statusFilter = 'all';
  String get statusFilter => _statusFilter;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  StreamSubscription? _ordersSubscription;

  OrderProvider() {
    startListening();
  }

  /// عدد الطلبات النشطة
  int get activeOrdersCount => _orders.where((o) => o.isActive).length;

  /// عدد الطلبات المعلقة
  int get pendingCount => _orders.where((o) => o.status == 'pending').length;

  /// الطلبات المصفاة حسب الحالة
  List<OrderModel> get filteredOrders {
    if (_statusFilter == 'all') return _orders;
    return _orders.where((o) => o.status == _statusFilter).toList();
  }

  /// إحصائيات سريعة
  Map<String, int> get statusCounts {
    final counts = <String, int>{};
    for (final order in _orders) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return counts;
  }

  /// بدء الاستماع للتغييرات
  void startListening() {
    _ordersSubscription?.cancel();
    _isLoading = true;
    notifyListeners();

    _ordersSubscription = _firestore.listenOrders().listen(
      (snapshot) {
        _orders = snapshot.docs
            .map((doc) => OrderModel.fromFirestore(doc))
            .toList();
        _isLoading = false;
        _error = null;
        notifyListeners();
      },
      onError: (err) {
        _error = 'فشل تحميل الطلبات: $err';
        _isLoading = false;
        notifyListeners();
      },
    );
  }

  /// تغيير فلتر الحالة
  void setStatusFilter(String status) {
    _statusFilter = status;
    notifyListeners();
  }

  /// تحديث حالة الطلب
  Future<bool> updateStatus(String orderId, String newStatus) async {
    try {
      await _firestore.updateOrderStatus(orderId, newStatus);
      return true;
    } catch (e) {
      _error = 'فشل تحديث الحالة';
      notifyListeners();
      return false;
    }
  }

  /// تحديث الحالة + طباعة الفاتورة
  Future<bool> updateStatusAndPrint(String orderId, String newStatus) async {
    try {
      // تحديث الحالة
      await _firestore.updateOrderStatus(orderId, newStatus);

      // طباعة إذا تم التأكيد
      if (newStatus == 'confirmed') {
        final order = _orders.firstWhere((o) => o.id == orderId);
        await _printer.printOrder(order);
      }

      return true;
    } catch (e) {
      _error = 'فشل العملية';
      notifyListeners();
      return false;
    }
  }

  /// إعادة تحميل
  void refresh() {
    startListening();
  }

  @override
  void dispose() {
    _ordersSubscription?.cancel();
    super.dispose();
  }
}
