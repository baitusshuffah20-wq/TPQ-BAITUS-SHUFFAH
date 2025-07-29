"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Save, X, BookOpen, Award, Heart, User } from "lucide-react";
import { toast } from "react-hot-toast";

interface Santri {
  id: string;
  nis: string;
  name: string;
}

interface SantriNoteFormData {
  id?: string;
  santriId: string;
  type: string;
  title: string;
  content: string;
  date: string;
}

interface SantriNoteFormProps {
  note?: SantriNoteFormData;
  santriId?: string;
  onSubmit: (data: SantriNoteFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const NOTE_TYPES = [
  {
    value: "PERKEMBANGAN",
    label: "Perkembangan",
    icon: <BookOpen className="h-4 w-4" />,
  },
  { value: "PRESTASI", label: "Prestasi", icon: <Award className="h-4 w-4" /> },
  { value: "PERILAKU", label: "Perilaku", icon: <Heart className="h-4 w-4" /> },
];

export default function SantriNoteForm({
  note,
  santriId,
  onSubmit,
  onCancel,
  isLoading = false,
}: SantriNoteFormProps) {
  const [formData, setFormData] = useState<SantriNoteFormData>({
    santriId: note?.santriId || santriId || "",
    type: note?.type || "PERKEMBANGAN",
    title: note?.title || "",
    content: note?.content || "",
    date: note?.date || new Date().toISOString().split("T")[0],
    ...note,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEdit = !!note?.id;

  useEffect(() => {
    loadSantriList();
  }, []);

  const loadSantriList = async () => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockSantriList: Santri[] = [
          { id: "1", nis: "2023001", name: "Ahmad Fauzi" },
          { id: "2", nis: "2023002", name: "Siti Aisyah" },
          { id: "3", nis: "2023003", name: "Muhammad Ali" },
          { id: "4", nis: "2023004", name: "Fatimah Zahra" },
          { id: "5", nis: "2023005", name: "Abdullah Rahman" },
        ];
        setSantriList(mockSantriList);
        setLoadingData(false);
      }, 500);
    } catch (error) {
      console.error("Error loading santri:", error);
      toast.error("Gagal memuat data santri");
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Santri validation
    if (!formData.santriId) {
      newErrors.santriId = "Santri wajib dipilih";
    }

    // Title validation
    if (!formData.title) {
      newErrors.title = "Judul catatan wajib diisi";
    } else if (formData.title.length < 3) {
      newErrors.title = "Judul catatan minimal 3 karakter";
    }

    // Content validation
    if (!formData.content) {
      newErrors.content = "Isi catatan wajib diisi";
    } else if (formData.content.length < 10) {
      newErrors.content = "Isi catatan minimal 10 karakter";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Tanggal wajib diisi";
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PERKEMBANGAN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PRESTASI":
        return "bg-green-50 text-green-700 border-green-200";
      case "PERILAKU":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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
          <FileText className="h-6 w-6 text-teal-600" />
          {isEdit ? "Edit Catatan Santri" : "Tambah Catatan Santri Baru"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Tanggal *
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Catatan *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {NOTE_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`
                    flex items-center justify-center p-3 rounded-md border cursor-pointer
                    ${formData.type === type.value ? getTypeColor(type.value) : "border-gray-300 hover:bg-gray-50"}
                  `}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: type.value }))
                  }
                >
                  <div className="flex flex-col items-center gap-1">
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Catatan *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Perkembangan Hafalan Juz 1"
              className={errors.title ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi Catatan *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.content ? "border-red-500" : ""}`}
              placeholder="Tuliskan catatan tentang perkembangan, prestasi, atau perilaku santri..."
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
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
              {isLoading ? "Menyimpan..." : "Simpan Catatan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
