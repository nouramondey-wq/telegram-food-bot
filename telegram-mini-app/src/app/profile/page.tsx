'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { getTelegramUser } from '@/lib/telegram';
import { useMyOrders } from '@/hooks/use-orders';
import { formatDate } from '@/lib/utils';
import {
  User,
  ChevronLeft,
  ShoppingBag,
  MessageCircle,
  Star,
  Share2,
  Info,
  Clock,
  CalendarDays,
  BadgeCheck,
  Store,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const telegramUser = getTelegramUser();
  const { orders, loading: ordersLoading } = useMyOrders(100);



  // Stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  // Find the earliest order date for "member since"
  const earliestOrder = [...orders].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return a.created_at.toDate().getTime() - b.created_at.toDate().getTime();
  })[0];
  const memberSince = earliestOrder?.created_at
    ? formatDate(earliestOrder.created_at.toDate())
    : 'اليوم';

  // Get initials for avatar
  const firstName = telegramUser?.first_name || '';
  const initials = firstName.charAt(0).toUpperCase() || '?';
  const username = telegramUser?.username || '';

  const menuItems = [
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: 'طلباتي',
      description: 'عرض وتتبع طلباتك السابقة',
      href: '/orders',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'تواصل مع المطعم',
      description: 'راسلنا عبر تيليجرام',
      href: 'https://t.me/restaurant_bot',
      external: true,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'قيم التطبيق',
      description: 'ساعدنا في تحسين الخدمة',
      href: '#',
      soon: true,
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'شارك التطبيق',
      description: 'ادعو أصدقاءك لتجربتنا',
      href: '#',
      soon: true,
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: 'عن المطعم',
      description: 'معلومات المطعم والخدمة',
      href: '#',
      soon: true,
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg, #f9fafb)' }}>
      {/* ─── Glassmorphism Header ─── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-800/80 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">حسابي</h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">معلوماتك وإحصائياتك</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      {/* pb-36 ensures content clears bottom nav */}
      <div className="px-4 py-4 pb-36 space-y-4">

        {/* ── User Profile Card ── */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card animate-fade-in">
          {/* Gradient top accent */}
          <div className="h-20 bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-600 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          </div>

          <div className="px-5 pb-5">
            {/* Avatar — overlaps the gradient */}
            <div className="flex justify-center -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-white dark:ring-gray-900 animate-scale-in overflow-hidden">
                  <span className="text-3xl font-black text-white drop-shadow-sm">
                    {initials}
                  </span>
                </div>
                {/* Verified badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900">
                  <BadgeCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Name + Username */}
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {firstName || 'مستخدم'}
              </h2>
              {username && (
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  @{username}
                </p>
              )}
            </div>

            {/* Connection status */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                متصل عبر Telegram
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-3 gap-2.5 animate-fade-in">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 text-center">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {ordersLoading ? (
                <span className="skeleton inline-block w-6 h-6 rounded" />
              ) : (
                totalOrders
              )}
            </p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 leading-tight">
              عدد الطلبات
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 text-center">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {ordersLoading ? (
                <span className="skeleton inline-block w-6 h-6 rounded" />
              ) : (
                completedOrders
              )}
            </p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 leading-tight">
              تم التوصيل
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 text-center">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {ordersLoading ? (
                <span className="skeleton inline-block w-6 h-6 rounded" />
              ) : (
                completedOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : '--'
              )}
            </p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 leading-tight">
              نسبة الإنجاز
            </p>
          </div>
        </div>

        {/* ── Member Since Card ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card p-4 animate-fade-in-up flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">عضو منذ</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {ordersLoading ? (
                <span className="skeleton inline-block w-24 h-4 rounded" />
              ) : (
                memberSince
              )}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        {/* ── Menu Items ── */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">الخدمات</p>
          </div>
          <div className="p-2">
            {menuItems.map((item, idx) => (
              <div key={idx}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-150 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        {item.icon}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-150 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        {item.icon}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.soon && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full">
                          قريباً
                        </span>
                      )}
                      <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  </Link>
                )}
                {idx < menuItems.length - 1 && (
                  <div className="border-b border-gray-50 dark:border-gray-800 mx-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── App Info ── */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Store className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            <span className="text-[11px] font-bold text-gray-300 dark:text-gray-600">مطعم الذواقة</span>
          </div>
          <p className="text-[10px] text-gray-300 dark:text-gray-600">
            الإصدار 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
