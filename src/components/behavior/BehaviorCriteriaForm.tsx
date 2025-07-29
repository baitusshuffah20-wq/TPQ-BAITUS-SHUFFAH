"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface BehaviorCriteria {
  id?: string;
  name: string;
  nameArabic: string;
  description: string;
  category:
    | "AKHLAQ"
    | "IBADAH"
    | "ACADEMIC"
    | "SOCIAL"
    | "DISCIPLINE"
    | "LEADERSHIP";
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  points: number;
  isActive: boolean;
  ageGroup: string;
  examples: string[];
  consequences?: string[];
  rewards?: string[];
  islamicReference?: {
    quranVerse?: string;
    hadith?: string;
    explanation?: string;
  };
}

interface BehaviorCriteriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editData?: BehaviorCriteria | null;
  title: string;
}

export default function BehaviorCriteriaForm({
  isOpen,
  onClose,
  onSave,
  editData,
  title,
}: BehaviorCriteriaFormProps) {
  const [formData, setFormData] = useState<BehaviorCriteria>({
    name: "",
    nameArabic: "",
    description: "",
    category: "AKHLAQ",
    type: "POSITIVE",
    severity: "LOW",
    points: 0,
    isActive: true,
    ageGroup: "5+",
    examples: [""],
    consequences: [""],
    rewards: [""],
    islamicReference: {
      quranVerse: "",
      hadith: "",
      explanation: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        examples: editData.examples.length > 0 ? editData.examples : [""],
        consequences:
          editData.consequences && editData.consequences.length > 0
            ? editData.consequences
            : [""],
        rewards:
          editData.rewards && editData.rewards.length > 0
            ? editData.rewards
            : [""],
        islamicReference: editData.islamicReference || {
          quranVerse: "",
          hadith: "",
          explanation: "",
        },
      });
    } else {
      // Reset form for new criteria
      setFormData({
        name: "",
        nameArabic: "",
        description: "",
        category: "AKHLAQ",
        type: "POSITIVE",
        severity: "LOW",
        points: 0,
        isActive: true,
        ageGroup: "5+",
        examples: [""],
        consequences: [""],
        rewards: [""],
        islamicReference: {
          quranVerse: "",
          hadith: "",
          explanation: "",
        },
      });
    }
  }, [editData, isOpen]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayChange = (
    field: "examples" | "consequences" | "rewards",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        prev[field]?.map((item, i) => (i === index ? value : item)) || [],
    }));
  };

  const addArrayItem = (field: "examples" | "consequences" | "rewards") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const removeArrayItem = (
    field: "examples" | "consequences" | "rewards",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleIslamicReferenceChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      islamicReference: {
        ...prev.islamicReference,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("💾 Submitting form data:", formData);

      // Validate required fields
      const errors: Record<string, string> = {};

      if (!formData.name.trim()) {
        errors.name = "Nama kriteria wajib diisi";
      }
      if (!formData.nameArabic.trim()) {
        errors.nameArabic = "Nama Arab wajib diisi";
      }
      if (!formData.description.trim()) {
        errors.description = "Deskripsi wajib diisi";
      }
      if (formData.examples.filter((item) => item.trim() !== "").length === 0) {
        errors.examples = "Minimal satu contoh perilaku harus diisi";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Mohon lengkapi semua field yang wajib diisi");
        setLoading(false);
        return;
      }

      // Clear validation errors
      setValidationErrors({});

      // Clean up empty strings from arrays
      const islamicRef = {
        quranVerse: formData.islamicReference?.quranVerse?.trim() || "",
        hadith: formData.islamicReference?.hadith?.trim() || "",
        explanation: formData.islamicReference?.explanation?.trim() || "",
      };

      const cleanedData: Partial<BehaviorCriteria> = {
        ...formData,
        examples: formData.examples.filter((item) => item.trim() !== ""),
        consequences:
          formData.consequences?.filter((item) => item.trim() !== "") || [],
        rewards: formData.rewards?.filter((item) => item.trim() !== "") || [],
      };

      // Only include islamic reference if at least one field has content
      if (
        islamicRef.quranVerse ||
        islamicRef.hadith ||
        islamicRef.explanation
      ) {
        cleanedData.islamicReference = islamicRef;
      }

      console.log("🧹 Cleaned data:", cleanedData);

      const url = "/api/behavior-criteria";
      const method = editData ? "PUT" : "POST";
      const body = editData ? { id: editData.id, ...cleanedData } : cleanedData;

      console.log(`📡 ${method} request to ${url}:`, body);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("📡 Response status:", response.status);
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (data.success) {
        toast.success(
          editData
            ? "Kriteria berhasil diperbarui"
            : "Kriteria berhasil ditambahkan",
        );
        onSave();
        onClose();
      } else {
        console.error("❌ API error:", data);
        if (data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).flat();
          toast.error(`Validasi gagal: ${errorMessages.join(", ")}`);
        } else {
          toast.error(data.message || "Gagal menyimpan kriteria");
        }
      }
    } catch (error) {
      console.error("❌ Network error saving criteria:", error);
      toast.error("Gagal terhubung ke server. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kriteria <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  validationErrors.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Arab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameArabic}
                onChange={(e) =>
                  handleInputChange("nameArabic", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  validationErrors.nameArabic
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                required
                dir="rtl"
              />
              {validationErrors.nameArabic && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.nameArabic}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                validationErrors.description
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              required
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="AKHLAQ">Akhlaq</option>
                <option value="IBADAH">Ibadah</option>
                <option value="ACADEMIC">Akademik</option>
                <option value="SOCIAL">Sosial</option>
                <option value="DISCIPLINE">Disiplin</option>
                <option value="LEADERSHIP">Kepemimpinan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="POSITIVE">Positif</option>
                <option value="NEGATIVE">Negatif</option>
                <option value="NEUTRAL">Netral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
                <option value="CRITICAL">Kritis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poin <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  handleInputChange("points", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Age Group and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelompok Usia
              </label>
              <input
                type="text"
                value={formData.ageGroup}
                onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                placeholder="Contoh: 5+, 7-12, 13+"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Aktif</label>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contoh Perilaku <span className="text-red-500">*</span>
            </label>
            {validationErrors.examples && (
              <p className="text-red-500 text-sm mb-2">
                {validationErrors.examples}
              </p>
            )}
            <div className="space-y-2">
              {formData.examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={example}
                    onChange={(e) =>
                      handleArrayChange("examples", index, e.target.value)
                    }
                    placeholder={`Contoh ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required={index === 0}
                  />
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("examples", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("examples")}
                className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Contoh
              </button>
            </div>
          </div>

          {/* Consequences (for negative behaviors) */}
          {formData.type === "NEGATIVE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konsekuensi
              </label>
              <div className="space-y-2">
                {formData.consequences?.map((consequence, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={consequence}
                      onChange={(e) =>
                        handleArrayChange("consequences", index, e.target.value)
                      }
                      placeholder={`Konsekuensi ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {(formData.consequences?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("consequences", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )) || []}
                <button
                  type="button"
                  onClick={() => addArrayItem("consequences")}
                  className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Konsekuensi
                </button>
              </div>
            </div>
          )}

          {/* Rewards (for positive behaviors) */}
          {formData.type === "POSITIVE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penghargaan
              </label>
              <div className="space-y-2">
                {formData.rewards?.map((reward, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={reward}
                      onChange={(e) =>
                        handleArrayChange("rewards", index, e.target.value)
                      }
                      placeholder={`Penghargaan ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {(formData.rewards?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("rewards", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )) || []}
                <button
                  type="button"
                  onClick={() => addArrayItem("rewards")}
                  className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Penghargaan
                </button>
              </div>
            </div>
          )}

          {/* Islamic Reference */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Referensi Islam
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ayat Al-Qur'an
                </label>
                <input
                  type="text"
                  value={formData.islamicReference?.quranVerse || ""}
                  onChange={(e) =>
                    handleIslamicReferenceChange("quranVerse", e.target.value)
                  }
                  placeholder="Contoh: QS. Al-Baqarah: 183"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hadits
                </label>
                <textarea
                  value={formData.islamicReference?.hadith || ""}
                  onChange={(e) =>
                    handleIslamicReferenceChange("hadith", e.target.value)
                  }
                  rows={2}
                  placeholder="Teks hadits dalam bahasa Arab"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penjelasan
                </label>
                <textarea
                  value={formData.islamicReference?.explanation || ""}
                  onChange={(e) =>
                    handleIslamicReferenceChange("explanation", e.target.value)
                  }
                  rows={3}
                  placeholder="Penjelasan atau terjemahan dalam bahasa Indonesia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
