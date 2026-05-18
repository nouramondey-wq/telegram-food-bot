'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  dir?: 'rtl' | 'ltr';
}

export function Card({ children, className, onClick, dir = 'rtl' }: CardProps) {
  return (
    <div
      dir={dir}
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden',
        'transition-all duration-200 ease-in-out',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 pt-4 pb-2', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-2', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 py-3 border-t border-gray-50', className)}>
      {children}
    </div>
  );
}
