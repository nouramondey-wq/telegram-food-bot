import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:restaurant_admin_app/config/firebase_config.dart';
import 'package:restaurant_admin_app/models/order_model.dart';
import 'package:restaurant_admin_app/models/menu_item_model.dart';

class FirestoreService {
  final FirebaseFirestore _db;

  FirestoreService() : _db = FirebaseConfig.instance.firestore;

  // ============================================================
  // الطلبات - Orders
  // ============================================================

  /// الاستماع للتغييرات في الطلبات (real-time)
  Stream<QuerySnapshot> listenOrders({String? statusFilter, int limit = 50}) {
    Query query = _db.collection('orders').orderBy('created_at', descending: true).limit(limit);

    if (statusFilter != null && statusFilter != 'all') {
      query = query.where('status', isEqualTo: statusFilter);
    }

    return query.snapshots();
  }

  /// تحديث حالة الطلب
  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    await _db.collection('orders').doc(orderId).update({
      'status': newStatus,
      'status_timeline.$newStatus': FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
    });
  }

  /// الحصول على طلب محدد
  Future<OrderModel?> getOrder(String orderId) async {
    final doc = await _db.collection('orders').doc(orderId).get();
    if (!doc.exists) return null;
    return OrderModel.fromFirestore(doc);
  }

  // ============================================================
  // القائمة - Menu Items
  // ============================================================

  /// الاستماع للتغييرات في القائمة (real-time)
  Stream<QuerySnapshot> listenMenuItems() {
    return _db.collection('menu_items').orderBy('sort_order').snapshots();
  }

  /// إضافة صنف جديد
  Future<String> addMenuItem(MenuItemModel item) async {
    final docRef = await _db.collection('menu_items').add({
      ...item.toJson(),
      'created_at': FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /// تحديث صنف
  Future<void> updateMenuItem(MenuItemModel item) async {
    await _db.collection('menu_items').doc(item.id).update(item.toJson());
  }

  /// حذف صنف
  Future<void> deleteMenuItem(String itemId) async {
    await _db.collection('menu_items').doc(itemId).delete();
  }

  /// تبديل حالة التوفر
  Future<void> toggleAvailability(String itemId, bool isAvailable) async {
    await _db.collection('menu_items').doc(itemId).update({
      'is_available': isAvailable,
      'updated_at': FieldValue.serverTimestamp(),
    });
  }

  // ============================================================
  // الفئات - Categories
  // ============================================================

  /// الاستماع للتغييرات في الفئات (real-time)
  Stream<QuerySnapshot> listenCategories() {
    return _db.collection('categories').orderBy('sort_order').snapshots();
  }

  /// إضافة فئة جديدة
  Future<String> addCategory(CategoryModel category) async {
    final docRef = await _db.collection('categories').add(category.toJson());
    return docRef.id;
  }

  /// تحديث فئة
  Future<void> updateCategory(CategoryModel category) async {
    await _db.collection('categories').doc(category.id).update(category.toJson());
  }

  /// حذف فئة
  Future<void> deleteCategory(String categoryId) async {
    await _db.collection('categories').doc(categoryId).delete();
  }

  // ============================================================
  // الإحصائيات - Statistics
  // ============================================================

  /// الحصول على إحصائيات اليوم
  Future<Map<String, dynamic>> getTodayStats() async {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    final ordersQuery = await _db
        .collection('orders')
        .where('created_at', isGreaterThanOrEqualTo: startOfDay)
        .where('created_at', isLessThan: endOfDay)
        .get();

    int totalOrders = ordersQuery.docs.length;
    double totalRevenue = 0;
    int pendingCount = 0;
    int preparingCount = 0;

    for (var doc in ordersQuery.docs) {
      final data = doc.data();
      totalRevenue += (data['total'] ?? 0).toDouble();
      final status = data['status'] ?? '';
      if (status == 'pending') pendingCount++;
      if (status == 'preparing') preparingCount++;
    }

    return {
      'totalOrders': totalOrders,
      'totalRevenue': totalRevenue,
      'pendingCount': pendingCount,
      'preparingCount': preparingCount,
    };
  }
}
