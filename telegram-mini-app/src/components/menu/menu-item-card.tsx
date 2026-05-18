'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

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
  const cartItem = useCartStore((s) =>
    s.items.find((i) => i.menu_item_id === id)
  );

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
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateQuantity(id, newQty);
    hapticFeedback('light');
  };

  const handleDecrease = () => {
    hapticFeedback('light');
    if (quantity === 1) {
      setQuantity(0);
      removeItem(id);
      return;
    }
    const newQty = quantity - 1;
    setQuantity(newQty);
    updateQuantity(id, newQty);
  };

  const hasAddons = addons && addons.length > 0;

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-card transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-card-hover hover:shadow-emerald-500/10',
        'dark:border-gray-800 dark:bg-gray-900',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ─── Image Section ─── */}
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
          {image_url && !imageError ? (
            <>
              <Image
                src={image_url}
                alt={name_ar}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={cn(
                  'object-cover transition-all duration-700',
                  imageLoaded ? 'scale-100 blur-0' : 'scale-110 blur-lg',
                  'group-hover:scale-105'
                )}
              />
              {/* Gradient overlay at bottom for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </>
          ) : (
            /* ─── Fallback centered icon ─── */
            <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
              <UtensilsCrossed className="w-12 h-12 text-emerald-400/50 dark:text-emerald-600/40" />
            </div>
          )}

          {/* ─── Top-right badges ─── */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {hasAddons && (
              <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-sm backdrop-blur-md dark:bg-gray-900/80 dark:text-amber-400">
                <Sparkles className="w-3 h-3" />
                إضافات
              </div>
            )}
          </div>

          {/* ─── Price badge (bottom-left) ─── */}
          <div className="absolute bottom-3 end-3 rounded-xl bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur-md dark:bg-gray-900/90">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(price)}
            </span>
          </div>

          {/* ─── Unavailable overlay ─── */}
          {!is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                غير متوفر حالياً
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Content Section ─── */}
      <div className="flex flex-col gap-3 px-4 py-3 text-right">
        {/* Title + Description */}
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-extrabold leading-7 text-gray-900 dark:text-white break-words">
            {name_ar}
          </h3>
          {description_ar && (
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 line-clamp-2">
              {description_ar}
            </p>
          )}
        </div>

        {/* ─── Action area ─── */}
        <div>
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-2xl py-3',
                'bg-gradient-to-l from-emerald-500 to-teal-500 text-sm font-bold text-white',
                'transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/20',
                'active:scale-[0.98]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              أضف إلى السلة
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 p-1.5 dark:bg-gray-800/60">
              <button
                onClick={handleIncrease}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                زيادة
              </button>

              <div className="flex flex-col items-center justify-center px-3">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  الكمية
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-5">
                  {quantity}
                </span>
              </div>

              <button
                onClick={handleDecrease}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-200 px-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
                تقليل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
