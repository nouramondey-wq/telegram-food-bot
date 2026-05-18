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
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[100]',
        'bg-white/95 backdrop-blur-xl',
        'border-t border-gray-100/80',
        'shadow-[0_-4px_24px_rgba(0,0,0,0.08)]',
        'dark:bg-gray-950/95 dark:border-gray-800/80'
      )}
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        /* Respect iOS safe area */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
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
                'relative flex flex-col items-center justify-center w-16 h-full gap-1',
                'transition-colors duration-150',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              {/* Active indicator pill at top */}
              {isActive && (
                <span className="absolute top-0 w-7 h-[3px] bg-emerald-500 rounded-b-full" />
              )}

              <div className="relative">
                <Icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]')} />

                {/* Cart badge — RTL-aware: badge appears on the logical end side */}
                {item.badge && (
                  <span
                    className={cn(
                      'absolute -top-2 -right-2',
                      'flex items-center justify-center',
                      'min-w-[18px] h-[18px] px-0.5',
                      'text-[10px] font-black text-white',
                      'bg-red-500 rounded-full',
                      'shadow-sm shadow-red-500/30',
                      'animate-scale-in'
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-semibold leading-none',
                  isActive && 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
