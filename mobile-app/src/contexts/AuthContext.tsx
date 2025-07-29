import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { showMessage } from "react-native-flash-message";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "WALI";
  santri: Santri[];
}

interface Santri {
  id: string;
  nis: string;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  halaqah?: {
    id: string;
    name: string;
    ustadz: {
      id: string;
      name: string;
    };
  };
  status: "ACTIVE" | "INACTIVE";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:3000/api"; // Change this to your actual API URL

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        await fetchUserProfile(token);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user.role === "WALI") {
          setUser(userData.user);
        } else {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      await logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: "WALI" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await SecureStore.setItemAsync("authToken", data.token);
        setUser(data.user);

        showMessage({
          message: "Login Berhasil",
          description: `Selamat datang, ${data.user.name}`,
          type: "success",
          duration: 3000,
        });

        return true;
      } else {
        showMessage({
          message: "Login Gagal",
          description: data.message || "Email atau password salah",
          type: "danger",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage({
        message: "Error",
        description: "Terjadi kesalahan saat login",
        type: "danger",
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      setUser(null);

      showMessage({
        message: "Logout Berhasil",
        description: "Anda telah keluar dari aplikasi",
        type: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        await fetchUserProfile(token);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
