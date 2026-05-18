'use client';

import React, { useEffect, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastPrimitive.Provider
      swipeDirection="right"
      duration={3000}
    >
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open={true}
          onOpenChange={(open) => {
            if (!open) dismiss(toast.id);
          }}
          className={cn(
            'fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]',
            'w-[90vw] max-w-[380px]',
            'bg-white border border-gray-200 shadow-xl shadow-black/10 rounded-2xl',
            'px-4 py-3.5',
            'flex items-center gap-3',
            'data-[state=open]:animate-slide-up-fade',
            'data-[state=closed]:animate-fade-out',
            'data-[swipe=end]:animate-slide-right'
          )}
        >
          {/* Icon */}
          {toast.variant === 'success' && (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          )}
          {toast.variant === 'error' && (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <ToastPrimitive.Title className="text-sm font-semibold text-gray-900">
                {toast.title}
              </ToastPrimitive.Title>
            )}
            {toast.description && (
              <ToastPrimitive.Description className="text-xs text-gray-500 mt-0.5">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => dismiss(toast.id)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </ToastPrimitive.Root>
      ))}

      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}
