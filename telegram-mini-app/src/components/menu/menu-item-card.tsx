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
        'flex flex-col h-full bg-yellow-50 dark:bg-gray-900',
        'rounded-2xl border-4 border-red-500 dark:border-gray-800',
        'shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 overflow-hidden',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-t-2xl overflow-hidden shrink-0">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'object-cover transition-opacity duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {/* Reduced padding to px-2.5 to give more room for text and prevent the card from expanding and overlapping */}
      <div className="flex flex-col flex-1 pt-3 pb-3 px-2.5 text-right w-full min-w-0">
        {/* Title & Action Button Row */}
        <div className="flex items-start justify-between gap-1.5 mb-1.5 w-full min-w-0">
          {/* min-w-0 to ensure long words like 'مارغريتا' wrap instead of pushing the container wide */}
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white leading-[1.3] flex-1 min-w-0 break-words whitespace-normal">
            {name_ar}
          </h3>
          
          {/* Action Button */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-7 h-7 shrink-0 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-md hover:bg-[#dc2626] active:scale-95 transition-all outline-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            /* Compressed counter width to avoid overlapping long product names */
            <div className="flex items-center gap-0.5 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-full p-0.5 border border-gray-100 dark:border-gray-700 shadow-sm max-w-fit">
              <button onClick={handleDecrease} className="w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-sm outline-none"><Minus className="w-3 h-3" /></button>
              <span className="text-[11px] font-bold min-w-[14px] text-center tabular-nums">{quantity}</span>
              <button onClick={handleIncrease} className="w-5 h-5 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-sm outline-none"><Plus className="w-3 h-3 stroke-[3]" /></button>
            </div>
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center justify-start gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
          ))}
        </div>

        {/* Description */}
        {description_ar && (
          <p className="text-[11px] leading-[1.6] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {description_ar}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto text-right">
          <span className="text-[14px] font-black text-[#ef4444] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}