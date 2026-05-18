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
      dir="rtl"
      className={cn(
        'group overflow-hidden rounded-[24px] border border-white/60 bg-white/90',
        'shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        'dark:border-gray-700/60 dark:bg-gray-900/90',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ─── Image Section ─── */}
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800">
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
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </>
          ) : (
            /* ─── Fallback icon ─── */
            <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
              <UtensilsCrossed className="w-10 h-10 text-emerald-400/50 dark:text-emerald-600/40" />
            </div>
          )}

          {/* ─── Addons badge ─── */}
          {hasAddons && (
            <div className="absolute top-2.5 start-2.5">
              <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-600 shadow-sm backdrop-blur-md dark:bg-gray-900/80 dark:text-amber-400">
                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                إضافات
              </div>
            </div>
          )}

          {/* ─── Unavailable overlay ─── */}
          {!is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                غير متوفر
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Content Section ─── */}
      <div className="flex flex-col gap-2.5 px-3 pt-3 pb-3 text-right">

        {/* Title */}
        <h3 className="text-sm font-extrabold leading-[1.5] text-gray-900 dark:text-white break-words hyphens-auto w-full">
          {name_ar}
        </h3>

        {/* Description */}
        {description_ar && (
          <p className="text-[11px] leading-[1.6] text-gray-500 dark:text-gray-400 line-clamp-2 break-words w-full">
            {description_ar}
          </p>
        )}

        {/* ─── Price row ─── */}
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatPrice(price)}
          </span>
          {quantity > 0 && (
            <span className="text-xs font-bold text-gray-400 tabular-nums dark:text-gray-500">
              × {quantity}
            </span>
          )}
        </div>

        {/* ─── Action row — full width below price ─── */}
        <div className="w-full">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className={cn(
                'flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5',
                'bg-gradient-to-l from-emerald-500 to-teal-500 text-xs font-bold text-white',
                'transition-all duration-200 hover:brightness-110 active:scale-[0.97]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'shadow-md shadow-emerald-500/20'
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              أضف للسلة
            </button>
          ) : (
            /* ─── Quantity Counter — three equal columns ─── */
            <div className="grid grid-cols-3 items-center rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-1 gap-1">
              {/* Plus — right in RTL */}
              <button
                onClick={handleIncrease}
                aria-label="زيادة الكمية"
                className="flex h-9 items-center justify-center rounded-xl bg-emerald-500 text-white transition-all hover:bg-emerald-600 active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Count display — center */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                  الكمية
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white tabular-nums leading-none">
                  {quantity}
                </span>
              </div>

              {/* Minus — left in RTL */}
              <button
                onClick={handleDecrease}
                aria-label="تقليل الكمية"
                className="flex h-9 items-center justify-center rounded-xl bg-gray-200 text-gray-700 transition-all hover:bg-gray-300 active:scale-95 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
