"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const firebase_1 = require("../config/firebase");
class MenuService {
    db = (0, firebase_1.getFirestore)();
    // جلب جميع الفئات
    async getCategories() {
        const snapshot = await this.db
            .collection('categories')
            .where('is_active', '==', true)
            .orderBy('sort_order', 'asc')
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name_ar: doc.data().name_ar,
            sort_order: doc.data().sort_order,
        }));
    }
    // جلب المواد حسب الفئة
    async getMenuItemsByCategory(categoryId) {
        let query = this.db
            .collection('menu_items')
            .where('is_available', '==', true)
            .orderBy('sort_order', 'asc');
        if (categoryId) {
            query = query.where('category_id', '==', categoryId);
        }
        const snapshot = await query.get();
        const items = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // جلب اسم الفئة
            const categoryDoc = await this.db.collection('categories').doc(data.category_id).get();
            const categoryData = categoryDoc.data();
            items.push({
                id: doc.id,
                name_ar: data.name_ar,
                name_en: data.name_en || '',
                description_ar: data.description_ar || '',
                price: data.price,
                image_url: data.image_url || '',
                is_available: data.is_available,
                category_name_ar: categoryData?.name_ar || '',
            });
        }
        return items;
    }
    // تنسيق القائمة للعرض في البوت
    async formatMenuForBot() {
        const categories = await this.getCategories();
        let message = '🍔 **قائمة الطعام**\n\n';
        for (const category of categories) {
            message += `*${category.name_ar}*\n`;
            const items = await this.getMenuItemsByCategory(category.id);
            for (const item of items) {
                message += `• ${item.name_ar} — ${item.price.toFixed(2)} ر.س\n`;
            }
            message += '\n';
        }
        message += '👇 اضغط على الزر لفتح القائمة كاملة';
        return message;
    }
    // جلب صنف محدد
    async getMenuItem(itemId) {
        const doc = await this.db.collection('menu_items').doc(itemId).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        const categoryDoc = await this.db.collection('categories').doc(data.category_id).get();
        const categoryData = categoryDoc.data();
        return {
            id: doc.id,
            name_ar: data.name_ar,
            name_en: data.name_en || '',
            description_ar: data.description_ar || '',
            price: data.price,
            image_url: data.image_url || '',
            is_available: data.is_available,
            category_name_ar: categoryData?.name_ar || '',
        };
    }
}
exports.MenuService = MenuService;
//# sourceMappingURL=menu_service.js.map