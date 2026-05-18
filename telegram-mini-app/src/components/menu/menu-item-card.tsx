'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, ShoppingCart, Sparkles, UtensilsCrossed } from 'lucide-react';

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
  // Sync local quantity with persisted cart store
  const cartItem = useCartStore((s) => s.items.find((i) => i.menu_item_id === id));
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  // Re-sync local quantity when cart changes (e.g., user edits on cart page)
  useEffect(() => {
    setQuantity(cartItem?.quantity || 0);
  }, [cartItem?.quantity]);

  const handleAdd = () => {
    if (!is_available) return;
    hapticFeedback('light');

    setQuantity(1);
    setBounceKey((k) => k + 1);

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
      title: 'تمت الإضافة 🎉',
      description: `${name_ar} — أضيف إلى السلة`,
      variant: 'success',
    });
  };

  const handleIncrease = () => {
    if (!is_available) return;
    hapticFeedback('light');
    const newQty = quantity + 1;
    setQuantity(newQty);
    setBounceKey((k) => k + 1);
    updateQuantity(id, newQty);
  };

  const handleDecrease = () => {
    if (!is_available) return;
    hapticFeedback('light');
    if (quantity === 1) {
      setQuantity(0);
      removeItem(id);
      toast({
        title: 'تمت الإزالة',
        description: `${name_ar} — أزيل من السلة`,
        variant: 'default',
      });
    } else {
      setQuantity(quantity - 1);
      updateQuantity(id, quantity - 1);
    }
  };

  const hasAddons = addons && addons.length > 0;

  return (
    <div
      className={cn(
        'relative group rounded-2xl overflow-hidden',
        'bg-white dark:bg-gray-800',
        'shadow-card transition-all duration-300',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'active:shadow-card-active',
        'press-effect',
        !is_available && 'opacity-50 grayscale-[30%]'
      )}
    >
      {/* صورة الصنف */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
        {image_url && !imageError ? (
          <>
            <Image
              src={image_url}
              alt={name_ar}
              fill
              className={cn(
                'object-cover transition-all duration-500 ease-out',
                imageLoaded ? 'scale-100 blur-0' : 'scale-110 blur-sm',
                'group-hover:scale-105'
              )}
              sizes="(max-width: 480px) 50vw, 240px"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Shimmer overlay until loaded */}
            {!imageLoaded && <div className="image-shimmer absolute inset-0" />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-teal-50">
            <UtensilsCrossed className="w-10 h-10 text-emerald-200" />
          </div>
        )}

        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* شارة الإضافات */}
        {hasAddons && (
          <div className="absolute top-2.5 right-2.5 animate-badge-pop">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50/90 text-amber-700 border border-amber-200/60 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3 h-3" />
              إضافات
            </span>
          </div>
        )}

        {/* علامة غير متوفر */}
        {!is_available && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-semibold text-xs bg-red-500/90 px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 backdrop-blur-sm">
              غير متوفر حالياً
            </span>
          </div>
        )}

        {/* Price badge on image */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-emerald-700 backdrop-blur-sm shadow-sm border border-white/50">
            {formatPrice(price)}
          </span>
        </div>

        {/* Floating Add to Cart button */}
        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            disabled={!is_available}
            className={cn(
              'absolute bottom-2.5 left-2.5',
              'w-9 h-9 rounded-full flex items-center justify-center',
              'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
              'hover:bg-emerald-600 hover:shadow-emerald-500/35',
              'active:scale-90 transition-all duration-200',
              'disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed',
              'animate-scale-in',
              'max-[768px]:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0',
              'transition-all duration-300 ease-out'
            )}
          >
            <Plus key={`plus-${id}`} className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-3 space-y-1.5">
        {/* الاسم */}
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 leading-snug">
          {name_ar}
        </h3>

        {/* الوصف */}
        {description_ar && (
          <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500 line-clamp-2 font-medium">
            {description_ar}
          </p>
        )}

        {/* السعر وزر التحكم بالكمية */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Quantity counter - always visible */}
          <div className="flex items-center gap-1">
            {quantity > 0 ? (
              <div
                key={bounceKey}
                className="flex items-center gap-0.5 bg-emerald-50 rounded-full border border-emerald-100/80 p-0.5 shadow-sm animate-scale-in"
              >
                <button
                  onClick={handleDecrease}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    'text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200',
                    'transition-colors duration-150'
                  )}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-emerald-700 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    'text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700',
                    'transition-colors duration-150 shadow-sm shadow-emerald-500/20'
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!is_available}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full',
                  'text-xs font-semibold',
                  'bg-emerald-500 text-white',
                  'hover:bg-emerald-600 active:bg-emerald-700',
                  'transition-all duration-200 shadow-sm shadow-emerald-500/20',
                  'disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed'
                )}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                أضف
              </button>
            )}
          </div>

          {/* Price text */}
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 tabular-nums">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
