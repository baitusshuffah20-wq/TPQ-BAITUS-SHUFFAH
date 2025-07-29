"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import SecuritySettings from "@/components/settings/SecuritySettings";
import {
  Settings,
  User,
  Bell,
  Shield,
  Mail,
  MessageSquare,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    system: {
      siteName: "TPQ Baitus Shuffah",
      siteDescription: "Lembaga Pendidikan Tahfidz Al-Quran",
      timezone: "Asia/Jakarta",
      language: "id",
      maintenanceMode: false,
    },

  });

  const tabs = [
    { key: "profile", label: "Profil", icon: User },
    { key: "notifications", label: "Notifikasi", icon: Bell },
    { key: "system", label: "Sistem", icon: Settings },
    { key: "security", label: "Keamanan", icon: Shield },
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // Here you would typically save to API
    alert("Pengaturan berhasil disimpan!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-600">
              Kelola pengaturan sistem dan profil Anda
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedTab === tab.key
                            ? "bg-teal-50 text-teal-700 border-r-2 border-teal-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {selectedTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profil Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.name}
                        onChange={(e) =>
                          handleInputChange("profile", "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.email}
                        onChange={(e) =>
                          handleInputChange("profile", "email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.phone}
                        onChange={(e) =>
                          handleInputChange("profile", "phone", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.address}
                        onChange={(e) =>
                          handleInputChange(
                            "profile",
                            "address",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ubah Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={settings.profile.currentPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "profile",
                                "currentPassword",
                                e.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.profile.newPassword}
                          onChange={(e) =>
                            handleInputChange(
                              "profile",
                              "newPassword",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.profile.confirmPassword}
                          onChange={(e) =>
                            handleInputChange(
                              "profile",
                              "confirmPassword",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Notifikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Notifikasi Email",
                        description: "Terima notifikasi melalui email",
                      },
                      {
                        key: "smsNotifications",
                        label: "Notifikasi SMS",
                        description: "Terima notifikasi melalui SMS",
                      },
                      {
                        key: "pushNotifications",
                        label: "Push Notifications",
                        description: "Terima notifikasi push di browser",
                      },
                      {
                        key: "weeklyReports",
                        label: "Laporan Mingguan",
                        description: "Terima laporan mingguan via email",
                      },
                      {
                        key: "monthlyReports",
                        label: "Laporan Bulanan",
                        description: "Terima laporan bulanan via email",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                              settings.notifications[
                                item.key as keyof typeof settings.notifications
                              ]
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "notifications",
                                item.key,
                                e.target.checked,
                              )
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === "system" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Situs
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.siteName}
                        onChange={(e) =>
                          handleInputChange(
                            "system",
                            "siteName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zona Waktu
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.timezone}
                        onChange={(e) =>
                          handleInputChange(
                            "system",
                            "timezone",
                            e.target.value,
                          )
                        }
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">
                          Asia/Makassar (WITA)
                        </option>
                        <option value="Asia/Jayapura">
                          Asia/Jayapura (WIT)
                        </option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Situs
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.siteDescription}
                        onChange={(e) =>
                          handleInputChange(
                            "system",
                            "siteDescription",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Mode Maintenance
                        </h4>
                        <p className="text-sm text-gray-500">
                          Aktifkan untuk menonaktifkan sementara akses publik
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) =>
                            handleInputChange(
                              "system",
                              "maintenanceMode",
                              e.target.checked,
                            )
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}



            {selectedTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Keamanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Import komponen SecuritySettings */}
                    <SecuritySettings />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
