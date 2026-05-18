'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { CategoryFilter } from '@/components/menu/category-filter';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { useCategories, useMenuItems } from '@/hooks/use-menu';
import { useSearchParams, useRouter } from 'next/navigation';
import { initTelegramApp, hapticFeedback } from '@/lib/telegram';
import { Store, Search, ChevronLeft, RefreshCw } from 'lucide-react';

// تهيئة Telegram WebApp عند تحميل الصفحة
if (typeof window !== 'undefined') {
  initTelegramApp();
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuPageSkeleton />}>
      <MenuPageContent />
    </Suspense>
  );
}

function MenuPageSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="skeleton h-6 w-40 mb-2" />
        <div className="skeleton h-3 w-24" />
      </header>
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="skeleton aspect-[3/2]" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function MenuPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [reorderId, setReorderId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const { categories, loading: catsLoading } = useCategories();
  const { items: allItems, loading: itemsLoading } = useMenuItems(
    selectedCategory || undefined
  );

  // Handle reorder query param from deep link
  useEffect(() => {
    const reorder = searchParams?.get('reorder');
    if (reorder) {
      setReorderId(reorder);
      hapticFeedback('medium');
      // Clear the query param from URL
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  // تصفية حسب البحث
  const filteredItems = searchQuery
    ? allItems.filter((item) =>
        item.name_ar.includes(searchQuery) ||
        item.description_ar?.includes(searchQuery)
      )
    : allItems;

  const isLoading = catsLoading || itemsLoading;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Reorder Banner */}
      {reorderId && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 mx-4 mt-3 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 shrink-0 animate-spin-slow" />
            <div className="flex-1">
              <p className="font-semibold text-sm">🔄 إعادة الطلب السابق</p>
              <p className="text-xs text-white/80 mt-0.5">
                أضف الأصناف التي تريدها إلى السلة ثم أكمل الطلب
              </p>
            </div>
            <button
              onClick={() => {
                setReorderId(null);
                hapticFeedback('light');
              }}
              className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
            >
              <span className="text-sm font-bold px-1">✕</span>
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => router.push('/orders')}
              className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              عرض الطلب السابق
            </button>
          </div>
        </div>
      )}

      {/* الهيدر */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">مطعم الذواقة</h1>
            <p className="text-xs text-gray-500 mt-0.5">أطلب ألذ المأكولات!</p>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* شريط البحث */}
        {showSearch && (
          <div className="mt-3 animate-fade-in">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث عن صنف..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* الفئات */}
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* محتوى القائمة */}
      <div className="px-4 py-4 pb-32">
        {isLoading ? (
          /* Skeleton loading */
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="skeleton aspect-[3/2]" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* حالة عدم وجود نتائج */
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد أصناف</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'حاول بكلمات بحث مختلفة' : 'هذه الفئة فارغة حالياً'}
            </p>
          </div>
        ) : (
          /* شبكة المواد */
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name_ar={item.name_ar}
                description_ar={item.description_ar}
                price={item.price}
                image_url={item.image_url}
                is_available={item.is_available}
                addons={item.addons}
              />
            ))}
          </div>
        )}
      </div>

      {/* الـ Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
