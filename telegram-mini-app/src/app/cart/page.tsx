'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useCartStore, CartItem } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { hapticFeedback, hapticNotification } from '@/lib/telegram';
import { createOrder } from '@/hooks/use-orders';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';

export default function CartPage() {
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
  } = useCartStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[] | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    hapticFeedback('medium');
    setIsCheckingOut(true);
    setError(null);
    setOrderSnapshot([...items]);
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

  /* ══════════════════════════════════════════════════════ */
  /* SUCCESS SCREEN                                         */
  /* ══════════════════════════════════════════════════════ */
  if (showSuccess) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col animate-fade-in pb-28" style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 40%, #f8fafc 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-24 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative z-10">
          {/* Success icon */}
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-900" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">تم استلام طلبك!</h1>
          <p className="text-gray-500 text-sm mb-6 text-center">سيبدأ المطعم في التحضير قريباً 🍳</p>

          {/* Order number badge */}
          <div className="mb-8 px-8 py-4 rounded-3xl shadow-xl shadow-emerald-500/20 text-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <p className="text-emerald-100 text-xs font-semibold mb-1">رقم طلبك</p>
            <p className="text-white text-5xl font-black tabular-nums">#{orderNumber}</p>
          </div>

          {/* Items receipt */}
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-lg shadow-gray-200/60 mb-6" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="px-5 py-4 border-b border-gray-100/80">
              <p className="font-black text-gray-800 text-sm">ملخص الطلب</p>
            </div>
            <div className="px-5 py-3 space-y-2.5">
              {(orderSnapshot || items).map((item) => (
                <div key={item.menu_item_id} className="flex justify-between items-center gap-3 text-sm">
                  <span className="font-bold text-emerald-600 tabular-nums shrink-0">{formatPrice(item.item_total)}</span>
                  <div className="flex-1 text-right">
                    <span className="font-semibold text-gray-800">{item.name_ar}</span>
                    <span className="text-gray-400 text-xs mr-1">× {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-4 border-t border-dashed border-gray-200 my-1" />
            <div className="px-5 py-3 flex justify-between items-center">
              <span className="text-xl font-black text-emerald-600 tabular-nums">{formatPrice(orderTotal)}</span>
              <span className="text-sm font-black text-gray-700">الإجمالي</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-8 text-center">🔔 سيتم إشعارك عبر البوت عند تجهيز طلبك</p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/orders" className="w-full py-4 rounded-2xl font-black text-white text-center shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              📋 تتبع الطلب
            </Link>
            <Link href="/" className="w-full py-3.5 rounded-2xl font-semibold text-gray-600 text-center border border-gray-200 bg-white active:scale-[0.98] transition-all">
              🏠 العودة للقائمة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════ */
  /* MAIN CART PAGE                                         */
  /* ══════════════════════════════════════════════════════ */
  return (
    <div dir="rtl" className="relative min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 shrink-0" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-3.5 flex items-center gap-3">
          {/* Back button */}
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </Link>

          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900 leading-tight">سلة المشتريات</h1>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <span className="text-xs font-black text-white tabular-nums">{totalItems()}</span>
              <span className="text-xs text-emerald-100">صنف</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto pb-52">

        {/* ── Empty State ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-gray-200/80" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-700 mb-2">السلة فارغة</p>
            <p className="text-sm text-gray-400 mb-10 max-w-[200px]">أضف أصنافاً من القائمة لبدء طلبك</p>
            <Link href="/" className="px-8 py-4 rounded-2xl font-black text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              🍔 تصفح القائمة
            </Link>
          </div>
        ) : (
          <div className="px-4 py-5 space-y-4">

            {/* ── Section title ── */}
            <div className="flex items-center gap-2 mb-1">
              <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-black text-gray-700">أصنافك</span>
            </div>

            {/* ── Items list ── */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.menu_item_id}
                  className="animate-fade-in-up rounded-3xl overflow-hidden"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }}
                >
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name_ar}
                            style={{ width: 56, height: 56, objectFit: 'cover', display: 'block', flexShrink: 0 }}
                          />
                        ) : (
                          <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>

                      {/* Name + addons */}
                      <div className="flex-1 text-right">
                        <h3 className="font-black text-gray-900 leading-snug text-sm">{item.name_ar}</h3>
                        {item.addons.length > 0 && (
                          <p className="text-xs text-amber-500 font-semibold mt-0.5">
                            + {item.addons.map((a) => a.name_ar).join('، ')}
                          </p>
                        )}
                        {/* Unit price */}
                        <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.unit_price)} / وحدة</p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => { hapticFeedback('medium'); removeItem(item.menu_item_id); }}
                        aria-label="إزالة الصنف"
                        className="w-8 h-8 flex items-center justify-center rounded-2xl transition-all active:scale-90 shrink-0"
                        style={{ background: '#fff0f0', color: '#ef4444' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom row: price + counter */}
                    <div className="flex items-center justify-between">
                      {/* Total price */}
                      <span className="text-base font-black tabular-nums" style={{ color: '#059669' }}>
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>

                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-2xl overflow-hidden shadow-sm" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                        <button
                          onClick={() => { hapticFeedback('light'); updateQuantity(item.menu_item_id, item.quantity + 1); }}
                          aria-label="زيادة الكمية"
                          className="w-9 h-9 flex items-center justify-center transition-all active:scale-90"
                          style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-9 text-center font-black text-sm text-gray-800 tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            hapticFeedback('light');
                            if (item.quantity <= 1) { removeItem(item.menu_item_id); return; }
                            updateQuantity(item.menu_item_id, item.quantity - 1);
                          }}
                          aria-label="تقليل الكمية"
                          className="w-9 h-9 flex items-center justify-center bg-white text-gray-500 transition-all active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Notes ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                  <span className="text-sm">📝</span>
                </div>
                <label htmlFor="order-notes" className="text-sm font-black text-gray-800">ملاحظات للمطعم</label>
              </div>
              <div className="px-4 pb-4">
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بدون بصل، زيادة صوص..."
                  rows={2}
                  className="w-full px-4 py-3 text-sm text-gray-800 resize-none rounded-2xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                />
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="font-black text-gray-800 text-sm">ملخص الفاتورة</h3>
              </div>

              <div className="px-4 py-3 space-y-2">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700 tabular-nums">{formatPrice(subtotal())}</span>
                  <span className="text-gray-400">المجموع الفرعي</span>
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700 tabular-nums">{formatPrice(tax())}</span>
                  <span className="text-gray-400">ضريبة القيمة المضافة ١٥٪</span>
                </div>
              </div>

              {/* Total row */}
              <div className="mx-4 my-2" style={{ borderTop: '2px dashed #e2e8f0' }} />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-xl font-black tabular-nums" style={{ color: '#059669' }}>{formatPrice(total())}</span>
                <span className="text-sm font-black text-gray-800">الإجمالي المستحق</span>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 mb-3 px-4 py-2.5 rounded-2xl text-center text-sm font-bold text-red-600" style={{ background: '#fff0f0', border: '1px solid #fecaca' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* CTA Button */}
              <div className="px-4 pb-4 pt-1">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={isCheckingOut ? { background: '#9ca3af' } : { background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #0d9488 100%)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري إرسال طلبك...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      تأكيد الطلب وإرساله
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
