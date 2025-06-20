import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import "./styles/theme-variables.css";
import "./styles/theme-components.css";
import { Toaster } from 'react-hot-toast';
import NotificationProvider from '@/contexts/NotificationContext';
import NavigationProvider from '@/components/providers/NavigationProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { Providers } from './providers';
import MaintenanceMode from '@/components/maintenance/MaintenanceMode';
import { ClientProviders } from '@/components/providers/ClientProviders';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TPQ Baitus Shuffah",
  description: "Lembaga Pendidikan Tahfidz Al-Quran",
  keywords: "tpq, tahfidz quran, pendidikan islam, islamic boarding school",
  authors: [{ name: "TPQ Baitus Shuffah" }],
  robots: "index, follow",
  openGraph: {
    title: "TPQ Baitus Shuffah",
    description: "Lembaga Pendidikan Tahfidz Al-Quran",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head />
      {/* favicon will be set dynamically by SettingsProvider */}
      <body
        className={`${inter.variable} ${amiri.variable} min-h-screen bg-gray-50 font-sans antialiased`}
      >
        <ClientProviders>
          <Providers>
            <AuthProvider>
              <NavigationProvider>
                <NotificationProvider>
                  <MaintenanceMode>
                    <div id="root">
                      {children}
                    </div>
                    <div id="modal-root" />
                    <div id="toast-root" />
                  </MaintenanceMode>
                </NotificationProvider>
              </NavigationProvider>
            </AuthProvider>
          </Providers>
        </ClientProviders>
      </body>
    </html>
  );
}
