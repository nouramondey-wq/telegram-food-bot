'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useMyOrders, useOrderDetail, cancelOrder, type Order } from '@/hooks/use-orders';
import { formatPrice, getStatusEmoji, getStatusText, formatDate, formatTime, timeAgo, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { hapticFeedback, hapticNotification } from '@/lib/telegram';
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import {
  ClipboardList,
  Package,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  Timer,
  ShoppingBag,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* Glassmorphism skeleton header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="px-4 py-4 pb-36 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton h-5 w-20" />
              <div className="skeleton h-6 w-28 rounded-full" />
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-24" />
            </div>
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   الصفحة الرئيسية — قائمة الطلبات أو تفاصيل طلب معين
   ============================================================ */
function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get('id');

  if (orderId) {
    return <OrderDetailView orderId={orderId} onBack={() => router.push('/orders')} />;
  }

  return <OrdersListView />;
}

/* ============================================================
   قائمة الطلبات
   ============================================================ */
function OrdersListView() {
  const router = useRouter();
  const { orders, loading, error } = useMyOrders(20);
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.totalItems());
  const { toast } = useToast();

  const handleReorder = async (order: Order) => {
    hapticFeedback('medium');

    if (totalItems > 0) {
      toast({
        title: 'السلة غير فارغة',
        description: 'يرجى تفريغ السلة أولاً أو إكمال الطلب الحالي',
        variant: 'error',
      });
      return;
    }

    // Add each item from the past order to the cart
    for (const item of order.items || []) {
      addItem({
        menu_item_id: item.menu_item_id,
        name_ar: item.name_ar,
        image_url: '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        addons: item.addons || [],
        notes: order.notes || '',
      });
    }

    toast({
      title: 'تم إعادة الطلب! 🎉',
      description: `تمت إضافة ${order.item_count} أصناف إلى السلة`,
      variant: 'success',
    });

    // Navigate to cart after a brief delay for the toast
    setTimeout(() => router.push('/cart'), 800);
  };

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* ─── Glassmorphism Header ─── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">طلباتي</h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">تتبع طلباتك السابقة والحالية</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">
                ID: {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('tg_user_cache') || '{}')?.id || 'مفقود') : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Orders List ─── */}
      {/* pb-36 ensures content clears bottom nav */}
      <div className="px-4 py-4 pb-36 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 space-y-3 animate-fade-in-up"
                 style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div className="skeleton h-5 w-20" />
                <div className="skeleton h-6 w-28 rounded-full" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-24" />
              </div>
              <div className="skeleton h-3 w-32" />
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">فشل تحميل الطلبات</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">حاول مرة أخرى لاحقاً</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-5">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">لا توجد طلبات سابقة</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6 text-center max-w-[220px]">
              ابدأ أول طلب لك من القائمة!
            </p>
            <Link
              href="/"
              className="px-8 py-3.5 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-md shadow-emerald-500/20 active:scale-[0.97] transition-all duration-200"
            >
              🍔 تصفح القائمة
            </Link>
          </div>
        ) : (
          orders.map((order, idx) => {
            const isActive = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
            const statusColor =
              order.status === 'cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
              'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';

            return (
              <div
                key={order.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(idx % 15) * 0.04}s` }}
              >
                <div
                  className={cn(
                    'rounded-2xl overflow-hidden',
                    'bg-white dark:bg-gray-900',
                    'border border-gray-100 dark:border-gray-800',
                    'shadow-card hover:shadow-card-hover transition-all duration-200',
                    isActive && 'ring-1 ring-emerald-200/40 dark:ring-emerald-800/40'
                  )}
                >
                  <button
                    onClick={() => router.push(`/orders?id=${order.id}`)}
                    className="w-full text-right p-4"
                  >
                    {/* Top row: order number + status badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusEmoji(order.status)}</span>
                        <span className="font-extrabold text-gray-900 dark:text-white tabular-nums" style={{ direction: 'ltr' }}>
                          #{order.order_number} {order.customer?.first_name ? `- ${order.customer.first_name}` : ''}
                        </span>
                      </div>
                      <span className={cn(
                        'text-[11px] font-bold px-3 py-1.5 rounded-full',
                        statusColor
                      )}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    {/* Items count + total */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {order.items?.length || 0} مواد · {order.item_count || 0} قطعة
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    {/* Date */}
                    {order.created_at && (
                      <p className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        {timeAgo(order.created_at.toDate())}
                      </p>
                    )}
                  </button>

                  {/* Reorder button for delivered orders */}
                  {order.status === 'delivered' && (
                    <div className="px-4 pb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 active:scale-[0.97] transition-all duration-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        إعادة الطلب
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ============================================================
   تفاصيل الطلب — Live Tracking Timeline
   ============================================================ */
const TIMELINE_STEPS = [
  { key: 'pending',    label: 'قيد الانتظار',   icon: Timer,      emoji: '⏳', color: 'text-amber-500' },
  { key: 'confirmed',  label: 'تم التأكيد',     icon: CheckCircle2, emoji: '✅', color: 'text-emerald-500' },
  { key: 'preparing',  label: 'جاري التجهيز',   icon: ChefHat,    emoji: '👨‍🍳', color: 'text-blue-500' },
  { key: 'ready',      label: 'جاهز للتوصيل',   icon: Bike,       emoji: '🛵',  color: 'text-purple-500' },
  { key: 'delivered',  label: 'تم التوصيل',     icon: Package,    emoji: '✅',  color: 'text-emerald-600' },
] as const;

function OrderDetailView({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const { order, loading } = useOrderDetail(orderId);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.totalItems());
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
    hapticFeedback('medium');
    const success = await cancelOrder(orderId);
    if (success) {
      hapticNotification('success');
      toast({ title: 'تم إلغاء الطلب', variant: 'success' });
    } else {
      hapticNotification('error');
      toast({ title: 'فشل الإلغاء', description: 'حاول مرة أخرى', variant: 'error' });
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    hapticFeedback('medium');

    if (totalItems > 0) {
      toast({
        title: 'السلة غير فارغة',
        description: 'يرجى تفريغ السلة أولاً أو إكمال الطلب الحالي',
        variant: 'error',
      });
      return;
    }

    for (const item of order.items || []) {
      addItem({
        menu_item_id: item.menu_item_id,
        name_ar: item.name_ar,
        image_url: '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        addons: item.addons || [],
        notes: order.notes || '',
      });
    }

    toast({
      title: 'تم إعادة الطلب! 🎉',
      description: `تمت إضافة ${order.item_count} أصناف إلى السلة`,
      variant: 'success',
    });

    setTimeout(() => router.push('/cart'), 800);
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-28" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="px-4 py-4 pb-36 space-y-4">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-52 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-6">الطلب غير موجود</p>
        <button onClick={onBack} className="px-8 py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-md shadow-emerald-500/20 active:scale-[0.97] transition-all duration-200">
          العودة للطلبات
        </button>
      </div>
    );
  }

  const timeline = order.status_timeline as Record<string, Timestamp | undefined> | undefined;
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* ─── Glassmorphism Header ─── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -mr-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90">
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight" style={{ direction: 'ltr', textAlign: 'right' }}>
                الطلب #{order.order_number} {order.customer?.first_name ? `- ${order.customer.first_name}` : ''}
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {order.created_at && formatDate(order.created_at.toDate())}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="px-4 py-4 pb-36 space-y-4">

        {/* ── Live Tracking Timeline Card ── */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card">
          {/* Status header */}
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isCancelled ? '❌' : getStatusEmoji(order.status)}</span>
                <div>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">
                    {isCancelled ? 'تم الإلغاء' : getStatusText(order.status)}
                  </p>
                  {!isCancelled && currentStepIndex >= 0 && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      الخطوة {currentStepIndex + 1} من {TIMELINE_STEPS.length}
                    </p>
                  )}
                </div>
              </div>
              {!isCancelled && order.status !== 'delivered' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">مباشر</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 py-5">
            {isCancelled ? (
              /* ── Cancelled state ── */
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">تم إلغاء الطلب</p>
                  {timeline?.cancelled && typeof timeline.cancelled.toDate === 'function' && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(timeline.cancelled.toDate())}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* ── Active & Completed timelines ── */
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800 rounded-full" />

                <div className="space-y-6">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const stepTimestamp = timeline?.[step.key];
                    const isDone = !!stepTimestamp;
                    const isCurrent = order.status === step.key;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        {/* Icon circle */}
                        <div className={cn(
                          'relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500',
                          isDone
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 shadow-sm'
                            : isCurrent
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-scale-bounce'
                            : 'bg-gray-100 dark:bg-gray-800'
                        )}>
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : isCurrent ? (
                            <StepIcon className="w-5 h-5 text-white" />
                          ) : (
                            <StepIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>

                        {/* Label + timestamp */}
                        <div className="flex-1 pt-1.5">
                          <p className={cn(
                            'text-sm font-bold transition-colors duration-300',
                            isDone || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          )}>
                            {step.emoji} {step.label}
                          </p>
                          {isDone && stepTimestamp && typeof stepTimestamp.toDate === 'function' && (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
                              {formatTime(stepTimestamp.toDate())}
                            </p>
                          )}
                          {isCurrent && !isDone && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 animate-pulse">
                              جاري التحديث...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              الأصناف المطلوبة
            </h3>
          </div>

          <div className="px-5 py-3 space-y-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start gap-3 text-sm py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                  {formatPrice(item.item_total)}
                </span>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white break-words">
                    {item.name_ar}
                    <span className="text-gray-400 dark:text-gray-500 font-medium"> ×{item.quantity}</span>
                  </p>
                  {item.addons?.length > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 break-words">
                      + {item.addons.map((a: any) => a.name_ar).join('، ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 tabular-nums">{formatPrice(order.subtotal)}</span>
              <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 tabular-nums">{formatPrice(order.tax)}</span>
              <span className="text-gray-600 dark:text-gray-400">الضريبة (١٥٪)</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-1 border-t border-dashed border-gray-100 dark:border-gray-800">
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPrice(order.total)}</span>
              <span className="text-gray-900 dark:text-white">الإجمالي</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mx-5 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">📝 ملاحظات:</span> {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Payment Info ── */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">الدفع</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">كاش عند الاستلام</p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="space-y-3">
          {/* Cancel — only for pending/confirmed orders */}
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.97] transition-all duration-200 border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="w-4 h-4" />
              إلغاء الطلب
            </button>
          )}

          {/* Reorder — for delivered orders */}
          {order.status === 'delivered' && (
            <button
              onClick={handleReorder}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all duration-200 shadow-md shadow-emerald-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة الطلب
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
