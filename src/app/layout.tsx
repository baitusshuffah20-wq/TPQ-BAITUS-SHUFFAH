import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import "./styles/theme-variables.css";
import "./styles/theme-components.css";
import { Toaster } from "react-hot-toast";
import NotificationProvider from "@/contexts/NotificationContext";
import NavigationProvider from "@/components/providers/NavigationProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Providers } from "./providers";
import MaintenanceMode from "@/components/maintenance/MaintenanceMode";
import { ClientProviders } from "@/components/providers/ClientProviders";

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
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head />
      {/* favicon will be set dynamically by SettingsProvider */}
      <body
        className={`${inter.variable} ${amiri.variable} min-h-screen bg-gray-50 font-sans antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced browser extension attribute cleanup
              (function() {
                const extensionAttrs = [
                  'bis_skin_checked', 'bis_register', '__processed_',
                  'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed',
                  'cz-shortcut-listen', 'data-lt-installed'
                ];
                
                // Immediate cleanup on page load
                function cleanupAttributes(element) {
                  if (!element || !element.removeAttribute) return;
                  extensionAttrs.forEach(attr => {
                    if (element.hasAttribute(attr)) {
                      element.removeAttribute(attr);
                    }
                  });
                }
                
                // Clean existing elements
                if (document.body) {
                  cleanupAttributes(document.body);
                  cleanupAttributes(document.documentElement);
                }
                
                // Observer for future changes
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const node = mutation.target;
                      const attrName = mutation.attributeName;
                      if (attrName && extensionAttrs.some(attr => attrName.includes(attr))) {
                        try {
                          node.removeAttribute(attrName);
                        } catch (e) {
                          // Silently ignore errors
                        }
                      }
                    }
                  });
                });
                
                // Start observing
                if (document.body) {
                  observer.observe(document.body, { 
                    attributes: true,
                    childList: true,
                    subtree: true
                  });
                }
              })();
            `,
          }}
        />
        <ClientProviders>
          <Providers>
            <AuthProvider>
              <NavigationProvider>
                <NotificationProvider>
                  <MaintenanceMode>
                    <div id="root" suppressHydrationWarning>
                      {children}
                    </div>
                    <div id="modal-root" suppressHydrationWarning />
                    <div id="toast-root" suppressHydrationWarning />
                    {/* Enhanced Toaster configuration */}
                    <Toaster
                      position="top-right"
                      reverseOrder={false}
                      gutter={8}
                      containerClassName=""
                      containerStyle={{}}
                      toastOptions={{
                        // Default options for all toasts
                        duration: 4000,
                        style: {
                          background: "#363636",
                          color: "#fff",
                          fontSize: "14px",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        },
                        // Success toast styling
                        success: {
                          duration: 3000,
                          style: {
                            background: "#10b981",
                            color: "#fff",
                          },
                          iconTheme: {
                            primary: "#fff",
                            secondary: "#10b981",
                          },
                        },
                        // Error toast styling
                        error: {
                          duration: 5000,
                          style: {
                            background: "#ef4444",
                            color: "#fff",
                          },
                          iconTheme: {
                            primary: "#fff",
                            secondary: "#ef4444",
                          },
                        },
                        // Loading toast styling
                        loading: {
                          duration: Infinity,
                          style: {
                            background: "#3b82f6",
                            color: "#fff",
                          },
                        },
                      }}
                    />
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
