'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav'; // kept for FloatingCheckoutButton z-index reference only — actual render is in layout.tsx
import { CategoryFilter } from '@/components/menu/category-filter';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { useCategories, useMenuItems } from '@/hooks/use-menu';
import { useSearchParams, useRouter } from 'next/navigation';
import { initTelegramApp, hapticFeedback } from '@/lib/telegram';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { Store, Search, ChevronLeft, RefreshCw, Sparkles, ShoppingCart, ArrowLeft } from 'lucide-react';

// تمت تهيئة Telegram WebApp عالمياً في layout.tsx

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuPageSkeleton />}>
      <MenuPageContent />
    </Suspense>
  );
}

function MenuPageSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* Skeleton header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-6 w-36" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
      </div>
      {/* Skeleton categories */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 px-4 py-3">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-9 w-20 rounded-full" />
          ))}
        </div>
      </div>
      {/* Skeleton grid — single column to match horizontal card layout */}
      <div className="px-4 py-4 pb-32">
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex rounded-2xl overflow-hidden bg-white shadow-sm h-[100px]">
              <div className="skeleton w-[110px] shrink-0" />
              <div className="flex-1 p-3 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-8 w-full rounded-xl mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Skeleton — BottomNav is rendered globally in layout.tsx */}
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
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* Reorder Banner */}
      {reorderId && (
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/10 animate-slide-down">
          <div className="bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-500 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 shrink-0 animate-spin-slow" />
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
                className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors active:scale-90"
              >
                <span className="text-sm font-bold px-1">✕</span>
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => router.push('/orders')}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                عرض الطلب السابق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الهيدر - Glassmorphism */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Right side (RTL first): Title & Icon */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <Store className="w-6 h-6 text-[#1a202c] dark:text-gray-100" />
              </div>
              <h1 className="text-xl font-black text-[#1a202c] dark:text-gray-100 tracking-tight">مطعم نور</h1>
            </div>

            {/* Left side (RTL last): Search */}
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) setTimeout(() => document.getElementById('search-input')?.focus(), 100);
              }}
              className={cn(
                'p-2.5 rounded-md border transition-all duration-200 active:scale-90',
                showSearch
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              )}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* شريط البحث */}
          <div
            className={cn(
              'grid transition-all duration-300 ease-out',
              showSearch ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن صنف..."
                    className={cn(
                      'w-full pr-10 pl-4 py-2.5 text-sm rounded-xl',
                      'bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80',
                      'text-gray-900 dark:text-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-400',
                      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                      'transition-all duration-200'
                    )}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-xs text-gray-400 font-bold">✕</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* الفئات */}
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* محتوى القائمة */}
      {/* pb-52 = 208px: enough to scroll last item above both floating btn (~56px) + nav (64px) + gap */}
      <div className="px-4 py-4 pb-52">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 text-right">
          وجبات رايقه ولذيذه
        </h2>

        {isLoading ? (
          /* Skeleton loading — inline styles to guarantee spacing */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', margin: '0 -8px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full min-w-0" style={{ padding: '8px' }}>
                <div className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm h-[200px] w-full min-w-0">
                  <div className="skeleton w-full h-[110px]" />
                  <div className="flex-1 p-2 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-4 w-1/3 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* حالة عدم وجود نتائج */
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">لا توجد أصناف</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] text-center">
              {searchQuery ? 'حاول بكلمات بحث مختلفة' : 'هذه الفئة فارغة حالياً'}
            </p>
          </div>
        ) : (
          /* قائمة المواد — استخدام Inline Styles كحل جذري ونهائي لتجاوز مشاكل تجميع Tailwind في بيئة الإنتاج الخاصة بك */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', margin: '0 -8px' }}>
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="animate-fade-in-up h-full w-full min-w-0"
                style={{ 
                  animationDelay: `${(idx % 8) * 0.035}s`,
                  padding: '8px'
                }}
              >
                <MenuItemCard
                  id={item.id}
                  name_ar={item.name_ar}
                  description_ar={item.description_ar}
                  price={item.price}
                  image_url={item.image_url}
                  is_available={item.is_available}
                  addons={item.addons}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Checkout Button */}
      <FloatingCheckoutButton />

      {/* الـ Bottom Navigation */}
      {/* BottomNav is rendered globally in layout.tsx */}
    </div>
  );
}

/** Floating Checkout Button — يظهر عند وجود أصناف في السلة */
function FloatingCheckoutButton() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());
  const router = useRouter();

  if (totalItems === 0) return null;

  return (
    /*
     * bottom-[72px] = sits 8px above the 64px BottomNav
     * z-[90]        = below BottomNav (z-100) so nav tabs remain tappable
     */
    <div
      className="fixed left-0 right-0 z-[90] pointer-events-none"
      style={{
        bottom: 'calc(62px + env(safe-area-inset-bottom, 0px) + 8px)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div className="mx-4 pointer-events-auto">
        <button
          dir="rtl"
          onClick={() => {
            hapticFeedback('medium');
            router.push('/cart');
          }}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-xl shadow-gray-900/40 hover:shadow-gray-900/50 active:scale-[0.97] transition-all duration-200 animate-slide-up border border-gray-700/50"
        >
          {/* Right side: cart icon + label */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-100" />
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-0.5 text-[10px] font-black text-white bg-[#ef4444] rounded-full shadow-sm tabular-nums">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">أضف إلى سله البيع</p>
              <p className="text-[11px] text-white/80 font-medium tabular-nums">{totalItems} صنف</p>
            </div>
          </div>

          {/* Left side: total price + arrow */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tabular-nums">{formatPrice(subtotal)}</span>
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </div>
        </button>
      </div>
    </div>
  );
}

