'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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

// Category icons by common keywords — keeps things visual in Arabic
function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('مشرو') || lower.includes('عصير') || lower.includes('شاي') || lower.includes('قهوة') || lower.includes('نسكافيه')) return '🥤';
  if (lower.includes('مقبل') || lower.includes('مزة') || lower.includes('سلطة')  || lower.includes('شوربة') || lower.includes('حساء')) return '🥗';
  if (lower.includes('رئيس') || lower.includes('أكل') || lower.includes('وجبة') || lower.includes('طبق')) return '🍽️';
  if (lower.includes('حلو') || lower.includes('تتحلية') || lower.includes('تحلية') || lower.includes('آيس') || lower.includes('جاتوه') || lower.includes('كيك') || lower.includes('بسكوت')) return '🍰';
  if (lower.includes('مأكول') || lower.includes('مشوي') || lower.includes('لحم') || lower.includes('دجاج') || lower.includes('برياني')|| lower.includes('مندي')|| lower.includes('كبسة')) return '🍖';
  if (lower.includes('مشاوي') || lower.includes('شاورما') || lower.includes('فلافل') || lower.includes('فول')) return '🥙';
  if (lower.includes('ساندوتش') || lower.includes('برجر') || lower.includes('ساندويش')) return '🍔';
  if (lower.includes('بيتزا') || lower.includes('فطاير') || lower.includes('فطائر') || lower.includes('مقانق')) return '🍕';
  if (lower.includes('فواكه') || lower.includes('سموث') || lower.includes('ميلك')) return '🍓';
  if (lower.includes('جديد') || lower.includes('عرض') || lower.includes('خصم') || lower.includes('تخفيض')) return '🔥';
  return '🍜';
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [is_scrolling, setIsScrolling] = useState(false);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    // Scroll the button into view
    if (scrollRef.current) {
      const container = scrollRef.current;
      const btn = container.querySelector(`[data-cat-id="${id === null ? '__all' : id}"]`) as HTMLElement | null;
      if (btn) {
        const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* زر "الكل" */}
        <button
          data-cat-id="__all"
          onClick={() => handleSelect(null)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
            'transition-all duration-300 ease-out',
            selectedId === null
              ? 'text-emerald-700 bg-emerald-50 shadow-sm shadow-emerald-100/50 ring-1 ring-emerald-200/60'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          <span className="text-base">🍽️</span>
          <span>الكل</span>
        </button>

        {/* أزرار الفئات */}
        {categories.map((cat, idx) => {
          const isSelected = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              style={{ animationDelay: `${idx * 0.04}s` }}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-300 ease-out',
                'opacity-0 animate-fade-in',
                isSelected
                  ? 'text-emerald-700 bg-emerald-50 shadow-sm shadow-emerald-100/50 ring-1 ring-emerald-200/60'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:ring-1 hover:ring-gray-200/50'
              )}
            >
              <span className="text-base">{getCategoryEmoji(cat.name_ar)}</span>
              <span>{cat.name_ar}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
