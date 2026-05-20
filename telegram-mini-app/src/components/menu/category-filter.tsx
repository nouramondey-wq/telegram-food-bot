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
}

function getCategoryTheme(name: string): CategoryTheme {
  const lower = name.toLowerCase();

  if (
    lower.includes('مشروب') ||
    lower.includes('قهوة') ||
    lower.includes('شاي') ||
    lower.includes('عصير')
  ) {
    return {
      emoji: '🥤',
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      selectedBg: 'bg-sky-500 dark:bg-sky-500 text-white',
    };
  }
  if (lower.includes('بيتزا')) {
    return {
      emoji: '🍕',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      selectedBg: 'bg-orange-500 dark:bg-orange-500 text-white',
    };
  }
  if (
    lower.includes('ساندوتش') ||
    lower.includes('برجر') ||
    lower.includes('شاورما') ||
    lower.includes('فلافل')
  ) {
    return {
      emoji: '🍔',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      selectedBg: 'bg-amber-500 dark:bg-amber-500 text-white',
    };
  }
  if (
    lower.includes('مشاوي') ||
    lower.includes('لحوم') ||
    lower.includes('دجاج') ||
    lower.includes('كباب')
  ) {
    return {
      emoji: '🥩',
      bg: 'bg-red-50 dark:bg-red-950/30',
      selectedBg: 'bg-red-500 dark:bg-red-500 text-white',
    };
  }
  if (
    lower.includes('سلطة') ||
    lower.includes('مقبلات') ||
    lower.includes('شوربة') ||
    lower.includes('حساء')
  ) {
    return {
      emoji: '🥗',
      bg: 'bg-green-50 dark:bg-green-950/30',
      selectedBg: 'bg-green-500 dark:bg-green-500 text-white',
    };
  }
  if (
    lower.includes('حلويات') ||
    lower.includes('كيك') ||
    lower.includes('جاتوه') ||
    lower.includes('بسبوسة')
  ) {
    return {
      emoji: '🍰',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      selectedBg: 'bg-pink-500 dark:bg-pink-500 text-white',
    };
  }
  if (
    lower.includes('سمك') ||
    lower.includes('مأكولات بحرية') ||
    lower.includes('جمبري') ||
    lower.includes('ربيان')
  ) {
    return {
      emoji: '🦐',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      selectedBg: 'bg-cyan-500 dark:bg-cyan-500 text-white',
    };
  }
  if (
    lower.includes('معجنات') ||
    lower.includes('فطائر') ||
    lower.includes('مناقيش')
  ) {
    return {
      emoji: '🥟',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      selectedBg: 'bg-yellow-500 dark:bg-yellow-500 text-white',
    };
  }
  if (
    lower.includes('فطور') ||
    lower.includes('إفطار') ||
    lower.includes('بيض') ||
    lower.includes('فول')
  ) {
    return {
      emoji: '🌅',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      selectedBg: 'bg-rose-500 dark:bg-rose-500 text-white',
    };
  }
  if (
    lower.includes('مكرونة') ||
    lower.includes('باستا') ||
    lower.includes('نودلز')
  ) {
    return {
      emoji: '🍝',
      bg: 'bg-lime-50 dark:bg-lime-950/30',
      selectedBg: 'bg-lime-500 dark:bg-lime-500 text-white',
    };
  }

  // Default
  return {
    emoji: '🍽️',
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    selectedBg: 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900',
  };
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
    selectedBg: 'bg-emerald-500 dark:bg-emerald-500 text-white',
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-4 py-3 scrollbar-none"
      >
        {/* "كل الأصناف" capsule */}
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 outline-none',
            selectedId === null
              ? `${allTheme.selectedBg} shadow-sm scale-[1.04]`
              : `${allTheme.bg} text-gray-600 dark:text-gray-300 hover:scale-[1.03]`
          )}
        >
          {allTheme.emoji} الكل
        </button>

        {/* Category capsules */}
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const theme = getCategoryTheme(cat.name_ar);

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 outline-none whitespace-nowrap',
                isSelected
                  ? `${theme.selectedBg} shadow-sm scale-[1.04]`
                  : `${theme.bg} text-gray-600 dark:text-gray-300 hover:scale-[1.03]`
              )}
            >
              {theme.emoji} {cat.name_ar}
            </button>
          );
        })}
      </div>
    </div>
  );
}
