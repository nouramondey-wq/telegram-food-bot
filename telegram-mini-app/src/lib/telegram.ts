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

  let user = null;

  // 1. المحاولة عبر Telegram SDK (الطريقة الأساسية)
  try {
    const webApp = getTelegramWebApp();
    user = webApp?.initDataUnsafe?.user || null;

    // 1.5 المحاولة من initData الخام إذا كان initDataUnsafe فارغاً
    if (!user?.id && webApp?.initData) {
      const dataParams = new URLSearchParams(webApp.initData);
      const userStr = dataParams.get('user');
      if (userStr) {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        if (parsedUser?.id) user = parsedUser;
      }
    }
  } catch {}

  // 2. المحاولة يدوياً عبر URL Hash (إذا فشل الـ SDK أو ضاعت البيانات)
  if (!user?.id) {
    try {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const tgWebAppData = params.get('tgWebAppData');
      if (tgWebAppData) {
        const dataParams = new URLSearchParams(tgWebAppData);
        const userStr = dataParams.get('user');
        if (userStr) {
          const parsedUser = JSON.parse(decodeURIComponent(userStr));
          if (parsedUser?.id) {
            user = parsedUser;
          }
        }
      }
    } catch (err) {
      console.warn('[getTelegramUser] Failed to parse hash manually:', err);
    }
  }

  // 3. الحفظ في الـ Cache إذا نجحنا
  if (user?.id) {
    try {
      localStorage.setItem(TELEGRAM_USER_KEY, JSON.stringify(user));
    } catch {}
    return user;
  }

  // 4. المحاولة من الـ Cache كحل أخير (Fallback)
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
