"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MUSYRIF" | "WALI" | "SANTRI";
  avatar?: string;
  phone?: string;
  nis?: string;
  halaqah?: string;
  musyrif?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@rumahtahfidz.com": {
    password: "admin123",
    user: {
      id: "1",
      name: "Administrator",
      email: "admin@rumahtahfidz.com",
      role: "ADMIN",
      avatar: "/avatars/admin.jpg",
      phone: "+62 812-3456-7890",
    },
  },
  "musyrif@rumahtahfidz.com": {
    password: "musyrif123",
    user: {
      id: "2",
      name: "Ustadz Abdullah",
      email: "musyrif@rumahtahfidz.com",
      role: "MUSYRIF",
      avatar: "/avatars/musyrif.jpg",
      phone: "+62 813-4567-8901",
      halaqah: "Al-Fatihah",
    },
  },
  "wali@rumahtahfidz.com": {
    password: "wali123",
    user: {
      id: "3",
      name: "Ahmad Fauzi",
      email: "wali@rumahtahfidz.com",
      role: "WALI",
      avatar: "/avatars/wali.jpg",
      phone: "+62 814-5678-9012",
    },
  },
  "santri@rumahtahfidz.com": {
    password: "santri123",
    user: {
      id: "4",
      name: "Muhammad Hafidz",
      email: "santri@rumahtahfidz.com",
      role: "SANTRI",
      avatar: "/avatars/santri.jpg",
      nis: "24001",
      halaqah: "Al-Fatihah",
      musyrif: "Ustadz Abdullah",
    },
  },
};

// AuthProvider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check NextAuth session
        if (session && session.user) {
          // Convert NextAuth session to our User type
          const userData: User = {
            id: session.user.id || "",
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role || "WALI",
            avatar: session.user.avatar,
          };

          setUser(userData);
          console.log(
            "AuthProvider: User loaded from NextAuth session",
            userData,
          );

          // Also store in localStorage for backup
          localStorage.setItem("auth_user", JSON.stringify(userData));
          localStorage.setItem("auth_token", "session_token");
        }
        // If no NextAuth session, try localStorage as fallback
        else {
          const storedUser = localStorage.getItem("auth_user");
          const storedToken = localStorage.getItem("auth_token");

          if (storedUser && storedToken) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log(
              "AuthProvider: User loaded from localStorage",
              userData,
            );
          } else {
            console.log(
              "AuthProvider: No user found in session or localStorage",
            );
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Clear invalid data
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      checkAuth();
    }
  }, [session, status]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Try to login with NextAuth first
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        return true;
      }

      // If NextAuth fails, try mock login as fallback
      const mockUser = MOCK_USERS[email];
      if (mockUser && mockUser.password === password) {
        const userData = mockUser.user;
        const token = `mock_token_${Date.now()}`;

        // Store in localStorage
        localStorage.setItem("auth_user", JSON.stringify(userData));
        localStorage.setItem("auth_token", token);

        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");

    // Clear state
    setUser(null);

    // Sign out from NextAuth
    signOut({ redirect: false });
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    loading: loading || status === "loading",
    login,
    logout,
    updateUser,
    isAuthenticated: !!user || !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: User["role"][],
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Helper function to get user role redirect path
export function getRoleRedirectPath(role: User["role"]): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "MUSYRIF":
      return "/dashboard/musyrif";
    case "WALI":
      return "/dashboard/wali";
    case "SANTRI":
      return "/dashboard/santri";
    default:
      return "/dashboard";
  }
}

// Helper function to check if user has permission
export function hasPermission(
  userRole: User["role"],
  requiredRoles: User["role"][],
): boolean {
  return requiredRoles.includes(userRole);
}

// Helper function to get user display name
export function getUserDisplayName(user: User): string {
  return user.name || user.email.split("@")[0];
}

// Helper function to get user avatar
export function getUserAvatar(user: User): string {
  return (
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d9488&color=fff`
  );
}

export default AuthProvider;
