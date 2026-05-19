import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/models/menu_item_model.dart';
import 'package:restaurant_admin_app/providers/menu_provider.dart';

/// أيقونات الفئات المتاحة
const List<Map<String, String>> _categoryIcons = [
  {'icon': '🍔', 'name': 'برجر'},
  {'icon': '🍕', 'name': 'بيتزا'},
  {'icon': '🥗', 'name': 'سلطات'},
  {'icon': '🍝', 'name': 'معكرونة'},
  {'icon': '🍛', 'name': 'أرز'},
  {'icon': '🥩', 'name': 'لحوم'},
  {'icon': '🐟', 'name': 'مأكولات بحرية'},
  {'icon': '🍗', 'name': 'دجاج'},
  {'icon': '🥘', 'name': 'مقبلات'},
  {'icon': '🥪', 'name': 'ساندويش'},
  {'icon': '🥤', 'name': 'مشروبات'},
  {'icon': '🍰', 'name': 'حلويات'},
  {'icon': '☕', 'name': 'قهوة'},
  {'icon': '🍦', 'name': 'آيس كريم'},
  {'icon': '🥟', 'name': 'معجنات'},
];

class MenuManagementScreen extends StatefulWidget {
  const MenuManagementScreen({super.key});

  @override
  State<MenuManagementScreen> createState() => _MenuManagementScreenState();
}

