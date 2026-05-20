'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';

import { useCartStore } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';

interface MenuItemProps {
  id: string;
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  is_available: boolean;
  addons?: { id: string; name_ar: string; price: number }[];
}

export function MenuItemCard({
  id,
  name_ar,
  description_ar,
  price,
  image_url,
  is_available,
}: MenuItemProps) {
  const cartItem = useCartStore((s) => s.items.find((i) => i.menu_item_id === id));
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setQuantity(cartItem?.quantity || 0);
  }, [cartItem?.quantity]);

  const handleAdd = () => {
    if (!is_available) return;
    hapticFeedback('light');
    setQuantity(1);
    addItem({
      menu_item_id: id,
      name_ar,
      image_url,
      quantity: 1,
      unit_price: price,
      addons: [],
      notes: '',
    });
    toast({
      title: 'تمت إضافة المنتج',
      description: `${name_ar} تمت إضافته إلى السلة`,
      variant: 'success',
    });
  };

  const handleIncrease = () => {
    const q = quantity + 1;
    setQuantity(q);
    updateQuantity(id, q);
    hapticFeedback('light');
  };

  const handleDecrease = () => {
    hapticFeedback('light');
    if (quantity === 1) {
      setQuantity(0);
      removeItem(id);
      return;
    }
    const q = quantity - 1;
    setQuantity(q);
    updateQuantity(id, q);
  };

  return (
    <div
      dir="rtl"
      className={cn(
        'w-full bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800 rounded-2xl',
        'overflow-hidden shadow-sm flex items-center p-3 gap-3 h-auto mb-3',
        'transition-all duration-200 hover:shadow-md',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ════════════════════════════════════════
          1. القسم الأيمن: الصورة مع Border أنيق
          ════════════════════════════════════════ */}
      {image_url && (
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-50">
          {!imageError ? (
            <Image
              src={image_url}
              alt={name_ar}
              width={80}
              height={80}
              className={cn(
                'w-full h-full object-cover transition-all duration-500',
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          2. القسم الأوسط: اسم المنتج + الوصف
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-1 text-right min-w-0 px-1 self-start pt-0.5">
        <h3 className="font-black text-sm text-gray-900 dark:text-white leading-tight break-words">
          {name_ar}
        </h3>
        {description_ar && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-tight">
            {description_ar}
          </p>
        )}
      </div>

      {/* ════════════════════════════════════════
          3. القسم الأيسر: النجوم + السعر + التحكم
          ════════════════════════════════════════ */}
      <div className="flex flex-col items-end justify-between shrink-0 w-28 py-0.5 self-stretch min-h-[80px]">
        {/* ─── التقييم بالنجوم ─── */}
        <div className="flex items-center gap-0.5 justify-end">
          <span className="text-[10px] font-bold text-amber-500 tabular-nums">4.0</span>
          <span className="text-amber-400 text-xs">★</span>
        </div>

        {/* ─── السعر تحت النجوم ─── */}
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums my-1">
          {formatPrice(price)}
        </span>

        {/* ─── أزرار التحكم بالكمية في الأسفل ─── */}
        <div className="flex justify-end items-center w-full mt-auto">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 hover:shadow-md active:scale-90 transition-all outline-none"
            >
              <Plus className="w-[20px] h-[20px] stroke-[3]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-full px-1.5 py-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <button
                onClick={handleDecrease}
                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-sm outline-none active:scale-90 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold w-5 text-center tabular-nums text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full shadow-sm outline-none active:scale-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
