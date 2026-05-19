'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Star, UtensilsCrossed } from 'lucide-react';

interface MenuItemProps {
  id: string;
  name_ar: string;
  description_ar: string;
  price: number;
  image_url: string;
  is_available: boolean;
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
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

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
  };

  const handleIncrease = () => {
    hapticFeedback('light');
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateQuantity(id, newQty);
  };

  const handleDecrease = () => {
    hapticFeedback('light');
    if (quantity === 1) {
      setQuantity(0);
      removeItem(id);
    } else {
      setQuantity(quantity - 1);
      updateQuantity(id, quantity - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100/60 dark:border-gray-700/40 overflow-hidden flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md">
      {/* جزء الصورة العلوي */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700 overflow-hidden">
        {image_url && !imageError ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 50vw, 240px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <UtensilsCrossed className="w-6 h-6 text-gray-300" />
          </div>
        )}

        {/* كبسولة العداد العائمة - صغيرة جداً وذكية لتفادي تغطية النص */}
        <div className="absolute bottom-2 left-2 z-10">
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md rounded-full p-0.5 border border-gray-200/50 dark:border-gray-700">
              <button
                onClick={handleIncrease}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-red-500 hover:bg-red-600 active:scale-90 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold px-0.5 text-gray-800 dark:text-gray-100 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={handleDecrease}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 active:scale-90 transition-transform"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!is_available}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-red-500 shadow-md hover:bg-red-600 active:scale-90 transition-transform disabled:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* تفاصيل الوجبة السفلية */}
      <div className="p-3 flex flex-col flex-grow justify-between text-right dir-rtl space-y-1">
        <div>
          {/* اسم الصنف Bold جداً وممتاز */}
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">
            {name_ar}
          </h3>

          {/* النجوم الذهبية الخمسة أسفل الاسم مباشرة */}
          <div className="flex items-center justify-start gap-0.5 my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* وصف الوجبة السلس */}
          {description_ar && (
            <p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500 line-clamp-1 font-medium">
              {description_ar}
            </p>
          )}
        </div>

        {/* السعر في سطر منفصل ملون ومحمي */}
        <div className="pt-1.5 flex items-center justify-start">
          <span className="font-black text-xs text-red-500 dark:text-red-400 tabular-nums">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}