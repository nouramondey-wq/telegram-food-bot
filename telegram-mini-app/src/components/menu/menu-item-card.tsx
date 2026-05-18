'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingBag, Sparkles, UtensilsCrossed } from 'lucide-react';

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

  const hasAddons = addons && addons.length > 0;

  return (
    /* ── Horizontal card: image right (RTL) | content fills left ── */
    <div
      dir="rtl"
      className={cn(
        'flex flex-row items-stretch overflow-hidden',
        'rounded-2xl bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800',
        'shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
        'transition-all duration-200 active:scale-[0.99]',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image (fixed square, 110 × full height) ── */}
      <div className="relative w-[110px] shrink-0 self-stretch bg-gray-100 dark:bg-gray-800">
        {image_url && !imageError ? (
          <>
            <Image
              src={image_url}
              alt={name_ar}
              fill
              sizes="110px"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={cn(
                'object-cover transition-all duration-700',
                imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              )}
            />
            {/* subtle darkening at edges */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
          </>
        ) : (
          <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <UtensilsCrossed className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
          </div>
        )}

        {/* Addons badge — inside image top-right */}
        {hasAddons && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-0.5 rounded-full bg-white/90 dark:bg-gray-900/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-2 h-2 shrink-0" />
              إضافات
            </div>
          </div>
        )}

        {/* Unavailable overlay */}
        {!is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
              غير متوفر
            </span>
          </div>
        )}
      </div>

      {/* ── Content (fills remaining width) ── */}
      <div className="flex flex-1 flex-col justify-between gap-2 min-w-0 px-3 py-3 text-right">

        {/* Title + Description */}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-extrabold leading-snug text-gray-900 dark:text-white break-words">
            {name_ar}
          </h3>
          {description_ar && (
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
              {description_ar}
            </p>
          )}
        </div>

        {/* Price + Action */}
        <div className="flex flex-col gap-2 min-w-0">
          {/* Price row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(price)}
            </span>
            {quantity > 0 && (
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tabular-nums bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                × {quantity} في السلة
              </span>
            )}
          </div>

          {/* Add / Counter */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className={cn(
                'flex w-full items-center justify-center gap-1.5 rounded-xl py-2',
                'bg-gradient-to-l from-emerald-500 to-teal-500 text-xs font-bold text-white',
                'transition-all duration-200 hover:brightness-110 active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'shadow-sm shadow-emerald-500/20'
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              أضف للسلة
            </button>
          ) : (
            /* ── Compact counter ── */
            <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-0.5">
              {/* + */}
              <button
                onClick={handleIncrease}
                aria-label="زيادة الكمية"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* qty */}
              <span className="flex-1 text-center text-sm font-black text-gray-900 dark:text-white tabular-nums">
                {quantity}
              </span>

              {/* − */}
              <button
                onClick={handleDecrease}
                aria-label="تقليل الكمية"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
