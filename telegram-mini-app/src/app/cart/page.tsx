'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { useCartStore, CartItem } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { hapticFeedback, hapticNotification } from '@/lib/telegram';
import { createOrder } from '@/hooks/use-orders';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  ReceiptText,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    notes,
    setNotes,
    updateQuantity,
    removeItem,
    totalItems,
    subtotal,
    tax,
    total,
    clearCart,
  } = useCartStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // نسخة احتياطية من الأصناف والإجمالي لعرضها في شاشة النجاح بعد تفريغ السلة
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[] | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    hapticFeedback('medium');
    setIsCheckingOut(true);
    setError(null);

    // ─── حفظ نسخة من الأصناف والإجمالي قبل clearCart (اللي بتتنفذ داخل createOrder) ───
    setOrderSnapshot(items);
    setOrderTotal(total());

    const result = await createOrder();

    if (result.success) {
      hapticNotification('success');
      setOrderNumber(result.orderNumber || 0);
      setShowSuccess(true);
    } else {
      hapticNotification('error');
      setError(result.error || 'حدث خطأ');
    }

    setIsCheckingOut(false);
  };

  /* ─────────────────────────────────────────────────── */
  /* Success screen                                      */
  /* ─────────────────────────────────────────────────── */
  if (showSuccess) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-emerald-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 animate-fade-in pb-28"
      >
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            تم استلام طلبك! 🎉
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">رقم الطلب</p>

          <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mb-8">
            #{orderNumber}
          </div>

          <Card className="mb-6 text-right border border-gray-200/70 dark:border-gray-700/60 shadow-sm w-full overflow-hidden">
            <CardContent className="px-5 py-4 space-y-3">
              {(orderSnapshot || items).map((item) => (
                <div key={item.menu_item_id} className="flex justify-between items-start text-sm gap-4">
                  <span className="text-gray-600 dark:text-gray-400 tabular-nums font-semibold shrink-0 whitespace-nowrap">
                    {formatPrice(item.item_total)}
                  </span>
                  <span className="text-right text-gray-900 dark:text-white font-medium leading-snug">
                    {item.name_ar}
                    <span className="text-gray-500 dark:text-gray-500 font-normal"> × {item.quantity}</span>
                  </span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300/60 dark:border-gray-600/50 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatPrice(orderTotal)}
                  </span>
                  <span className="text-base font-black text-gray-900 dark:text-white">الإجمالي</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            🔔 سيتم إشعارك عبر البوت عند تجهيز الطلب
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <Link
              href="/orders"
              className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-center hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 active:scale-[0.98]"
            >
              📋 متابعة الطلب
            </Link>
            <Link
              href="/"
              className="w-full py-3.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-medium text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              🏠 العودة للقائمة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────── */
  /* Main cart page                                      */
  /* ─────────────────────────────────────────────────── */
  return (
    <div
      dir="rtl"
      className="relative min-h-screen bg-gray-50 dark:bg-gray-950 text-right flex flex-col"
    >
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 shadow-sm px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -mr-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              سلة المشتريات
            </h1>
          </div>
          {items.length > 0 && (
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full tabular-nums">
              {totalItems()} صنف
            </span>
          )}
        </div>
      </header>

      {/* ─── Scrollable Content Area ─── */}
      {/* pb-52 ensures content scrolls fully above the bottom nav (h-16) + summary card + safe area */}
      <div className="flex-1 overflow-y-auto w-full pb-52">
        {items.length === 0 ? (
          /* ─── Empty cart ─── */
          <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xl font-black text-gray-700 dark:text-gray-300 mb-2">
              السلة فارغة
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 max-w-[220px]">
              أضف أصنافاً من القائمة لبدء الطلب
            </p>
            <Link
              href="/"
              className="px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 active:scale-[0.98]"
            >
              🍔 تصفح القائمة
            </Link>
          </div>
        ) : (
          <div className="px-4 py-5 space-y-4">

            {/* ─── Items list ─── */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menu_item_id}
                  className={cn(
                    'rounded-2xl bg-white dark:bg-gray-900',
                    'border border-gray-100 dark:border-gray-800',
                    'shadow-sm animate-fade-in overflow-hidden'
                  )}
                >
                  <div className="p-4">
                    {/* Top row: name + remove */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <button
                        onClick={() => {
                          hapticFeedback('medium');
                          removeItem(item.menu_item_id);
                        }}
                        aria-label="إزالة الصنف"
                        className="p-1.5 -mt-0.5 -ml-0.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex-1 text-right">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-[1.5] break-words">
                          {item.name_ar}
                        </h3>
                        {item.addons.length > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 break-words">
                            + {item.addons.map((a) => a.name_ar).join('، ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: price left, counter right */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Price (logical start = right in RTL) */}
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>

                      {/* Quantity counter */}
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-1 border border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => {
                            hapticFeedback('light');
                            updateQuantity(item.menu_item_id, item.quantity + 1);
                          }}
                          aria-label="زيادة الكمية"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-8 text-center font-black text-sm text-gray-800 dark:text-white tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            hapticFeedback('light');
                            if (item.quantity <= 1) {
                              removeItem(item.menu_item_id);
                              return;
                            }
                            updateQuantity(item.menu_item_id, item.quantity - 1);
                          }}
                          aria-label="تقليل الكمية"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors shadow-sm active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Notes ─── */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4">
              <label
                htmlFor="order-notes"
                className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 block"
              >
                📝 ملاحظات خاصة بالطلب
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: بدون بصل، زيادة صوص..."
                rows={3}
                className={cn(
                  'w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700 rounded-xl',
                  'text-sm text-gray-900 dark:text-white resize-none',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* ─── Order Summary & Checkout ─── */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <ReceiptText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  تفاصيل الحساب
                </h3>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    {formatPrice(subtotal())}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">المجموع الفرعي</span>
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium tabular-nums">
                    {formatPrice(tax())}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">الضريبة (١٥٪)</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatPrice(total())}
                  </span>
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    الإجمالي المستحق
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-xs text-center font-medium px-4 pb-2 animate-pulse">
                  {error}
                </p>
              )}

              {/* CTA */}
              <div className="px-4 pb-4 pt-1">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className={cn(
                    'w-full py-4 rounded-2xl font-black text-base text-white',
                    'bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-500',
                    'flex items-center justify-center gap-2',
                    'shadow-lg shadow-emerald-500/25',
                    'transition-all duration-200 hover:brightness-105 active:scale-[0.98]',
                    'disabled:bg-gray-300 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300',
                    'disabled:cursor-not-allowed disabled:shadow-none disabled:text-gray-500'
                  )}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري إرسال طلبك...
                    </>
                  ) : (
                    <>🤝 تأكيد الطلب وإرساله</>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ─── Bottom Navigation ─── */}
      {/* BottomNav is rendered globally in layout.tsx */}
    </div>
  );
}
