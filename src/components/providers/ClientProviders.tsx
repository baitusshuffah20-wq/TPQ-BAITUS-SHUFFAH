"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "react-hot-toast";
import ClientOnly from "@/components/ui/ClientOnly";
import { AuthProvider } from "@/components/providers/AuthProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
          <ClientOnly>
            <Toaster position="bottom-right" />
          </ClientOnly>
        </ToastProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
