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
  addons,
}: MenuItemProps) {
  const cartItem = useCartStore((s) => s.items.find((i) => i.menu_item_id === id));
  const addItem     = useCartStore((s) => s.addItem);
  const removeItem  = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [quantity, setQuantity]       = useState(cartItem?.quantity || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError]   = useState(false);
  const { toast } = useToast();

  useEffect(() => { setQuantity(cartItem?.quantity || 0); }, [cartItem?.quantity]);

  const handleAdd = () => {
    if (!is_available) return;
    hapticFeedback('light');
    setQuantity(1);
    addItem({ menu_item_id: id, name_ar, image_url, quantity: 1, unit_price: price, addons: [], notes: '' });
    toast({ title: 'تمت إضافة المنتج', description: `${name_ar} تمت إضافته إلى السلة`, variant: 'success' });
  };

  const handleIncrease = () => {
    const q = quantity + 1; setQuantity(q); updateQuantity(id, q); hapticFeedback('light');
  };

  const handleDecrease = () => {
    hapticFeedback('light');
    if (quantity === 1) { setQuantity(0); removeItem(id); return; }
    const q = quantity - 1; setQuantity(q); updateQuantity(id, q);
  };

  return (
    <div
      dir="rtl"
      className={cn(
        'flex flex-row h-[120px] w-full bg-white dark:bg-gray-900',
        'rounded-2xl border border-gray-100/80 dark:border-gray-800/80',
        'shadow-[0_1px_6px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]',
        'active:shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        'overflow-hidden',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image (right side for RTL) ── */}
      <div className="relative w-[110px] min-w-[110px] h-full bg-gray-50 dark:bg-gray-800 shrink-0 overflow-hidden">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            sizes="110px"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Gradient overlay on image edge for depth */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-l from-transparent to-white/80 dark:to-gray-900/80 pointer-events-none" />
      </div>

      {/* ── Content (left side for RTL) ── */}
      <div className="flex flex-col flex-1 min-w-0 px-3.5 py-3 justify-between">
        {/* Top: Name + Price Row */}
        <div className="flex items-start justify-between gap-2">
          {/* Name */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-1 flex-1">
            {name_ar}
          </h3>

          {/* Price badge */}
          <span className="text-sm font-black text-[#ef4444] tabular-nums tracking-tight whitespace-nowrap shrink-0">
            {formatPrice(price)}
          </span>
        </div>

        {/* Stars row */}
        <div className="flex items-center gap-0.5">
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
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1 font-medium">4.0</span>
        </div>

        {/* Description */}
        {description_ar && (
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1">
            {description_ar}
          </p>
        )}

        {/* Bottom: Add/Quantity Button */}
        <div className="flex justify-end">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] text-white rounded-full text-xs font-bold shadow-sm hover:bg-[#dc2626] active:scale-90 transition-all outline-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>أضف</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-100 dark:border-gray-700 shadow-sm">
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
                className="w-7 h-7 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-sm outline-none active:scale-90 transition-all"
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
