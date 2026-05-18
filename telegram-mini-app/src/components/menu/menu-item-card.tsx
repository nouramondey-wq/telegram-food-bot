'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [quantity, setQuantity] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const [showAddons, setShowAddons] = useState(false);

  const handleAdd = () => {
    if (!is_available) return;
    hapticFeedback('light');

    if (quantity === 0) {
      setQuantity(1);
      // First add - show toast
      toast({
        title: 'تمت الإضافة 🎉',
        description: `${name_ar} — أضيف إلى السلة`,
        variant: 'success',
      });
    }

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
      title: 'زيادة الكمية ✅',
      description: `${name_ar} — الكمية: ${newQty}`,
      variant: 'success',
    });
  };

  const handleDecrease = () => {
    hapticFeedback('light');
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Card className={cn(
      'overflow-hidden',
      !is_available && 'opacity-60'
    )}>
      {/* صورة الصنف */}
      <div className="relative w-full aspect-[3/2] bg-gray-100 overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={name_ar}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 480px) 50vw, 240px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <UtensilsCrossed className="w-12 h-12" />
          </div>
        )}

        {/* علامة غير متوفر */}
        {!is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">
              غير متوفر
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* الاسم والوصف */}
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{name_ar}</h3>
        {description_ar && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description_ar}</p>
        )}

        {/* السعر وزر الإضافة */}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-emerald-700 text-sm">
            {formatPrice(price)}
          </span>

          <div className="flex items-center gap-1">
            {quantity > 0 ? (
              <>
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!is_available}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                أضف
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// استيراد إضافي
import { UtensilsCrossed } from 'lucide-react';
