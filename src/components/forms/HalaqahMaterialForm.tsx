"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Save, X, Upload, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

interface HalaqahMaterialFormData {
  id?: string;
  title: string;
  description: string;
  content: string;
  fileUrl: string;
  order: number;
  halaqahId: string;
}

interface HalaqahMaterialFormProps {
  material?: HalaqahMaterialFormData;
  halaqahId?: string;
  onSubmit: (data: HalaqahMaterialFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function HalaqahMaterialForm({
  material,
  halaqahId,
  onSubmit,
  onCancel,
  isLoading = false,
}: HalaqahMaterialFormProps) {
  const [formData, setFormData] = useState<HalaqahMaterialFormData>({
    title: material?.title || "",
    description: material?.description || "",
    content: material?.content || "",
    fileUrl: material?.fileUrl || "",
    order: material?.order || 1,
    halaqahId: material?.halaqahId || halaqahId || "",
    ...material,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!material?.id;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title) {
      newErrors.title = "Judul materi wajib diisi";
    } else if (formData.title.length < 3) {
      newErrors.title = "Judul materi minimal 3 karakter";
    }

    // HalaqahId validation
    if (!formData.halaqahId) {
      newErrors.halaqahId = "ID halaqah wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a placeholder for file upload functionality
    // In a real implementation, you would handle file upload to a server or cloud storage
    toast.info("Fitur upload file akan tersedia dalam update mendatang");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" />
          {isEdit ? "Edit Materi" : "Tambah Materi Baru"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informasi Materi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Materi *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Pengenalan Huruf Hijaiyah"
                  className={errors.title ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Deskripsi singkat tentang materi ini"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten Materi
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Isi materi pembelajaran"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan
                </label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min={1}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Pendukung
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleChange}
                    placeholder="URL file pendukung"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </div>
                {formData.fileUrl && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-teal-600">
                    <FileText className="h-4 w-4" />
                    <a
                      href={formData.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Menyimpan..." : "Simpan Materi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
