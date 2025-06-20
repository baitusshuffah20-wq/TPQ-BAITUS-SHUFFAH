'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

// Page Loading Component
export function PageLoading({ text = 'Memuat halaman...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
      </div>
    </div>
  );
}

// Card Loading Component
export function CardLoading({ text = 'Memuat data...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
}

// Button Loading Component
export function ButtonLoading({ text = 'Memproses...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Table Loading Component
export function TableLoading({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-gray-200 rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton Loading Components
export function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-200 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
