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
        'rounded-2xl',
        'shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 overflow-hidden',
        !is_available && 'opacity-60 grayscale'
      )}
    >
      {/* ── Image ── */}
      <div 
        className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0"
        style={{ borderRadius: '14px', margin: '6px' }}
      >
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
        {/* Title Row - Action button moved down */}
        <div className="mb-1 w-full min-w-0">
          {/* min-w-0 to ensure long words like 'مارغريتا' wrap instead of pushing the container wide */}
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white leading-[1.3] min-w-0 break-words whitespace-normal">
            {name_ar}
          </h3>
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

        {/* Price & Action Button Row */}
        <div className="mt-auto flex items-center justify-between w-full">
          <span className="text-[14px] font-black text-[#ef4444] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>

          {/* Action Button - Moved here and made slightly smaller using Inline Styles */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="shrink-0 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-md hover:bg-[#dc2626] active:scale-95 transition-all outline-none"
              style={{ width: '24px', height: '24px' }}
            >
              <Plus className="stroke-[3]" style={{ width: '14px', height: '14px' }} />
            </button>
          ) : (
            <div className="flex items-center shrink-0 bg-gray-50 dark:bg-gray-800 rounded-full shadow-sm max-w-fit" style={{ padding: '2px', gap: '2px', border: '1px solid #f3f4f6' }}>
              <button onClick={handleDecrease} className="flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-sm outline-none" style={{ width: '20px', height: '20px' }}>
                <Minus style={{ width: '12px', height: '12px' }} />
              </button>
              <span className="text-[11px] font-bold text-center tabular-nums" style={{ minWidth: '14px' }}>{quantity}</span>
              <button onClick={handleIncrease} className="flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-sm outline-none" style={{ width: '20px', height: '20px' }}>
                <Plus className="stroke-[3]" style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}