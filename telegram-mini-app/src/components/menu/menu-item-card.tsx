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
        'flex flex-col h-full bg-white dark:bg-gray-900',
        'rounded-2xl border border-gray-100 dark:border-gray-800',
        'shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        'transition-all duration-200',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-t-3xl overflow-hidden shrink-0">
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
      <div className="flex flex-col flex-1 p-3 text-right">
        {/* Title & Action Button Row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight flex-1">
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
            <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <button onClick={handleDecrease} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-sm outline-none"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-sm font-bold w-4 text-center">{quantity}</span>
              <button onClick={handleIncrease} className="w-6 h-6 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-sm outline-none"><Plus className="w-3.5 h-3.5 stroke-[3]" /></button>
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
          <span className="text-[15px] font-black text-[#ef4444] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
