import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:restaurant_admin_app/models/menu_item_model.dart';
import 'package:restaurant_admin_app/services/firestore_service.dart';

class MenuProvider extends ChangeNotifier {
  final FirestoreService _firestore = FirestoreService();

  List<MenuItemModel> _menuItems = [];
  List<MenuItemModel> get menuItems => _menuItems;

  List<CategoryModel> _categories = [];
  List<CategoryModel> get categories => _categories;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  StreamSubscription? _itemsSubscription;
  StreamSubscription? _categoriesSubscription;
  int _receivedSnapshots = 0;

  MenuProvider() {
    startListening();
  }

  /// بدء الاستماع للتغييرات
  void startListening() {
    _itemsSubscription?.cancel();
    _categoriesSubscription?.cancel();
    _isLoading = true;
    _receivedSnapshots = 0;
    notifyListeners();

    // الاستماع للأصناف
    _itemsSubscription = _firestore.listenMenuItems().listen(
      (snapshot) {
        _menuItems = snapshot.docs
            .map((doc) => MenuItemModel.fromFirestore(doc))
            .toList();
        _checkLoading();
      },
      onError: (err) {
        _error = 'فشل تحميل القائمة';
        _isLoading = false;
        notifyListeners();
      },
    );

    // الاستماع للفئات
    _categoriesSubscription = _firestore.listenCategories().listen(
      (snapshot) {
        _categories = snapshot.docs
            .map((doc) => CategoryModel.fromFirestore(doc))
            .toList();
        _checkLoading();
      },
      onError: (err) {
        _error = 'فشل تحميل الفئات';
        _isLoading = false;
        notifyListeners();
      },
    );
  }

  void _checkLoading() {
    _receivedSnapshots++;
    // انتظار استلام أول snapshot من كلا المصدرين (menu و categories)
    if (_receivedSnapshots >= 2) {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// إضافة صنف
  Future<bool> addItem(MenuItemModel item) async {
    try {
      await _firestore.addMenuItem(item);
      return true;
    } catch (e) {
      _error = 'فشل إضافة الصنف';
      notifyListeners();
      return false;
    }
  }

  /// تحديث صنف
  Future<bool> updateItem(MenuItemModel item) async {
    try {
      await _firestore.updateMenuItem(item);
      return true;
    } catch (e) {
      _error = 'فشل تحديث الصنف';
      notifyListeners();
      return false;
    }
  }

  /// حذف صنف
  Future<bool> deleteItem(String itemId) async {
    try {
      await _firestore.deleteMenuItem(itemId);
      return true;
    } catch (e) {
      _error = 'فشل حذف الصنف';
      notifyListeners();
      return false;
    }
  }

  /// إضافة فئة
  Future<bool> addCategory(CategoryModel category) async {
    try {
      await _firestore.addCategory(category);
      return true;
    } catch (e) {
      _error = 'فشل إضافة الفئة';
      notifyListeners();
      return false;
    }
  }

  /// تحديث فئة
  Future<bool> updateCategory(CategoryModel category) async {
    try {
      await _firestore.updateCategory(category);
      return true;
    } catch (e) {
      _error = 'فشل تحديث الفئة';
      notifyListeners();
      return false;
    }
  }

  /// حذف فئة
  Future<bool> deleteCategory(String categoryId) async {
    try {
      await _firestore.deleteCategory(categoryId);
      return true;
    } catch (e) {
      _error = 'فشل حذف الفئة';
      notifyListeners();
      return false;
    }
  }

  /// الأصناف المتاحة حالياً
  List<MenuItemModel> get availableItems =>
      _menuItems.where((item) => item.isAvailable).toList();

  /// الأصناف حسب الفئة
  List<MenuItemModel> getItemsByCategory(String categoryId) =>
      _menuItems.where((item) => item.categoryId == categoryId).toList();

  /// الأصناف المميزة
  List<MenuItemModel> get featuredItems =>
      _menuItems.where((item) => item.isFeatured && item.isAvailable).toList();

  @override
  void dispose() {
    _itemsSubscription?.cancel();
    _categoriesSubscription?.cancel();
    super.dispose();
  }
}
