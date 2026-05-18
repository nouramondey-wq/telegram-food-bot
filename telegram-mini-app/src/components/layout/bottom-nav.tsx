'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';
import { UtensilsCrossed, ShoppingCart, ClipboardList, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  const navItems = [
    {
      label: 'القائمة',
      href: '/',
      icon: UtensilsCrossed,
    },
    {
      label: 'السلة',
      href: '/cart',
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : undefined,
    },
    {
      label: 'طلباتي',
      href: '/orders',
      icon: ClipboardList,
    },
    {
      label: 'حسابي',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 shadow-lg shadow-black/5 safe-bottom"
      style={{ maxWidth: '480px', margin: '0 auto' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-full transition-colors',
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-2 -left-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-scale-in">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -top-0.5 w-8 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
