"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  BookOpen,
  Star,
  Calendar,
  MapPin,
  UserCheck,
  BarChart3,
  Eye,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import AddHalaqahForm from "@/components/halaqah/AddHalaqahForm";
import AssessmentForm from "@/components/halaqah/AssessmentForm";
import ManageSantriForm from "@/components/halaqah/ManageSantriForm";

interface HalaqahData {
  id: string;
  name: string;
  description: string;
  capacity: number;
  room: string;
  schedule: {
    days?: string[];
    time?: string;
    pattern?: string;
  } | null;
  status: string;
  musyrif: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  santri: {
    id: string;
    name: string;
    nis: string;
    averageGrade: number;
  }[];
  totalSantri: number;
  averageGrade: number;
  occupancyRate: number;
  recentAssessments: {
    id: string;
    santriName: string;
    type: string;
    score: number;
  }[];
}

interface Statistics {
  totalHalaqah: number;
  totalSantri: number;
  totalMusyrif: number;
  overallAverageGrade: number;
  averageOccupancy: number;
}

export default function HalaqahTerpaduPage() {
  const [halaqahList, setHalaqahList] = useState<HalaqahData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showManageSantriForm, setShowManageSantriForm] = useState(false);
  const [selectedHalaqah, setSelectedHalaqah] = useState<HalaqahData | null>(
    null,
  );

  useEffect(() => {
    loadHalaqahData();
  }, []);

  const loadHalaqahData = async () => {
    try {
      setLoading(true);
      console.log("?? Loading comprehensive halaqah data from database...");

      const response = await fetch("/api/halaqah/comprehensive", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Always fetch fresh data
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log("? Real halaqah data loaded successfully:", result.data);
          setHalaqahList(result.data.halaqah || []);
          setStatistics(
            result.data.statistics || {
              totalHalaqah: 0,
              totalSantri: 0,
              totalMusyrif: 0,
              overallAverageGrade: 0,
              averageOccupancy: 0,
            },
          );
          toast.success("Data halaqah berhasil dimuat dari database");
          return; // Exit early if successful
        } else {
          throw new Error(result.error || "API returned unsuccessful response");
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("? Error loading real halaqah data:", error);
      console.log("?? Falling back to mock data for development...");

      // Load mock data as fallback
      const mockData = {
        halaqah: [
          {
            id: "1",
            name: "Halaqah Al-Fatiha",
            description:
              "Halaqah untuk pemula dengan fokus pada surat-surat pendek",
            capacity: 15,
            room: "Ruang A1",
            schedule: {
              days: ["Senin", "Rabu", "Jumat"],
              time: "16:00-17:30",
              pattern: "3x seminggu",
            },
            status: "ACTIVE",
            musyrif: {
              id: "m1",
              name: "Ustadz Ahmad Fauzi",
              email: "ahmad.fauzi@tpq.com",
              phone: "081234567890",
            },
            santri: [
              {
                id: "s1",
                name: "Muhammad Ali",
                nis: "2024001",
                averageGrade: 85,
              },
              {
                id: "s2",
                name: "Fatimah Zahra",
                nis: "2024002",
                averageGrade: 90,
              },
              {
                id: "s3",
                name: "Abdullah Rahman",
                nis: "2024003",
                averageGrade: 78,
              },
            ],
            totalSantri: 12,
            averageGrade: 84.5,
            occupancyRate: 80,
            recentAssessments: [
              {
                id: "a1",
                santriName: "Muhammad Ali",
                type: "Tahsin",
                score: 85,
              },
              {
                id: "a2",
                santriName: "Fatimah Zahra",
                type: "Hafalan",
                score: 92,
              },
            ],
          },
          {
            id: "2",
            name: "Halaqah An-Nas",
            description: "Halaqah lanjutan dengan fokus pada hafalan juz 30",
            capacity: 12,
            room: "Ruang B2",
            schedule: {
              days: ["Selasa", "Kamis", "Sabtu"],
              time: "15:30-17:00",
              pattern: "3x seminggu",
            },
            status: "ACTIVE",
            musyrif: {
              id: "m2",
              name: "Ustadzah Siti Aminah",
              email: "siti.aminah@tpq.com",
              phone: "081234567891",
            },
            santri: [
              {
                id: "s4",
                name: "Umar Faruq",
                nis: "2024004",
                averageGrade: 88,
              },
              {
                id: "s5",
                name: "Khadijah Binti Ahmad",
                nis: "2024005",
                averageGrade: 95,
              },
            ],
            totalSantri: 8,
            averageGrade: 91.5,
            occupancyRate: 67,
            recentAssessments: [
              {
                id: "a3",
                santriName: "Umar Faruq",
                type: "Akhlaq",
                score: 90,
              },
              {
                id: "a4",
                santriName: "Khadijah Binti Ahmad",
                type: "Tahsin",
                score: 96,
              },
            ],
          },
        ],
        statistics: {
          totalHalaqah: 2,
          totalSantri: 20,
          totalMusyrif: 2,
          overallAverageGrade: 88.0,
          averageOccupancy: 74,
        },
      };

      setHalaqahList(mockData.halaqah);
      setStatistics(mockData.statistics);
      toast.error(
        "Gagal memuat data dari database. Menggunakan data mock untuk development.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadHalaqahData();
    toast.success("Halaqah berhasil ditambahkan");
  };

  const handleAssessmentSuccess = () => {
    loadHalaqahData();
    toast.success("Penilaian berhasil disimpan");
  };

  const openAssessmentForm = (halaqah: HalaqahData) => {
    setSelectedHalaqah(halaqah);
    setShowAssessmentForm(true);
  };

  const openManageSantriForm = (halaqah: HalaqahData) => {
    setSelectedHalaqah(halaqah);
    setShowManageSantriForm(true);
  };

  const openDetailView = (halaqah: HalaqahData) => {
    // For now, we'll show the manage santri form as detail view
    // Later this can be expanded to a dedicated detail modal
    setSelectedHalaqah(halaqah);
    setShowManageSantriForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "text-red-600";
    if (rate >= 75) return "text-yellow-600";
    if (rate >= 50) return "text-blue-600";
    return "text-green-600";
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    if (grade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data halaqah...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Halaqah Terpadu
            </h1>
            <p className="text-gray-600">
              Kelola halaqah, musyrif, santri, dan penilaian dalam satu tempat
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Halaqah
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Halaqah</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statistics.totalHalaqah}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Santri</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.totalSantri}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Musyrif</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.totalMusyrif}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                    <p
                      className={`text-2xl font-bold ${getGradeColor(statistics.overallAverageGrade)}`}
                    >
                      {statistics.overallAverageGrade.toFixed(1)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Okupansi</p>
                    <p
                      className={`text-2xl font-bold ${getOccupancyColor(statistics.averageOccupancy)}`}
                    >
                      {statistics.averageOccupancy}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Halaqah List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {halaqahList.map((halaqah) => (
            <Card
              key={halaqah.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{halaqah.name}</CardTitle>
                  <Badge className={getStatusColor(halaqah.status)}>
                    {halaqah.status}
                  </Badge>
                </div>
                {halaqah.description && (
                  <p className="text-sm text-gray-600">{halaqah.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {halaqah.room || "Belum ditentukan"}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {halaqah.totalSantri}/{halaqah.capacity} santri
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserCheck className="h-4 w-4 mr-2" />
                    {halaqah.musyrif?.name || "Belum ada musyrif"}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    Rata-rata: {halaqah.averageGrade.toFixed(1)}
                  </div>
                </div>

                {/* Schedule */}
                {halaqah.schedule && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-800 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {halaqah.schedule.days?.join(", ")} •{" "}
                        {halaqah.schedule.time}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssessmentForm(halaqah)}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Nilai
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDetailView(halaqah)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openManageSantriForm(halaqah)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Kelola
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {halaqahList.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Halaqah
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai dengan membuat halaqah pertama untuk TPQ Anda
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Halaqah Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Forms */}
        <AddHalaqahForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />

        {selectedHalaqah && (
          <>
            <AssessmentForm
              isOpen={showAssessmentForm}
              onClose={() => {
                setShowAssessmentForm(false);
                setSelectedHalaqah(null);
              }}
              onSuccess={handleAssessmentSuccess}
              halaqahId={selectedHalaqah.id}
              santriList={selectedHalaqah.santri}
            />

            <ManageSantriForm
              isOpen={showManageSantriForm}
              onClose={() => {
                setShowManageSantriForm(false);
                setSelectedHalaqah(null);
              }}
              onSuccess={handleAddSuccess}
              halaqah={selectedHalaqah}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
