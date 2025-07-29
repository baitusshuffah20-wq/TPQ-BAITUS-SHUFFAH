"use client";

import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "TPQ Baitus Shuffah",
    siteDescription: "Lembaga Pendidikan Tahfidz Al-Quran",
    timezone: "Asia/Jakarta",
    language: "id",
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Pengaturan umum berhasil disimpan!");
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast.error("Gagal menyimpan pengaturan umum");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Situs
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={settings.siteName}
            onChange={(e) => handleInputChange("siteName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Situs
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={settings.siteDescription}
            onChange={(e) =>
              handleInputChange("siteDescription", e.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zona Waktu
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={settings.timezone}
            onChange={(e) => handleInputChange("timezone", e.target.value)}
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bahasa
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={settings.language}
            onChange={(e) => handleInputChange("language", e.target.value)}
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          checked={settings.maintenanceMode}
          onChange={(e) =>
            handleInputChange("maintenanceMode", e.target.checked)
          }
        />
        <label
          htmlFor="maintenanceMode"
          className="ml-2 block text-sm text-gray-900"
        >
          Aktifkan Mode Pemeliharaan
        </label>
      </div>

      {settings.maintenanceMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Settings className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Saat mode pemeliharaan aktif, situs hanya dapat diakses oleh
                admin.
              </p>
            </div>
          </div>
        </div>
      )}

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
              Simpan Pengaturan Umum
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
