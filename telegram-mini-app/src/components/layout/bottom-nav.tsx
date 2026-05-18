'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';
import { UtensilsCrossed, ShoppingCart, ClipboardList, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  /**
   * Zustand `persist` middleware rehydrates from localStorage AFTER the first
   * render, so `totalItems` is 0 on the server and the first client paint.
   * We defer reading cart state until after mount to avoid hydration mismatches
   * and the badge flickering / nav disappearing.
   */
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Badge count — only show after hydration to prevent mismatch
  const badgeCount = mounted ? totalItems : 0;

  const navItems = [
    { label: 'القائمة', href: '/',        icon: UtensilsCrossed },
    { label: 'السلة',   href: '/cart',    icon: ShoppingCart, badge: badgeCount > 0 ? badgeCount : undefined },
    { label: 'طلباتي',  href: '/orders',  icon: ClipboardList },
    { label: 'حسابي',   href: '/profile', icon: User },
  ];

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 w-full z-[100]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ── Top accent line ── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

      {/* ── Main bar ── */}
      <div
        className="w-full flex items-center justify-around h-[60px]"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ffffff 100%)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.10), 0 -1px 0 rgba(16,185,129,0.08)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1',
                'flex-1 h-full',
                'transition-all duration-150 active:scale-90',
                isActive ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {/* Active glow pill behind icon */}
              {isActive && (
                <span className="absolute top-1.5 w-10 h-10 rounded-full bg-emerald-50 -z-0" />
              )}

              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-150',
                    isActive && 'text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110'
                  )}
                />

                {/* Cart badge — only rendered after mount */}
                {item.badge && (
                  <span
                    className={cn(
                      'absolute -top-2 -right-2.5',
                      'flex items-center justify-center',
                      'min-w-[18px] h-[18px] px-1',
                      'text-[10px] font-black text-white tabular-nums',
                      'bg-red-500 rounded-full shadow-md shadow-red-500/30',
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-bold leading-none z-10',
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot at bottom */}
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/60" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
