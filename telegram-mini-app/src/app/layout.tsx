import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { TelegramThemeScript } from '@/components/telegram-theme';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav } from '@/components/layout/bottom-nav';

// استيراد خط Cairo العربي
const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'مطعم الذواقة - اطلب أونلاين',
  description: 'اطلب ألذ المأكولات من مطعم الذواقة بنقرات بسيطة',
  other: {
    'telegram-web-app': 'true', // إعلام Telegram بأنها WebApp
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body
        className={`${cairo.className} bg-gray-50 text-gray-900 antialiased`}
        style={{
          fontFamily: 'var(--font-cairo), sans-serif',
          minHeight: '100dvh',
        }}
      >
        {/* دمج Telegram Theme */}
        <TelegramThemeScript />

        <ToastProvider>
          {/* حاوية التطبيق الرئيسية - محدودة العرض للمحتوى فقط، الـ nav يأخذ الشاشة كاملاً */}
          <main
            className="pb-[62px]"
            style={{
              maxWidth: '480px',
              margin: '0 auto',
              minHeight: '100dvh',
              position: 'relative',
            }}
          >
            {children}
          </main>

          {/* ─── القائمة السفلية — ثابتة دائماً على مستوى التطبيق كاملاً ─── */}
          <BottomNav />

          {/* Toast notifications */}
          <Toaster />
        </ToastProvider>

        {/* سكربت Telegram WebApp */}
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
      </body>
    </html>
  );
}
