'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

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
    return <span className="text-3xl drop-shadow-sm">🥤</span>;
  }

  if (lower.includes('بيتزا')) {
    return <span className="text-3xl drop-shadow-sm">🍕</span>;
  }

  if (lower.includes('ساندوتش') || lower.includes('برجر')) {
    return <span className="text-3xl drop-shadow-sm">🍔</span>;
  }

  if (lower.includes('مشاوي') || lower.includes('لحوم')) {
    return <span className="text-3xl drop-shadow-sm">🥘</span>;
  }

  if (lower.includes('سلطة') || lower.includes('مقبلات')) {
    return <span className="text-3xl drop-shadow-sm">🥗</span>;
  }

  if (lower.includes('حلويات') || lower.includes('كيك')) {
    return <span className="text-3xl drop-shadow-sm">🍰</span>;
  }

  return <span className="text-3xl drop-shadow-sm">🍽️</span>;
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
        `[data-cat-id="${catId}"]`
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
    <div
      className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-4 py-3 scrollbar-none"
        style={{ gap: '12px' }}
      >
        {/* All Categories */}
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className={cn(
            'group relative flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 ease-out outline-none px-3 py-2',
            selectedId === null
              ? 'bg-white dark:bg-gray-800 shadow-md scale-[1.03]'
              : 'bg-gray-50/70 dark:bg-gray-800/60'
          )}
          style={{
            borderRadius: '22px',
            minWidth: '88px',
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center">
            <span className="text-3xl drop-shadow-sm">✨</span>
          </div>

          <span
            className={cn(
              'text-[13px] whitespace-nowrap transition-colors mt-1',
              selectedId === null
                ? 'font-black text-gray-900 dark:text-white'
                : 'font-semibold text-gray-500 dark:text-gray-400'
            )}
          >
            كل الأصناف
          </span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={cn(
                'group relative flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 ease-out outline-none px-3 py-2',
                isSelected
                  ? 'bg-white dark:bg-gray-800 shadow-md scale-[1.03]'
                  : 'bg-gray-50/70 dark:bg-gray-800/60'
              )}
              style={{
                borderRadius: '22px',
                minWidth: '88px',
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center">
                {getCategoryIcon(cat.name_ar)}
              </div>

              <span
                className={cn(
                  'text-[13px] whitespace-nowrap transition-colors mt-1',
                  isSelected
                    ? 'font-black text-gray-900 dark:text-white'
                    : 'font-semibold text-gray-500 dark:text-gray-400'
                )}
              >
                {cat.name_ar}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}