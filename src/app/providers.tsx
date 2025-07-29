"use client";

import React from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "react-hot-toast";
// SessionProvider moved to ClientProviders.tsx
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import ClientOnly from "@/components/ui/ClientOnly";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ClientOnly>
          <Toaster position="top-right" />
        </ClientOnly>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  );
}
