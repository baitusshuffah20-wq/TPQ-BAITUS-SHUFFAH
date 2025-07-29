"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  ReactNode,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { applyGlobalTheme } from "./apply-theme";

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  buttons: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    info: string;
  };
  fonts: {
    heading: string;
    body: string;
    arabic: string;
  };
  layout: {
    borderRadius: string;
    containerWidth: string;
    sidebarStyle: "default" | "compact" | "expanded";
  };
  logo: {
    main: string;
    alt: string;
    favicon: string;
  };
}

export interface Theme extends ThemeConfig {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  activeTheme: Theme | null;
  allThemes: Theme[];
  isLoading: boolean;
  error: string | null;
  saveTheme: (
    theme: Partial<ThemeConfig> & { name: string },
  ) => Promise<Theme | null>;
  updateTheme: (
    id: string,
    theme: Partial<ThemeConfig> & { name: string },
  ) => Promise<Theme | null>;
  deleteTheme: (id: string) => Promise<boolean>;
  activateTheme: (id: string) => Promise<boolean>;
  applyTheme: (theme: ThemeConfig) => void;
  resetTheme: () => void;
}

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#008080", // Teal (diubah dari kuning emas untuk kontras yang lebih baik)
    secondary: "#E6CF00", // Kuning emas (diubah dari teal)
    accent: "#00e0e0", // Cyan terang
    background: "#F8FAFC", // Putih kebiruan
    text: "#1E293B", // Biru gelap untuk kontras
    success: "#00e0a0", // Hijau kebiruan, harmonis dengan accent
    warning: "#FFB344", // Orange lembut
    error: "#EF4444", // Merah
  },
  buttons: {
    primary: "#008080", // Teal (diubah dari kuning emas untuk kontras yang lebih baik)
    secondary: "#E6CF00", // Kuning emas (diubah dari teal)
    accent: "#00e0e0", // Cyan terang
    danger: "#EF4444", // Merah
    info: "#3B82F6", // Biru, lebih kontras
  },
  fonts: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
    arabic: "Amiri",
  },
  layout: {
    borderRadius: "0.5rem",
    containerWidth: "1280px",
    sidebarStyle: "default",
  },
  logo: {
    main: "/logo.png",
    alt: "/logo-alt.png",
    favicon: "/favicon.ico",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set auth cookies when component mounts
    if (typeof window !== "undefined") {
      const authUser = localStorage.getItem("auth_user");
      const authToken = localStorage.getItem("auth_token");

      if (authUser) {
        document.cookie = `auth_user=${encodeURIComponent(authUser)};path=/;max-age=86400`;
      }

      if (authToken) {
        document.cookie = `auth_token=${authToken};path=/;max-age=86400`;
      }
    }

    loadThemes();
  }, []);

  // const ensureButtonsField = (theme: ThemeWithOptionalButtons): Theme => {
  //   if (!theme.buttons) {
  //     return {
  //       ...theme,
  //       buttons: {
  //         primary: theme.colors.primary,
  //         secondary: theme.colors.secondary,
  //         accent: theme.colors.accent,
  //         danger: theme.colors.error,
  //         info: theme.colors.accent,
  //       },
  //     } as Theme;
  //   }
  //   return theme as Theme;
  // };

  const ensureCompleteTheme = (
    themeData: Partial<ThemeConfig>,
  ): ThemeConfig => {
    // Always ensure a complete theme structure with all required fields
    return {
      colors: {
        primary: themeData.colors?.primary || defaultTheme.colors.primary,
        secondary: themeData.colors?.secondary || defaultTheme.colors.secondary,
        accent: themeData.colors?.accent || defaultTheme.colors.accent,
        background:
          themeData.colors?.background || defaultTheme.colors.background,
        text: themeData.colors?.text || defaultTheme.colors.text,
        success: themeData.colors?.success || defaultTheme.colors.success,
        warning: themeData.colors?.warning || defaultTheme.colors.warning,
        error: themeData.colors?.error || defaultTheme.colors.error,
      },
      buttons: {
        primary:
          themeData.buttons?.primary ||
          themeData.colors?.primary ||
          defaultTheme.buttons.primary,
        secondary:
          themeData.buttons?.secondary ||
          themeData.colors?.secondary ||
          defaultTheme.buttons.secondary,
        accent:
          themeData.buttons?.accent ||
          themeData.colors?.accent ||
          defaultTheme.buttons.accent,
        danger:
          themeData.buttons?.danger ||
          themeData.colors?.error ||
          defaultTheme.buttons.danger,
        info:
          themeData.buttons?.info ||
          themeData.colors?.accent ||
          defaultTheme.buttons.info,
      },
      fonts: {
        heading: themeData.fonts?.heading || defaultTheme.fonts.heading,
        body: themeData.fonts?.body || defaultTheme.fonts.body,
        arabic: themeData.fonts?.arabic || defaultTheme.fonts.arabic,
      },
      layout: {
        borderRadius:
          themeData.layout?.borderRadius || defaultTheme.layout.borderRadius,
        containerWidth:
          themeData.layout?.containerWidth ||
          defaultTheme.layout.containerWidth,
        sidebarStyle:
          themeData.layout?.sidebarStyle || defaultTheme.layout.sidebarStyle,
      },
      logo: {
        main: themeData.logo?.main || defaultTheme.logo.main,
        alt: themeData.logo?.alt || defaultTheme.logo.alt,
        favicon: themeData.logo?.favicon || defaultTheme.logo.favicon,
      },
    };
  };

  const ensureThemeCompatibility = (themeData: Theme): Theme => {
    // First ensure we have complete theme config
    const completeConfig = ensureCompleteTheme(themeData);
    // Then return a complete Theme object
    return {
      ...themeData, // Keep original Theme properties (id, name, etc.)
      colors: completeConfig.colors,
      buttons: completeConfig.buttons,
      fonts: completeConfig.fonts,
      layout: completeConfig.layout,
      logo: completeConfig.logo,
    };
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // Get auth token from localStorage
    const authToken =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(url, {
      ...options,
      credentials: "include", // Include cookies and auth headers
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
    });
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    return response;
  };

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch active theme with auth
      const activeResponse = await fetchWithAuth("/api/theme?active=true");
      const activeData = await activeResponse.json();

      if (activeData.success && activeData.theme) {
        const compatibleTheme = ensureThemeCompatibility(activeData.theme);
        setActiveTheme(compatibleTheme);
        setTheme(compatibleTheme);
        applyTheme(compatibleTheme);
      } else {
        setActiveTheme(null);
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
      }

      // Fetch all themes with auth
      const allResponse = await fetchWithAuth("/api/theme");
      const allData = await allResponse.json();

      if (allData.success) {
        const compatibleThemes = (allData.themes || []).map((theme: Theme) =>
          ensureThemeCompatibility(theme),
        );
        setAllThemes(compatibleThemes);
      }
    } catch (err) {
      console.error("Error loading themes:", err);
      if (err instanceof Error && err.message === "Unauthorized") {
        setError("You must be logged in to access themes");
      } else {
        setError("Failed to load themes");
      }
      setActiveTheme(null);
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (
    themeData: Partial<ThemeConfig> & { name: string },
  ): Promise<Theme | null> => {
    try {
      // Ensure we have complete theme config before saving
      const completeConfig = ensureCompleteTheme(themeData);

      const response = await fetchWithAuth("/api/theme", {
        method: "POST",
        body: JSON.stringify({
          name: themeData.name,
          colors: completeConfig.colors,
          buttons: completeConfig.buttons,
          fonts: completeConfig.fonts,
          layout: completeConfig.layout,
          logo: completeConfig.logo,
          isActive: false,
        }),
      });

      const responseData = await response.json();

      // Handle specific HTTP status codes
      if (response.status === 401) {
        toast.error("Please log in to save themes");
        throw new Error("Unauthorized");
      }

      if (response.status === 403) {
        toast.error("Only administrators can save themes");
        throw new Error("Forbidden");
      }

      if (!response.ok) {
        const errorMessage = responseData.error || "Failed to save theme";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (!responseData.success || !responseData.theme) {
        const errorMessage =
          responseData.error || "Failed to save theme: Invalid response data";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Validate the returned theme data
      const savedTheme = responseData.theme;
      if (!savedTheme.id || !savedTheme.name) {
        toast.error("Invalid theme data received from server");
        throw new Error("Invalid theme data received from server");
      }

      toast.success("Theme saved successfully");
      await loadThemes(); // Refresh themes list
      return savedTheme;
    } catch (err) {
      console.error("Error saving theme:", err);

      // Don't show toast for auth errors (already handled above)
      if (
        err instanceof Error &&
        !err.message.includes("Unauthorized") &&
        !err.message.includes("Forbidden")
      ) {
        toast.error(err.message || "Failed to save theme");
      }

      throw err;
    }
  };

  const updateTheme = async (
    id: string,
    themeData: Partial<ThemeConfig> & { name: string },
  ): Promise<Theme | null> => {
    try {
      const currentTheme = allThemes.find((t) => t.id === id);
      if (!currentTheme) throw new Error("Theme not found");
      const completeConfig = ensureCompleteTheme(themeData);
      // Get auth token from localStorage
      const authToken = localStorage.getItem("auth_token");
      // Get user data from localStorage
      const authUserStr = localStorage.getItem("auth_user");
      // Ensure cookies are set for server-side access
      if (authToken) {
        document.cookie = `auth_token=${authToken};path=/;max-age=86400`;
      }
      if (authUserStr) {
        document.cookie = `auth_user=${encodeURIComponent(
          authUserStr,
        )};path=/;max-age=86400`;
      }

      // Use fetch directly with credentials and auth token
      const response = await fetch(`/api/theme/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
        credentials: "include",
        body: JSON.stringify({
          name: themeData.name,
          colors: completeConfig.colors,
          buttons: completeConfig.buttons,
          fonts: completeConfig.fonts,
          layout: completeConfig.layout,
          logo: completeConfig.logo,
          isActive: currentTheme.isActive,
        }),
      });

      // Handle authentication errors
      if (response.status === 401) {
        toast.error("You must be logged in to update themes");
        throw new Error("Unauthorized");
      }

      // Handle authorization errors
      if (response.status === 403) {
        toast.error("Only administrators can update themes");
        throw new Error("Forbidden");
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to update theme";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        await loadThemes();
        return data.theme;
      } else {
        throw new Error(data.error || "Failed to update theme");
      }
    } catch (err) {
      console.error("Error updating theme:", err);

      if (err instanceof Error) {
        if (
          !err.message.includes("Unauthorized") &&
          !err.message.includes("Forbidden")
        ) {
          toast.error(`Failed to update theme: ${err.message}`);
        }
      } else {
        toast.error("Failed to update theme");
      }

      throw err;
    }
  };

  const deleteTheme = async (id: string): Promise<boolean> => {
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem("auth_token");

      // Get user data from localStorage
      const authUserStr = localStorage.getItem("auth_user");

      // Ensure cookies are set for server-side access
      if (authToken) {
        document.cookie = `auth_token=${authToken};path=/;max-age=86400`;
      }

      if (authUserStr) {
        document.cookie = `auth_user=${encodeURIComponent(
          authUserStr,
        )};path=/;max-age=86400`;
      }

      // Use fetch directly with credentials and auth token
      const response = await fetch(`/api/theme/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
        credentials: "include",
      });

      // Handle authentication errors
      if (response.status === 401) {
        toast.error("You must be logged in to delete themes");
        throw new Error("Unauthorized");
      }

      // Handle authorization errors
      if (response.status === 403) {
        toast.error("Only administrators can delete themes");
        throw new Error("Forbidden");
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to delete theme";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Theme deleted successfully");
        await loadThemes();
        return true;
      } else {
        throw new Error(data.error || "Failed to delete theme");
      }
    } catch (err) {
      console.error("Error deleting theme:", err);

      if (err instanceof Error) {
        if (
          !err.message.includes("Unauthorized") &&
          !err.message.includes("Forbidden")
        ) {
          toast.error(`Failed to delete theme: ${err.message}`);
        }
      } else {
        toast.error("Failed to delete theme");
      }

      throw err;
    }
  };

  const activateTheme = async (id: string): Promise<boolean> => {
    try {
      // Find the theme in our local state first
      const themeToActivate = allThemes.find((t) => t.id === id);
      if (!themeToActivate) {
        toast.error("Theme not found");
        return false;
      }

      // Get auth token from localStorage
      const authToken = localStorage.getItem("auth_token");

      // Get user data from localStorage
      const authUserStr = localStorage.getItem("auth_user");

      // Ensure cookies are set for server-side access
      if (authToken) {
        document.cookie = `auth_token=${authToken};path=/;max-age=86400`;
      }

      if (authUserStr) {
        document.cookie = `auth_user=${encodeURIComponent(
          authUserStr,
        )};path=/;max-age=86400`;
      }

      // Use fetch directly with credentials and auth token
      const response = await fetch(`/api/theme/${id}/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
        credentials: "include", // Important: include cookies for authentication
      });

      // Handle authentication errors
      if (response.status === 401) {
        toast.error("You must be logged in to activate themes");
        return false;
      }

      // Handle authorization errors
      if (response.status === 403) {
        toast.error("Only administrators can activate themes");
        return false;
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to activate theme";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }

        toast.error(errorMessage);
        return false;
      }

      const data = await response.json();

      if (data.success && data.theme) {
        // Update states with the activated theme
        const activatedTheme = ensureThemeCompatibility(data.theme);
        setActiveTheme(activatedTheme);

        // Apply the theme
        setTheme(activatedTheme);
        applyTheme(activatedTheme);
        // Refresh theme list
        await loadThemes();
        toast.success("Theme activated successfully");
        return true;
      } else {
        throw new Error(data.error || "Failed to activate theme");
      }
    } catch (err) {
      console.error("Error activating theme:", err);

      if (err instanceof Error) {
        toast.error(`Failed to activate theme: ${err.message}`);
      } else {
        toast.error("Failed to activate theme. Please try again.");
      }

      return false;
    }
  };

  const applyTheme = (themeConfig: ThemeConfig) => {
    // Use the global theme utility function
    applyGlobalTheme(themeConfig);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        activeTheme,
        allThemes,
        isLoading,
        error,
        saveTheme,
        updateTheme,
        deleteTheme,
        activateTheme,
        applyTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
