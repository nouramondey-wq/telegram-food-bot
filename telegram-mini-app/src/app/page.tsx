'use client';

import React, { useState, useEffect } from 'react';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { CategoryFilter } from '@/components/menu/category-filter';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Search, Utensils } from 'lucide-react';
import Link from 'next/link';

// واجهة البيانات القادمة من قاعدة البيانات (Firestore)
interface MenuItem {
  id: string;
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name_ar: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { totalItems, total } = useCartStore();

  // جلب البيانات لايف من الفايربيز عند تحميل الصفحة
  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true);
        // ملاحظة: استبدل هذه الروابط بـ API الخاص بك أو استدعاء Firestore المباشر المبرمج عندك
        const [resItems, resCats] = await Promise.all([
          fetch('/api/menu-items').then((res) => res.json()),
          fetch('/api/categories').then((res) => res.json()),
        ]);
        setMenuItems(resItems || []);
        setCategories(resCats || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenuData();
  }, []);

  // فلترة الأصناف بناءً على القسم المختار ومربع البحث
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchesSearch = item.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3">
        <Utensils className="w-8 h-8 text-red-500 animate-pulse" />
        <span className="text-sm font-bold text-gray-500">جاري تحميل قائمة الطعام الفاخرة...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* الهيدر العلوي ومربع البحث الاحترافي */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-40 space-y-3">
        <div className="flex items-center justify-between dir-rtl text-right">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
            مطعم الذواقة
          </h1>
          <span className="text-sm text-gray-400 font-medium">أهلاً بك في منيو السعادة</span>
        </div>

        {/* حقل البحث المتناسق */}
        <div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 dir-rtl">
          <Search className="w-4 h-4 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="ابحث عن وجبتك المفضلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0 text-right"
          />
        </div>
      </div>

      {/* شريط الأقسام الدائرية المطور المتناسق كلياً */}
      <div className="my-2">
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* 🚀 الـ Grid السحري والمطور لمنع الالتصاق نهائياً وإعطاء مسافات فخمة */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-2 bg-gray-50 dark:bg-gray-900">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              id={item.id}
              name_ar={item.name_ar}
              description_ar={item.description_ar}
              price={item.price}
              image_url={item.image_url}
              is_available={item.is_available}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm font-bold">
            عذراً، لم نجد أي أصناف تطابق بحثك الحالي!
          </div>
        )}
      </div>

      {/* زر العوام العائم أسفل السلة لايف إذا كانت ممتلئة */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-fade-in">
          <Link href="/cart">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl py-3.5 px-4 shadow-xl flex items-center justify-between transition-transform active:scale-95 dir-rtl">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs tabular-nums font-black">
                  {totalItems}
                </div>
                <span className="text-sm">عرض سلة المأكولات</span>
              </div>
              <span className="text-sm font-black tabular-nums">{formatPrice(total())}</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}