'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from 'react-hot-toast';
// SessionProvider moved to ClientProviders.tsx
import { SettingsProvider } from '@/components/providers/SettingsProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </SettingsProvider>
  );
}