'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
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

  const handleCheckout = async () => {
    if (items.length === 0) return;

    hapticFeedback('medium');
    setIsCheckingOut(true);
    setError(null);

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

  if (showSuccess) {
    return (
      <div dir="rtl" className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 animate-fade-in pb-24">
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">تم استلام طلبك! 🎉</h1>
          <p className="text-gray-500 mb-6">رقم الطلب</p>

          <div className="text-5xl font-bold text-emerald-600 mb-8">
            #{orderNumber}
          </div>

          <Card className="mb-6 text-right border border-gray-100 shadow-sm">
            <CardContent className="p-4 space-y-2">
              {items.map((item) => (
                <div key={item.menu_item_id} className="flex justify-between text-sm">
                  <span>{item.name_ar} × {item.quantity}</span>
                  <span className="text-gray-600 tabular-nums">{formatPrice(item.item_total)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>الإجمالي</span>
                  <span className="text-emerald-700 tabular-nums">{formatPrice(total())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 mb-8">
            🔔 سيتم إشعارك عبر البوت عند تجهيز الطلب
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <Link
              href="/orders"
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-center hover:bg-emerald-600 transition-colors shadow-sm"
            >
              📋 متابعة الطلب
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-white text-gray-700 rounded-xl font-medium text-center border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              🏠 العودة للقائمة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col text-right">
      {/* ─── Content wrapper with massive bottom padding to clear bottom nav ─── */}
      <div className="w-full pb-48">
        {/* ─── Header ─── */}
        <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 -mr-1">
              <ArrowLeft className="w-5 h-5 text-gray-500 transform rotate-180" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">سلة المشتريات</h1>
            <span className="text-sm text-gray-400 font-medium tabular-nums">
              ({totalItems()} مواد)
            </span>
          </div>
        </header>

        {items.length === 0 ? (
          /* ─── Empty cart ─── */
          <div className="flex flex-col items-center justify-center py-24 px-4 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400 opacity-80" />
            </div>
            <p className="text-lg font-bold text-gray-700">السلة فارغة</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">أضف أصنافاً من القائمة لبدء الطلب</p>
            <Link
              href="/"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              🍔 تصفح القائمة
            </Link>
          </div>
        ) : (
          /* ─── Cart items ─── */
          <div className="px-4 py-4 space-y-4">
            {/* Items list */}
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.menu_item_id} className="animate-fade-in border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-sm text-gray-900">{item.name_ar}</h3>
                        {item.addons.length > 0 && (
                          <p className="text-xs text-amber-600 font-medium">
                            + {item.addons.map(a => a.name_ar).join('، ')}
                          </p>
                        )}
                        <span className="text-sm font-extrabold text-emerald-600 block tabular-nums">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
                        <button
                          onClick={() => {
                            hapticFeedback('light');
                            updateQuantity(item.menu_item_id, item.quantity + 1);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-gray-800 tabular-nums">
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
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <div className="flex justify-end pt-2 mt-2 border-t border-gray-50">
                      <button
                        onClick={() => {
                          hapticFeedback('medium');
                          removeItem(item.menu_item_id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        إزالة
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ─── Notes ─── */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <label className="text-sm font-bold text-gray-800 mb-2 block">
                  📝 ملاحظات خاصة بالطلب
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بدون بصل، زيادة صوص..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </CardContent>
            </Card>

            {/* ─── Order Summary ─── */}
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2">
                  📊 تفاصيل الحساب
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>المجموع الفرعي</span>
                    <span className="tabular-nums font-medium">{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>الضريبة (١٥%)</span>
                    <span className="tabular-nums font-medium">{formatPrice(tax())}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-dashed">
                    <span>الإجمالي المستحق</span>
                    <span className="text-emerald-600 text-lg tabular-nums">{formatPrice(total())}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center font-medium animate-pulse">{error}</p>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-base hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.99]"
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ─── Bottom Navigation ─── */}
      <BottomNav />
    </div>
  );
}
