"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  UserX,
  FileText,
  Database,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SecuritySettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSecurityTab, setActiveSecurityTab] = useState("password");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    // Password settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Two-factor authentication
    twoFactorEnabled: false,
    twoFactorMethod: "app", // 'app', 'sms', 'email'

    // Login security
    loginNotifications: true,
    failedLoginLockout: true,
    failedLoginAttempts: "5",
    lockoutDuration: "30",
    sessionTimeout: "30",
    passwordExpiryDays: "90",

    // IP restrictions
    ipRestriction: false,
    allowedIPs: "",

    // Password policy
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    minPasswordLength: "8",
    passwordHistory: "5",

    // Data protection
    dataEncryption: true,
    personalDataAccess: "admin", // 'admin', 'admin_musyrif', 'all'
    dataRetentionPeriod: "365",

    // Backup settings
    autoBackup: true,
    backupFrequency: "daily", // 'daily', 'weekly', 'monthly'
    backupRetention: "30",
    backupEncryption: true,
  });

  // Simulasi data riwayat login
  useEffect(() => {
    const mockLoginHistory = [
      {
        id: 1,
        userId: 1,
        username: "admin",
        ip: "192.168.1.1",
        userAgent: "Chrome 98.0.4758.102 / Windows",
        status: "success",
        timestamp: "2023-06-15 08:30:45",
      },
      {
        id: 2,
        userId: 1,
        username: "admin",
        ip: "192.168.1.1",
        userAgent: "Chrome 98.0.4758.102 / Windows",
        status: "success",
        timestamp: "2023-06-14 14:22:31",
      },
      {
        id: 3,
        userId: 1,
        username: "admin",
        ip: "10.0.0.5",
        userAgent: "Safari 15.4 / macOS",
        status: "success",
        timestamp: "2023-06-13 09:15:22",
      },
      {
        id: 4,
        userId: 2,
        username: "musyrif1",
        ip: "192.168.1.5",
        userAgent: "Firefox 100.0 / Windows",
        status: "success",
        timestamp: "2023-06-12 16:45:10",
      },
      {
        id: 5,
        userId: 1,
        username: "admin",
        ip: "203.0.113.1",
        userAgent: "Chrome Mobile / Android",
        status: "failed",
        timestamp: "2023-06-12 02:11:05",
      },
    ];

    const mockBlockedIPs = [
      {
        id: 1,
        ip: "203.0.113.1",
        reason: "Multiple failed login attempts",
        timestamp: "2023-06-12 02:11:05",
        expiresAt: "2023-06-12 02:41:05",
      },
      {
        id: 2,
        ip: "198.51.100.23",
        reason: "Suspicious activity",
        timestamp: "2023-06-10 15:30:22",
        expiresAt: "Permanent",
      },
      {
        id: 3,
        ip: "198.51.100.45",
        reason: "Multiple failed login attempts",
        timestamp: "2023-06-08 09:45:11",
        expiresAt: "2023-06-08 10:15:11",
      },
    ];

    setLoginHistory(mockLoginHistory);
    setBlockedIPs(mockBlockedIPs);
  }, []);

  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Evaluate password strength when password changes
    if (field === "newPassword") {
      evaluatePasswordStrength(value);
    }
  };

  const handleToggle = (field: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Function to evaluate password strength
  const evaluatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    let feedback = "";

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Provide feedback based on strength
    if (strength <= 2) {
      feedback = "Password sangat lemah";
    } else if (strength <= 4) {
      feedback = "Password cukup kuat";
    } else {
      feedback = "Password sangat kuat";
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  // Function to get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSave = async () => {
    try {
      // Validate password if changing
      if (settings.newPassword) {
        if (
          settings.newPassword.length < parseInt(settings.minPasswordLength)
        ) {
          toast.error(
            `Password baru harus minimal ${settings.minPasswordLength} karakter`,
          );
          return;
        }

        // Check password requirements
        if (settings.requireUppercase && !/[A-Z]/.test(settings.newPassword)) {
          toast.error("Password harus mengandung huruf kapital");
          return;
        }

        if (settings.requireLowercase && !/[a-z]/.test(settings.newPassword)) {
          toast.error("Password harus mengandung huruf kecil");
          return;
        }

        if (settings.requireNumbers && !/[0-9]/.test(settings.newPassword)) {
          toast.error("Password harus mengandung angka");
          return;
        }

        if (
          settings.requireSymbols &&
          !/[^A-Za-z0-9]/.test(settings.newPassword)
        ) {
          toast.error("Password harus mengandung simbol");
          return;
        }

        if (settings.newPassword !== settings.confirmPassword) {
          toast.error("Password baru dan konfirmasi tidak cocok");
          return;
        }

        if (!settings.currentPassword) {
          toast.error("Password saat ini harus diisi");
          return;
        }
      }

      setIsSaving(true);

      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Pengaturan keamanan berhasil disimpan!");

      // Reset password fields
      if (activeSecurityTab === "password") {
        setSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setPasswordStrength(0);
        setPasswordFeedback("");
      }
    } catch (error) {
      console.error("Error saving security settings:", error);
      toast.error("Gagal menyimpan pengaturan keamanan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblockIP = async (ipId: number) => {
    setIsLoading(true);

    try {
      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Filter out the unblocked IP
      setBlockedIPs((prev) => prev.filter((ip) => ip.id !== ipId));

      toast.success("IP berhasil dihapus dari daftar blokir");
    } catch (error) {
      console.error("Error unblocking IP:", error);
      toast.error("Gagal menghapus IP dari daftar blokir");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setIsLoading(true);

    try {
      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Backup database berhasil dibuat");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Gagal membuat backup database");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="password"
        value={activeSecurityTab}
        onValueChange={setActiveSecurityTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Akses</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Log</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          {/* Password Change */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ubah Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password strength meter */}
                {settings.newPassword && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 6) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordFeedback}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Kebijakan Password
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Panjang Minimal Password
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.minPasswordLength}
                    onChange={(e) =>
                      handleInputChange("minPasswordLength", e.target.value)
                    }
                  >
                    <option value="6">6 karakter</option>
                    <option value="8">8 karakter</option>
                    <option value="10">10 karakter</option>
                    <option value="12">12 karakter</option>
                    <option value="14">14 karakter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Riwayat Password
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.passwordHistory}
                    onChange={(e) =>
                      handleInputChange("passwordHistory", e.target.value)
                    }
                  >
                    <option value="0">Tidak diaktifkan</option>
                    <option value="3">3 password terakhir</option>
                    <option value="5">5 password terakhir</option>
                    <option value="10">10 password terakhir</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Mencegah penggunaan password yang sama dengan sebelumnya
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireUppercase"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={settings.requireUppercase}
                      onChange={() => handleToggle("requireUppercase")}
                    />
                    <label
                      htmlFor="requireUppercase"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Wajib mengandung huruf kapital
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireLowercase"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={settings.requireLowercase}
                      onChange={() => handleToggle("requireLowercase")}
                    />
                    <label
                      htmlFor="requireLowercase"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Wajib mengandung huruf kecil
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireNumbers"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={settings.requireNumbers}
                      onChange={() => handleToggle("requireNumbers")}
                    />
                    <label
                      htmlFor="requireNumbers"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Wajib mengandung angka
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireSymbols"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={settings.requireSymbols}
                      onChange={() => handleToggle("requireSymbols")}
                    />
                    <label
                      htmlFor="requireSymbols"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Wajib mengandung simbol
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Access Tab */}
        <TabsContent value="access" className="space-y-6">
          {/* Two-Factor Authentication */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Autentikasi Dua Faktor
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Aktifkan Autentikasi Dua Faktor
                </p>
                <p className="text-xs text-gray-500">
                  Tingkatkan keamanan akun dengan verifikasi tambahan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.twoFactorEnabled}
                  onChange={() => handleToggle("twoFactorEnabled")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {settings.twoFactorEnabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Verifikasi
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="2fa-app"
                        name="twoFactorMethod"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                        checked={settings.twoFactorMethod === "app"}
                        onChange={() =>
                          handleInputChange("twoFactorMethod", "app")
                        }
                      />
                      <label
                        htmlFor="2fa-app"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Aplikasi Autentikator (Google Authenticator, Authy)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="2fa-sms"
                        name="twoFactorMethod"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                        checked={settings.twoFactorMethod === "sms"}
                        onChange={() =>
                          handleInputChange("twoFactorMethod", "sms")
                        }
                      />
                      <label
                        htmlFor="2fa-sms"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        SMS
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="2fa-email"
                        name="twoFactorMethod"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                        checked={settings.twoFactorMethod === "email"}
                        onChange={() =>
                          handleInputChange("twoFactorMethod", "email")
                        }
                      />
                      <label
                        htmlFor="2fa-email"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Email
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-teal-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-teal-800">
                        Autentikasi Dua Faktor Aktif
                      </h3>
                      <div className="mt-2 text-sm text-teal-700">
                        <p>
                          Akun Anda dilindungi dengan autentikasi dua faktor.
                          Setiap kali login, Anda akan diminta kode verifikasi
                          tambahan.
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
                          >
                            Atur Ulang
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Security */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Keamanan Login
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Notifikasi Login
                  </p>
                  <p className="text-xs text-gray-500">
                    Dapatkan notifikasi saat ada login baru ke akun Anda
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.loginNotifications}
                    onChange={() => handleToggle("loginNotifications")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Kunci Akun Setelah Login Gagal
                  </p>
                  <p className="text-xs text-gray-500">
                    Kunci akun setelah beberapa kali percobaan login gagal
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.failedLoginLockout}
                    onChange={() => handleToggle("failedLoginLockout")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {settings.failedLoginLockout && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Percobaan Login Gagal
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={settings.failedLoginAttempts}
                      onChange={(e) =>
                        handleInputChange("failedLoginAttempts", e.target.value)
                      }
                    >
                      <option value="3">3 kali</option>
                      <option value="5">5 kali</option>
                      <option value="10">10 kali</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi Penguncian (menit)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={settings.lockoutDuration}
                      onChange={(e) =>
                        handleInputChange("lockoutDuration", e.target.value)
                      }
                    >
                      <option value="15">15 menit</option>
                      <option value="30">30 menit</option>
                      <option value="60">1 jam</option>
                      <option value="1440">24 jam</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout Sesi (menit)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange("sessionTimeout", e.target.value)
                  }
                >
                  <option value="15">15 menit</option>
                  <option value="30">30 menit</option>
                  <option value="60">1 jam</option>
                  <option value="120">2 jam</option>
                  <option value="240">4 jam</option>
                  <option value="480">8 jam</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Sesi login akan berakhir setelah tidak ada aktivitas selama
                  periode ini
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masa Berlaku Password (hari)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.passwordExpiryDays}
                  onChange={(e) =>
                    handleInputChange("passwordExpiryDays", e.target.value)
                  }
                >
                  <option value="30">30 hari</option>
                  <option value="60">60 hari</option>
                  <option value="90">90 hari</option>
                  <option value="180">180 hari</option>
                  <option value="365">1 tahun</option>
                  <option value="0">Tidak pernah kedaluwarsa</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pengguna akan diminta untuk mengubah password setelah periode
                  ini
                </p>
              </div>
            </div>
          </div>

          {/* IP Restrictions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pembatasan IP
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Aktifkan Pembatasan IP
                  </p>
                  <p className="text-xs text-gray-500">
                    Batasi akses hanya dari alamat IP tertentu
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.ipRestriction}
                    onChange={() => handleToggle("ipRestriction")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {settings.ipRestriction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat IP yang Diizinkan
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.allowedIPs}
                    onChange={(e) =>
                      handleInputChange("allowedIPs", e.target.value)
                    }
                    placeholder="Contoh: 192.168.1.1, 10.0.0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pisahkan beberapa alamat IP dengan koma. Hanya alamat IP ini
                    yang dapat mengakses sistem.
                  </p>
                </div>
              )}

              {/* Blocked IPs */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  IP yang Diblokir
                </h4>
                {blockedIPs.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Alamat IP
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Alasan
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Waktu
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Berakhir
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {blockedIPs.map((ip) => (
                          <tr key={ip.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {ip.ip}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {ip.reason}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {ip.timestamp}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {ip.expiresAt}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleUnblockIP(ip.id)}
                                disabled={isLoading}
                                className="text-teal-600 hover:text-teal-900"
                              >
                                Buka Blokir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Tidak ada alamat IP yang diblokir saat ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Perlindungan Data
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Enkripsi Data Sensitif
                  </p>
                  <p className="text-xs text-gray-500">
                    Enkripsi data sensitif seperti informasi pribadi
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.dataEncryption}
                    onChange={() => handleToggle("dataEncryption")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akses Data Pribadi
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.personalDataAccess}
                  onChange={(e) =>
                    handleInputChange("personalDataAccess", e.target.value)
                  }
                >
                  <option value="admin">Hanya Admin</option>
                  <option value="admin_musyrif">Admin dan Musyrif</option>
                  <option value="all">Semua Pengguna</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Siapa yang dapat mengakses data pribadi santri dan wali
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode Retensi Data (hari)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.dataRetentionPeriod}
                  onChange={(e) =>
                    handleInputChange("dataRetentionPeriod", e.target.value)
                  }
                >
                  <option value="180">180 hari</option>
                  <option value="365">1 tahun</option>
                  <option value="730">2 tahun</option>
                  <option value="1095">3 tahun</option>
                  <option value="0">Selamanya</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Berapa lama data log dan aktivitas disimpan sebelum dihapus
                  otomatis
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Riwayat Login
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pengguna
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      IP Address
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Browser / Perangkat
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Waktu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginHistory.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.username}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {log.ip}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {log.userAgent}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {log.status === "success" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Sukses
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Gagal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ekspor Log
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Aktivitas Pengguna
            </h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-500">
                Log aktivitas pengguna tersedia di halaman Audit System.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Lihat Audit System
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pengaturan Backup
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Backup Otomatis
                  </p>
                  <p className="text-xs text-gray-500">
                    Buat backup database secara otomatis
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoBackup}
                    onChange={() => handleToggle("autoBackup")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {settings.autoBackup && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frekuensi Backup
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={settings.backupFrequency}
                      onChange={(e) =>
                        handleInputChange("backupFrequency", e.target.value)
                      }
                    >
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retensi Backup (hari)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={settings.backupRetention}
                      onChange={(e) =>
                        handleInputChange("backupRetention", e.target.value)
                      }
                    >
                      <option value="7">7 hari</option>
                      <option value="14">14 hari</option>
                      <option value="30">30 hari</option>
                      <option value="90">90 hari</option>
                      <option value="365">1 tahun</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Berapa lama backup disimpan sebelum dihapus otomatis
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="backupEncryption"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={settings.backupEncryption}
                      onChange={() => handleToggle("backupEncryption")}
                    />
                    <label
                      htmlFor="backupEncryption"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Enkripsi file backup
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Backup Manual
            </h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-4">
                Buat backup database secara manual. Backup akan disimpan di
                server dan dapat diunduh.
              </p>
              <div className="flex space-x-4">
                <Button onClick={handleBackupNow} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Membuat Backup...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Backup Sekarang
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Riwayat Backup
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nama File
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ukuran
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tanggal
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tipe
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      backup_2023-06-15_08-30-00.sql
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      4.2 MB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      15 Jun 2023, 08:30
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Manual
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900 mr-4">
                        Unduh
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Hapus
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      backup_2023-06-14_00-00-00.sql
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      4.1 MB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      14 Jun 2023, 00:00
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Otomatis
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900 mr-4">
                        Unduh
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Hapus
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      backup_2023-06-13_00-00-00.sql
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      4.0 MB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      13 Jun 2023, 00:00
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Otomatis
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900 mr-4">
                        Unduh
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Hapus
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Keamanan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
