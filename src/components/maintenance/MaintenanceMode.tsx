"use client";

import React from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ClientOnly from "@/components/ui/ClientOnly";

interface MaintenanceModeProps {
  children: React.ReactNode;
}

const LoadingIndicator = ({ children }: { children?: React.ReactNode }) => {
  // Use a simple loading indicator that's less likely to cause hydration issues
  return (
    <>
      {children || (
        <div
          className="flex items-center justify-center min-h-screen bg-gray-100"
          suppressHydrationWarning
        >
          <div
            className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md"
            suppressHydrationWarning
          >
            <div
              className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"
              suppressHydrationWarning
            ></div>
            <h2
              className="text-xl font-semibold text-gray-800"
              suppressHydrationWarning
            >
              Memuat...
            </h2>
            <p className="text-gray-600 mt-2" suppressHydrationWarning>
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ children }) => {
  const { settings, isLoading } = useSettings();
  const pathname = usePathname();

  // Check if current path is admin path
  const isAdminPath = pathname?.startsWith("/dashboard/admin");

  // If settings are still loading, show a loading indicator
  if (isLoading) {
    return <LoadingIndicator />;
  }

  const MaintenancePage = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          {settings.system.logo && (
            <Image
              src={settings.system.logo}
              alt={settings.system.siteName}
              width={150}
              height={150}
              className="h-auto"
            />
          )}
        </div>

        <h1 className="text-3xl font-bold text-center text-teal-600 mb-4">
          Sedang Dalam Pemeliharaan
        </h1>

        <div className="h-1 w-20 bg-teal-500 mx-auto mb-6"></div>

        <p className="text-lg text-center text-gray-700 mb-6">
          Mohon maaf atas ketidaknyamanannya. Saat ini kami sedang melakukan
          pemeliharaan sistem untuk meningkatkan layanan kami.
        </p>

        <p className="text-center text-gray-600 mb-8">
          Silakan kembali beberapa saat lagi. Terima kasih atas pengertian Anda.
        </p>

        <div className="text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {settings.system.siteName}
          </p>
          {settings.contact.email && (
            <p className="mt-1">Kontak: {settings.contact.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  // If maintenance mode is enabled but not admin path, show maintenance page
  if (settings.system.maintenanceMode && !isAdminPath) {
    return (
      <ClientOnly fallback={<LoadingIndicator />}>
        <MaintenancePage />
      </ClientOnly>
    );
  }

  // If maintenance mode is disabled or it's admin path, show normal content
  return (
    <ClientOnly fallback={<LoadingIndicator />}>
      <div suppressHydrationWarning>{children}</div>
    </ClientOnly>
  );
};

export default MaintenanceMode;
