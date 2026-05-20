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
import { Store, Search, RefreshCw, Sparkles, ShoppingCart, ArrowLeft, MapPin, Percent, ChevronLeft, Flame } from 'lucide-react';

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
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* Skeleton header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <div className="skeleton h-6 w-32" />
            <div className="flex items-center gap-1">
              <div className="skeleton h-3 w-3 rounded-full" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
          <div className="skeleton w-10 h-10 rounded-xl" />
        </div>
        {/* Skeleton search */}
        <div className="skeleton h-[42px] w-full rounded-xl mb-4" />
      </div>
      {/* Skeleton categories */}
      <div className="bg-white/95 dark:bg-gray-900/95 px-4 py-3">
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="skeleton h-[62px] w-[62px] rounded-full" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Skeleton promo */}
      <div className="px-4 pt-4">
        <div className="skeleton h-[130px] w-full rounded-2xl" />
      </div>
      {/* Skeleton section title */}
      <div className="px-4 pt-6 pb-3">
        <div className="skeleton h-5 w-36" />
      </div>
      {/* Skeleton list items */}
      <div className="px-4 pb-32 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex rounded-2xl overflow-hidden bg-white shadow-sm h-[120px]">
            <div className="skeleton w-[110px] shrink-0" />
            <div className="flex-1 p-3.5 space-y-2.5">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-[30px] w-16 rounded-full mr-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

      {/* ================================================================
           الهيدر — Search دائم visible
           ================================================================ */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-4 pt-4 pb-0">
          {/* Row: Logo + Location + Profile */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              {/* Store icon */}
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  مطعم نور
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    حي النور — أونلاين
                  </span>
                </div>
              </div>
            </div>

            {/* Profile placeholder */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">0</span>
              </div>
            </div>
          </div>

          {/* ── Search Bar — دائم visible ── */}
          <div className="relative mb-4">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن صنف في القائمة..."
              className={cn(
                'w-full pr-10 pl-4 py-3 text-sm rounded-xl',
                'bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80',
                'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400',
                'transition-all duration-200'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs text-gray-400 font-bold block px-1">✕</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── الفئات ── */}
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* ── Promo Banner ── */}
      <div className="px-4 pt-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
          
          <div className="relative px-5 py-4 flex items-center justify-between">
            <div className="text-white space-y-1.5">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-semibold text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
                  خصم خاص
                </span>
              </div>
              <h3 className="text-lg font-black leading-tight">
                طلبك الأول
              </h3>
              <p className="text-sm text-emerald-50/90 font-medium">
                خصم 15% على أول طلب 🎉
              </p>
              <button
                onClick={() => {
                  hapticFeedback('light');
                  document.getElementById('search-input')?.focus();
                }}
                className="mt-1.5 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
              >
                ابدأ الطلب
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-3xl">🎉</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── محتوى القائمة ── */}
      <div className="px-4 py-5 pb-52">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ef4444]" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              الوجبات الشعبية
            </h2>
          </div>
          {!isLoading && filteredItems.length > 0 && (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              {filteredItems.length} صنف
            </span>
          )}
        </div>

        {isLoading ? (
          /* Skeleton loading — list view */
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100/80 dark:border-gray-800/80 shadow-sm h-[120px]">
                <div className="skeleton w-[110px] shrink-0 rounded-none" />
                <div className="flex-1 p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-14 shrink-0" />
                  </div>
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-[30px] w-[66px] rounded-full mr-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* حالة عدم وجود نتائج */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-base font-bold text-gray-500 dark:text-gray-400">لا توجد أصناف</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] text-center">
              {searchQuery ? 'حاول بكلمات بحث مختلفة' : 'هذه الفئة فارغة حالياً'}
            </p>
          </div>
        ) : (
          /* ── قائمة المواد — List View (horizontal cards) ── */
          <div className="flex flex-col gap-3">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(idx % 8) * 0.045}s` }}
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
              <p className="text-sm font-bold">أضف إلى السلة</p>
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
