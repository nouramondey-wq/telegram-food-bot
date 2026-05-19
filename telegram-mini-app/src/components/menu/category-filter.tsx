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
    return <span className="text-2xl">🥤</span>;
  }

  if (lower.includes('بيتزا')) {
    return <span className="text-2xl">🍕</span>;
  }

  if (lower.includes('ساندوتش') || lower.includes('برجر')) {
    return <span className="text-2xl">🍔</span>;
  }

  if (lower.includes('مشاوي') || lower.includes('لحوم')) {
    return <span className="text-2xl">🥘</span>;
  }

  if (lower.includes('سلطة') || lower.includes('مقبلات')) {
    return <span className="text-2xl">🥗</span>;
  }

  if (lower.includes('حلويات') || lower.includes('كيك')) {
    return <span className="text-2xl">🍰</span>;
  }

  return <span className="text-2xl">🍽️</span>;
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
          className="group relative flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] transition-all duration-300 ease-out"
        >
          <div className={cn(
            'flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 transition-all duration-200',
            selectedId === null
              ? 'border-gray-800 bg-gray-100 shadow-sm'
              : 'border-transparent bg-gray-50 hover:bg-gray-100'
          )}>
            <span className="text-2xl">✨</span>
          </div>
          <span className={cn(
            'text-[13px] whitespace-nowrap transition-colors mt-1',
            selectedId === null ? 'font-black text-gray-900' : 'font-bold text-gray-600'
          )}>
            كل الأصناف
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="group relative flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] transition-all duration-300 ease-out"
            >
              <div className={cn(
                'flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 transition-all duration-200',
                isSelected
                  ? 'border-gray-800 bg-gray-100 shadow-sm'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              )}>
                {getCategoryIcon(cat.name_ar)}
              </div>
              <span className={cn(
                'text-[13px] whitespace-nowrap transition-colors mt-1',
                isSelected ? 'font-black text-gray-900' : 'font-bold text-gray-600'
              )}>
                {cat.name_ar}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
