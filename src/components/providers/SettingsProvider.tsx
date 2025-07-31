"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

// Define types for settings
interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  operationalHours: string;
}

interface AboutSettings {
  vision: string;
  mission: string;
  history: string;
  values: string;
  achievements: string;
}

interface Settings {
  system: SiteSettings;
  contact: ContactSettings;
  about: AboutSettings;
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Default settings
const defaultSettings: Settings = {
  system: {
    siteName: "TPQ Baitus Shuffah",
    siteDescription: "Lembaga Pendidikan Tahfidz Al-Quran",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    timezone: "Asia/Jakarta",
    language: "id",
    maintenanceMode: false,
  },
  contact: {
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
    operationalHours: "",
  },
  about: {
    vision: "",
    mission: "",
    history: "",
    values: "",
    achievements: "",
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);



  const fetchSettings = async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log("Component unmounted, skipping settings fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching settings...");

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Check if already aborted before starting
      if (controller.signal.aborted || !isMountedRef.current) {
        console.log("Controller already aborted or component unmounted, skipping fetch");
        return;
      }

      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted && isMountedRef.current) {
          console.log("Settings fetch timeout, aborting request");
          try {
            controller.abort();
          } catch (abortError) {
            console.warn("Error during timeout abort:", abortError);
          }
        }
      }, 3000); // 3 second timeout (reduced from 5)

      let response;
      try {
        response = await fetch("/api/settings?public=true", {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
      } catch (fetchError) {
        // Clear timeout on fetch error
        try {
          clearTimeout(timeoutId);
        } catch (clearError) {
          console.warn("Error clearing timeout on fetch error:", clearError);
        }

        // Handle fetch-specific errors including AbortError
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.log("Fetch was aborted - this is expected behavior");
          return;
        }
        throw fetchError; // Re-throw non-abort errors
      }

      // Clear timeout safely
      try {
        clearTimeout(timeoutId);
      } catch (clearError) {
        console.warn("Error clearing timeout:", clearError);
      }

      // Check if request was aborted after fetch or component unmounted
      if (controller.signal.aborted || !isMountedRef.current) {
        console.log("Request was aborted after fetch or component unmounted");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch settings: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Settings fetched successfully:", data);

      // Check again before updating state
      if (!isMountedRef.current) {
        console.log("Component unmounted before updating state");
        return;
      }

      if (data.success && data.settings) {
        const newSettings = { ...defaultSettings };

        // System settings
        if (data.settings["site.name"]) {
          newSettings.system.siteName = data.settings["site.name"].value;
        }

        if (data.settings["site.description"]) {
          newSettings.system.siteDescription =
            data.settings["site.description"].value;
        }

        if (data.settings["site.logo"]) {
          newSettings.system.logo = data.settings["site.logo"].value;
        }

        if (data.settings["site.favicon"]) {
          newSettings.system.favicon = data.settings["site.favicon"].value;
        }

        if (data.settings["site.timezone"]) {
          newSettings.system.timezone = data.settings["site.timezone"].value;
        }

        if (data.settings["site.language"]) {
          newSettings.system.language = data.settings["site.language"].value;
        }

        if (data.settings["site.maintenanceMode"]) {
          // Convert string 'true'/'false' to boolean
          newSettings.system.maintenanceMode =
            data.settings["site.maintenanceMode"].value === true ||
            data.settings["site.maintenanceMode"].value === "true";
          console.log(
            "Maintenance mode set to:",
            newSettings.system.maintenanceMode,
          );
        }

        // Contact settings
        if (data.settings["contact.address"]) {
          newSettings.contact.address = data.settings["contact.address"].value;
        }

        if (data.settings["contact.phone"]) {
          newSettings.contact.phone = data.settings["contact.phone"].value;
        }

        if (data.settings["contact.email"]) {
          newSettings.contact.email = data.settings["contact.email"].value;
        }

        if (data.settings["contact.whatsapp"]) {
          newSettings.contact.whatsapp =
            data.settings["contact.whatsapp"].value;
        }

        if (data.settings["contact.operationalHours"]) {
          newSettings.contact.operationalHours =
            data.settings["contact.operationalHours"].value;
        }

        // About settings
        if (data.settings["about.vision"]) {
          newSettings.about.vision = data.settings["about.vision"].value;
        }

        if (data.settings["about.mission"]) {
          newSettings.about.mission = data.settings["about.mission"].value;
        }

        if (data.settings["about.history"]) {
          newSettings.about.history = data.settings["about.history"].value;
        }

        if (data.settings["about.values"]) {
          newSettings.about.values = data.settings["about.values"].value;
        }

        if (data.settings["about.achievements"]) {
          newSettings.about.achievements =
            data.settings["about.achievements"].value;
        }

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setSettings(newSettings);
          setRetryCount(0); // Reset retry count on success

          // Apply settings to document
          try {
            document.title = newSettings.system.siteName;
            console.log("Setting document title to:", newSettings.system.siteName);

            // Update favicon
            const faviconLink = document.querySelector(
              'link[rel="icon"]',
            ) as HTMLLinkElement;
            if (faviconLink) {
              faviconLink.href = newSettings.system.favicon;
              console.log("Updated favicon to:", newSettings.system.favicon);
            } else {
              const newFaviconLink = document.createElement("link");
              newFaviconLink.rel = "icon";
              newFaviconLink.href = newSettings.system.favicon;
              document.head.appendChild(newFaviconLink);
              console.log(
                "Created new favicon link with href:",
                newSettings.system.favicon,
              );
            }
          } catch (domError) {
            console.warn("Error updating DOM elements:", domError);
          }
        }

          try {
            // Update logo in meta tags
            let logoMetaTag = document.querySelector(
              'meta[property="og:image"]',
            ) as HTMLMetaElement;
            if (logoMetaTag) {
              logoMetaTag.content = newSettings.system.logo;
              console.log("Updated og:image meta tag to:", newSettings.system.logo);
            } else {
              logoMetaTag = document.createElement("meta");
              logoMetaTag.setAttribute("property", "og:image");
              logoMetaTag.content = newSettings.system.logo;
              document.head.appendChild(logoMetaTag);
              console.log(
                "Created new og:image meta tag with content:",
                newSettings.system.logo,
              );
            }

            // Update description in meta tags
            let descMetaTag = document.querySelector(
              'meta[name="description"]',
            ) as HTMLMetaElement;
            if (descMetaTag) {
              descMetaTag.content = newSettings.system.siteDescription;
              console.log(
                "Updated description meta tag to:",
                newSettings.system.siteDescription,
              );
            } else {
              descMetaTag = document.createElement("meta");
              descMetaTag.setAttribute("name", "description");
              descMetaTag.content = newSettings.system.siteDescription;
              document.head.appendChild(descMetaTag);
              console.log(
                "Created new description meta tag with content:",
                newSettings.system.siteDescription,
              );
            }

            // Set language attribute on html tag
            document.documentElement.lang = newSettings.system.language;
            console.log("Set document language to:", newSettings.system.language);
          } catch (metaError) {
            console.warn("Error updating meta tags:", metaError);
          }
      }
    } catch (err) {
      // Handle AbortError specifically first to avoid logging it as an error
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("Settings fetch was aborted (timeout or component unmount) - this is expected behavior");

        // If no settings have been loaded yet, use default settings
        if (isMountedRef.current && (!settings || Object.keys(settings).length === 0)) {
          console.log("Using default settings due to aborted fetch");
          setSettings(defaultSettings);
          setError(null);

          // Apply default settings to document
          try {
            document.title = defaultSettings.system.siteName;
            const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (faviconLink) {
              faviconLink.href = defaultSettings.system.favicon;
            }
          } catch (domError) {
            console.warn("Error applying default settings to DOM:", domError);
          }
        }

        // Don't set error state for abort errors as they are expected
        // Don't retry on abort
        return;
      }

      // Log other errors
      console.error("Error fetching settings:", err);

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      // Implement retry logic for non-abort errors
      if (retryCount < maxRetries) {
        console.log(
          `Retrying settings fetch (${retryCount + 1}/${maxRetries})...`,
        );
        setRetryCount((prev) => prev + 1);

        // Exponential backoff for retries
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(fetchSettings, retryDelay);
      } else {
        console.log("Max retries reached, using default settings");

        // Clear error state and use default settings
        if (isMountedRef.current) {
          setError(null);
          setSettings(defaultSettings);

          // Apply default settings to document
          document.title = defaultSettings.system.siteName;

          // Update favicon
          const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (faviconLink) {
            faviconLink.href = defaultSettings.system.favicon;
          }
        }

        // Log error to server if available (but don't log abort errors)
        if (!(err instanceof Error && err.name === 'AbortError')) {
          try {
            fetch("/api/error-logger", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: `Settings fetch failed after ${maxRetries} retries: ${errorMessage}`,
                severity: "ERROR",
                context: "SettingsProvider",
              }),
            }).catch((e) => console.error("Failed to log error:", e));
          } catch (logError) {
            console.error("Failed to log error:", logError);
          }
        }
      }
    } finally {
      // Always set loading to false if component is still mounted
      // This ensures the UI doesn't stay in loading state indefinitely
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const fetchSettingsWithMountCheck = async () => {
      if (isMountedRef.current) {
        try {
          await fetchSettings();
        } catch (error) {
          // Handle any uncaught errors, especially AbortError
          if (error instanceof Error && error.name === 'AbortError') {
            console.log("Settings fetch aborted during mount check - this is expected");
          } else {
            console.error("Unexpected error during settings fetch:", error);
          }
        }
      }
    };

    // Set a fallback timeout to ensure loading state is cleared
    const fallbackTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        console.log("Fallback timeout: Using default settings");
        setSettings(defaultSettings);
        setIsLoading(false);
        setError(null);
      }
    }, 2000); // 2 second fallback

    fetchSettingsWithMountCheck();

    // Add event listener for when settings are updated
    const handleSettingsUpdate = () => {
      if (isMountedRef.current) {
        fetchSettingsWithMountCheck();
      }
    };

    window.addEventListener("settings-updated", handleSettingsUpdate);

    return () => {
      isMountedRef.current = false;
      // Cleanup fallback timeout
      clearTimeout(fallbackTimeout);
      // Cleanup: abort any ongoing request and remove event listener
      if (abortControllerRef.current) {
        try {
          if (!abortControllerRef.current.signal.aborted) {
            abortControllerRef.current.abort();
          }
        } catch (abortError) {
          // Silently handle abort errors during cleanup
          console.log("Cleanup: Request aborted during component unmount");
        }
        abortControllerRef.current = null;
      }
      window.removeEventListener("settings-updated", handleSettingsUpdate);
    };
  }, []);

  const value = {
    settings,
    isLoading,
    error,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
