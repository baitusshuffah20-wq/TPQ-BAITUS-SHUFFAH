"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceRecorder from "@/components/audio/VoiceRecorder";
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
  Mic,
  User,
  Calendar,
  Star,
} from "lucide-react";

interface HafalanSubmission {
  id: string;
  santriId: string;
  santriName: string;
  santriNis: string;
  santriPhoto?: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  type: "SETORAN" | "MURAJAAH" | "TASMI";
  status: "PENDING" | "APPROVED" | "NEEDS_IMPROVEMENT" | "REJECTED";
  grade?: number;
  notes?: string;
  audioUrl?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const MusyrifHafalanPage = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<HafalanSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();

  const [hafalanList, setHafalanList] = useState<HafalanSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [surahList, setSurahList] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "MUSYRIF") {
        router.push("/login");
      } else {
        setUser(parsedUser);
        loadHafalanData(parsedUser.id);
        loadSantriData();
        loadSurahData();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const loadHafalanData = async (musyrifId: string) => {
    try {
      setLoading(true);

      console.log("Fetching hafalan data from API...");
      const response = await fetch(`/api/hafalan?musyrifId=${musyrifId}`, {
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
        const processedData = data.hafalan.map((h: any) => ({
          id: h.id,
          santriId: h.santriId,
          santriName: h.santri?.name || "Unknown",
          santriNis: h.santri?.nis || "Unknown",
          santriPhoto: h.santri?.photo || null,
          surahId: h.surahId,
          surahName: h.surahName,
          ayahStart: h.ayahStart,
          ayahEnd: h.ayahEnd,
          type: h.type,
          status: h.status,
          grade: h.grade,
          notes: h.notes,
          audioUrl: h.audioUrl,
          submittedAt: h.createdAt,
          reviewedAt: h.updatedAt !== h.createdAt ? h.updatedAt : undefined,
        }));

        setHafalanList(processedData);
        console.log("Loaded hafalan data:", processedData);
      } else {
        console.error("Failed to load hafalan data:", data.message);
        // Fallback to mock data if API fails
        console.log("Using mock data as fallback");
        setHafalanList(hafalanSubmissions);
      }
    } catch (error) {
      console.error("Error loading hafalan data:", error);
      // Fallback to mock data if API fails
      console.log("Using mock data as fallback due to error");
      setHafalanList(hafalanSubmissions);
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

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Mock data for fallback
  const hafalanSubmissions: HafalanSubmission[] = [
    {
      id: "1",
      santriId: "1",
      santriName: "Ahmad Fauzi",
      santriNis: "24001",
      santriPhoto: null,
      surahId: 2,
      surahName: "Al-Baqarah",
      ayahStart: 1,
      ayahEnd: 10,
      type: "SETORAN",
      status: "PENDING",
      audioUrl: "https://example.com/audio1.mp3",
      submittedAt: "2024-02-12T08:30:00Z",
    },
    {
      id: "2",
      santriId: "2",
      santriName: "Siti Aisyah",
      santriNis: "24002",
      santriPhoto: null,
      surahId: 3,
      surahName: "Ali Imran",
      ayahStart: 1,
      ayahEnd: 20,
      type: "SETORAN",
      status: "APPROVED",
      grade: 85,
      notes: "Bacaan sudah baik, tajwid perlu diperbaiki sedikit",
      audioUrl: "https://example.com/audio2.mp3",
      submittedAt: "2024-02-11T09:00:00Z",
      reviewedAt: "2024-02-11T14:30:00Z",
    },
    {
      id: "3",
      santriId: "3",
      santriName: "Muhammad Rizki",
      santriNis: "24003",
      santriPhoto: null,
      surahId: 1,
      surahName: "Al-Fatihah",
      ayahStart: 1,
      ayahEnd: 7,
      type: "MURAJAAH",
      status: "NEEDS_IMPROVEMENT",
      grade: 65,
      notes: "Perlu latihan lebih untuk makhorijul huruf",
      audioUrl: "https://example.com/audio3.mp3",
      submittedAt: "2024-02-10T10:15:00Z",
      reviewedAt: "2024-02-10T16:20:00Z",
    },
  ];

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

  const [formData, setFormData] = useState({
    santriId: "",
    surahId: "",
    surahName: "",
    ayahStart: 1,
    ayahEnd: 1,
    type: "SETORAN",
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If surahId changes, update surahName
    if (field === "surahId") {
      const selectedSurah = surahList.find(
        (s) => s.id.toString() === value.toString(),
      );
      if (selectedSurah) {
        setFormData((prev) => ({
          ...prev,
          surahId: value,
          surahName: selectedSurah.name,
          ayahEnd: prev.ayahStart, // Reset ayahEnd to ayahStart when surah changes
        }));
      }
    }

    // Ensure ayahEnd is not less than ayahStart
    if (field === "ayahStart") {
      const ayahStart = parseInt(value);
      if (ayahStart > formData.ayahEnd) {
        setFormData((prev) => ({ ...prev, ayahEnd: ayahStart }));
      }
    }
  };

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    console.log("Recording completed:", { audioBlob, duration });
    // Here you would upload the audio to your server
  };

  const handleAudioUpload = (audioFile: File) => {
    console.log("Audio uploaded:", audioFile);
    // Here you would upload the audio to your server
  };

  const handleReview = (submission: HafalanSubmission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  const submitReview = async (grade: number, notes: string, status: string) => {
    if (!selectedSubmission) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/hafalan/${selectedSubmission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          santriId: selectedSubmission.santriId,
          surahId: selectedSubmission.surahId,
          surahName: selectedSubmission.surahName,
          ayahStart: selectedSubmission.ayahStart,
          ayahEnd: selectedSubmission.ayahEnd,
          type: selectedSubmission.type,
          status: status,
          grade: grade,
          notes: notes,
          musyrifId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the hafalan list
        setHafalanList((prev) =>
          prev.map((h) =>
            h.id === selectedSubmission.id
              ? {
                  ...h,
                  status: status as
                    | "PENDING"
                    | "APPROVED"
                    | "NEEDS_IMPROVEMENT"
                    | "REJECTED",
                  grade: grade,
                  notes: notes,
                  reviewedAt: new Date().toISOString(),
                }
              : h,
          ),
        );

        alert("Review berhasil disimpan!");
      } else {
        console.error("Failed to submit review:", data.message);
        alert("Gagal menyimpan review: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Terjadi kesalahan saat menyimpan review");
    } finally {
      setLoading(false);
      setShowReviewModal(false);
      setSelectedSubmission(null);
    }
  };

  const handleSubmitHafalan = async () => {
    try {
      if (!formData.santriId || !formData.surahId || !formData.type) {
        alert("Mohon lengkapi semua field yang diperlukan");
        return;
      }

      setLoading(true);

      const response = await fetch("/api/hafalan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          musyrifId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new hafalan to the list
        const newHafalan: HafalanSubmission = {
          id: data.hafalan.id,
          santriId: data.hafalan.santriId,
          santriName: data.hafalan.santri.name,
          santriNis: data.hafalan.santri.nis,
          santriPhoto: data.hafalan.santri.photo || null,
          surahId: data.hafalan.surahId,
          surahName: data.hafalan.surahName,
          ayahStart: data.hafalan.ayahStart,
          ayahEnd: data.hafalan.ayahEnd,
          type: data.hafalan.type,
          status: data.hafalan.status,
          notes: data.hafalan.notes,
          submittedAt: data.hafalan.createdAt,
        };

        setHafalanList((prev) => [newHafalan, ...prev]);

        // Reset form
        setFormData({
          santriId: "",
          surahId: "",
          surahName: "",
          ayahStart: 1,
          ayahEnd: 1,
          type: "SETORAN",
          notes: "",
        });

        alert("Hafalan berhasil disimpan!");
        setShowInputModal(false);
      } else {
        console.error("Failed to submit hafalan:", data.message);
        alert("Gagal menyimpan hafalan: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting hafalan:", error);
      alert("Terjadi kesalahan saat menyimpan hafalan");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = hafalanList.filter((submission) => {
    const matchesSearch =
      submission.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.surahName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || submission.status === statusFilter;
    const matchesType = typeFilter === "ALL" || submission.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: hafalanList.length,
    pending: hafalanList.filter((h) => h.status === "PENDING").length,
    approved: hafalanList.filter((h) => h.status === "APPROVED").length,
    needsImprovement: hafalanList.filter(
      (h) => h.status === "NEEDS_IMPROVEMENT",
    ).length,
    averageGrade:
      hafalanList.filter((h) => h.grade).length > 0
        ? Math.round(
            hafalanList
              .filter((h) => h.grade)
              .reduce((sum, h) => sum + (h.grade || 0), 0) /
              hafalanList.filter((h) => h.grade).length,
          )
        : 0,
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Hafalan
            </h1>
            <p className="text-gray-600">
              Kelola dan review hafalan santri dengan rekaman audio
            </p>
          </div>
          <Button onClick={() => setShowInputModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Input Hafalan Baru
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
                    Pending Review
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Disetujui</p>
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
                <Star className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hafalan Santri</CardTitle>
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
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Disetujui</option>
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
              </div>
            </div>

            {/* Hafalan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                          {submission.santriPhoto ? (
                            <img
                              src={submission.santriPhoto}
                              alt={submission.santriName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-teal-600">
                              {submission.santriName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {submission.santriName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            NIS: {submission.santriNis}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(submission.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {submission.surahName} ayat {submission.ayahStart}
                          {submission.ayahEnd !== submission.ayahStart &&
                            ` - ${submission.ayahEnd}`}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(submission.type)}`}
                          >
                            {submission.type}
                          </span>
                          {submission.audioUrl && (
                            <span className="flex items-center text-xs text-gray-500">
                              <Mic className="h-3 w-3 mr-1" />
                              Audio
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDateTime(submission.submittedAt)}
                        </div>
                      </div>

                      {submission.grade && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Nilai:</span>
                          <span
                            className={`font-semibold ${getGradeColor(submission.grade)}`}
                          >
                            {submission.grade}
                          </span>
                        </div>
                      )}

                      {submission.notes && (
                        <div className="text-sm text-gray-600">
                          <p className="italic">"{submission.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      {submission.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleReview(submission)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada hafalan ditemukan
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
                  Input Hafalan Baru
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
                        Jenis Hafalan *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        value={formData.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                      >
                        <option value="">Pilih Jenis</option>
                        <option value="SETORAN">Setoran</option>
                        <option value="MURAJAAH">Murajaah</option>
                        <option value="TASMI">Tasmi</option>
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ayat Mulai *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={
                            surahList.find(
                              (s) =>
                                s.id.toString() === formData.surahId.toString(),
                            )?.totalAyah || 286
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                          value={formData.ayahStart}
                          onChange={(e) =>
                            handleInputChange(
                              "ayahStart",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ayat Akhir *
                        </label>
                        <input
                          type="number"
                          min={formData.ayahStart}
                          max={
                            surahList.find(
                              (s) =>
                                s.id.toString() === formData.surahId.toString(),
                            )?.totalAyah || 286
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                          value={formData.ayahEnd}
                          onChange={(e) =>
                            handleInputChange(
                              "ayahEnd",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      rows={3}
                      placeholder="Tambahkan catatan tentang hafalan ini..."
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                    ></textarea>
                  </div>

                  {/* Voice Recorder */}
                  <VoiceRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onUpload={handleAudioUpload}
                    title="Rekam Hafalan"
                    description="Rekam bacaan hafalan santri"
                    maxDuration={600} // 10 minutes
                  />
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
                    onClick={handleSubmitHafalan}
                    disabled={
                      loading ||
                      !formData.santriId ||
                      !formData.surahId ||
                      !formData.type
                    }
                  >
                    {loading ? "Menyimpan..." : "Simpan Hafalan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Review Hafalan
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedSubmission.santriPhoto ? (
                          <img
                            src={selectedSubmission.santriPhoto}
                            alt={selectedSubmission.santriName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-teal-600">
                            {selectedSubmission.santriName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedSubmission.santriName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          NIS: {selectedSubmission.santriNis}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Surah:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedSubmission.surahName} ayat{" "}
                          {selectedSubmission.ayahStart}
                          {selectedSubmission.ayahEnd !==
                            selectedSubmission.ayahStart &&
                            ` - ${selectedSubmission.ayahEnd}`}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Jenis:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedSubmission.type)}`}
                        >
                          {selectedSubmission.type}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tanggal:</span>
                        <span className="text-sm text-gray-900">
                          {formatDateTime(selectedSubmission.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedSubmission.audioUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rekaman Audio
                      </label>
                      <audio
                        controls
                        className="w-full"
                        src={selectedSubmission.audioUrl}
                      ></audio>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai (0-100) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      defaultValue={selectedSubmission.grade || 80}
                      id="grade-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      defaultValue={selectedSubmission.status}
                      id="status-input"
                    >
                      <option value="APPROVED">Disetujui</option>
                      <option value="NEEDS_IMPROVEMENT">Perlu Perbaikan</option>
                      <option value="REJECTED">Ditolak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      rows={3}
                      placeholder="Tambahkan catatan untuk santri..."
                      defaultValue={selectedSubmission.notes || ""}
                      id="notes-input"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedSubmission(null);
                    }}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      const gradeInput = document.getElementById(
                        "grade-input",
                      ) as HTMLInputElement;
                      const statusInput = document.getElementById(
                        "status-input",
                      ) as HTMLSelectElement;
                      const notesInput = document.getElementById(
                        "notes-input",
                      ) as HTMLTextAreaElement;

                      const grade = parseInt(gradeInput.value);
                      const status = statusInput.value;
                      const notes = notesInput.value;

                      submitReview(grade, notes, status);
                    }}
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Simpan Review"}
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

export default MusyrifHafalanPage;
