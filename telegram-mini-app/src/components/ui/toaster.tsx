'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[100] pointer-events-none"
         style={{ maxWidth: '480px', margin: '0 auto' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="mx-4 pointer-events-auto animate-slide-up-fade"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl shadow-black/10 border ${
              t.variant === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : t.variant === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Icon */}
            {t.variant === 'success' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            )}
            {t.variant === 'error' && (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              )}
              {t.description && (
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
