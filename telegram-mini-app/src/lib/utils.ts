import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// دمج الـ Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تنسيق السعر بالريال السعودي
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// تنسيق التاريخ بالعربية
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// تنسيق الوقت
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// الوقت المنقضي (منذ كم دقيقة)
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return formatDate(d);
}

// الحصول على إيموجي الحالة
export function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    pending: '🟡',
    confirmed: '✅',
    preparing: '🔵',
    ready: '🟢',
    delivered: '✅',
    cancelled: '❌',
  };
  return emojis[status] || '🟡';
}

// الحصول على نص الحالة بالعربية
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    preparing: 'جاري التحضير 🔥',
    ready: 'جاهز للتسليم 🎉',
    delivered: 'تم الاستلام ✅',
    cancelled: 'ملغي ❌',
  };
  return texts[status] || status;
}
