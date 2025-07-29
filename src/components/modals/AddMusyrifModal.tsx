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
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  FileText,
} from "lucide-react";

interface Education {
  id?: string;
  institution: string;
  degree: string;
  year: string;
  description?: string;
}

interface Experience {
  id?: string;
  position: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  description?: string;
}

interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  description?: string;
  documentUrl?: string;
  documentFile?: File;
}

interface AddMusyrifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (musyrifData: any) => void;
  editData?: any;
  halaqahList: any[];
}

const AddMusyrifModal: React.FC<AddMusyrifModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  halaqahList,
}) => {
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    gender: "MALE",
    birthPlace: "",
    birthDate: "",
    address: "",
    phone: "",
    email: "",

    // Academic Info
    specialization: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
    halaqahId: "",

    // User Account
    userId: "",
    createAccount: false,
    password: "",
  });

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);

  // Load user list when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserList();
    }
  }, [isOpen]);

  // Set form data when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        gender: editData.gender || "MALE",
        birthPlace: editData.birthPlace || "",
        birthDate: editData.birthDate
          ? new Date(editData.birthDate).toISOString().split("T")[0]
          : "",
        address: editData.address || "",
        phone: editData.phone || "",
        email: editData.email || "",
        specialization: editData.specialization || "",
        joinDate: editData.joinDate
          ? new Date(editData.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: editData.status || "ACTIVE",
        halaqahId: editData.halaqahId || "",
        userId: editData.userId || "",
        createAccount: false,
        password: "",
      });

      setAvatarPreview(editData.photo || null);

      // Set education, experience, and certificates if available
      if (editData.education && Array.isArray(editData.education)) {
        setEducation(editData.education);
      }

      if (editData.experience && Array.isArray(editData.experience)) {
        setExperience(editData.experience);
      }

      if (editData.certificates && Array.isArray(editData.certificates)) {
        setCertificates(editData.certificates);
      }
    } else {
      // Reset form for new musyrif
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "MALE",
      birthPlace: "",
      birthDate: "",
      address: "",
      phone: "",
      email: "",
      specialization: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      halaqahId: "",
      userId: "",
      createAccount: false,
      password: "",
    });
    setEducation([]);
    setExperience([]);
    setCertificates([]);
    setAvatarPreview(null);
    setAvatarFile(null);
    setErrors({});
    setActiveTab("personal");
  };

  const loadUserList = async () => {
    try {
      setLoading(true);

      console.log("Fetching user data from API...");
      const response = await fetch("/api/users?role=MUSYRIF", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Disable caching
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);

      if (data.success) {
        setUserList(data.users);
        console.log("Loaded user data:", data.users);
      } else {
        console.error("Failed to load user list:", data.message);
        // Fallback data
        console.log("Using mock data as fallback");
        setUserList([
          {
            id: "user1",
            name: "Ustadz Abdullah",
            email: "ustadz.abdullah@rumahtahfidz.com",
            role: "MUSYRIF",
          },
          {
            id: "user2",
            name: "Ustadz Ahmad",
            email: "ustadz.ahmad@rumahtahfidz.com",
            role: "MUSYRIF",
          },
          {
            id: "user3",
            name: "Ustadz Rahman",
            email: "ustadz.rahman@rumahtahfidz.com",
            role: "MUSYRIF",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading user list:", error);
      // Fallback data
      console.log("Using mock data as fallback due to error");
      setUserList([
        {
          id: "user1",
          name: "Ustadz Abdullah",
          email: "ustadz.abdullah@rumahtahfidz.com",
          role: "MUSYRIF",
        },
        {
          id: "user2",
          name: "Ustadz Ahmad",
          email: "ustadz.ahmad@rumahtahfidz.com",
          role: "MUSYRIF",
        },
        {
          id: "user3",
          name: "Ustadz Rahman",
          email: "ustadz.rahman@rumahtahfidz.com",
          role: "MUSYRIF",
        },
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

  // Education handlers
  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        institution: "",
        degree: "",
        year: "",
        description: "",
      },
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string,
  ) => {
    setEducation((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    );
  };

  const removeEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // Experience handlers
  const addExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        position: "",
        organization: "",
        startDate: "",
        endDate: null,
        description: "",
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string | null,
  ) => {
    setExperience((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    );
  };

  const removeExperience = (index: number) => {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  // Certificate handlers
  const addCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      {
        name: "",
        issuer: "",
        issueDate: "",
        description: "",
        documentUrl: "",
      },
    ]);
  };

  const updateCertificate = (
    index: number,
    field: keyof Certificate,
    value: string,
  ) => {
    setCertificates((prev) =>
      prev.map((cert, i) => (i === index ? { ...cert, [field]: value } : cert)),
    );
  };

  const handleCertificateFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificates((prev) =>
        prev.map((cert, i) =>
          i === index ? { ...cert, documentFile: file } : cert,
        ),
      );
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.joinDate) {
      newErrors.joinDate = "Tanggal bergabung wajib diisi";
    }

    if (formData.createAccount && !formData.password) {
      newErrors.password = "Password wajib diisi jika membuat akun baru";
    }

    // Validate education
    education.forEach((edu, index) => {
      if (!edu.institution.trim()) {
        newErrors[`education_${index}_institution`] = "Institusi wajib diisi";
      }
      if (!edu.degree.trim()) {
        newErrors[`education_${index}_degree`] = "Gelar/Jurusan wajib diisi";
      }
      if (!edu.year.trim()) {
        newErrors[`education_${index}_year`] = "Tahun wajib diisi";
      }
    });

    // Validate experience
    experience.forEach((exp, index) => {
      if (!exp.position.trim()) {
        newErrors[`experience_${index}_position`] = "Posisi wajib diisi";
      }
      if (!exp.organization.trim()) {
        newErrors[`experience_${index}_organization`] =
          "Organisasi wajib diisi";
      }
      if (!exp.startDate) {
        newErrors[`experience_${index}_startDate`] =
          "Tanggal mulai wajib diisi";
      }
    });

    // Validate certificates
    certificates.forEach((cert, index) => {
      if (!cert.name.trim()) {
        newErrors[`certificate_${index}_name`] = "Nama sertifikat wajib diisi";
      }
      if (!cert.issuer.trim()) {
        newErrors[`certificate_${index}_issuer`] = "Penerbit wajib diisi";
      }
      if (!cert.issueDate) {
        newErrors[`certificate_${index}_issueDate`] =
          "Tanggal terbit wajib diisi";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const musyrifData = {
      ...formData,
      education,
      experience,
      certificates,
      photo: avatarPreview,
      id: editData?.id,
    };

    onSave(musyrifData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editData ? "Edit Data Musyrif" : "Tambah Musyrif Baru"}
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
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "personal"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Informasi Pribadi
                </button>
                <button
                  onClick={() => setActiveTab("education")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "education"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  Pendidikan
                </button>
                <button
                  onClick={() => setActiveTab("experience")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "experience"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  Pengalaman
                </button>
                <button
                  onClick={() => setActiveTab("certificates")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "certificates"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Sertifikat
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "account"
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Akun
                </button>
              </nav>
            </div>

            <div className="space-y-8">
              {/* Personal Information Tab */}
              {activeTab === "personal" && (
                <>
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
                      <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors">
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
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
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
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tempat Lahir *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.birthPlace
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={formData.birthPlace}
                          onChange={(e) =>
                            handleInputChange("birthPlace", e.target.value)
                          }
                          placeholder="Masukkan tempat lahir"
                        />
                        {errors.birthPlace && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.birthPlace}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.birthDate
                              ? "border-red-500"
                              : "border-gray-300"
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
                          Nomor Telepon *
                        </label>
                        <input
                          type="tel"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Masukkan nomor telepon"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Masukkan email"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alamat *
                        </label>
                        <textarea
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.address
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder="Masukkan alamat lengkap"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.address}
                          </p>
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
                          Spesialisasi
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={formData.specialization}
                          onChange={(e) =>
                            handleInputChange("specialization", e.target.value)
                          }
                          placeholder="Contoh: Tahfidz, Tahsin, Tafsir"
                        />
                      </div>

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
                          <option value="">-- Pilih Halaqah --</option>
                          {halaqahList.map((halaqah) => (
                            <option key={halaqah.id} value={halaqah.id}>
                              {halaqah.name} - {halaqah.level} (
                              {halaqah.santriCount || 0} santri)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Bergabung *
                        </label>
                        <input
                          type="date"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            errors.joinDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={formData.joinDate}
                          onChange={(e) =>
                            handleInputChange("joinDate", e.target.value)
                          }
                        />
                        {errors.joinDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.joinDate}
                          </p>
                        )}
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
                          <option value="ON_LEAVE">Cuti</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Education Tab */}
              {activeTab === "education" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Riwayat Pendidikan
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addEducation}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Pendidikan
                    </Button>
                  </div>

                  {education.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada data pendidikan
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Tambahkan riwayat pendidikan untuk musyrif ini.
                      </p>
                      <Button
                        variant="outline"
                        onClick={addEducation}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Pendidikan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">
                              Pendidikan {index + 1}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Institusi *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`education_${index}_institution`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "institution",
                                    e.target.value,
                                  )
                                }
                                placeholder="Nama institusi pendidikan"
                              />
                              {errors[`education_${index}_institution`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`education_${index}_institution`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gelar/Jurusan *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`education_${index}_degree`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "degree",
                                    e.target.value,
                                  )
                                }
                                placeholder="Gelar atau jurusan"
                              />
                              {errors[`education_${index}_degree`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`education_${index}_degree`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tahun Lulus *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`education_${index}_year`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={edu.year}
                                onChange={(e) =>
                                  updateEducation(index, "year", e.target.value)
                                }
                                placeholder="Tahun lulus"
                              />
                              {errors[`education_${index}_year`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`education_${index}_year`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={edu.description || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Deskripsi tambahan (opsional)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Pengalaman Kerja
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addExperience}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Pengalaman
                    </Button>
                  </div>

                  {experience.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada data pengalaman
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Tambahkan pengalaman kerja untuk musyrif ini.
                      </p>
                      <Button
                        variant="outline"
                        onClick={addExperience}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Pengalaman
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {experience.map((exp, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">
                              Pengalaman {index + 1}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(index)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Posisi/Jabatan *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`experience_${index}_position`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={exp.position}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "position",
                                    e.target.value,
                                  )
                                }
                                placeholder="Posisi atau jabatan"
                              />
                              {errors[`experience_${index}_position`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`experience_${index}_position`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organisasi/Perusahaan *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`experience_${index}_organization`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={exp.organization}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "organization",
                                    e.target.value,
                                  )
                                }
                                placeholder="Nama organisasi atau perusahaan"
                              />
                              {errors[`experience_${index}_organization`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`experience_${index}_organization`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Mulai *
                              </label>
                              <input
                                type="date"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`experience_${index}_startDate`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={exp.startDate}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                              />
                              {errors[`experience_${index}_startDate`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`experience_${index}_startDate`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Selesai
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="date"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  value={exp.endDate || ""}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "endDate",
                                      e.target.value || null,
                                    )
                                  }
                                  disabled={exp.endDate === null}
                                />
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={exp.endDate === null}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        updateExperience(
                                          index,
                                          "endDate",
                                          null,
                                        );
                                      } else {
                                        updateExperience(index, "endDate", "");
                                      }
                                    }}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Masih bekerja
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi
                              </label>
                              <textarea
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={exp.description || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Deskripsi tugas dan tanggung jawab (opsional)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Certificates Tab */}
              {activeTab === "certificates" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Sertifikat & Dokumen
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCertificate}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Sertifikat
                    </Button>
                  </div>

                  {certificates.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada sertifikat
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Tambahkan sertifikat dan dokumen untuk musyrif ini.
                      </p>
                      <Button
                        variant="outline"
                        onClick={addCertificate}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Sertifikat
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">
                              Sertifikat {index + 1}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertificate(index)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Sertifikat *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`certificate_${index}_name`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={cert.name}
                                onChange={(e) =>
                                  updateCertificate(
                                    index,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder="Nama sertifikat"
                              />
                              {errors[`certificate_${index}_name`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`certificate_${index}_name`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Penerbit *
                              </label>
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`certificate_${index}_issuer`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={cert.issuer}
                                onChange={(e) =>
                                  updateCertificate(
                                    index,
                                    "issuer",
                                    e.target.value,
                                  )
                                }
                                placeholder="Lembaga penerbit sertifikat"
                              />
                              {errors[`certificate_${index}_issuer`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`certificate_${index}_issuer`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Terbit *
                              </label>
                              <input
                                type="date"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors[`certificate_${index}_issueDate`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={cert.issueDate}
                                onChange={(e) =>
                                  updateCertificate(
                                    index,
                                    "issueDate",
                                    e.target.value,
                                  )
                                }
                              />
                              {errors[`certificate_${index}_issueDate`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`certificate_${index}_issueDate`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dokumen Sertifikat
                              </label>
                              <div className="flex items-center space-x-2">
                                <label className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Upload className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {cert.documentFile
                                      ? cert.documentFile.name
                                      : "Pilih file"}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                      handleCertificateFileChange(index, e)
                                    }
                                    className="hidden"
                                  />
                                </label>
                                {cert.documentUrl && (
                                  <a
                                    href={cert.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                  >
                                    Lihat
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Format: PDF, JPG, PNG (maks. 5MB)
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi
                              </label>
                              <textarea
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={cert.description || ""}
                                onChange={(e) =>
                                  updateCertificate(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Deskripsi sertifikat (opsional)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Informasi Akun
                  </h3>

                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-yellow-800">
                        Akun musyrif digunakan untuk login ke sistem. Setiap
                        musyrif harus memiliki akun dengan role MUSYRIF.
                      </p>
                    </div>

                    {!editData ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="createAccount"
                            checked={formData.createAccount}
                            onChange={(e) =>
                              handleInputChange(
                                "createAccount",
                                e.target.checked ? "true" : "false",
                              )
                            }
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor="createAccount"
                            className="text-sm font-medium text-gray-700"
                          >
                            Buat akun baru untuk musyrif ini
                          </label>
                        </div>

                        {formData.createAccount ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email (Username)
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                value={formData.email}
                                disabled
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Email akan digunakan sebagai username
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                              </label>
                              <input
                                type="password"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                  errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                value={formData.password}
                                onChange={(e) =>
                                  handleInputChange("password", e.target.value)
                                }
                                placeholder="Masukkan password"
                              />
                              {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.password}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pilih Akun Musyrif
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              value={formData.userId}
                              onChange={(e) =>
                                handleInputChange("userId", e.target.value)
                              }
                              disabled={loading}
                            >
                              <option value="">-- Pilih Akun --</option>
                              {userList.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} - {user.email}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Pilih akun yang sudah ada dengan role MUSYRIF
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Akun Terhubung
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={formData.userId}
                          onChange={(e) =>
                            handleInputChange("userId", e.target.value)
                          }
                          disabled={loading}
                        >
                          <option value="">-- Tidak Ada Akun --</option>
                          {userList.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} - {user.email}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Anda dapat mengubah akun yang terhubung dengan musyrif
                          ini
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div>
                  {activeTab !== "personal" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const tabs = [
                          "personal",
                          "education",
                          "experience",
                          "certificates",
                          "account",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                    >
                      Sebelumnya
                    </Button>
                  )}
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                  {activeTab !== "account" ? (
                    <Button
                      onClick={() => {
                        const tabs = [
                          "personal",
                          "education",
                          "experience",
                          "certificates",
                          "account",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Selanjutnya
                    </Button>
                  ) : (
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {editData ? "Update" : "Simpan"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMusyrifModal;
