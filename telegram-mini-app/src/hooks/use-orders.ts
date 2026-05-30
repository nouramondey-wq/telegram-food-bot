'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { initFirebase } from '@/lib/firebase';
import { useCartStore } from '@/stores/cart-store';
import { getTelegramUser, getTelegramWebApp } from '@/lib/telegram';

// ============================================================
// أنواع البيانات
// ============================================================
export interface Order {
  id: string;
  order_number: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: {
    menu_item_id: string;
    name_ar: string;
    quantity: number;
    unit_price: number;
    addons?: { id: string; name_ar: string; price: number }[];
    item_total: number;
  }[];
  item_count: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  payment: { method: string; status: string };
  source: string;
  status_timeline: {
    pending?: Timestamp;
    confirmed?: Timestamp;
    preparing?: Timestamp;
    ready?: Timestamp;
    delivered?: Timestamp;
    cancelled?: Timestamp;
  };
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

// ============================================================
// إنشاء طلب جديد
// ============================================================
export async function createOrder(): Promise<{ success: boolean; orderId?: string; orderNumber?: number; error?: string }> {
  const { db } = initFirebase();
  const cart = useCartStore.getState();

  if (cart.items.length === 0) {
    return { success: false, error: 'السلة فارغة' };
  }

  // ─── التحقق من وجود Telegram WebApp + initData + مستخدم ───
  // يتم الفصل بين التحقق من WebApp (هل نحن داخل Telegram؟) وتحقق البيانات (initData + user)
  // لإعطاء تشخيص دقيق في حال فشل أحد الخطوات

  // المرحلة 1: هل نحن داخل Telegram أصلاً؟
  let tg = getTelegramWebApp();
  if (!tg) {
    console.warn('[createOrder] Telegram.WebApp غير متاح — التطبيق ليس داخل Telegram');
    return { success: false, error: 'يرجى فتح التطبيق من داخل Telegram' };
  }

  // المرحلة 2: انتظار تحميل initData (حتى 2.5 ثانية)
  if (!tg.initData) {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      tg = getTelegramWebApp();
      if (tg?.initData) break;
    }
  }

  // المرحلة 3: انتظار تحميل بيانات المستخدم (حتى 2.5 ثانية)
  let telegramUser = getTelegramUser();
  if (!telegramUser?.id) {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      telegramUser = getTelegramUser();
      if (telegramUser?.id) break;
    }
  }

  // ─── التحقق النهائي ───
  // نكتفي بوجود بيانات المستخدم (telegramUser?.id) — لا نحتاج initData بالضرورة
  // لأن على الموبايل WebView، initData قد يكون فاضياً بينما initDataUnsafe.user موجود
  // (الـ WebApp موجود ✅ يثبت أننا داخل Telegram أصلاً)
  if (!telegramUser?.id) {
    console.warn('[createOrder] فشل الحصول على بيانات مستخدم Telegram:', {
      webAppExists: !!tg,
      initDataExists: !!tg?.initData,
      initDataLength: tg?.initData?.length || 0,
      initDataUnsafeUser: tg?.initDataUnsafe?.user || null,
      userKeys: telegramUser ? Object.keys(telegramUser) : [],
    });
    // في حالة فشل الحصول على userId، نحاول إنشاء الطلب بدون بيانات المستخدم كـ fallback
    // (يسمح للطلب بالمرور حتى لو ما جات بيانات التليجرام)
    console.warn('[createOrder] تكملة الطلب بدون بيانات مستخدم (fallback)');
  }

  try {

    // حساب الإجماليات
    const subtotal = cart.subtotal();
    const tax = cart.tax();
    const total = cart.total();

    // ── تسجيل بيانات المستخدم للتشخيص ──
    console.log('[createOrder] بيانات المستخدم:', {
      telegram_id: telegramUser?.id?.toString() || 'EMPTY - لا يوجد',
      username: telegramUser?.username || 'غير متوفر',
      first_name: telegramUser?.first_name || 'غير متوفر',
      webApp_exists: !!getTelegramWebApp(),
      initData_exists: !!getTelegramWebApp()?.initData,
    });

    // الحصول على رقم الطلب وإنشاء الطلب في транзаكشن واحدة
    const settingsRef = doc(db, 'settings', 'order_counter');
    let orderNumber = 1;

    // استخدام Transaction لمنع تكرار أرقام الطلبات
    const orderRef = await runTransaction(db, async (transaction) => {
      const settingsDoc = await transaction.get(settingsRef);
      orderNumber = (settingsDoc.data()?.current_number || 0) + 1;

      const orderData = {
        order_number: orderNumber,
        status: 'pending',
        restaurant_id: 'default',
        items: cart.items.map(item => ({
          menu_item_id: item.menu_item_id,
          name_ar: item.name_ar,
          quantity: item.quantity,
          unit_price: item.unit_price,
          addons: item.addons || [],
          item_total: item.item_total,
        })),
        item_count: cart.totalItems(),
        subtotal,
        tax,
        total,
        notes: cart.notes,
        payment: {
          method: 'cash',
          status: 'pending',
        },
        source: 'telegram_mini_app',
        status_timeline: {
          pending: serverTimestamp(),
        },
        customer: {
          telegram_id: telegramUser?.id?.toString() || '',
          telegram_username: telegramUser?.username || '',
          first_name: telegramUser?.first_name || '',
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const newOrderRef = doc(collection(db, 'orders'));
      transaction.set(newOrderRef, orderData);
      transaction.set(settingsRef, {
        current_number: orderNumber,
      }, { merge: true });

      return newOrderRef;
    });

    // تفريغ السلة
    cart.clearCart();

    return { success: true, orderId: orderRef.id, orderNumber }; // إرجاع رقم الطلب الفعلي
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى' };
  }
}

// ============================================================
// جلب طلبات المستخدم (real-time)
// ============================================================
export function useMyOrders(maxOrders = 20) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { db } = initFirebase();
    let unsubscribe: (() => void) | undefined;

    const subscribe = async () => {
      // ── انتظار تحميل Telegram WebApp (حتى 3 ثواني) ──
      let telegramUser = getTelegramUser();
      if (!telegramUser?.id) {
        for (let i = 0; i < 6; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          telegramUser = getTelegramUser();
          if (telegramUser?.id) break;
        }
      }

      if (!telegramUser?.id) {
        console.warn('[useMyOrders] لم يتم الحصول على بيانات مستخدم Telegram');
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'orders'),
        where('customer.telegram_id', '==', telegramUser.id.toString()),
        limit(maxOrders)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orderList = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Order))
            // ترتيب تنازلي حسب تاريخ الإنشاء (client-side)
            .sort((a, b) => {
              const aTime = a.created_at?.toMillis?.() ?? 0;
              const bTime = b.created_at?.toMillis?.() ?? 0;
              return bTime - aTime;
            });
          setOrders(orderList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching orders:', err);
          setError('فشل تحميل الطلبات');
          setLoading(false);
        }
      );
    };

    subscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [maxOrders]);

  return { orders, loading, error };
}


// ============================================================
// جلب تفاصيل طلب محدد (real-time)
// ============================================================
export function useOrderDetail(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const { db } = initFirebase();
    const docRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [orderId]);

  return { order, loading };
}

// ============================================================
// إلغاء طلب
// ============================================================
export async function cancelOrder(orderId: string): Promise<boolean> {
  const { db } = initFirebase();

  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'cancelled',
      'status_timeline.cancelled': serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}
