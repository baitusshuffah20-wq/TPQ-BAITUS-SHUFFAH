"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SantriAvatar from "@/components/ui/SantriAvatar";
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Award,
  Clock,
  Edit,
  Trash2,
  Download,
} from "lucide-react";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  student: any;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  student,
}) => {
  if (!isOpen || !student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "GRADUATED":
        return "bg-blue-100 text-blue-800";
      case "DROPPED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Aktif";
      case "INACTIVE":
        return "Tidak Aktif";
      case "GRADUATED":
        return "Lulus";
      case "DROPPED":
        return "Keluar";
      default:
        return status;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Santri</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <SantriAvatar
                  name={student.name || "Santri"}
                  photo={student.photo || student.avatar}
                  size="xl"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {student.name}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      NIS: {student.nis}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {student.birthDate
                        ? `${calculateAge(student.birthDate)} tahun`
                        : "-"}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {student.halaqah?.name || "Belum ada halaqah"}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {student.halaqah?.musyrif?.name || "-"}
                    </div>
                  </div>
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
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-gray-900">{student.name || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      NIS
                    </label>
                    <p className="text-gray-900">{student.nis || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Jenis Kelamin
                    </label>
                    <p className="text-gray-900">
                      {student.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tempat, Tanggal Lahir
                    </label>
                    <p className="text-gray-900">
                      {student.birthPlace && student.birthDate
                        ? `${student.birthPlace}, ${new Date(student.birthDate).toLocaleDateString("id-ID")}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nomor Telepon
                    </label>
                    <p className="text-gray-900">{student.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tanggal Masuk
                    </label>
                    <p className="text-gray-900">
                      {student.enrollmentDate
                        ? new Date(student.enrollmentDate).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Alamat
                    </label>
                    <p className="text-gray-900">{student.address || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Informasi Orang Tua
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nama Wali
                    </label>
                    <p className="text-gray-900">{student.wali?.name || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nomor Telepon
                    </label>
                    <p className="text-gray-900">
                      {student.wali?.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {student.wali?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ID Wali
                    </label>
                    <p className="text-gray-900">{student.wali?.id || "-"}</p>
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
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Halaqah
                    </label>
                    <p className="text-gray-900">
                      {student.halaqah?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Musyrif
                    </label>
                    <p className="text-gray-900">
                      {student.halaqah?.musyrif?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tanggal Kelulusan
                    </label>
                    <p className="text-gray-900">
                      {student.graduationDate
                        ? new Date(student.graduationDate).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Ringkasan Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {student.hafalan?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Hafalan</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {student.attendance?.filter((a) => a.status === "PRESENT")
                        .length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Kehadiran</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {student.payments?.filter((p) => p.status === "PAID")
                        .length || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Pembayaran Lunas
                    </div>
                  </div>
                </div>
              </div>

              {/* Hafalan Information */}
              {student.hafalan && student.hafalan.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Hafalan Terbaru
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Surah</th>
                          <th className="px-4 py-2 text-left">Ayat</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.hafalan.map((h: any) => (
                          <tr key={h.id} className="border-b">
                            <td className="px-4 py-2">{h.surahName}</td>
                            <td className="px-4 py-2">
                              {h.ayahStart}-{h.ayahEnd}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  h.status === "APPROVED"
                                    ? "bg-green-100 text-green-800"
                                    : h.status === "NEEDS_IMPROVEMENT"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {h.status === "APPROVED"
                                  ? "Disetujui"
                                  : h.status === "NEEDS_IMPROVEMENT"
                                    ? "Perlu Perbaikan"
                                    : "Ditolak"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {h.recordedAt
                                ? new Date(h.recordedAt).toLocaleDateString(
                                    "id-ID",
                                  )
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={onDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Santri
                </Button>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Data
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetailModal;
