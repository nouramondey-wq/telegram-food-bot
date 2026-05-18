import 'package:cloud_firestore/cloud_firestore.dart';

class MenuItemAddon {
  String id;
  String nameAr;
  String nameEn;
  double price;
  bool isAvailable;

  MenuItemAddon({
    required this.id,
    required this.nameAr,
    this.nameEn = '',
    required this.price,
    this.isAvailable = true,
  });

  factory MenuItemAddon.fromJson(Map<String, dynamic> json) {
    return MenuItemAddon(
      id: json['id'] ?? '',
      nameAr: json['name_ar'] ?? '',
      nameEn: json['name_en'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      isAvailable: json['is_available'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name_ar': nameAr,
        'name_en': nameEn,
        'price': price,
        'is_available': isAvailable,
      };
}

class MenuItemModel {
  String id;
  String nameAr;
  String nameEn;
  String descriptionAr;
  String descriptionEn;
  double price;
  String? imageUrl;
  String categoryId;
  bool isAvailable;
  bool isFeatured;
  List<MenuItemAddon> addons;
  int sortOrder;
  Timestamp? createdAt;
  Timestamp? updatedAt;

  MenuItemModel({
    required this.id,
    required this.nameAr,
    this.nameEn = '',
    this.descriptionAr = '',
    this.descriptionEn = '',
    required this.price,
    this.imageUrl,
    required this.categoryId,
    this.isAvailable = true,
    this.isFeatured = false,
    this.addons = const [],
    this.sortOrder = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory MenuItemModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return MenuItemModel(
      id: doc.id,
      nameAr: data['name_ar'] ?? '',
      nameEn: data['name_en'] ?? '',
      descriptionAr: data['description_ar'] ?? '',
      descriptionEn: data['description_en'] ?? '',
      price: (data['price'] ?? 0).toDouble(),
      imageUrl: data['image_url'],
      categoryId: data['category_id'] ?? '',
      isAvailable: data['is_available'] ?? true,
      isFeatured: data['is_featured'] ?? false,
      addons: (data['addons'] as List<dynamic>?)
              ?.map((e) => MenuItemAddon.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      sortOrder: (data['sort_order'] ?? 0) as int,
      createdAt: data['created_at'] as Timestamp?,
      updatedAt: data['updated_at'] as Timestamp?,
    );
  }

  Map<String, dynamic> toJson() => {
        'name_ar': nameAr,
        'name_en': nameEn,
        'description_ar': descriptionAr,
        'description_en': descriptionEn,
        'price': price,
        'image_url': imageUrl,
        'category_id': categoryId,
        'is_available': isAvailable,
        'is_featured': isFeatured,
        'addons': addons.map((e) => e.toJson()).toList(),
        'sort_order': sortOrder,
        'updated_at': FieldValue.serverTimestamp(),
      };
}

class CategoryModel {
  String id;
  String nameAr;
  String nameEn;
  String? icon;
  int sortOrder;
  bool isActive;

  CategoryModel({
    required this.id,
    required this.nameAr,
    this.nameEn = '',
    this.icon,
    this.sortOrder = 0,
    this.isActive = true,
  });

  factory CategoryModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return CategoryModel(
      id: doc.id,
      nameAr: data['name_ar'] ?? '',
      nameEn: data['name_en'] ?? '',
      icon: data['icon'],
      sortOrder: (data['sort_order'] ?? 0) as int,
      isActive: data['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'name_ar': nameAr,
        'name_en': nameEn,
        'icon': icon,
        'sort_order': sortOrder,
        'is_active': isActive,
      };
}
