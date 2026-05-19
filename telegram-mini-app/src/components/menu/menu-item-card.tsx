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
        'flex flex-col overflow-hidden',
        'rounded-2xl bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800',
        'shadow-sm',
        'transition-all duration-200',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'object-cover transition-all duration-700',
              imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
            )}
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center bg-gray-50 dark:bg-gray-800">
            <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col p-2.5 text-right">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex-1">
            {name_ar}
          </h3>
          
          {/* Action Button */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-6 h-6 shrink-0 flex items-center justify-center bg-[#d33a3a] text-white rounded-md shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
              <button onClick={handleDecrease} className="w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200 shadow-sm"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-bold w-3 text-center">{quantity}</span>
              <button onClick={handleIncrease} className="w-5 h-5 flex items-center justify-center bg-[#d33a3a] text-white rounded shadow-sm"><Plus className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center justify-start gap-0.5 mb-1.5" dir="ltr">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Description */}
        {description_ar && (
          <p className="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 min-h-[30px]">
            {description_ar}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto text-left">
          <span className="text-sm font-black text-[#d33a3a] tabular-nums" dir="rtl">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
