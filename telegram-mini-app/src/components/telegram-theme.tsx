'use client';

import React, { useEffect, useState } from 'react';

/**
 * مكون دمج Telegram Theme
 * يقرأ themeParams من Telegram WebApp ويطبقها كـ CSS Variables
 */
export function TelegramThemeScript() {
  const [theme, setTheme] = useState({
    bg_color: '#f9fafb',
    text_color: '#111827',
    hint_color: '#9ca3af',
    link_color: '#059669',
    button_color: '#059669',
    button_text_color: '#ffffff',
    secondary_bg_color: '#ffffff',
  });

  useEffect(() => {
    try {
      // محاولة قراءة Telegram Theme
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.themeParams) {
        const tp = tg.themeParams;
        setTheme({
          bg_color: tp.bg_color || '#f9fafb',
          text_color: tp.text_color || '#111827',
          hint_color: tp.hint_color || '#9ca3af',
          link_color: tp.link_color || '#059669',
          button_color: tp.button_color || '#059669',
          button_text_color: tp.button_text_color || '#ffffff',
          secondary_bg_color: tp.secondary_bg_color || '#ffffff',
        });
      }
    } catch {
      // خارج Telegram - استخدم الألوان الافتراضية
    }
  }, []);

  // تطبيق الألوان كـ CSS Variables
  const cssVars = {
    '--tg-bg': theme.bg_color,
    '--tg-text': theme.text_color,
    '--tg-hint': theme.hint_color,
    '--tg-link': theme.link_color,
    '--tg-button': theme.button_color,
    '--tg-button-text': theme.button_text_color,
    '--tg-secondary-bg': theme.secondary_bg_color,
  } as React.CSSProperties;

  return <div id="telegram-theme" style={{ display: 'none', ...cssVars }} />;
}
