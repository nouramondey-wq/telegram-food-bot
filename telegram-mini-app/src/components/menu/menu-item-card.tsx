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
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
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
        'rounded-3xl border border-gray-100/70 dark:border-gray-800/70',
        'shadow-[0_4px_16px_rgba(0,0,0,0.03)] m-0.5', // أضفنا مسافة امان ميكروسكوبية لظهور الكارت منفرداً
        'transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]',
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
      <div className="flex flex-col flex-1 p-3 pt-2 text-right">
        {/* Title & Action Button Row */}
        <div className="flex items-center justify-between gap-1 mb-1">
          {/* الاسم هنا تم تغليظه إلى font-black وتصغير حجمه متناسق للعمودين */}
          <h3 className="text-[14px] font-black text-gray-900 dark:text-white leading-tight flex-1 line-clamp-1">
            {name_ar}
          </h3>

          {/* Action Button - تم تصغيره وتنسيقه بالملي ليناسب واجهة الموبايل المزدوجة */}
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-6 h-6 shrink-0 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-sm hover:bg-[#dc2626] active:scale-90 transition-all outline-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3.5]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-full p-0.5 border border-gray-100/80 dark:border-gray-700 shadow-sm animate-scale-in">
              <button onClick={handleDecrease} className="w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 shadow-xs outline-none"><Minus className="w-2.5 h-2.5 stroke-[2.5]" /></button>
              <span className="text-xs font-black w-3.5 text-center text-gray-900 dark:text-white tabular-nums">{quantity}</span>
              <button onClick={handleIncrease} className="w-5 h-5 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-xs outline-none"><Plus className="w-2.5 h-2.5 stroke-[3.5]" /></button>
            </div>
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center justify-start gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
          ))}
        </div>

        {/* Description */}
        {description_ar && (
          <p className="text-[10.5px] leading-[1.5] text-gray-400 dark:text-gray-500 line-clamp-2 mb-2 font-medium">
            {description_ar}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-1 text-right">
          <span className="text-[14px] font-black text-[#ef4444] tabular-nums tracking-tight">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}