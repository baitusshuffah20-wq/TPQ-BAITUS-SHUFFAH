"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BookOpen,
  User,
  Calendar,
  Star,
  BarChart2,
  Target,
  BookMarked,
} from "lucide-react";

interface HafalanProgress {
  id: string;
  santriId: string;
  santriName?: string;
  santriNis?: string;
  surahId: number;
  surahName: string;
  totalAyah: number;
  memorized: number;
  inProgress: number;
  lastAyah: number;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ProgressHafalanPage = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showInputModal, setShowInputModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProgress, setSelectedProgress] =
    useState<HafalanProgress | null>(null);
  const [progressList, setProgressList] = useState<HafalanProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [surahList, setSurahList] = useState<any[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    santriId: "",
    surahId: "",
    surahName: "",
    totalAyah: 0,
    memorized: 0,
    inProgress: 0,
    lastAyah: 0,
    targetDate: "",
    status: "IN_PROGRESS",
    notes: "",
  });

  const [updateData, setUpdateData] = useState({
    memorized: 0,
    inProgress: 0,
    lastAyah: 0,
    targetDate: "",
    status: "IN_PROGRESS",
    notes: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "MUSYRIF") {
        router.push("/login");
      } else {
        setUser(parsedUser);
        loadProgressData();
        loadSantriData();
        loadSurahData();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      console.log("Fetching hafalan progress data from API...");
      const response = await fetch("/api/hafalan-progress", {
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
        // Process the data to ensure it has the expected format
        const processedData = data.progress.map((p: any) => ({
          id: p.id,
          santriId: p.santriId,
          santriName: p.santri?.name || "Unknown",
          santriNis: p.santri?.nis || "Unknown",
          surahId: p.surahId,
          surahName: p.surahName,
          totalAyah: p.totalAyah,
          memorized: p.memorized,
          inProgress: p.inProgress,
          lastAyah: p.lastAyah,
          startDate: p.startDate,
          targetDate: p.targetDate,
          completedAt: p.completedAt,
          status: p.status,
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));

        setProgressList(processedData);
        console.log("Loaded progress data:", processedData);
      } else {
        console.error("Failed to load progress data:", data.message);
        // Fallback to empty array if API fails
        setProgressList([]);
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
      // Fallback to empty array if API fails
      setProgressList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSantriData = async () => {
    try {
      const response = await fetch("/api/santri", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setSantriList(data.santri);
      } else {
        console.error("Failed to load santri data:", data.message);
        // Fallback data
        setSantriList([
          { id: "1", name: "Ahmad Fauzi", nis: "24001" },
          { id: "2", name: "Siti Aisyah", nis: "24002" },
          { id: "3", name: "Muhammad Rizki", nis: "24003" },
        ]);
      }
    } catch (error) {
      console.error("Error loading santri data:", error);
      // Fallback data
      setSantriList([
        { id: "1", name: "Ahmad Fauzi", nis: "24001" },
        { id: "2", name: "Siti Aisyah", nis: "24002" },
        { id: "3", name: "Muhammad Rizki", nis: "24003" },
      ]);
    }
  };

  const loadSurahData = async () => {
    try {
      // In a real app, you would fetch this from an API
      // For now, we'll use a static list of common surahs
      setSurahList([
        { id: 1, name: "Al-Fatihah", totalAyah: 7 },
        { id: 2, name: "Al-Baqarah", totalAyah: 286 },
        { id: 3, name: "Ali Imran", totalAyah: 200 },
        { id: 4, name: "An-Nisa", totalAyah: 176 },
        { id: 5, name: "Al-Ma'idah", totalAyah: 120 },
        { id: 36, name: "Ya-Sin", totalAyah: 83 },
        { id: 55, name: "Ar-Rahman", totalAyah: 78 },
        { id: 56, name: "Al-Waqi'ah", totalAyah: 96 },
        { id: 67, name: "Al-Mulk", totalAyah: 30 },
        { id: 78, name: "An-Naba", totalAyah: 40 },
        { id: 93, name: "Ad-Duha", totalAyah: 11 },
        { id: 94, name: "Ash-Sharh", totalAyah: 8 },
        { id: 112, name: "Al-Ikhlas", totalAyah: 4 },
        { id: 113, name: "Al-Falaq", totalAyah: 5 },
        { id: 114, name: "An-Nas", totalAyah: 6 },
      ]);
    } catch (error) {
      console.error("Error loading surah data:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If surahId changes, update surahName and totalAyah
    if (field === "surahId") {
      const selectedSurah = surahList.find(
        (s) => s.id.toString() === value.toString(),
      );
      if (selectedSurah) {
        setFormData((prev) => ({
          ...prev,
          surahId: value,
          surahName: selectedSurah.name,
          totalAyah: selectedSurah.totalAyah,
        }));
      }
    }
  };

  const handleUpdateInputChange = (field: string, value: any) => {
    setUpdateData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitProgress = async () => {
    try {
      if (!formData.santriId || !formData.surahId) {
        alert("Mohon lengkapi semua field yang diperlukan");
        return;
      }

      setLoading(true);

      const response = await fetch("/api/hafalan-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new progress to the list
        const newProgress: HafalanProgress = {
          id: data.progress.id,
          santriId: data.progress.santriId,
          santriName: data.progress.santri.name,
          santriNis: data.progress.santri.nis,
          surahId: data.progress.surahId,
          surahName: data.progress.surahName,
          totalAyah: data.progress.totalAyah,
          memorized: data.progress.memorized,
          inProgress: data.progress.inProgress,
          lastAyah: data.progress.lastAyah,
          startDate: data.progress.startDate,
          targetDate: data.progress.targetDate,
          completedAt: data.progress.completedAt,
          status: data.progress.status,
          notes: data.progress.notes,
          createdAt: data.progress.createdAt,
          updatedAt: data.progress.updatedAt,
        };

        setProgressList((prev) => [newProgress, ...prev]);

        // Reset form
        setFormData({
          santriId: "",
          surahId: "",
          surahName: "",
          totalAyah: 0,
          memorized: 0,
          inProgress: 0,
          lastAyah: 0,
          targetDate: "",
          status: "IN_PROGRESS",
          notes: "",
        });

        alert("Progress hafalan berhasil disimpan!");
        setShowInputModal(false);
      } else {
        console.error("Failed to submit progress:", data.message);
        alert("Gagal menyimpan progress: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting progress:", error);
      alert("Terjadi kesalahan saat menyimpan progress");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedProgress) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/hafalan-progress/${selectedProgress.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update the progress list
        setProgressList((prev) =>
          prev.map((p) =>
            p.id === selectedProgress.id
              ? {
                  ...p,
                  memorized: data.progress.memorized,
                  inProgress: data.progress.inProgress,
                  lastAyah: data.progress.lastAyah,
                  targetDate: data.progress.targetDate,
                  completedAt: data.progress.completedAt,
                  status: data.progress.status,
                  notes: data.progress.notes,
                  updatedAt: data.progress.updatedAt,
                }
              : p,
          ),
        );

        alert("Progress hafalan berhasil diupdate!");
        setShowUpdateModal(false);
        setSelectedProgress(null);
      } else {
        console.error("Failed to update progress:", data.message);
        alert("Gagal mengupdate progress: " + data.message);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Terjadi kesalahan saat mengupdate progress");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (progress: HafalanProgress) => {
    setSelectedProgress(progress);
    setShowDetailModal(true);
  };

  const handleEditProgress = (progress: HafalanProgress) => {
    setSelectedProgress(progress);
    setUpdateData({
      memorized: progress.memorized,
      inProgress: progress.inProgress,
      lastAyah: progress.lastAyah,
      targetDate: progress.targetDate || "",
      status: progress.status,
      notes: progress.notes || "",
    });
    setShowUpdateModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "ON_HOLD":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "ON_HOLD":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (memorized: number, totalAyah: number) => {
    return Math.round((memorized / totalAyah) * 100);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProgress = progressList.filter((progress) => {
    const matchesSearch =
      progress.santriName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      progress.santriNis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      progress.surahName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || progress.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: progressList.length,
    inProgress: progressList.filter((p) => p.status === "IN_PROGRESS").length,
    completed: progressList.filter((p) => p.status === "COMPLETED").length,
    onHold: progressList.filter((p) => p.status === "ON_HOLD").length,
    averageProgress:
      progressList.length > 0
        ? Math.round(
            progressList.reduce(
              (sum, p) => sum + getProgressPercentage(p.memorized, p.totalAyah),
              0,
            ) / progressList.length,
          )
        : 0,
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Progress Hafalan Santri
            </h1>
            <p className="text-gray-600">
              Pantau dan kelola progress hafalan Al-Quran santri
            </p>
          </div>
          <Button onClick={() => setShowInputModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Progress Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Progress
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
                    Sedang Berlangsung
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
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
                  <p className="text-sm font-medium text-gray-600">Ditunda</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.onHold}
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
                    Rata-rata Progress
                  </p>
                  <p className="text-2xl font-bold text-teal-600">
                    {stats.averageProgress}%
                  </p>
                </div>
                <BarChart2 className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Progress Hafalan</CardTitle>
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
                  <option value="IN_PROGRESS">Sedang Berlangsung</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="ON_HOLD">Ditunda</option>
                </select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgress.map((progress) => (
                <Card
                  key={progress.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden relative">
                          <div className="w-full h-full bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-teal-600">
                              {progress.santriName?.charAt(0) || "S"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {progress.santriName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            NIS: {progress.santriNis}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(progress.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}
                        >
                          {progress.status === "IN_PROGRESS"
                            ? "Berlangsung"
                            : progress.status === "COMPLETED"
                              ? "Selesai"
                              : "Ditunda"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {progress.surahName} ({progress.totalAyah} ayat)
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Mulai: {formatDateTime(progress.startDate)}
                          </span>
                          {progress.targetDate && (
                            <span className="text-xs text-gray-500">
                              Target: {formatDateTime(progress.targetDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-medium">
                            {getProgressPercentage(
                              progress.memorized,
                              progress.totalAyah,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full"
                            style={{
                              width: `${getProgressPercentage(progress.memorized, progress.totalAyah)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Dihafal: {progress.memorized} ayat</span>
                          <span>Total: {progress.totalAyah} ayat</span>
                        </div>
                      </div>

                      {progress.notes && (
                        <div className="text-sm text-gray-600">
                          <p className="italic">"{progress.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetail(progress)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditProgress(progress)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProgress.length === 0 && (
              <div className="text-center py-12">
                <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada progress hafalan ditemukan
                </h3>
                <p className="text-gray-500">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Modal */}
        {showInputModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tambah Progress Hafalan Baru
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Santri *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.santriId}
                        onChange={(e) =>
                          handleInputChange("santriId", e.target.value)
                        }
                      >
                        <option value="">Pilih Santri</option>
                        {santriList.map((santri) => (
                          <option key={santri.id} value={santri.id}>
                            {santri.name} ({santri.nis})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surah *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.surahId}
                        onChange={(e) =>
                          handleInputChange("surahId", e.target.value)
                        }
                      >
                        <option value="">Pilih Surah</option>
                        {surahList.map((surah) => (
                          <option key={surah.id} value={surah.id}>
                            {surah.name} ({surah.totalAyah} ayat)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Ayat Dihafal
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.totalAyah}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.memorized}
                        onChange={(e) =>
                          handleInputChange(
                            "memorized",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ayat Terakhir Dihafal
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.totalAyah}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.lastAyah}
                        onChange={(e) =>
                          handleInputChange(
                            "lastAyah",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ayat Dalam Proses
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.totalAyah - formData.memorized}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.inProgress}
                        onChange={(e) =>
                          handleInputChange(
                            "inProgress",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Selesai
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.targetDate}
                        onChange={(e) =>
                          handleInputChange("targetDate", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                      >
                        <option value="IN_PROGRESS">Sedang Berlangsung</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="ON_HOLD">Ditunda</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      rows={3}
                      placeholder="Tambahkan catatan tentang progress hafalan ini..."
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowInputModal(false)}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitProgress}
                    disabled={
                      loading || !formData.santriId || !formData.surahId
                    }
                  >
                    {loading ? "Menyimpan..." : "Simpan Progress"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Detail Progress Hafalan
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden relative">
                        <div className="w-full h-full bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-600">
                            {selectedProgress.santriName?.charAt(0) || "S"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedProgress.santriName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NIS: {selectedProgress.santriNis}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Surah:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedProgress.surahName} (
                          {selectedProgress.totalAyah} ayat)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProgress.status)}`}
                        >
                          {selectedProgress.status === "IN_PROGRESS"
                            ? "Sedang Berlangsung"
                            : selectedProgress.status === "COMPLETED"
                              ? "Selesai"
                              : "Ditunda"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tanggal Mulai:
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatDateTime(selectedProgress.startDate)}
                        </span>
                      </div>

                      {selectedProgress.targetDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Target Selesai:
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatDateTime(selectedProgress.targetDate)}
                          </span>
                        </div>
                      )}

                      {selectedProgress.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Tanggal Selesai:
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatDateTime(selectedProgress.completedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Progress Hafalan
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-medium">
                            {getProgressPercentage(
                              selectedProgress.memorized,
                              selectedProgress.totalAyah,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full"
                            style={{
                              width: `${getProgressPercentage(selectedProgress.memorized, selectedProgress.totalAyah)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Ayat Dihafal</p>
                          <p className="text-xl font-semibold text-blue-700">
                            {selectedProgress.memorized}
                          </p>
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Ayat Dalam Proses
                          </p>
                          <p className="text-xl font-semibold text-yellow-700">
                            {selectedProgress.inProgress}
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Ayat Terakhir</p>
                          <p className="text-xl font-semibold text-green-700">
                            {selectedProgress.lastAyah}
                          </p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Sisa Ayat</p>
                          <p className="text-xl font-semibold text-purple-700">
                            {selectedProgress.totalAyah -
                              selectedProgress.memorized}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedProgress.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Catatan
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedProgress.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedProgress(null);
                    }}
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditProgress(selectedProgress);
                    }}
                  >
                    Update Progress
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Update Progress Hafalan
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden relative">
                        <div className="w-full h-full bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-600">
                            {selectedProgress.santriName?.charAt(0) || "S"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedProgress.santriName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NIS: {selectedProgress.santriNis}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Surah:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedProgress.surahName} (
                          {selectedProgress.totalAyah} ayat)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tanggal Mulai:
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatDateTime(selectedProgress.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Ayat Dihafal *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedProgress.totalAyah}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={updateData.memorized}
                        onChange={(e) =>
                          handleUpdateInputChange(
                            "memorized",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ayat Terakhir Dihafal
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedProgress.totalAyah}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={updateData.lastAyah}
                        onChange={(e) =>
                          handleUpdateInputChange(
                            "lastAyah",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ayat Dalam Proses
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedProgress.totalAyah - updateData.memorized}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={updateData.inProgress}
                        onChange={(e) =>
                          handleUpdateInputChange(
                            "inProgress",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Selesai
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={updateData.targetDate}
                        onChange={(e) =>
                          handleUpdateInputChange("targetDate", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={updateData.status}
                        onChange={(e) =>
                          handleUpdateInputChange("status", e.target.value)
                        }
                      >
                        <option value="IN_PROGRESS">Sedang Berlangsung</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="ON_HOLD">Ditunda</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      rows={3}
                      placeholder="Tambahkan catatan tentang progress hafalan ini..."
                      value={updateData.notes}
                      onChange={(e) =>
                        handleUpdateInputChange("notes", e.target.value)
                      }
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedProgress(null);
                    }}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleUpdateProgress} disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProgressHafalanPage;
