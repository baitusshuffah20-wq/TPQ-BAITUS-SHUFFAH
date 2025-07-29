"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Building, MapPin, Phone, Mail, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const ProfileSettings = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("/logo.png");
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    name: "TPQ Baitus Shuffah",
    address: "Jl. Islamic Center No. 123, Jakarta Pusat",
    phone: "021-12345678",
    email: "info@tpqbaitusshuffah.ac.id",
    website: "www.tpqbaitusshuffah.ac.id",
    description:
      "Lembaga Pendidikan Tahfidz Al-Quran yang berfokus pada pembentukan karakter Islami dan pengembangan potensi santri.",
    foundedYear: "2009",
    founderName: "KH. Ahmad Fauzi",
    registrationNumber: "12345/TPQ/2009",
  });

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file logo terlalu besar. Maksimal 2MB.");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan PNG atau JPG.");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
    }
  };

  const clearLogoSelection = () => {
    setLogoPreview("/logo.png");
    setLogoFile(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profil lembaga berhasil disimpan!");
    } catch (error) {
      console.error("Error saving profile settings:", error);
      toast.error("Gagal menyimpan profil lembaga");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo Lembaga
        </label>
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 relative">
            <Image
              src={logoPreview}
              alt="Logo Preview"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                Pilih Logo
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
            {logoFile && (
              <button
                type="button"
                onClick={clearLogoSelection}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Hapus
              </button>
            )}
            <p className="text-xs text-gray-500">
              Format: PNG, JPG. Ukuran maks: 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informasi Dasar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lembaga
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informasi Tambahan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Berdiri
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.foundedYear}
              onChange={(e) => handleInputChange("foundedYear", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pendiri
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.founderName}
              onChange={(e) => handleInputChange("founderName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Registrasi
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.registrationNumber}
              onChange={(e) =>
                handleInputChange("registrationNumber", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi Lembaga
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          value={settings.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>

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
              Simpan Profil Lembaga
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
