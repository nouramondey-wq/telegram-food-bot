'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { hapticFeedback, hapticNotification } from '@/lib/telegram';
import { createOrder } from '@/hooks/use-orders';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ClipboardList,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // تأكيد الطلب
  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    hapticFeedback('medium');
    setIsCheckingOut(true);
    setError(null);

    const result = await createOrder();

    if (result.success) {
      hapticNotification('success');
      setOrderNumber(result.orderNumber || 0); // رقم الطلب الفعلي من Firebase
      setShowSuccess(true);
    } else {
      hapticNotification('error');
      setError(result.error || 'حدث خطأ');
    }

    setIsCheckingOut(false);
  };

  // شاشة النجاح
  if (showSuccess) {
    return (
      <div dir="rtl" className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">تم استلام طلبك! 🎉</h1>
          <p className="text-gray-500 mb-6">رقم الطلب</p>

          <div className="text-5xl font-bold text-emerald-600 mb-8">
            #{orderNumber}
          </div>

          <Card className="mb-6 text-right">
            <CardContent className="p-4 space-y-2">
              {items.map((item) => (
                <div key={item.menu_item_id} className="flex justify-between text-sm">
                  <span>{item.name_ar} × {item.quantity}</span>
                  <span className="text-gray-600">{formatPrice(item.item_total)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>الإجمالي</span>
                  <span>{formatPrice(total())}</span>
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
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium text-center hover:bg-emerald-600 transition-colors"
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
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 -mr-1">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">سلة المشتريات</h1>
          <span className="text-sm text-gray-500">
            ({totalItems()} مواد)
          </span>
        </div>
      </header>

      {items.length === 0 ? (
        /* سلة فارغة */
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag className="w-20 h-20 mb-4 opacity-50" />
          <p className="text-lg font-medium">السلة فارغة</p>
          <p className="text-sm mt-1 mb-6">أضف أصنافاً من القائمة لبدء الطلب</p>
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            🍔 تصفح القائمة
          </Link>
        </div>
      ) : (
        <>
          {/* المواد في السلة */}
          <div className="px-4 py-4 space-y-3">
            {items.map((item) => (
              <Card key={item.menu_item_id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name_ar}</h3>
                      {item.addons.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          + {item.addons.map(a => a.name_ar).join(', ')}
                        </p>
                      )}
                      <span className="text-sm font-bold text-emerald-700 mt-1 block">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          hapticFeedback('light');
                          updateQuantity(item.menu_item_id, item.quantity - 1);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>

                      <span className="w-7 text-center font-bold">{item.quantity}</span>

                      <button
                        onClick={() => {
                          hapticFeedback('light');
                          updateQuantity(item.menu_item_id, item.quantity + 1);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      hapticFeedback('medium');
                      removeItem(item.menu_item_id);
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف
                  </button>
                </CardContent>
              </Card>
            ))}

            {/* ملاحظات */}
            <Card>
              <CardContent className="p-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  📝 ملاحظات للطلب
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بدون بصل، إضافات..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* ملخص السلة */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg shadow-black/10"
               style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>المجموع</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>الضريبة (١٥%)</span>
                <span>{formatPrice(tax())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t">
                <span>الإجمالي</span>
                <span className="text-emerald-700">{formatPrice(total())}</span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs mb-2 text-center">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || items.length === 0}
              className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-base hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري تأكيد الطلب...
                </>
              ) : (
                <>
                  💳 تأكيد الطلب - دفع كاش
                </>
              )}
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
