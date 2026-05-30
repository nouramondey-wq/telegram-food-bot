import 'package:cloud_firestore/cloud_firestore.dart';

class OrderItemModel {
  final String menuItemId;
  final String nameAr;
  final int quantity;
  final double unitPrice;
  final List<OrderAddon> addons;
  final double itemTotal;

  OrderItemModel({
    required this.menuItemId,
    required this.nameAr,
    required this.quantity,
    required this.unitPrice,
    this.addons = const [],
    required this.itemTotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      menuItemId: json['menu_item_id'] ?? '',
      nameAr: json['name_ar'] ?? '',
      quantity: (json['quantity'] ?? 1) as int,
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      addons: (json['addons'] as List<dynamic>?)
              ?.map((e) => OrderAddon.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      itemTotal: (json['item_total'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'menu_item_id': menuItemId,
        'name_ar': nameAr,
        'quantity': quantity,
        'unit_price': unitPrice,
        'addons': addons.map((e) => e.toJson()).toList(),
        'item_total': itemTotal,
      };
}

class OrderAddon {
  final String id;
  final String nameAr;
  final double price;

  OrderAddon({required this.id, required this.nameAr, required this.price});

  factory OrderAddon.fromJson(Map<String, dynamic> json) {
    return OrderAddon(
      id: json['id'] ?? '',
      nameAr: json['name_ar'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'name_ar': nameAr, 'price': price};
}

class OrderModel {
  final String id;
  final int orderNumber;
  String status; // pending | confirmed | preparing | ready | delivered | cancelled
  final List<OrderItemModel> items;
  final int itemCount;
  final double subtotal;
  final double tax;
  final double total;
  final String notes;
  final Map<String, dynamic> payment;
  final String source;
  final Map<String, dynamic> statusTimeline;
  final Map<String, dynamic> customer;
  final Timestamp? createdAt;
  final Timestamp? updatedAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.items,
    required this.itemCount,
    required this.subtotal,
    required this.tax,
    required this.total,
    this.notes = '',
    required this.payment,
    required this.source,
    required this.statusTimeline,
    required this.customer,
    this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return OrderModel(
      id: doc.id,
      orderNumber: (data['order_number'] ?? 0) as int,
      status: data['status'] ?? 'pending',
      items: (data['items'] as List<dynamic>?)
              ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      itemCount: (data['item_count'] ?? 0) as int,
      subtotal: (data['subtotal'] ?? 0).toDouble(),
      tax: (data['tax'] ?? 0).toDouble(),
      total: (data['total'] ?? 0).toDouble(),
      notes: data['notes'] ?? '',
      payment: data['payment'] ?? {},
      source: data['source'] ?? '',
      statusTimeline: data['status_timeline'] ?? {},
      customer: data['customer'] ?? {},
      createdAt: data['created_at'] as Timestamp?,
      updatedAt: data['updated_at'] as Timestamp?,
    );
  }

  /// حساب الوقت المنقضي منذ الطلب
  String get elapsedTime {
    if (createdAt == null) return '';
    final diff = DateTime.now().difference(createdAt!.toDate());
    if (diff.inMinutes < 1) return 'الآن';
    if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} د';
    if (diff.inHours < 24) return 'منذ ${diff.inHours} س';
    return 'منذ ${diff.inDays} ي';
  }

  /// هل يمكن إلغاء الطلب؟
  bool get canCancel => status == 'pending' || status == 'confirmed';

  /// هل الطلب نشط (لم يكتمل بعد)؟
  bool get isActive => !['delivered', 'cancelled'].contains(status);

  /// رقم الطلب واسم العميل للعرض
  String get displayOrderNumber {
    final firstName = customer['first_name'] as String?;
    if (firstName != null && firstName.isNotEmpty) {
      return '#$orderNumber - $firstName';
    }
    return '#$orderNumber';
  }
}
