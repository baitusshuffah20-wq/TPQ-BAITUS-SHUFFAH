// Date utilities
export const formatDate = (
  date: string | Date,
  format: "short" | "long" | "time" = "short",
): string => {
  const d = new Date(date);

  if (format === "time") {
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (format === "long") {
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffInHours = (now.getTime() - target.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes <= 1 ? "Baru saja" : `${diffInMinutes} menit lalu`;
  }

  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} jam lalu`;
  }

  if (diffInHours < 48) {
    return "Kemarin";
  }

  return formatDate(date);
};

// Currency utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, "")) || 0;
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validatePassword = (
  password: string,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password minimal 6 karakter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf besar");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password harus mengandung huruf kecil");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung angka");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Array utilities
export const groupBy = <T>(
  array: T[],
  key: keyof T,
): { [key: string]: T[] } => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as { [key: string]: T[] },
  );
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Storage utilities
export const storage = {
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage setItem error:", error);
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage removeItem error:", error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};

// Device utilities
export const getDeviceInfo = () => {
  const { Dimensions, Platform } = require("react-native");
  const { width, height } = Dimensions.get("window");

  return {
    width,
    height,
    platform: Platform.OS,
    version: Platform.Version,
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
    isSmallScreen: width < 375,
    isMediumScreen: width >= 375 && width < 414,
    isLargeScreen: width >= 414,
  };
};

// Network utilities
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const { default: NetInfo } = await import(
      "@react-native-community/netinfo"
    );
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error("Network check error:", error);
    return false;
  }
};

// Haptic feedback utilities
export const hapticFeedback = {
  light: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },

  medium: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },

  heavy: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },

  success: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },

  warning: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },

  error: async () => {
    try {
      const { default: Haptics } = await import("expo-haptics");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  },
};

// Color utilities
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: any;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
