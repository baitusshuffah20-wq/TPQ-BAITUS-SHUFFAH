"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, User, BookOpen, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Santri {
  id: string;
  nis: string;
  name: string;
}

interface Material {
  id: string;
  title: string;
  halaqahId: string;
}

interface HalaqahProgressFormData {
  id?: string;
  santriId: string;
  materialId: string;
  status: string;
  notes: string;
  grade: number | null;
}

interface HalaqahProgressFormProps {
  progress?: HalaqahProgressFormData;
  santriId?: string;
  materialId?: string;
  onSubmit: (data: HalaqahProgressFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROGRESS_STATUS = [
  { value: "NOT_STARTED", label: "Belum Dimulai" },
  { value: "IN_PROGRESS", label: "Sedang Dipelajari" },
  { value: "COMPLETED", label: "Selesai" },
];

export default function HalaqahProgressForm({
  progress,
  santriId,
  materialId,
  onSubmit,
  onCancel,
  isLoading = false,
}: HalaqahProgressFormProps) {
  const [formData, setFormData] = useState<HalaqahProgressFormData>({
    santriId: progress?.santriId || santriId || "",
    materialId: progress?.materialId || materialId || "",
    status: progress?.status || "NOT_STARTED",
    notes: progress?.notes || "",
    grade: progress?.grade || null,
    ...progress,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [materialList, setMaterialList] = useState<Material[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEdit = !!progress?.id;

  useEffect(() => {
    loadSantriList();
    loadMaterialList();
  }, []);

  const loadSantriList = async () => {
    try {
      const response = await fetch("/api/santri?status=ACTIVE");
      if (response.ok) {
        const data = await response.json();
        setSantriList(data.santri || []);
      }
    } catch (error) {
      console.error("Error loading santri:", error);
      toast.error("Gagal memuat data santri");
    } finally {
      setLoadingData(false);
    }
  };

  const loadMaterialList = async () => {
    try {
      const response = await fetch("/api/halaqah/materials");
      if (response.ok) {
        const data = await response.json();
        setMaterialList(data.materials || []);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
      toast.error("Gagal memuat data materi");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Santri validation
    if (!formData.santriId) {
      newErrors.santriId = "Santri wajib dipilih";
    }

    // Material validation
    if (!formData.materialId) {
      newErrors.materialId = "Materi wajib dipilih";
    }

    // Grade validation
    if (
      formData.grade !== null &&
      (formData.grade < 0 || formData.grade > 100)
    ) {
      newErrors.grade = "Nilai harus antara 0 dan 100";
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

    if (name === "grade") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-teal-600" />
          {isEdit ? "Edit Progres Santri" : "Catat Progres Santri"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Santri *
              </label>
              <select
                name="santriId"
                value={formData.santriId}
                onChange={handleChange}
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.santriId ? "border-red-500" : ""}`}
                disabled={isLoading || !!santriId}
              >
                <option value="">Pilih Santri</option>
                {santriList.map((santri) => (
                  <option key={santri.id} value={santri.id}>
                    {santri.name} ({santri.nis})
                  </option>
                ))}
              </select>
              {errors.santriId && (
                <p className="text-red-500 text-xs mt-1">{errors.santriId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materi *
              </label>
              <select
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.materialId ? "border-red-500" : ""}`}
                disabled={isLoading || !!materialId}
              >
                <option value="">Pilih Materi</option>
                {materialList.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.title}
                  </option>
                ))}
              </select>
              {errors.materialId && (
                <p className="text-red-500 text-xs mt-1">{errors.materialId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isLoading}
              >
                {PROGRESS_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai (0-100)
              </label>
              <Input
                type="number"
                name="grade"
                value={formData.grade === null ? "" : formData.grade}
                onChange={handleChange}
                placeholder="Nilai (opsional)"
                min={0}
                max={100}
                className={errors.grade ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.grade && (
                <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Catatan tentang progres santri (opsional)"
                disabled={isLoading}
              />
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
              {isLoading ? "Menyimpan..." : "Simpan Progres"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
