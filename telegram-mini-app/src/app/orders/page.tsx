'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useMyOrders, useOrderDetail, cancelOrder } from '@/hooks/use-orders';
import { formatPrice, getStatusEmoji, getStatusText, formatDate, formatTime, timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { hapticFeedback, hapticNotification } from '@/lib/telegram';
import { Timestamp } from 'firebase/firestore';
import { ClipboardList, Package, ArrowLeft, Clock } from 'lucide-react';

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="skeleton h-6 w-24" />
      </header>
      <div className="px-4 py-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* BottomNav rendered globally in layout.tsx */}
    </div>
  );
}

/** الصفحة الرئيسية - تظهر قائمة الطلبات أو تفاصيل طلب معين حسب ?id=xxx */
function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get('id');

  // إذا كان هناك id → عرض تفاصيل الطلب
  if (orderId) {
    return <OrderDetailView orderId={orderId} onBack={() => router.push('/orders')} />;
  }

  // عرض قائمة الطلبات
  return <OrdersListView />;
}

// ============================================================
// قائمة الطلبات
// ============================================================
function OrdersListView() {
  const router = useRouter();
  const { orders, loading, error } = useMyOrders(20);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">📋 طلباتي</h1>
        <p className="text-xs text-gray-500 mt-0.5">تتبع طلباتك السابقة والحالية</p>
      </header>

      <div className="px-4 py-4 pb-32 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">فشل تحميل الطلبات</p>
            <p className="text-sm mt-1">حاول مرة أخرى لاحقاً</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg font-medium">لا توجد طلبات سابقة</p>
            <p className="text-sm mt-1 mb-6">ابدأ أول طلب لك من القائمة!</p>
            <Link
              href="/"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              🍔 تصفح القائمة
            </Link>
          </div>
        ) : (
          orders.map((order, idx) => (
            <button
              key={order.id}
              onClick={() => router.push(`/orders?id=${order.id}`)}
              className="w-full text-right"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Card className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusEmoji(order.status)}</span>
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                    </div>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {order.items?.length || 0} مواد
                    </span>
                    <span className="font-bold text-emerald-700">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {order.created_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      {timeAgo(order.created_at.toDate())}
                    </p>
                  )}
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>

      {/* BottomNav rendered globally in layout.tsx */}
    </div>
  );
}

// ============================================================
// تفاصيل الطلب (عند وجود ?id=xxx)
// ============================================================
function OrderDetailView({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const router = useRouter();
  const { order, loading } = useOrderDetail(orderId);

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
    hapticFeedback('medium');
    const success = await cancelOrder(orderId);
    if (success) {
      hapticNotification('success');
    } else {
      hapticNotification('error');
    }
  };

  const timelineSteps = [
    { key: 'pending', label: 'قيد الانتظار', icon: '🟡' },
    { key: 'confirmed', label: 'تم التأكيد', icon: '✅' },
    { key: 'preparing', label: 'جاري التحضير', icon: '🔵' },
    { key: 'ready', label: 'جاهز', icon: '🟢' },
    { key: 'delivered', label: 'تم الاستلام', icon: '✅' },
  ];

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 p-4">
        <div className="space-y-4">
          <div className="skeleton h-8 w-1/3" />
          <div className="skeleton h-40" />
          <div className="skeleton h-60" />
        </div>
        {/* BottomNav rendered globally in layout.tsx */}
      </div>
    );
  }

  if (!order) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">الطلب غير موجود</p>
        <button onClick={onBack} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium">
          العودة للطلبات
        </button>
        {/* BottomNav rendered globally in layout.tsx */}
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -mr-1">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              الطلب #{order.order_number}
            </h1>
            <p className="text-xs text-gray-500">
              {order.created_at && formatDate(order.created_at.toDate())}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* بطاقة الحالة */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{getStatusEmoji(order.status)}</span>
              <span className="text-sm font-bold px-4 py-2 rounded-full bg-emerald-50 text-emerald-700">
                {getStatusText(order.status)}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {timelineSteps.map((step) => {
                const timeline = order.status_timeline as Record<string, Timestamp | undefined> | undefined;
                const stepTimestamp = timeline?.[step.key];
                const isDone = !!stepTimestamp;
                const isCurrent = order.status === step.key;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                      isDone ? 'bg-emerald-100' :
                      isCurrent ? 'bg-emerald-500 animate-pulse-dot' :
                      'bg-gray-100'
                    }`}>
                      {isDone ? '✅' : isCurrent ? '🔵' : '◻️'}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-sm font-medium ${
                        isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {isDone && stepTimestamp && typeof stepTimestamp.toDate === 'function' && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(stepTimestamp.toDate())}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* المواد */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3">🍔 المواد</h3>
            <div className="space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name_ar} × {item.quantity}
                    {item.addons?.length > 0 && (
                      <span className="block text-xs text-gray-400">
                        + {item.addons.map((a: any) => a.name_ar).join(', ')}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{formatPrice(item.item_total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>المجموع</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>الضريبة</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1">
                <span>الإجمالي</span>
                <span className="text-emerald-700">{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                <p className="text-xs text-yellow-800">
                  <span className="font-bold">📝 ملاحظات:</span> {order.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات الدفع */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">💳 الدفع</h3>
            <p className="text-sm text-gray-600">كاش عند الاستلام</p>
          </CardContent>
        </Card>

        {/* أزرار الإجراءات */}
        {['pending', 'confirmed'].includes(order.status) && (
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            ❌ إلغاء الطلب
          </button>
        )}

        {order.status === 'delivered' && (
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            🔄 طلب مرة أخرى
          </button>
        )}
      </div>

      {/* BottomNav rendered globally in layout.tsx */}
    </div>
  );
}
