import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "../constants/theme";

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof COLORS;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_COLORS = {
  ...COLORS,
  // Override colors for dark mode
  background: "#1f2937",
  backgroundSecondary: "#374151",
  textPrimary: "#f9fafb",
  textSecondary: "#d1d5db",
  textLight: "#9ca3af",
  border: "#4b5563",
  borderLight: "#374151",
  borderDark: "#6b7280",
  gray50: "#374151",
  gray100: "#4b5563",
  gray200: "#6b7280",
  gray300: "#9ca3af",
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync("themeMode");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await SecureStore.setItemAsync("themeMode", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const colors = isDarkMode ? DARK_COLORS : COLORS;

  const value: ThemeContextType = {
    isDarkMode,
    colors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
