'use client';

// تعريف نوع Telegram WebApp (للدعم في TypeScript)
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date?: string;
          hash?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          hideProgress: () => void;
          showProgress: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
      };
    };
  }
}

// الحصول على Telegram WebApp
export function getTelegramWebApp() {
  if (typeof window !== 'undefined') {
    return window.Telegram?.WebApp || null;
  }
  return null;
}

// تهيئة Telegram WebApp
export function initTelegramApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;

  webApp.ready();
  webApp.expand();

  return webApp;
}

// الحصول على معلومات المستخدم من Telegram
// مع حفظ البيانات في localStorage كـ fallback للموبايل
const TELEGRAM_USER_KEY = 'tg_user_cache';

export function getTelegramUser() {
  if (typeof window === 'undefined') return null;

  const webApp = getTelegramWebApp();
  const user = webApp?.initDataUnsafe?.user || null;

  if (user?.id) {
    // حفظ في localStorage عند أول مرة نجاح
    try {
      localStorage.setItem(TELEGRAM_USER_KEY, JSON.stringify(user));
    } catch {}
    return user;
  }

  // Fallback: حاول من localStorage (يفيد عند تأخر Telegram على الموبايل)
  try {
    const cached = localStorage.getItem(TELEGRAM_USER_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.id) return parsed;
    }
  } catch {}

  return null;
}

// تحديث زر Main Button
export function updateMainButton(options: {
  text: string;
  color?: string;
  onClick?: () => void;
}) {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  const btn = webApp.MainButton;
  btn.setText(options.text);
  if (options.color) btn.color = options.color;
  btn.show();
  
  if (options.onClick) {
    btn.onClick(options.onClick);
  }
}

// هزاز اللمس (Haptic Feedback)
export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
  const webApp = getTelegramWebApp();
  webApp?.HapticFeedback?.impactOccurred(style);
}

// إشعار لمسي (Notification Feedback)
export function hapticNotification(type: 'error' | 'success' | 'warning') {
  const webApp = getTelegramWebApp();
  webApp?.HapticFeedback?.notificationOccurred(type);
}

// التحقق من أن التطبيق يعمل ضمن Telegram
export function isRunningInTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  const webApp = getTelegramWebApp();
  return webApp !== null;
}

// الحصول على تهيئة الـ Theme من Telegram
export function getTelegramTheme() {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams || null;
}