class _MenuManagementScreenState extends State<MenuManagementScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة القائمة'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddItemDialog(context),
          ),
        ],
      ),
      body: Consumer<MenuProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: () async => provider.startListening(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ============================================================
                // الفئات
                // ============================================================
                _buildSectionHeader(context, '📂 الفئات',
                    onAdd: () => _showAddCategoryDialog(context)),

                const SizedBox(height: 8),
                SizedBox(
                  height: 80,
                  child: provider.categories.isEmpty
                      ? _buildEmptySmall('لا توجد فئات بعد')
                      : ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: provider.categories.length,
                          separatorBuilder: (_, _) => const SizedBox(width: 8),
                          itemBuilder: (context, index) {
                            final cat = provider.categories[index];
                            return _buildCategoryChip(context, cat, provider);
                          },
                        ),
                ),

                const SizedBox(height: 24),

                // ============================================================
                // الأصناف
                // ============================================================
                _buildSectionHeader(context, '🍔 الأصناف'),
                const SizedBox(height: 8),

                if (provider.menuItems.isEmpty)
                  _buildEmptyState('لا توجد أصناف في القائمة',
                      'أضف أصنافاً جديدة باستخدام زر + في الأعلى')
                else
                  ...provider.menuItems.map(
                    (item) => _buildMenuItemCard(context, item, provider),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, {VoidCallback? onAdd}) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const Spacer(),
        if (onAdd != null)
          TextButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('إضافة'),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
          ),
      ],
    );
  }

  Widget _buildCategoryChip(BuildContext context, CategoryModel cat, MenuProvider provider) {
    return GestureDetector(
      onLongPress: () => _showEditCategoryDialog(context, cat, provider),
      child: Container(
        width: 120,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(cat.icon ?? '📁', style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 4),
            Text(
              cat.nameAr,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItemCard(BuildContext context, MenuItemModel item, MenuProvider provider) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // الصورة
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                image: item.imageUrl != null
                    ? DecorationImage(
                        image: NetworkImage(item.imageUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: item.imageUrl == null
                  ? const Icon(Icons.fastfood, color: Colors.grey)
                  : null,
            ),
            const SizedBox(width: 12),

            // المعلومات
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.nameAr,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (!item.isAvailable)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'غير متوفر',
                            style: TextStyle(fontSize: 10, color: Colors.red.shade600),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '${item.price.toStringAsFixed(2)} ر.س',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        provider.categories
                            .where((c) => c.id == item.categoryId)
                            .firstOrNull
                            ?.nameAr ?? '',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // أزرار التحكم
            PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'toggle':
                    provider.updateItem(MenuItemModel(
                      id: item.id,
                      nameAr: item.nameAr,
                      nameEn: item.nameEn,
                      price: item.price,
                      categoryId: item.categoryId,
                      descriptionAr: item.descriptionAr,
                      descriptionEn: item.descriptionEn,
                      imageUrl: item.imageUrl,
                      isAvailable: !item.isAvailable,
                      isFeatured: item.isFeatured,
                      addons: item.addons,
                      sortOrder: item.sortOrder,
                    ));
                    break;
                  case 'edit':
                    _showEditItemDialog(context, item, provider);
                    break;
                  case 'delete':
                    _confirmDelete(context, item, provider);
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'toggle',
                  child: ListTile(
                    leading: Icon(Icons.toggle_on, size: 20),
                    title: Text('تبديل التوفر', style: TextStyle(fontSize: 13)),
                    dense: true,
                  ),
                ),
                const PopupMenuItem(
                  value: 'edit',
                  child: ListTile(
                    leading: Icon(Icons.edit, size: 20),
                    title: Text('تعديل', style: TextStyle(fontSize: 13)),
                    dense: true,
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: ListTile(
                    leading: Icon(Icons.delete, size: 20, color: Colors.red),
                    title: Text('حذف', style: TextStyle(fontSize: 13, color: Colors.red)),
                    dense: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // حوارات الإضافة والتعديل
  // ============================================================

  void _showAddItemDialog(BuildContext context) {
    _showItemFormDialog(context, null, context.read<MenuProvider>());
  }

  void _showEditItemDialog(BuildContext context, MenuItemModel item, MenuProvider provider) {
    _showItemFormDialog(context, item, provider);
  }

  void _showItemFormDialog(BuildContext context, MenuItemModel? existingItem, MenuProvider provider) {
    final isEditing = existingItem != null;
    final nameArController = TextEditingController(text: existingItem?.nameAr ?? '');
    final nameEnController = TextEditingController(text: existingItem?.nameEn ?? '');
    final priceController = TextEditingController(
      text: existingItem != null ? existingItem.price.toString() : '',
    );
    final descriptionArController = TextEditingController(text: existingItem?.descriptionAr ?? '');
    final descriptionEnController = TextEditingController(text: existingItem?.descriptionEn ?? '');
    final imageUrlController = TextEditingController(text: existingItem?.imageUrl ?? '');
    final sortOrderController = TextEditingController(
      text: existingItem != null ? existingItem.sortOrder.toString() : '0',
    );
    final formKey = GlobalKey<FormState>();

    String selectedCategoryId = existingItem?.categoryId ?? '';
    bool isAvailable = existingItem?.isAvailable ?? true;
    bool isFeatured = existingItem?.isFeatured ?? false;
    List<MenuItemAddon> addons = existingItem?.addons.map((a) => MenuItemAddon(
      id: a.id,
      nameAr: a.nameAr,
      nameEn: a.nameEn,
      price: a.price,
      isAvailable: a.isAvailable,
    )).toList() ?? [];

    showDialog(
      context: context,
      useSafeArea: false,
      builder: (ctx) => Dialog(
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: StatefulBuilder(
          builder: (context, setDialogState) {
            final categories = provider.categories;
            // Auto-select first category if none selected
            if (selectedCategoryId.isEmpty && categories.isNotEmpty) {
              selectedCategoryId = categories.first.id;
            }

            return SizedBox(
              width: 500,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: formKey,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ============================================================
                        // العنوان
                        // ============================================================
                        Row(
                          children: [
                            Text(
                              isEditing ? '✏️ تعديل الصنف' : '➕ إضافة صنف جديد',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(Icons.close),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // ============================================================
                        // الاسم العربي (مطلوب)
                        // ============================================================
                        TextFormField(
                          controller: nameArController,
                          decoration: const InputDecoration(
                            labelText: 'الاسم (عربي) *',
                            hintText: 'مثال: برجر دجاج',
                            prefixIcon: Icon(Icons.text_fields),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty)
                              ? 'الرجاء إدخال الاسم بالعربية'
                              : null,
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // الاسم الإنجليزي (اختياري)
                        // ============================================================
                        TextFormField(
                          controller: nameEnController,
                          decoration: const InputDecoration(
                            labelText: 'الاسم (English)',
                            hintText: 'Example: Chicken Burger',
                            prefixIcon: Icon(Icons.text_fields),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // السعر (مطلوب)
                        // ============================================================
                        TextFormField(
                          controller: priceController,
                          decoration: const InputDecoration(
                            labelText: 'السعر (ر.س) *',
                            hintText: 'مثال: 25.00',
                            prefixIcon: Icon(Icons.monetization_on_outlined),
                          ),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'الرجاء إدخال السعر';
                            if (double.tryParse(v) == null) return 'السعر غير صالح';
                            if (double.parse(v) <= 0) return 'السعر يجب أن يكون أكبر من 0';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // الفئة (مطلوب)
                        // ============================================================
                        DropdownButtonFormField<String>(
                          initialValue: selectedCategoryId.isNotEmpty &&
                                  categories.any((c) => c.id == selectedCategoryId)
                              ? selectedCategoryId
                              : null,
                          decoration: const InputDecoration(
                            labelText: 'الفئة *',
                            prefixIcon: Icon(Icons.folder_outlined),
                          ),
                          items: categories
                              .map((c) => DropdownMenuItem(
                                    value: c.id,
                                    child: Text('${c.icon ?? "📁"} ${c.nameAr}'),
                                  ))
                              .toList(),
                          onChanged: (v) {
                            setDialogState(() => selectedCategoryId = v!);
                          },
                          validator: (v) => v == null || v.isEmpty
                              ? 'الرجاء اختيار الفئة'
                              : null,
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // الوصف (اختياري)
                        // ============================================================
                        TextFormField(
                          controller: descriptionArController,
                          decoration: const InputDecoration(
                            labelText: 'الوصف (عربي)',
                            hintText: 'وصف مختصر للصنف',
                            prefixIcon: Icon(Icons.description_outlined),
                          ),
                          maxLines: 3,
                        ),
                        const SizedBox(height: 12),

                        TextFormField(
                          controller: descriptionEnController,
                          decoration: const InputDecoration(
                            labelText: 'الوصف (English)',
                            hintText: 'Brief description of the item',
                            prefixIcon: Icon(Icons.description_outlined),
                          ),
                          maxLines: 2,
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // رابط الصورة
                        // ============================================================
                        TextFormField(
                          controller: imageUrlController,
                          decoration: const InputDecoration(
                            labelText: 'رابط الصورة',
                            hintText: 'https://example.com/image.jpg',
                            prefixIcon: Icon(Icons.image_outlined),
                          ),
                          keyboardType: TextInputType.url,
                        ),
                        const SizedBox(height: 12),

                        // ============================================================
                        // ترتيب العرض
                        // ============================================================
                        TextFormField(
                          controller: sortOrderController,
                          decoration: const InputDecoration(
                            labelText: 'ترتيب العرض',
                            hintText: '0',
                            prefixIcon: Icon(Icons.sort),
                          ),
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 16),

                        // ============================================================
                        // خيارات التبديل
                        // ============================================================
                        Row(
                          children: [
                            Expanded(
                              child: SwitchListTile(
                                title: const Text('متوفر', style: TextStyle(fontSize: 14)),
                                value: isAvailable,
                                onChanged: (v) => setDialogState(() => isAvailable = v),
                                contentPadding: EdgeInsets.zero,
                                dense: true,
                              ),
                            ),
                            Expanded(
                              child: SwitchListTile(
                                title: const Text('مميز', style: TextStyle(fontSize: 14)),
                                value: isFeatured,
                                onChanged: (v) => setDialogState(() => isFeatured = v),
                                contentPadding: EdgeInsets.zero,
                                dense: true,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // ============================================================
                        // الإضافات (Addons)
                        // ============================================================
                        Row(
                          children: [
                            const Text(
                              '➕ الإضافات',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                            const Spacer(),
                            TextButton.icon(
                              icon: const Icon(Icons.add_circle_outline, size: 18),
                              label: const Text('إضافة', style: TextStyle(fontSize: 12)),
                              onPressed: () {
                                setDialogState(() {
                                  addons.add(MenuItemAddon(
                                    id: '',
                                    nameAr: '',
                                    price: 0,
                                  ));
                                });
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),

                        if (addons.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Text(
                              'لا توجد إضافات. يمكن إضافة إضافات مثل (إضافي جبن، صوص إضافي...)',
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                            ),
                          ),

                        ...addons.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final addon = entry.value;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: TextFormField(
                                    initialValue: addon.nameAr,
                                    decoration: InputDecoration(
                                      hintText: 'اسم الإضافة',
                                      isDense: true,
                                      contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 10,
                                      ),
                                    ),
                                    onChanged: (v) => addon.nameAr = v,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextFormField(
                                    initialValue: addon.price > 0 ? addon.price.toString() : '',
                                    decoration: InputDecoration(
                                      hintText: 'السعر',
                                      isDense: true,
                                      contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 10,
                                      ),
                                    ),
                                    keyboardType: TextInputType.number,
                                    onChanged: (v) => addon.price = double.tryParse(v) ?? 0,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline,
                                      color: Colors.red, size: 20),
                                  onPressed: () {
                                    setDialogState(() => addons.removeAt(idx));
                                  },
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                ),
                              ],
                            ),
                          );
                        }),

                        const SizedBox(height: 20),

                        // ============================================================
                        // أزرار الإجراءات
                        // ============================================================
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => Navigator.pop(ctx),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                                child: const Text('إلغاء'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              flex: 2,
                              child: ElevatedButton(
                                onPressed: () async {
                                  if (!formKey.currentState!.validate()) return;

                                  // Validate addons
                                  final validAddons = addons
                                      .where((a) => a.nameAr.isNotEmpty)
                                      .map((a) => MenuItemAddon(
                                            id: a.id,
                                            nameAr: a.nameAr,
                                            nameEn: a.nameEn,
                                            price: a.price,
                                            isAvailable: a.isAvailable,
                                          ))
                                      .toList();

                                  final item = MenuItemModel(
                                    id: existingItem?.id ?? '',
                                    nameAr: nameArController.text.trim(),
                                    nameEn: nameEnController.text.trim(),
                                    price: double.parse(priceController.text.trim()),
                                    categoryId: selectedCategoryId,
                                    descriptionAr: descriptionArController.text.trim(),
                                    descriptionEn: descriptionEnController.text.trim(),
                                    imageUrl: imageUrlController.text.trim().isEmpty
                                        ? null
                                        : imageUrlController.text.trim(),
                                    isAvailable: isAvailable,
                                    isFeatured: isFeatured,
                                    addons: validAddons,
                                    sortOrder: int.tryParse(sortOrderController.text) ?? 0,
                                  );

                                  bool success;
                                  if (isEditing) {
                                    success = await provider.updateItem(item);
                                  } else {
                                    success = await provider.addItem(item);
                                  }

                                  if (ctx.mounted) {
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          success
                                              ? (isEditing
                                                  ? '✅ تم تحديث الصنف بنجاح'
                                                  : '✅ تم إضافة الصنف بنجاح')
                                              : '❌ فشلت العملية',
                                        ),
                                        backgroundColor:
                                            success ? AppTheme.success : AppTheme.error,
                                      ),
                                    );
                                  }
                                },
                                child: Text(isEditing ? '💾 حفظ التعديلات' : '➕ إضافة'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showAddCategoryDialog(BuildContext context) {
    _showCategoryFormDialog(context, null, context.read<MenuProvider>());
  }

  void _showEditCategoryDialog(BuildContext context, CategoryModel cat, MenuProvider provider) {
    _showCategoryFormDialog(context, cat, provider);
  }

  void _showCategoryFormDialog(BuildContext context, CategoryModel? existingCat, MenuProvider provider) {
    final isEditing = existingCat != null;
    final nameArController = TextEditingController(text: existingCat?.nameAr ?? '');
    final nameEnController = TextEditingController(text: existingCat?.nameEn ?? '');
    final sortOrderController = TextEditingController(
      text: existingCat != null ? existingCat.sortOrder.toString() : '0',
    );
    final formKey = GlobalKey<FormState>();
    String selectedIcon = existingCat?.icon ?? '📁';
    bool isActive = existingCat?.isActive ?? true;

    showDialog(
      context: context,
      useSafeArea: false,
      builder: (ctx) => Dialog(
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: StatefulBuilder(
          builder: (context, setDialogState) => SizedBox(
            width: 400,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // العنوان
                      Row(
                        children: [
                          Text(
                            isEditing ? '✏️ تعديل الفئة' : '📂 إضافة فئة جديدة',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => Navigator.pop(ctx),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // الاسم العربي (مطلوب)
                      TextFormField(
                        controller: nameArController,
                        decoration: const InputDecoration(
                          labelText: 'اسم الفئة (عربي) *',
                          hintText: 'مثال: مشروبات',
                          prefixIcon: Icon(Icons.text_fields),
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'الرجاء إدخال اسم الفئة' : null,
                      ),
                      const SizedBox(height: 12),

                      // الاسم الإنجليزي
                      TextFormField(
                        controller: nameEnController,
                        decoration: const InputDecoration(
                          labelText: 'اسم الفئة (English)',
                          hintText: 'Example: Beverages',
                          prefixIcon: Icon(Icons.text_fields),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // ترتيب العرض
                      TextFormField(
                        controller: sortOrderController,
                        decoration: const InputDecoration(
                          labelText: 'ترتيب العرض',
                          hintText: '0',
                          prefixIcon: Icon(Icons.sort),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 16),

                      // اختيار الأيقونة
                      Text(
                        'اختر أيقونة',
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _categoryIcons.map((item) {
                          final icon = item['icon']!;
                          final isSelected = selectedIcon == icon;
                          return GestureDetector(
                            onTap: () => setDialogState(() => selectedIcon = icon),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppTheme.primary.withValues(alpha: 0.1)
                                    : Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? AppTheme.primary : Colors.grey.shade200,
                                  width: isSelected ? 2 : 1,
                                ),
                              ),
                              child: Center(
                                child: Text(icon, style: const TextStyle(fontSize: 22)),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // خيارات التبديل
                      SwitchListTile(
                        title: const Text('نشطة', style: TextStyle(fontSize: 14)),
                        subtitle: Text(
                          isActive ? 'سيتم عرض الفئة في القائمة' : 'الفئة مخفية',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                        ),
                        value: isActive,
                        onChanged: (v) => setDialogState(() => isActive = v),
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      ),
                      const SizedBox(height: 20),

                      // أزرار الإجراءات
                      Row(
                        children: [
                          if (isEditing)
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final confirmed = await showDialog<bool>(
                                    context: context,
                                    builder: (dCtx) => AlertDialog(
                                      title: const Text('حذف الفئة'),
                                      content: Text('هل أنت متأكد من حذف "${existingCat.nameAr}"؟'),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(dCtx, false),
                                          child: const Text('إلغاء'),
                                        ),
                                        TextButton(
                                          onPressed: () => Navigator.pop(dCtx, true),
                                          style: TextButton.styleFrom(foregroundColor: Colors.red),
                                          child: const Text('حذف'),
                                        ),
                                      ],
                                    ),
                                  );
                                  if (confirmed == true) {
                                    await provider.deleteCategory(existingCat.id);
                                    if (ctx.mounted) Navigator.pop(ctx);
                                  }
                                },
                                icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                                label: const Text('حذف', style: TextStyle(color: Colors.red)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.red),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                              ),
                            ),
                          if (isEditing) const SizedBox(width: 12),
                          Expanded(
                            flex: isEditing ? 2 : 1,
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(ctx),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              child: const Text('إلغاء'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton(
                              onPressed: () async {
                                if (!formKey.currentState!.validate()) return;

                                final category = CategoryModel(
                                  id: existingCat?.id ?? '',
                                  nameAr: nameArController.text.trim(),
                                  nameEn: nameEnController.text.trim(),
                                  icon: selectedIcon,
                                  sortOrder: int.tryParse(sortOrderController.text) ?? 0,
                                  isActive: isActive,
                                );

                                bool success;
                                if (isEditing) {
                                  success = await provider.updateCategory(category);
                                } else {
                                  success = await provider.addCategory(category);
                                }

                                if (ctx.mounted) {
                                  Navigator.pop(ctx);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        success
                                            ? (isEditing
                                                ? '✅ تم تحديث الفئة بنجاح'
                                                : '✅ تم إضافة الفئة بنجاح')
                                            : '❌ فشلت العملية',
                                      ),
                                      backgroundColor: success ? AppTheme.success : AppTheme.error,
                                    ),
                                  );
                                }
                              },
                              child: Text(isEditing ? '💾 حفظ' : '➕ إضافة'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, MenuItemModel item, MenuProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('حذف الصنف'),
        content: Text('هل أنت متأكد من حذف "${item.nameAr}"؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('حذف'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await provider.deleteItem(item.id);
    }
  }

  Widget _buildEmptyState(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(Icons.restaurant_menu, size: 48, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(fontSize: 16, color: Colors.grey.shade500)),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey.shade400)),
        ],
      ),
    );
  }

  Widget _buildEmptySmall(String text) {
    return Center(
      child: Text(text, style: TextStyle(fontSize: 13, color: Colors.grey.shade400)),
    );
  }
}
