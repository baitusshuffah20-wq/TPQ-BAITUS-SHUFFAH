"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Target,
  BarChart3,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  Send,
  MessageSquare,
  User,
} from "lucide-react";

interface HafalanProgress {
  id: string;
  surahName: string;
  surahNumber: number;
  totalAyahs: number;
  completedAyahs: number;
  percentage: number;
  status: string;
  lastReview: string;
  difficulty: string;
  musyrifNotes: string;
  parentNotes?: string;
  audioUrl?: string;
}

interface HafalanData {
  progress: HafalanProgress[];
  statistics: {
    totalSurahs: number;
    completedSurahs: number;
    inProgressSurahs: number;
    totalAyahs: number;
    completedAyahs: number;
    overallPercentage: number;
    averageScore: number;
    streak: number;
  };
  children: Array<{
    id: string;
    name: string;
    nis: string;
    currentLevel: string;
    targetLevel: string;
    musyrif: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    surahName: string;
    score?: number;
  }>;
  groupedProgress: {
    [key: string]: HafalanProgress[];
  };
}

const WaliHafalanPage = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HafalanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parentNote, setParentNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchHafalanData();
  }, [selectedChild]);

  const fetchHafalanData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChild !== "all") params.append("childId", selectedChild);

      const response = await fetch(`/api/dashboard/wali/hafalan?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hafalan data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParentNote = async (surahId: string) => {
    if (!parentNote.trim()) return;

    try {
      setSending(true);
      const response = await fetch('/api/dashboard/wali/hafalan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_parent_note',
          surahId,
          note: parentNote.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const result = await response.json();
      if (result.success) {
        setParentNote("");
        fetchHafalanData(); // Refresh data
        alert('Catatan berhasil ditambahkan!');
      }
    } catch (err) {
      alert('Gagal menambahkan catatan');
    } finally {
      setSending(false);
    }
  };

  const handleRequestReview = async (surahId: string) => {
    try {
      const response = await fetch('/api/dashboard/wali/hafalan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_review',
          surahId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request review');
      }

      const result = await response.json();
      if (result.success) {
        alert('Permintaan review berhasil dikirim ke musyrif!');
      }
    } catch (err) {
      alert('Gagal mengirim permintaan review');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchHafalanData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock children data
  const children = [
    {
      id: "1",
      name: "Muhammad Fauzi",
      nis: "2024001",
      class: "Juz 1",
      currentLevel: "Al-Fatihah",
      totalProgress: 15,
    },
  ];

  // Mock hafalan data
  const hafalanData = [
    {
      id: "1",
      surah: "Al-Fatihah",
      arabicName: "الفاتحة",
      verses: 7,
      status: "completed",
      grade: "A",
      completedDate: "2024-01-15",
      musyrif: "Ustadz Ahmad Fauzi",
      notes: "Hafalan sangat baik, tajwid sudah benar",
      audioUrl: "/audio/al-fatihah.mp3",
      progress: 100,
    },
    {
      id: "2",
      surah: "Al-Baqarah (1-10)",
      arabicName: "البقرة",
      verses: 10,
      status: "in_progress",
      grade: "B+",
      completedDate: null,
      musyrif: "Ustadz Ahmad Fauzi",
      notes: "Perlu perbaikan pada ayat 8-10, tajwid cukup baik",
      audioUrl: "/audio/al-baqarah-1-10.mp3",
      progress: 70,
    },
    {
      id: "3",
      surah: "Al-Baqarah (11-20)",
      arabicName: "البقرة",
      verses: 10,
      status: "pending",
      grade: null,
      completedDate: null,
      musyrif: "Ustadz Ahmad Fauzi",
      notes: "Belum dimulai",
      audioUrl: "/audio/al-baqarah-11-20.mp3",
      progress: 0,
    },
    {
      id: "4",
      surah: "Al-Baqarah (21-30)",
      arabicName: "البقرة",
      verses: 10,
      status: "pending",
      grade: null,
      completedDate: null,
      musyrif: "Ustadz Ahmad Fauzi",
      notes: "Belum dimulai",
      audioUrl: "/audio/al-baqarah-21-30.mp3",
      progress: 0,
    },
  ];

  const selectedChildData = children.find(child => child.id === selectedChild);
  const selectedSurahData = hafalanData.find(surah => surah.id === selectedSurah);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'in_progress':
        return 'Sedang Belajar';
      default:
        return 'Belum Dimulai';
    }
  };

  const completedCount = hafalanData.filter(h => h.status === 'completed').length;
  const inProgressCount = hafalanData.filter(h => h.status === 'in_progress').length;
  const totalCount = hafalanData.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress Hafalan</h1>
            <p className="text-gray-600">Pantau perkembangan hafalan Al-Qur'an anak Anda</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistik
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        {data?.children && data.children.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Pilih Anak:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedChild === "all" ? "default" : "outline"}
                    onClick={() => setSelectedChild("all")}
                  >
                    Semua Anak
                  </Button>
                  {data.children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild === child.id ? "default" : "outline"}
                      onClick={() => setSelectedChild(child.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-xs font-bold text-blue-600">
                          {child.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <span>{child.name}</span>
                      <Badge variant="secondary" className="ml-1">
                        {child.currentLevel}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Summary */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Progress Keseluruhan</p>
                    <p className="text-2xl font-bold">{data.statistics.overallPercentage}%</p>
                    <p className="text-xs text-gray-500">
                      {data.statistics.completedAyahs} dari {data.statistics.totalAyahs} ayat
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Surah Selesai</p>
                    <p className="text-2xl font-bold">{data.statistics.completedSurahs}</p>
                    <p className="text-xs text-gray-500">
                      dari {data.statistics.totalSurahs} surah
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Sedang Belajar</p>
                    <p className="text-2xl font-bold">{data.statistics.inProgressSurahs}</p>
                    <p className="text-xs text-gray-500">surah</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold">{data.statistics.averageScore}</p>
                    <p className="text-xs text-gray-500">
                      Streak: {data.statistics.streak} hari
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sedang Belajar</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                  <p className="text-xs text-gray-500">Bagian</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Level Saat Ini</p>
                  <p className="text-lg font-bold text-gray-900">{selectedChildData?.currentLevel}</p>
                  <p className="text-xs text-gray-500">Juz 1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hafalan List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Daftar Hafalan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hafalanData.map((hafalan) => (
                  <div
                    key={hafalan.id}
                    onClick={() => setSelectedSurah(hafalan.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSurah === hafalan.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(hafalan.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{hafalan.surah}</h3>
                          <p className="text-sm text-gray-600">{hafalan.arabicName}</p>
                          <p className="text-xs text-gray-500">{hafalan.verses} ayat</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hafalan.status)}`}>
                          {getStatusText(hafalan.status)}
                        </span>
                        {hafalan.grade && (
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            Nilai: {hafalan.grade}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{hafalan.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            hafalan.status === 'completed' ? 'bg-green-500' :
                            hafalan.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${hafalan.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Detail Hafalan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSurahData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {selectedSurahData.surah}
                    </h3>
                    <p className="text-gray-600">{selectedSurahData.arabicName}</p>
                    <p className="text-sm text-gray-500">{selectedSurahData.verses} ayat</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSurahData.status)}`}>
                        {getStatusText(selectedSurahData.status)}
                      </span>
                    </div>
                    
                    {selectedSurahData.grade && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Nilai:</span>
                        <span className="text-sm font-bold text-teal-600">{selectedSurahData.grade}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Musyrif:</span>
                      <span className="text-sm text-gray-900">{selectedSurahData.musyrif}</span>
                    </div>
                    
                    {selectedSurahData.completedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Selesai:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedSurahData.completedDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Audio Player */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Audio Murotal</h4>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Catatan Musyrif</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedSurahData.notes}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Audio
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Jadwal Setoran
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Pilih hafalan untuk melihat detail</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Hafalan Al-Fatihah selesai dengan nilai A
                  </p>
                  <p className="text-xs text-gray-600">15 Januari 2024 • Ustadz Ahmad Fauzi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Setoran Al-Baqarah ayat 8-10 perlu perbaikan
                  </p>
                  <p className="text-xs text-gray-600">20 Januari 2024 • Ustadz Ahmad Fauzi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Mendapat pujian untuk tajwid yang baik
                  </p>
                  <p className="text-xs text-gray-600">18 Januari 2024 • Ustadz Ahmad Fauzi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliHafalanPage;
