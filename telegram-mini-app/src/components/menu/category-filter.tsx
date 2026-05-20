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

function getCategoryThemeColor(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('مشاوي') || lower.includes('لحوم')) return '#ef4444'; // Red
  if (lower.includes('سلطة') || lower.includes('مقبلات')) return '#22c55e'; // Green
  if (lower.includes('برجر') || lower.includes('ساندوتش')) return '#eab308'; // Yellow
  if (lower.includes('مشروب') || lower.includes('شاي')) return '#3b82f6'; // Blue
  if (lower.includes('حلويات') || lower.includes('كيك')) return '#ec4899'; // Pink
  if (lower.includes('بيتزا')) return '#f97316'; // Orange
  return '#10b981'; // Default Emerald
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
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-transparent">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-4 py-3 scrollbar-none"
        style={{ gap: '12px' }}
      >
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className="group relative flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 ease-out outline-none"
        >
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center transition-all duration-300 ease-out',
              selectedId === null
                ? 'scale-110 shadow-md bg-white dark:bg-gray-800'
                : 'bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800'
            )}
            style={{ borderRadius: '18px' }}
          >
            <span className="text-3xl drop-shadow-sm">✨</span>
          </div>
          <span className={cn(
            'text-[13px] whitespace-nowrap transition-colors',
            selectedId === null ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-500 dark:text-gray-400'
          )}>
            كل الأصناف
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const themeColor = getCategoryThemeColor(cat.name_ar);

          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="group relative flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 ease-out outline-none"
            >
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center transition-all duration-300 ease-out',
                  isSelected
                    ? 'scale-110 shadow-md bg-white dark:bg-gray-800'
                    : 'bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800'
                )}
                style={{ borderRadius: '30px' }}
              >
                {getCategoryIcon(cat.name_ar)}
              </div>
              <span className={cn(
                'text-[13px] whitespace-nowrap transition-colors',
                isSelected ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-500 dark:text-gray-400'
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
