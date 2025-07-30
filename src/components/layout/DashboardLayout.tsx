"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationLink } from "@/components/providers/NavigationProvider";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Logo from "@/components/ui/Logo";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Heart,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  UserCheck,
  MessageSquare,
  Mail,
  Zap,
  Star,
  Building2,
  Brain,
  Monitor,
  Database,
  DollarSign,
  TrendingUp,
  Award,
  Palette,
  User,
  ChevronDown,
  AlertTriangle,
  Shield,
  Smartphone,
  Wallet,
  ArrowDownRight,
  Activity,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const dropdown = document.getElementById("profile-dropdown");
      const trigger = document.getElementById("profile-trigger");
      if (
        dropdown &&
        trigger &&
        !dropdown.contains(event.target as Node) &&
        !trigger.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    // Only redirect if we're sure the user is unauthenticated and not in loading state
    if (status === "unauthenticated" && pathname !== "/login") {
      console.log(
        "DashboardLayout: User is unauthenticated, redirecting to login",
      );
      router.push("/login");
    } else {
      console.log("DashboardLayout: Auth status:", status, "User:", user);
    }
  }, [status, router, user, pathname]);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (status === "unauthenticated" || !user) {
    return null;
  }

  const navigationGroups: NavGroup[] = [
    {
      name: "DASHBOARD",
      items: [
        {
          name: "Dashboard",
          href: `/dashboard/${user?.role?.toLowerCase()}`,
          icon: Home,
          roles: ["ADMIN", "MUSYRIF", "WALI"],
        },
      ],
    },
    {
      name: "AKADEMIK",
      items: [
        {
          name: "Data Santri",
          href: `/dashboard/${user?.role?.toLowerCase()}/santri`,
          icon: Users,
          roles: ["ADMIN", "MUSYRIF"], // Musyrif can only view santri in their halaqah (no create/edit)
        },
        {
          name: "Data Musyrif",
          href: `/dashboard/${user?.role?.toLowerCase()}/musyrif`,
          icon: GraduationCap,
          roles: ["ADMIN"],
        },
        {
          name: "Halaqah",
          href: `/dashboard/${user?.role?.toLowerCase()}/halaqah`,
          icon: BookOpen,
          roles: ["ADMIN", "MUSYRIF"], // Musyrif can view their assigned halaqah
        },
        {
          name: "Hafalan & Progress",
          href: `/dashboard/${user?.role?.toLowerCase()}/hafalan`,
          icon: BookOpen,
          roles: ["ADMIN", "MUSYRIF"], // Musyrif can give grades/scores to their santri
        },
        {
          name: "Penilaian Santri",
          href: `/dashboard/${user?.role?.toLowerCase()}/penilaian`,
          icon: Star,
          roles: ["MUSYRIF"], // Menu khusus untuk musyrif memberikan penilaian
        },
        {
          name: "Absensi",
          href: `/dashboard/${user?.role?.toLowerCase()}/attendance`,
          icon: Calendar,
          roles: ["ADMIN", "MUSYRIF"],
        },
        {
          name: "Evaluasi Perilaku",
          href: `/dashboard/${user?.role?.toLowerCase()}/behavior`,
          icon: Heart,
          roles: ["ADMIN", "MUSYRIF"],
        },
        {
          name: "Kriteria Perilaku",
          href: `/dashboard/${user?.role?.toLowerCase()}/behavior/criteria`,
          icon: Shield,
          roles: ["ADMIN"],
        },
        {
          name: "Prestasi & Achievement",
          href: `/dashboard/${user?.role?.toLowerCase()}/achievements`,
          icon: Award,
          roles: ["ADMIN", "MUSYRIF"],
        },
      ],
    },
    {
      name: "KEUANGAN",
      items: [
        {
          name: "SPP & Pembayaran",
          href: `/dashboard/${user?.role?.toLowerCase()}/spp`,
          icon: CreditCard,
          roles: ["ADMIN"],
        },
        {
          name: "Keuangan",
          href: `/dashboard/${user?.role?.toLowerCase()}/financial`,
          icon: DollarSign,
          roles: ["ADMIN"],
        },

        {
          name: "Donasi",
          href: `/dashboard/${user?.role?.toLowerCase()}/donations`,
          icon: Heart,
          roles: ["ADMIN"], // Musyrif can contribute donations
        },
        {
          name: "Wallet Saya",
          href: `/dashboard/${user?.role?.toLowerCase()}/wallet`,
          icon: Wallet,
          roles: ["MUSYRIF"], // Menu khusus untuk musyrif mengelola penghasilan
        },
        {
          name: "Kelola Penarikan",
          href: `/dashboard/${user?.role?.toLowerCase()}/withdrawals`,
          icon: ArrowDownRight,
          roles: ["ADMIN"], // Menu khusus untuk admin kelola withdrawal musyrif
        },
        {
          name: "Salary Rates",
          href: `/dashboard/${user?.role?.toLowerCase()}/salary-rates`,
          icon: DollarSign,
          roles: ["ADMIN"], // Menu khusus untuk admin kelola salary rates musyrif
        },
        {
          name: "Payment Gateway",
          href: `/dashboard/${user?.role?.toLowerCase()}/payment-gateway`,
          icon: CreditCard,
          roles: ["ADMIN"],
        },
        {
          name: "Rekening Bank",
          href: `/dashboard/${user?.role?.toLowerCase()}/bank-accounts`,
          icon: Building2,
          roles: ["ADMIN"],
        },
        {
          name: "Analytics Dashboard",
          href: `/dashboard/${user?.role?.toLowerCase()}/analytics`,
          icon: BarChart3,
          roles: ["ADMIN"],
        },
        {
          name: "Analytics Pembayaran",
          href: `/dashboard/${user?.role?.toLowerCase()}/analytics/payments`,
          icon: TrendingUp,
          roles: ["ADMIN"],
        },
        {
          name: "Subscription SPP",
          href: `/dashboard/${user?.role?.toLowerCase()}/subscriptions`,
          icon: CreditCard,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "LAPORAN & ANALISIS",
      items: [
        {
          name: "Laporan",
          href: `/dashboard/${user?.role?.toLowerCase()}/reports`,
          icon: BarChart3,
          roles: ["ADMIN", "MUSYRIF"],
        },
        {
          name: "Laporan Keuangan",
          href: `/dashboard/${user?.role?.toLowerCase()}/financial-reports`,
          icon: FileText,
          roles: ["ADMIN"],
        },
        {
          name: "Laporan Salary",
          href: `/dashboard/${user?.role?.toLowerCase()}/salary-reports`,
          icon: BarChart3,
          roles: ["ADMIN"],
        },
        {
          name: "AI Insights",
          href: `/dashboard/${user?.role?.toLowerCase()}/insights`,
          icon: Brain,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "SISTEM & MONITORING",
      items: [
        {
          name: "Monitoring",
          href: `/dashboard/${user?.role?.toLowerCase()}/monitoring`,
          icon: Monitor,
          roles: ["ADMIN"],
        },
        {
          name: "System Audit",
          href: `/dashboard/${user?.role?.toLowerCase()}/audit`,
          icon: Database,
          roles: ["ADMIN"],
        },
        {
          name: "Error Logs",
          href: `/dashboard/${user?.role?.toLowerCase()}/system/error-logs`,
          icon: AlertTriangle,
          roles: ["ADMIN"],
        },
        {
          name: "Database Test",
          href: `/db-test`,
          icon: Database,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "KOMUNIKASI",
      items: [
        {
          name: "Notifikasi",
          href: `/dashboard/${user?.role?.toLowerCase()}/notifications`,
          icon: Bell,
          roles: ["ADMIN"],
        },
        {
          name: "Trigger Notifikasi",
          href: `/dashboard/${user?.role?.toLowerCase()}/notifications/triggers`,
          icon: Bell,
          roles: ["ADMIN"],
        },
        {
          name: "Berita",
          href: `/dashboard/${user?.role?.toLowerCase()}/news`,
          icon: FileText,
          roles: ["ADMIN"],
        },
        {
          name: "WhatsApp",
          href: `/dashboard/${user?.role?.toLowerCase()}/whatsapp`,
          icon: MessageSquare,
          roles: ["ADMIN"],
        },
        {
          name: "Email",
          href: `/dashboard/${user?.role?.toLowerCase()}/email`,
          icon: Mail,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "MOBILE APPS",
      items: [
        {
          name: "Mobile App Generator",
          href: `/dashboard/${user?.role?.toLowerCase()}/mobile-app-generator`,
          icon: Smartphone,
          roles: ["ADMIN"],
        },
      ],
    },
    {
      name: "ADMINISTRASI",
      items: [
        {
          name: "Pengguna",
          href: `/dashboard/${user?.role?.toLowerCase()}/users`,
          icon: UserCheck,
          roles: ["ADMIN"],
        },
        {
          name: "Pengaturan",
          href: `/dashboard/${user?.role?.toLowerCase()}/settings`,
          icon: Settings,
          roles: ["ADMIN"], // Musyrif tidak boleh akses pengaturan sistem
        },
        {
          name: "Integrasi Sistem",
          href: `/dashboard/${user?.role?.toLowerCase()}/settings/integrations`,
          icon: Zap,
          roles: ["ADMIN"],
        },
        {
          name: "System Health",
          href: `/dashboard/${user?.role?.toLowerCase()}/system-health`,
          icon: Activity,
          roles: ["ADMIN"], // Menu khusus untuk admin monitor system health
        },
        {
          name: "Kustomisasi Tema",
          href: `/dashboard/${user?.role?.toLowerCase()}/theme-customizer`,
          icon: Palette,
          roles: ["ADMIN"],
        },
        {
          name: "Mode Pemeliharaan",
          href: `/dashboard/${user?.role?.toLowerCase()}/maintenance`,
          icon: Settings,
          roles: ["ADMIN"],
        },
      ],
    },
  ];

  // Filter navigation groups based on user role
  const filteredNavigationGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles.includes(user?.role || ""),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Sidebar header with new logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-teal-600/10 to-transparent">
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
          </div>

          {/* Sidebar content with enhanced styling */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-8">
              {filteredNavigationGroups.map((group) => (
                <div key={group.name}>
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                      <span className="w-8 h-px bg-gradient-to-r from-teal-200 to-transparent mr-2"></span>
                      {group.name}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <NavigationLink
                          key={`${item.name}-${item.href}`}
                          href={item.href}
                          className={cn(
                            "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            active
                              ? "bg-gradient-to-r from-teal-50 to-transparent text-teal-700 border-r-2 border-teal-500"
                              : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
                          )}
                        >
                          <Icon
                            className={cn(
                              "mr-3 h-5 w-5 transition-colors duration-200",
                              active
                                ? "text-teal-600"
                                : "text-gray-400 group-hover:text-gray-500",
                            )}
                          />
                          <span>{item.name}</span>
                          {active && (
                            <div className="ml-auto w-1 h-4 bg-teal-500 rounded-full opacity-70" />
                          )}
                        </NavigationLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Profile section at bottom of sidebar */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 px-2 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-50 ring-2 ring-white">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-2 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile dropdown with enhanced styling */}
          {profileDropdownOpen && (
            <div
              id="profile-dropdown"
              className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200/50 py-1 z-50 backdrop-blur-sm bg-white/95"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                href={`/dashboard/${user?.role?.toLowerCase()}/profile`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Edit Profile
              </Link>
              <Link
                href={`/dashboard/${user?.role?.toLowerCase()}/settings`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleSignOut();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 transition-all duration-300",
          sidebarOpen ? "visible" : "invisible",
        )}
      >
        {/* Mobile sidebar backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile sidebar panel */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 bg-white transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Same content as desktop sidebar */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Logo width={30} height={30} />
                <span className="text-sm font-bold text-teal-600">
                  TPQ Baitus Shuffah
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Same navigation as desktop */}
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="px-4 space-y-6">
                {filteredNavigationGroups.map((group) => (
                  <div key={group.name}>
                    <div className="px-3 mb-3">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {group.name}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavigationLink
                            key={`${item.name}-${item.href}`}
                            href={item.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              isActive(item.href)
                                ? "bg-teal-50 text-teal-700 border-r-2 border-teal-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </NavigationLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-72">
        {/* Navbar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-md lg:hidden text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  id="profile-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-full h-full p-1 text-gray-400" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile dropdown menu */}
                {profileDropdownOpen && (
                  <div
                    id="profile-dropdown"
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href={`/dashboard/${user?.role?.toLowerCase()}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Edit Profile
                    </Link>
                    <Link
                      href={`/dashboard/${user?.role?.toLowerCase()}/settings`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
