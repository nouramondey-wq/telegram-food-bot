import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:restaurant_admin_app/config/theme.dart';
import 'package:restaurant_admin_app/models/menu_item_model.dart';
import 'package:restaurant_admin_app/providers/menu_provider.dart';

class MenuManagementScreen extends StatefulWidget {
  const MenuManagementScreen({super.key});

  @override
  State<MenuManagementScreen> createState() => _MenuManagementScreenState();
}

class _MenuManagementScreenState extends State<MenuManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MenuProvider>().startListening();
    });
  }

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
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
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
                      price: item.price,
                      categoryId: item.categoryId,
                      isAvailable: !item.isAvailable,
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
    // TODO: Full dialog form
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إضافة صنف جديد'),
        content: const Text('نموذج إضافة صنف جديد (سيتم تطويره لاحقاً)'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  void _showEditItemDialog(BuildContext context, MenuItemModel item, MenuProvider provider) {
    // TODO: Full edit form
  }

  void _showAddCategoryDialog(BuildContext context) {
    final nameController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    final menuProvider = context.read<MenuProvider>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إضافة فئة جديدة'),
        content: Form(
          key: formKey,
          child: TextFormField(
            controller: nameController,
            decoration: const InputDecoration(
              labelText: 'اسم الفئة',
              hintText: 'مثال: مشروبات',
            ),
            validator: (v) => v == null || v.isEmpty ? 'الرجاء إدخال اسم الفئة' : null,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              final cat = CategoryModel(
                id: '',
                nameAr: nameController.text,
              );
              await menuProvider.addCategory(cat);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
  }

  void _showEditCategoryDialog(BuildContext context, CategoryModel cat, MenuProvider provider) {
    final nameController = TextEditingController(text: cat.nameAr);
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تعديل الفئة'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'اسم الفئة'),
                validator: (v) => v == null || v.isEmpty ? 'الرجاء إدخال اسم الفئة' : null,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      await provider.updateCategory(CategoryModel(
                        id: cat.id,
                        nameAr: nameController.text,
                        icon: cat.icon,
                        sortOrder: cat.sortOrder,
                      ));
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('حفظ'),
                  ),
                  TextButton(
                    onPressed: () async {
                      await provider.deleteCategory(cat.id);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text('حذف'),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
        ],
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
