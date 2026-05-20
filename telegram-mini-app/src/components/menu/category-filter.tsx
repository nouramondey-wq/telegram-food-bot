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

interface CategoryTheme {
  emoji: string;
  bg: string;
  selectedBg: string;
  border: string;
}

function getCategoryTheme(name: string): CategoryTheme {
  const lower = name.toLowerCase();

  if (lower.includes('مشروب') || lower.includes('قهوة') || lower.includes('شاي') || lower.includes('عصير')) {
    return { emoji: '🥤', bg: 'bg-sky-50 dark:bg-sky-950/30', selectedBg: 'bg-sky-100 dark:bg-sky-900/50', border: 'border-sky-300/60 dark:border-sky-600/60' };
  }
  if (lower.includes('بيتزا') || lower.includes('بيتza')) {
    return { emoji: '🍕', bg: 'bg-orange-50 dark:bg-orange-950/30', selectedBg: 'bg-orange-100 dark:bg-orange-900/50', border: 'border-orange-300/60 dark:border-orange-600/60' };
  }
  if (lower.includes('ساندوتش') || lower.includes('برجر') || lower.includes('شاورما') || lower.includes('فلافل')) {
    return { emoji: '🍔', bg: 'bg-amber-50 dark:bg-amber-950/30', selectedBg: 'bg-amber-100 dark:bg-amber-900/50', border: 'border-amber-300/60 dark:border-amber-600/60' };
  }
  if (lower.includes('مشاوي') || lower.includes('لحوم') || lower.includes('دجاج') || lower.includes('كباب')) {
    return { emoji: '🥩', bg: 'bg-red-50 dark:bg-red-950/30', selectedBg: 'bg-red-100 dark:bg-red-900/50', border: 'border-red-300/60 dark:border-red-600/60' };
  }
  if (lower.includes('سلطة') || lower.includes('مقبلات') || lower.includes('شوربة') || lower.includes('حساء')) {
    return { emoji: '🥗', bg: 'bg-green-50 dark:bg-green-950/30', selectedBg: 'bg-green-100 dark:bg-green-900/50', border: 'border-green-300/60 dark:border-green-600/60' };
  }
  if (lower.includes('حلويات') || lower.includes('كيك') || lower.includes('جاتوه') || lower.includes('بسبوسة')) {
    return { emoji: '🍰', bg: 'bg-pink-50 dark:bg-pink-950/30', selectedBg: 'bg-pink-100 dark:bg-pink-900/50', border: 'border-pink-300/60 dark:border-pink-600/60' };
  }
  if (lower.includes('سمك') || lower.includes('مأكولات بحرية') || lower.includes('جمبري') || lower.includes('ربيان')) {
    return { emoji: '🦐', bg: 'bg-cyan-50 dark:bg-cyan-950/30', selectedBg: 'bg-cyan-100 dark:bg-cyan-900/50', border: 'border-cyan-300/60 dark:border-cyan-600/60' };
  }
  if (lower.includes('معجنات') || lower.includes('فطائر') || lower.includes('مناقيش')) {
    return { emoji: '🥟', bg: 'bg-yellow-50 dark:bg-yellow-950/30', selectedBg: 'bg-yellow-100 dark:bg-yellow-900/50', border: 'border-yellow-300/60 dark:border-yellow-600/60' };
  }
  if (lower.includes('فطور') || lower.includes('إفطار') || lower.includes('بيض') || lower.includes('فول')) {
    return { emoji: '🌅', bg: 'bg-rose-50 dark:bg-rose-950/30', selectedBg: 'bg-rose-100 dark:bg-rose-900/50', border: 'border-rose-300/60 dark:border-rose-600/60' };
  }
  if (lower.includes('مكرونة') || lower.includes('باستا') || lower.includes('نودلز')) {
    return { emoji: '🍝', bg: 'bg-lime-50 dark:bg-lime-950/30', selectedBg: 'bg-lime-100 dark:bg-lime-900/50', border: 'border-lime-300/60 dark:border-lime-600/60' };
  }

  // Default
  return { emoji: '🍽️', bg: 'bg-gray-50 dark:bg-gray-800/50', selectedBg: 'bg-gray-200 dark:bg-gray-700', border: 'border-gray-300/60 dark:border-gray-600/60' };
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

  const allTheme: CategoryTheme = {
    emoji: '✨',
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    selectedBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    border: 'border-emerald-300/60 dark:border-emerald-600/60',
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-none"
      >
        {/* "كل الأصناف" button */}
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className="group relative flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 ease-out outline-none"
        >
          <div
            className={cn(
              'flex h-[60px] w-[60px] items-center justify-center rounded-full transition-all duration-300 ease-out',
              selectedId === null
                ? `${allTheme.selectedBg} scale-110 shadow-sm`
                : `${allTheme.bg} hover:scale-105`
            )}
          >
            <span className="text-2xl">{allTheme.emoji}</span>
          </div>
          <span className={cn(
            'text-[11px] whitespace-nowrap transition-colors',
            selectedId === null ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'
          )}>
            الكل
          </span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const theme = getCategoryTheme(cat.name_ar);

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="group relative flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 ease-out outline-none"
            >
              <div
                className={cn(
                  'flex h-[60px] w-[60px] items-center justify-center rounded-full transition-all duration-300 ease-out',
                  isSelected
                    ? `${theme.selectedBg} scale-110 shadow-sm`
                    : `${theme.bg} hover:scale-105`
                )}
              >
                <span className="text-2xl">{theme.emoji}</span>
              </div>
              <span className={cn(
                'text-[11px] whitespace-nowrap transition-colors',
                isSelected ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'
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
