'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { initFirebase } from '@/lib/firebase';

// ============================================================
// أنواع البيانات
// ============================================================
export interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en?: string;
  description_ar: string;
  description_en?: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  has_addons: boolean;
  addons?: {
    id: string;
    name_ar: string;
    price: number;
    is_required: boolean;
    max_select: number;
  }[];
}

// ============================================================
// جلب الفئات (مع real-time updates)
// ============================================================
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { db } = initFirebase();
    const q = query(
      collection(db, 'categories'),
      where('is_active', '==', true),
      orderBy('sort_order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(cats);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching categories:', err);
        setError('فشل تحميل الفئات');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { categories, loading, error };
}

// ============================================================
// جلب المواد حسب الفئة (مع real-time updates)
// ============================================================
export function useMenuItems(categoryId?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { db } = initFirebase();

    let q;
    if (categoryId) {
      q = query(
        collection(db, 'menu_items'),
        where('category_id', '==', categoryId),
        where('is_available', '==', true),
        orderBy('sort_order', 'asc')
      );
    } else {
      q = query(
        collection(db, 'menu_items'),
        where('is_available', '==', true),
        orderBy('sort_order', 'asc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const menuItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];
        setItems(menuItems);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching menu items:', err);
        setError('فشل تحميل القائمة');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [categoryId]);

  return { items, loading, error };
}

// ============================================================
// جلب الأصناف المميزة
// ============================================================
export function useFeaturedItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { db } = initFirebase();
    const q = query(
      collection(db, 'menu_items'),
      where('is_featured', '==', true),
      where('is_available', '==', true),
      orderBy('sort_order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const featured = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
      setItems(featured);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { items, loading };
}
