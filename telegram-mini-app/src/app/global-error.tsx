'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error?.message, error?.stack);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f8fafc',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>
          حدث خطأ في التطبيق
        </h1>
        <p
          style={{
            fontSize: 12,
            color: '#6b7280',
            marginBottom: 24,
            maxWidth: 280,
            wordBreak: 'break-word',
          }}
        >
          {error?.message || 'خطأ غير معروف'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '12px 32px',
            borderRadius: 16,
            background: '#059669',
            color: '#fff',
            fontWeight: 900,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
