"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementBadge } from "@/lib/achievement-data";

interface BadgeFormProps {
  badge?: AchievementBadge;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BadgeForm({
  badge,
  onSubmit,
  onCancel,
  isSubmitting,
}: BadgeFormProps) {
  const isEditing = !!badge;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: badge || {
      name: "",
      nameArabic: "",
      description: "",
      icon: "??",
      color: "#10b981",
      category: "HAFALAN",
      criteriaType: "SURAH_COUNT",
      criteriaValue: 1,
      criteriaCondition: "GREATER_THAN",
      timeframe: "ALL_TIME",
      rarity: "COMMON",
      points: 100,
      isActive: true,
      unlockMessage: "",
      shareMessage: "",
    },
  });

  useEffect(() => {
    if (badge) {
      Object.entries(badge).forEach(([key, value]) => {
        setValue(key as keyof typeof badge, value);
      });
    }
  }, [badge, setValue]);

  const iconOptions = [
    "??",
    "??",
    "?",
    "?",
    "??",
    "??",
    "??",
    "??",
    "??",
    "??",
    "?",
    "??",
    "??",
    "???",
    "??",
    "??",
    "??",
    "??",
    "??",
    "??",
    "??",
    "??",
  ];

  const colorOptions = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#0ea5e9", // Sky
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Badge" : "Tambah Badge Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Badge <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Nama badge wajib diisi" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: Hafidz Juz 30"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Arab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("nameArabic", {
                    required: "Nama Arab wajib diisi",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: ???? ??? ??"
                  dir="rtl"
                />
                {errors.nameArabic && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nameArabic.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description", {
                    required: "Deskripsi wajib diisi",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Deskripsi singkat tentang badge ini"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`text-xl p-2 border rounded-md hover:bg-gray-100 ${
                          watch("icon") === icon
                            ? "bg-teal-100 border-teal-500"
                            : "border-gray-300"
                        }`}
                        onClick={() => setValue("icon", icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    {...register("icon", { required: "Icon wajib diisi" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Emoji atau icon"
                  />
                  {errors.icon && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.icon.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warna <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 rounded-md border ${
                          watch("color") === color
                            ? "ring-2 ring-offset-2 ring-gray-500"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setValue("color", color)}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    {...register("color", { required: "Warna wajib diisi" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Kode warna hex (#10b981)"
                  />
                  {errors.color && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.color.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Badge Properties */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category", {
                      required: "Kategori wajib dipilih",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="HAFALAN">Hafalan</option>
                    <option value="ATTENDANCE">Kehadiran</option>
                    <option value="BEHAVIOR">Perilaku</option>
                    <option value="ACADEMIC">Akademik</option>
                    <option value="SPECIAL">Khusus</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelangkaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("rarity", {
                      required: "Kelangkaan wajib dipilih",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="COMMON">Umum</option>
                    <option value="UNCOMMON">Tidak Umum</option>
                    <option value="RARE">Langka</option>
                    <option value="EPIC">Epik</option>
                    <option value="LEGENDARY">Legendaris</option>
                  </select>
                  {errors.rarity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.rarity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Kriteria <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("criteriaType", {
                      required: "Tipe kriteria wajib dipilih",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="SURAH_COUNT">Jumlah Surah</option>
                    <option value="AYAH_COUNT">Jumlah Ayat</option>
                    <option value="PERFECT_SCORE">Nilai Sempurna</option>
                    <option value="STREAK">Streak Kehadiran</option>
                    <option value="TIME_BASED">Berbasis Waktu</option>
                    <option value="CUSTOM">Kustom</option>
                  </select>
                  {errors.criteriaType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.criteriaType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kondisi Kriteria <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("criteriaCondition", {
                      required: "Kondisi kriteria wajib dipilih",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="GREATER_THAN">
                      Lebih dari atau sama dengan
                    </option>
                    <option value="EQUAL">Sama dengan</option>
                    <option value="LESS_THAN">
                      Kurang dari atau sama dengan
                    </option>
                    <option value="BETWEEN">Di antara</option>
                  </select>
                  {errors.criteriaCondition && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.criteriaCondition.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Kriteria <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("criteriaValue", {
                      required: "Nilai kriteria wajib diisi",
                      min: { value: 1, message: "Nilai minimal 1" },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: 10"
                  />
                  {errors.criteriaValue && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.criteriaValue.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jangka Waktu
                  </label>
                  <select
                    {...register("timeframe")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL_TIME">Sepanjang Waktu</option>
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("points", {
                      required: "Poin wajib diisi",
                      min: { value: 1, message: "Poin minimal 1" },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: 100"
                  />
                  {errors.points && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.points.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register("isActive")}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Aktif
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan Pembuka <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("unlockMessage", {
                    required: "Pesan pembuka wajib diisi",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Pesan yang ditampilkan saat badge terbuka"
                  rows={2}
                />
                {errors.unlockMessage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.unlockMessage.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan Berbagi <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("shareMessage", {
                    required: "Pesan berbagi wajib diisi",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Pesan yang dibagikan saat badge dibagikan"
                  rows={2}
                />
                {errors.shareMessage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.shareMessage.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                  ? "Perbarui Badge"
                  : "Tambah Badge"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
