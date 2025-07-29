"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import AuthWrapper from "./auth-wrapper";
import AddHafalanModal from "@/components/modals/AddHafalanModal";
import HafalanDetailModal from "@/components/modals/HafalanDetailModal";
import {
  QURAN_SURAHS,
  HafalanRecord,
  HafalanProgress,
  HafalanType,
  HafalanStatus,
  HafalanGrade,
  getSurahById,
  calculateHafalanProgress,
  getGradeColor,
  getStatusColor,
} from "@/lib/quran-data";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react";

interface Hafalan {
  id: string;
  santriName: string;
  santriNis: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  type: "SETORAN" | "MURAJAAH" | "TASMI";
  status: "PENDING" | "APPROVED" | "NEEDS_IMPROVEMENT" | "REJECTED";
  grade?: number;
  notes?: string;
  musyrifName: string;
  recordedAt: string;
  createdAt: string;
}

const HafalanPage = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingHafalan, setEditingHafalan] = useState<any>(null);
  const [selectedHafalan, setSelectedHafalan] = useState<any>(null);
  const [hafalanList, setHafalanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load hafalan data
  useEffect(() => {
    if (session?.user) {
      loadHafalanData();
    }
  }, [session]);

  const loadHafalanData = async () => {
    try {
      setLoading(true);
      console.log("?? Loading hafalan data...");

      const response = await fetch("/api/hafalan");
      const data = await response.json();

      if (data.success) {
        console.log("? Hafalan data loaded:", data.hafalan.length, "records");
        // Transform API data to match component expectations
        const transformedData = data.hafalan.map((item: any) => ({
          id: item.id,
          santriId: item.santriId,
          santriName: item.santri?.name || "Unknown",
          santriNis: item.santri?.nis || "",
          surah: item.surahName,
          surahId: item.surahId,
          ayahStart: item.ayahStart?.toString() || "",
          ayahEnd: item.ayahEnd?.toString() || "",
          ayahRange: `${item.ayahStart}-${item.ayahEnd}`,
          type: item.type,
          date: new Date(item.createdAt).toISOString().split("T")[0],
          musyrifId: item.musyrifId,
          musyrifName: item.musyrif?.name || "Unknown",
          tajwid: item.tajwidScore || 0,
          kelancaran: item.fluencyScore || 0,
          fashahah: item.pronunciationScore || 0,
          grade: item.totalScore || 0,
          status: item.status,
          notes: item.notes || "",
          duration: item.duration?.toString() || "0",
          corrections: item.corrections || "",
          recommendations: item.recommendations || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        setHafalanList(transformedData);
      } else {
        console.error("? Failed to load hafalan data:", data.message);
        // Fallback to empty array if API fails
        setHafalanList([]);
      }
    } catch (error) {
      console.error("Error loading hafalan:", error);
      alert("Gagal memuat data hafalan");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHafalan = async (hafalanData: any) => {
    try {
      console.log("?? Creating hafalan...", hafalanData);

      const response = await fetch("/api/hafalan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hafalanData),
      });

      const data = await response.json();

      if (data.success) {
        console.log("? Hafalan created successfully");
        // Reload data to get updated list
        await loadHafalanData();
        return true;
      } else {
        console.error("? Failed to create hafalan:", data.message);
        alert(data.message || "Gagal membuat hafalan");
        return false;
      }
    } catch (error) {
      console.error("? Error creating hafalan:", error);
      alert("Gagal menambahkan evaluasi hafalan");
      return false;
    }
  };

  const handleUpdateHafalan = async (hafalanData: any) => {
    try {
      // Mock update - update local state
      setHafalanList((prev) =>
        prev.map((h) =>
          h.id === editingHafalan?.id
            ? {
                ...hafalanData,
                id: editingHafalan.id,
                updatedAt: new Date().toISOString(),
              }
            : h,
        ),
      );
      alert("Evaluasi hafalan berhasil diperbarui!");
      setEditingHafalan(null);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error updating hafalan:", error);
      alert("Gagal memperbarui evaluasi hafalan");
    }
  };

  const handleDeleteHafalan = async (hafalanId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus evaluasi hafalan ini?"))
      return;

    try {
      // Mock delete - remove from local state
      setHafalanList((prev) => prev.filter((h) => h.id !== hafalanId));
      alert("Evaluasi hafalan berhasil dihapus!");
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error deleting hafalan:", error);
      alert("Gagal menghapus evaluasi hafalan");
    }
  };

  const handleViewDetail = (hafalan: any) => {
    setSelectedHafalan(hafalan);
    setShowDetailModal(true);
  };

  const handleEditHafalan = (hafalan: any) => {
    setEditingHafalan(hafalan);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  // Filter hafalan data
  const filteredHafalan = hafalanList.filter((hafalan) => {
    const matchesSearch =
      hafalan.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hafalan.surah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || hafalan.status === statusFilter;
    const matchesType = typeFilter === "ALL" || hafalan.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const stats = {
    total: hafalanList.length,
    approved: hafalanList.filter((h) => h.status === "APPROVED").length,
    pending: hafalanList.filter((h) => h.status === "PENDING").length,
    needsImprovement: hafalanList.filter(
      (h) => h.status === "NEEDS_IMPROVEMENT",
    ).length,
    averageGrade: Math.round(
      hafalanList
        .filter((h) => h.grade)
        .reduce((sum, h) => sum + (h.grade || 0), 0) /
        hafalanList.filter((h) => h.grade).length || 1,
    ),
  };

  if (loading) {
    return (
      <AuthWrapper>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data hafalan...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthWrapper>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "NEEDS_IMPROVEMENT":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "NEEDS_IMPROVEMENT":
        return "bg-orange-100 text-orange-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SETORAN":
        return "bg-blue-100 text-blue-800";
      case "MURAJAAH":
        return "bg-purple-100 text-purple-800";
      case "TASMI":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AuthWrapper>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manajemen Hafalan
              </h1>
              <p className="text-gray-600">
                Kelola dan pantau progress hafalan santri
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Input Hafalan
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Hafalan
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Disetujui
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.approved}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Perlu Perbaikan
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.needsImprovement}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Rata-rata Nilai
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      {stats.averageGrade}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Hafalan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Cari santri, NIS, atau surah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="PENDING">Pending</option>
                    <option value="NEEDS_IMPROVEMENT">Perlu Perbaikan</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                  >
                    <option value="ALL">Semua Jenis</option>
                    <option value="SETORAN">Setoran</option>
                    <option value="MURAJAAH">Murajaah</option>
                    <option value="TASMI">Tasmi</option>
                  </select>

                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Hafalan Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Santri
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Surah & Ayat
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Jenis
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Nilai
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Musyrif
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHafalan.map((hafalan) => (
                      <tr
                        key={hafalan.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-teal-600">
                                {hafalan.santriName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {hafalan.santriName}
                              </p>
                              <p className="text-sm text-gray-500">
                                NIS: {hafalan.santriNis}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {hafalan.surah}
                            </p>
                            <p className="text-sm text-gray-500">
                              Ayat {hafalan.ayahRange}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hafalan.type)}`}
                          >
                            {hafalan.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(hafalan.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hafalan.status)}`}
                            >
                              {hafalan.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {hafalan.grade ? (
                            <span
                              className={`font-semibold ${getGradeColor(hafalan.grade)}`}
                            >
                              {hafalan.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {hafalan.musyrifName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">
                            {formatDateTime(hafalan.date)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(hafalan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditHafalan(hafalan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredHafalan.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada data hafalan ditemukan
                  </h3>
                  <p className="text-gray-500">
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modals */}
          <AddHafalanModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingHafalan(null);
            }}
            onSave={editingHafalan ? handleUpdateHafalan : handleCreateHafalan}
            editData={editingHafalan}
          />

          <HafalanDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onEdit={() => handleEditHafalan(selectedHafalan)}
            onDelete={() => handleDeleteHafalan(selectedHafalan?.id)}
            hafalan={selectedHafalan}
          />
        </div>
      </DashboardLayout>
    </AuthWrapper>
  );
};

export default HafalanPage;
