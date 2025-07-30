"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/ui/Logo";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Heart,
  Phone,
  Target,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  // Use try-catch to handle potential errors with useSession
  let session: {
    user: {
      name: string;
      email: string;
      avatar?: string;
    };
  } | null = null;
  let status: "loading" | "authenticated" | "unauthenticated" = "loading";

  try {
    const sessionData = useSession();
    session = sessionData.data;
    status = sessionData.status;
  } catch (error) {
    console.error("Error using useSession:", error);
    status = "unauthenticated";
  }

  // For debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Session status:", status);
      console.log("Session data:", session);
    }
  }, [session, status]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Tentang", href: "/about", icon: BookOpen },
    { name: "Program", href: "/programs", icon: BookOpen },
    { name: "Campaign", href: "/campaigns", icon: Target },
    { name: "Donasi", href: "/donate", icon: Heart },
    { name: "Kontak", href: "/contact", icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo with Site Name */}
          <div className="flex items-center space-x-2">
            <Logo width={30} height={30} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-teal-600">
                TPQ Baitus Shuffah
              </span>
              <span className="text-xs text-gray-600">
                Rumah Tahfidz Al-Qur'an
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-teal-700 bg-teal-100 border border-teal-200"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" && session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {session.user.avatar ? (
                        <Image
                          src={session.user.avatar}
                          alt={session.user.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {session.user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        try {
                          signOut({ callbackUrl: "/" });
                        } catch (error) {
                          console.error("Error signing out:", error);
                          window.location.href = "/";
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: "#006666",
                    color: "white",
                    border: "1px solid #004d4d",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#004d4d";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#006666";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <UserPlus className="h-4 w-4" style={{ color: "white" }} />
                  <span style={{ color: "white" }}>Daftar</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-teal-700 bg-teal-100 border border-teal-200"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Buttons or User Profile */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {status === "authenticated" && session ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {session.user.avatar ? (
                        <Image
                          src={session.user.avatar}
                          alt={session.user.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-800">
                        {session.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profil</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      try {
                        signOut({ callbackUrl: "/" });
                      } catch (error) {
                        console.error("Error signing out:", error);
                        window.location.href = "/";
                      }
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 shadow-md"
                    style={{
                      backgroundColor: "#006666",
                      color: "white",
                      border: "1px solid #004d4d",
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5" style={{ color: "white" }} />
                    <span style={{ color: "white" }}>Daftar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
