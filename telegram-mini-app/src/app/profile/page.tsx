'use client';

import React from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card, CardContent } from '@/components/ui/card';
import { getTelegramUser } from '@/lib/telegram';
import {
  User,
  ChevronLeft,
  ShoppingBag,
  MessageCircle,
  Star,
  Share2,
  Info,
} from 'lucide-react';

export default function ProfilePage() {
  const telegramUser = getTelegramUser();

  const menuItems = [
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'طلباتي', href: '/orders' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'تواصل مع المطعم', href: 'https://t.me/restaurant_bot', external: true },
    { icon: <Star className="w-5 h-5" />, label: 'قيم التطبيق', href: '#', soon: true },
    { icon: <Share2 className="w-5 h-5" />, label: 'شارك التطبيق', href: '#', soon: true },
    { icon: <Info className="w-5 h-5" />, label: 'عن المطعم', href: '#', soon: true },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">حسابي</h1>
      </header>

      <div className="px-4 py-4 pb-32 space-y-4">
        {/* بطاقة المستخدم */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              {telegramUser ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {telegramUser.first_name?.charAt(0) || '?'}
                  </span>
                </div>
              ) : (
                <User className="w-10 h-10 text-emerald-600" />
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {telegramUser?.first_name || 'مستخدم'}
            </h2>
            {telegramUser?.username && (
              <p className="text-sm text-gray-500">@{telegramUser.username}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              🔗 متصل عبر Telegram
            </p>
          </CardContent>
        </Card>

        {/* القائمة */}
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, idx) => (
              <div key={idx}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.soon && (
                        <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full">قريباً</span>
                      )}
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </Link>
                )}
                {idx < menuItems.length - 1 && <div className="border-b border-gray-50 mx-3" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* معلومات التطبيق */}
        <p className="text-center text-xs text-gray-400">
          الإصدار 1.0.0 — مطعم الذواقة
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
