'use client';

import { useEffect } from 'react';

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CartPage Error Boundary]', error?.message, error?.stack);
  }, [error]);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f8fafc',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 16,
        }}
      >
        ⚠️
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>
        حدث خطأ ما
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
        {error?.message || 'خطأ غير معروف'}
      </p>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>
        {error?.digest && `(${error.digest})`}
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
        حاول مجدداً
      </button>
    </div>
  );
}
