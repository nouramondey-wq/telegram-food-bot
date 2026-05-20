'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Minus, Star, UtensilsCrossed } from 'lucide-react';

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
        'w-full h-auto flex items-center p-3 gap-3 mb-3',
        'bg-white dark:bg-gray-900',
        'rounded-2xl border border-gray-100 dark:border-gray-800',
        'shadow-sm',
        'transition-all duration-200 hover:shadow-md',
        !is_available && 'opacity-60 grayscale',
        'overflow-hidden'
      )}
    >
      {/* ════════════════════════════════════════
          1. القسم الأيمن: الصورة مع Border
          ════════════════════════════════════════ */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            width={96}
            height={96}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          2. القسم الأوسط: اسم المنتج + الوصف
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-1 text-right min-w-0">
        <h3 className="font-black text-sm text-gray-900 dark:text-white leading-tight break-words line-clamp-2">
          {name_ar}
        </h3>
        {description_ar && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
            {description_ar}
          </p>
        )}
        <span className="text-base font-black text-[#ef4444] tabular-nums tracking-tight mt-1">
          {formatPrice(price)}
        </span>
      </div>

      {/* ════════════════════════════════════════
          3. القسم الأيسر: النجوم + أزرار التحكم
          ════════════════════════════════════════ */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[90px] py-0.5">
        {/* ─── التقييم بالنجوم ─── */}
        <div className="flex items-center gap-1 justify-end">
          <span className="text-[11px] font-bold text-amber-500 tabular-nums">4.0</span>
          <div className="flex text-amber-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < 4
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* ─── أزرار التحكم بالكمية ─── */}
        <div className="flex justify-end w-full mt-2">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 hover:shadow-md active:scale-90 transition-all outline-none"
            >
              <Plus className="w-[20px] h-[20px] stroke-[3]" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-100 dark:border-gray-700 shadow-sm">
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
