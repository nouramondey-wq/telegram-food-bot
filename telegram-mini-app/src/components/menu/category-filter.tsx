'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Flame, Beef, Pizza, Sandwich, Coffee, Salad, IceCreamBowl } from 'lucide-react';

interface Category {
  id: string;
  name_ar: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes('مشروب') || lower.includes('قهوة') || lower.includes('شاي')) {
    return <Coffee className="w-4 h-4" />;
  }

  if (lower.includes('بيتزا')) {
    return <Pizza className="w-4 h-4" />;
  }

  if (lower.includes('ساندوتش') || lower.includes('برجر')) {
    return <Sandwich className="w-4 h-4" />;
  }

  if (lower.includes('مشاوي') || lower.includes('لحوم')) {
    return <Beef className="w-4 h-4" />;
  }

  if (lower.includes('سلطة') || lower.includes('مقبلات')) {
    return <Salad className="w-4 h-4" />;
  }

  if (lower.includes('حلويات') || lower.includes('كيك')) {
    return <IceCreamBowl className="w-4 h-4" />;
  }

  return <Flame className="w-4 h-4" />;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string | null) => {
    onSelect(id);

    if (scrollRef.current) {
      const container = scrollRef.current;
      const catId = id === null ? '__all' : id;
      const btn = container.querySelector(
        '[data-cat-id="' + catId + '"]'
      ) as HTMLElement | null;

      if (btn) {
        const scrollLeft =
          btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="sticky top-0 z-30 border-b border-gray-100/70 bg-white/90 backdrop-blur-2xl dark:border-gray-800 dark:bg-gray-900/90">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-4 scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className={cn(
            'group relative flex-shrink-0 overflow-hidden rounded-2xl px-4 py-3',
            'transition-all duration-300 ease-out',
            'border',
            selectedId === null
              ? 'border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl',
                selectedId === null
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              <Flame className="w-4 h-4" />
            </div>

            <span className="text-sm font-bold whitespace-nowrap">
              كل الأصناف
            </span>
          </div>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={cn(
                'group relative flex-shrink-0 overflow-hidden rounded-2xl px-4 py-3',
                'transition-all duration-300 ease-out border',
                isSelected
                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                    isSelected
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  {getCategoryIcon(cat.name_ar)}
                </div>

                <span className="text-sm font-bold whitespace-nowrap">
                  {cat.name_ar}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
