"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import Logo from "@/components/ui/Logo";
import {
  BookOpen,
  Mail,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const NextAuthLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    // Only check NextAuth session to avoid conflicts
    if (status === "authenticated" && session) {
      const user = session.user;

      // Redirect based on user role instead of using the default callbackUrl
      if (user?.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (user?.role === "MUSYRIF") {
        router.push("/dashboard/musyrif");
      } else if (user?.role === "WALI") {
        router.push("/dashboard/wali");
      } else {
        // Default dashboard or use callbackUrl if it's not the default
        if (callbackUrl !== "/dashboard") {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard/user");
        }
      }
    }
  }, [session, status, router, callbackUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear auth error when user changes input
    if (authError) {
      setAuthError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use NextAuth signIn directly
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setAuthError("Email atau password salah");
      } else if (result?.ok) {
        // Login successful, force redirect
        setAuthError(null);

        // Wait a bit for session to update, then redirect
        setTimeout(() => {
          // Force redirect based on callbackUrl or default admin dashboard
          if (callbackUrl && callbackUrl !== "/dashboard") {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/dashboard/admin";
          }
        }, 500);
      }
      // If successful, the session will update and the useEffect will handle redirect
    } catch (error) {
      setAuthError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };



  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-5"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-3">
              <Logo width={30} height={30} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-teal-600">
                  TPQ Baitus Shuffah
                </span>
                <span className="text-sm text-gray-600">
                  Rumah Tahfidz Al-Qur'an
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-center text-3xl font-bold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{" "}
            <Link
              href="/register"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              daftar sebagai santri baru
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-xl border-0">
            <CardContent className="py-8 px-6">
              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email Anda"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  required
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password Anda"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password}
                  required
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={formData.remember}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Ingat saya
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-teal-600 hover:text-teal-500"
                    >
                      Lupa password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <LoadingButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isLoading}
                  loadingText="Memproses..."
                >
                  Masuk
                </LoadingButton>
              </form>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextAuthLoginPage;
