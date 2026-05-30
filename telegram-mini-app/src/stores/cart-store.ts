'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// أنواع البيانات
// ============================================================
export interface CartAddon {
  id: string;
  name_ar: string;
  price: number;
}

export interface CartItem {
  menu_item_id: string;
  name_ar: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  addons: CartAddon[];
  notes: string;
  item_total: number;
}

export interface CartState {
  items: CartItem[];
  notes: string;
  phone: string;

  // الإجراءات
  addItem: (item: Omit<CartItem, 'item_total'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setNotes: (notes: string) => void;
  setPhone: (phone: string) => void;
  toggleAddon: (menuItemId: string, addon: CartAddon) => void;

  // الحسابات
  totalItems: () => number;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
}

// ============================================================
// الـ Store
// ============================================================
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      notes: '',
      phone: '',

      setPhone: (phone) => set({ phone }),

      // إضافة صنف للسلة
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.menu_item_id === newItem.menu_item_id
          );

          if (existingIndex >= 0) {
            // الصنف موجود مسبقاً - زد الكمية
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...existing,
              quantity: existing.quantity + newItem.quantity,
              addons: newItem.addons,
              item_total: calculateItemTotal(existing.quantity + newItem.quantity, existing.unit_price, newItem.addons),
            };
            return { items: updatedItems };
          } else {
            // صنف جديد
            return {
              items: [
                ...state.items,
                {
                  ...newItem,
                  item_total: calculateItemTotal(newItem.quantity, newItem.unit_price, newItem.addons),
                },
              ],
            };
          }
        });
      },

      // حذف صنف من السلة
      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menu_item_id !== menuItemId),
        }));
      },

      // تحديث الكمية
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.menu_item_id === menuItemId
              ? {
                  ...item,
                  quantity,
                  item_total: calculateItemTotal(quantity, item.unit_price, item.addons),
                }
              : item
          ),
        }));
      },

      // تفريغ السلة
      clearCart: () => {
        set({ items: [], notes: '' });
      },

      // تعيين الملاحظات
      setNotes: (notes) => {
        set({ notes });
      },

      // إضافة/إزالة إضافة
      toggleAddon: (menuItemId, addon) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.menu_item_id !== menuItemId) return item;

            const hasAddon = item.addons.some((a) => a.id === addon.id);
            const newAddons = hasAddon
              ? item.addons.filter((a) => a.id !== addon.id)
              : [...item.addons, addon];

            return {
              ...item,
              addons: newAddons,
              item_total: calculateItemTotal(item.quantity, item.unit_price, newAddons),
            };
          }),
        }));
      },

      // الحسابات
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, item) => {
          const itemWithoutAddons = item.quantity * item.unit_price;
          const addonsTotal = item.addons.reduce((a, b) => a + b.price, 0);
          return sum + itemWithoutAddons + (addonsTotal * item.quantity);
        }, 0),
      tax: () => {
        const subtotal = get().subtotal();
        return subtotal * 0.15; // 15% ضريبة
      },
      total: () => {
        const subtotal = get().subtotal();
        const tax = get().tax();
        return subtotal + tax;
      },
    }),
    {
      name: 'restaurant-cart', // localStorage key
    }
  )
);

// ============================================================
// دوال مساعدة
// ============================================================
function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  addons: CartAddon[]
): number {
  const itemsTotal = quantity * unitPrice;
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  return itemsTotal + addonsTotal;
}
