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
        'flex flex-col w-full h-auto',
        'bg-white dark:bg-gray-900',
        'rounded-2xl border border-gray-100/80 dark:border-gray-800/80',
        'shadow-[0_1px_6px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]',
        'active:shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ════════════════════════════════════════
          Image — Full width, at the top
          ════════════════════════════════════════ */}
      <div className="relative w-full h-40 rounded-t-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            sizes="480px"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Bottom gradient fade for depth */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 pointer-events-none" />
      </div>

      {/* ════════════════════════════════════════
          Content — below the image
          ════════════════════════════════════════ */}
      <div className="p-4 flex flex-col gap-2">
        {/* ─── Top: Name (right) + Stars (left) ─── */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {name_ar}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
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
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1 font-medium">
              4.0
            </span>
          </div>
        </div>

        {/* ─── Description ─── */}
        {description_ar && (
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
            {description_ar}
          </p>
        )}

        {/* ─── Price + Add button — vertical stack ─── */}
        <div className="flex flex-col items-start gap-2 mt-1">
          {/* Price first */}
          <span className="text-base font-black text-[#ef4444] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>

          {/* Add button below price */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 hover:shadow-md active:scale-90 transition-all outline-none"
            >
              <Plus className="w-[20px] h-[20px] stroke-[3]" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-sm outline-none active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold w-6 text-center tabular-nums text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full shadow-sm outline-none active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
