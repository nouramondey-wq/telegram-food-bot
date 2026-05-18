import { getFirestore } from '../config/firebase';

interface MenuItem {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_name_ar: string;
}

interface Category {
  id: string;
  name_ar: string;
  sort_order: number;
}

export class MenuService {
  private db = getFirestore();

  // جلب جميع الفئات
  async getCategories(): Promise<Category[]> {
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
  async getMenuItemsByCategory(categoryId?: string): Promise<MenuItem[]> {
    let query: any = this.db
      .collection('menu_items')
      .where('is_available', '==', true)
      .orderBy('sort_order', 'asc');

    if (categoryId) {
      query = query.where('category_id', '==', categoryId);
    }

    const snapshot = await query.get();
    const items: MenuItem[] = [];

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
  async formatMenuForBot(): Promise<string> {
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
  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    const doc = await this.db.collection('menu_items').doc(itemId).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
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
