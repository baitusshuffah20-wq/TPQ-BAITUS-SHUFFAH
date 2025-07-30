"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Save,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Upload,
  Camera,
} from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: any) => void;
  editData?: any;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    nis: "",
    gender: "LAKI_LAKI",
    birthPlace: "",
    birthDate: "",
    address: "",
    phone: "",
    email: "",

    // Parent/Wali Info
    waliId: "",

    // Academic Info
    halaqahId: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    graduationDate: "",
    status: "ACTIVE",

    // Additional Info
    photo: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [waliList, setWaliList] = useState<any[]>([]);
  const [halaqahList, setHalaqahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wali and halaqah data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWaliList();
      loadHalaqahList();
    }
  }, [isOpen]);

  // Set form data when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        nis: editData.nis || "",
        gender: editData.gender || "LAKI_LAKI",
        birthPlace: editData.birthPlace || "",
        birthDate: editData.birthDate
          ? new Date(editData.birthDate).toISOString().split("T")[0]
          : "",
        address: editData.address || "",
        phone: editData.phone || "",
        email: editData.email || "",
        waliId: editData.waliId || "",
        halaqahId: editData.halaqahId || "",
        enrollmentDate: editData.enrollmentDate
          ? new Date(editData.enrollmentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        graduationDate: editData.graduationDate
          ? new Date(editData.graduationDate).toISOString().split("T")[0]
          : "",
        status: editData.status || "ACTIVE",
        photo: editData.photo || "",
      });

      setAvatarPreview(editData.photo || null);
    } else {
      // Reset form for new student
      setFormData({
        name: "",
        nis: "",
        gender: "LAKI_LAKI",
        birthPlace: "",
        birthDate: "",
        address: "",
        phone: "",
        email: "",
        waliId: "",
        halaqahId: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
        graduationDate: "",
        status: "ACTIVE",
        photo: "",
      });
      setAvatarPreview(null);
    }
  }, [editData, isOpen]);

  const loadWaliList = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users?role=WALI");
      const data = await response.json();

      if (data.success) {
        setWaliList(data.users);
      } else {
        console.error("Failed to load wali list:", data.message);
        // Fallback data
        setWaliList([
          {
            id: "wali1",
            name: "Ahmad (Wali)",
            email: "ahmad@example.com",
            phone: "08123456789",
          },
          {
            id: "wali2",
            name: "Budi (Wali)",
            email: "budi@example.com",
            phone: "08123456790",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading wali list:", error);
      // Fallback data
      setWaliList([
        {
          id: "wali1",
          name: "Ahmad (Wali)",
          email: "ahmad@example.com",
          phone: "08123456789",
        },
        {
          id: "wali2",
          name: "Budi (Wali)",
          email: "budi@example.com",
          phone: "08123456790",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadHalaqahList = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/halaqah");
      const data = await response.json();

      if (data.success) {
        setHalaqahList(data.halaqah);
      } else {
        console.error("Failed to load halaqah list:", data.message);
        // Fallback data
        setHalaqahList([
          { id: "halaqah1", name: "Halaqah Al-Fatihah", level: "Pemula" },
          { id: "halaqah2", name: "Halaqah Al-Baqarah", level: "Menengah" },
        ]);
      }
    } catch (error) {
      console.error("Error loading halaqah list:", error);
      // Fallback data
      setHalaqahList([
        { id: "halaqah1", name: "Halaqah Al-Fatihah", level: "Pemula" },
        { id: "halaqah2", name: "Halaqah Al-Baqarah", level: "Menengah" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.nis.trim()) {
      newErrors.nis = "NIS wajib diisi";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Tanggal lahir wajib diisi";
    }

    if (!formData.birthPlace.trim()) {
      newErrors.birthPlace = "Tempat lahir wajib diisi";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
    }

    if (!formData.waliId) {
      newErrors.waliId = "Wali santri wajib dipilih";
    }

    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = "Tanggal masuk wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const studentData = {
      ...formData,
      photo: avatarPreview,
      id: editData?.id,
    };

    onSave(studentData);

    // Form will be reset by useEffect when modal closes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editData ? "Edit Data Santri" : "Tambah Santri Baru"}
              </CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIS *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.nis ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.nis}
                      onChange={(e) => handleInputChange("nis", e.target.value)}
                      placeholder="Masukkan NIS"
                    />
                    {errors.nis && (
                      <p className="text-red-500 text-sm mt-1">{errors.nis}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                    >
                      <option value="LAKI_LAKI">Laki-laki</option>
                      <option value="PEREMPUAN">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.birthPlace}
                      onChange={(e) =>
                        handleInputChange("birthPlace", e.target.value)
                      }
                      placeholder="Masukkan tempat lahir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.birthDate ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                    />
                    {errors.birthDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                </div>
              </div>

              {/* Wali Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Informasi Wali Santri
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Wali Santri *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.waliId ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.waliId}
                      onChange={(e) =>
                        handleInputChange("waliId", e.target.value)
                      }
                      disabled={loading}
                    >
                      <option value="">-- Pilih Wali Santri --</option>
                      {waliList.map((wali) => (
                        <option key={wali.id} value={wali.id}>
                          {wali.name} - {wali.phone || wali.email}
                        </option>
                      ))}
                    </select>
                    {errors.waliId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.waliId}
                      </p>
                    )}

                    {formData.waliId && waliList.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Detail Wali Santri
                        </h4>
                        {waliList.find((w) => w.id === formData.waliId) && (
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Nama:</span>{" "}
                              {
                                waliList.find((w) => w.id === formData.waliId)
                                  ?.name
                              }
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {
                                waliList.find((w) => w.id === formData.waliId)
                                  ?.email
                              }
                            </p>
                            <p>
                              <span className="font-medium">Telepon:</span>{" "}
                              {waliList.find((w) => w.id === formData.waliId)
                                ?.phone || "-"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Informasi Akademik
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Halaqah
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.halaqahId}
                      onChange={(e) =>
                        handleInputChange("halaqahId", e.target.value)
                      }
                      disabled={loading}
                    >
                      <option value="">-- Belum Ada Halaqah --</option>
                      {halaqahList.map((halaqah) => (
                        <option key={halaqah.id} value={halaqah.id}>
                          {halaqah.name} - {halaqah.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Santri
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Masukkan email santri (opsional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Masuk *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.enrollmentDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={formData.enrollmentDate}
                      onChange={(e) =>
                        handleInputChange("enrollmentDate", e.target.value)
                      }
                    />
                    {errors.enrollmentDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.enrollmentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Kelulusan
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.graduationDate}
                      onChange={(e) =>
                        handleInputChange("graduationDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Tidak Aktif</option>
                      <option value="GRADUATED">Lulus</option>
                      <option value="DROPPED_OUT">Keluar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editData ? "Update" : "Simpan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddStudentModal;
