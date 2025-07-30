"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import AssessmentForm from "@/components/halaqah/AssessmentForm";
import AssessmentHistory from "@/components/musyrif/AssessmentHistory";

interface SantriData {
  id: string;
  name: string;
  nis: string;
  halaqahId: string;
  halaqahName: string;
  averageGrade: number;
  totalAssessments: number;
  lastAssessment: string;
  recentScores: {
    quran: number;
    tahsin: number;
    akhlaq: number;
  };
}

interface Assessment {
  id: string;
  santriId: string;
  santriName: string;
  type: "QURAN" | "TAHSIN" | "AKHLAQ";
  category: string;
  surah?: string;
  ayahStart?: number;
  ayahEnd?: number;
  score: number;
  grade: string;
  notes?: string;
  strengths?: string;
  improvements?: string;
  assessedAt: string;
}

interface Statistics {
  totalSantri: number;
  totalAssessments: number;
  averageScore: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
}

export default function PenilaianPage() {
  const { data: session } = useSession();
  const [santriList, setSantriList] = useState<SantriData[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalSantri: 0,
    totalAssessments: 0,
    averageScore: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedSantri, setSelectedSantri] = useState<SantriData | null>(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showAssessmentHistory, setShowAssessmentHistory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch santri data
      const santriResponse = await fetch("/api/santri");
      if (santriResponse.ok) {
        const santriData = await santriResponse.json();
        setSantriList(santriData.data || []);
      }

      // Fetch assessments data
      const assessmentResponse = await fetch("/api/halaqah/assessment");
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json();
        setAssessments(assessmentData.data || []);
      }

      // Calculate statistics
      calculateStatistics();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data penilaian");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    // This would be calculated from real data
    setStatistics({
      totalSantri: santriList.length,
      totalAssessments: assessments.length,
      averageScore: 85.5,
      gradeDistribution: { A: 12, B: 18, C: 8, D: 3, E: 1 },
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-100";
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "D":
        return "text-orange-600 bg-orange-100";
      case "E":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const filteredSantri = santriList.filter((santri) => {
    const matchesSearch = santri.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAssessmentSuccess = () => {
    fetchData();
    setShowAssessmentForm(false);
  };

  const openAssessmentForm = (santri: SantriData) => {
    setSelectedSantri(santri);
    setShowAssessmentForm(true);
  };

  const openAssessmentHistory = (santri: SantriData) => {
    setSelectedSantri(santri);
    setShowAssessmentHistory(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data penilaian...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Penilaian Santri
            </h1>
            <p className="text-gray-600">
              Kelola penilaian dan evaluasi santri di halaqah Anda
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Santri</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.totalSantri}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Penilaian</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.totalAssessments}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                  <p className={`text-2xl font-bold ${getScoreColor(statistics.averageScore)}`}>
                    {statistics.averageScore.toFixed(1)}
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
                  <p className="text-sm text-gray-600">Nilai A</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.gradeDistribution.A}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari santri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="excellent">Nilai A</SelectItem>
                  <SelectItem value="good">Nilai B</SelectItem>
                  <SelectItem value="average">Nilai C</SelectItem>
                  <SelectItem value="below">Nilai D-E</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Santri List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Rata-rata</TableHead>
                  <TableHead>Quran</TableHead>
                  <TableHead>Tahsin</TableHead>
                  <TableHead>Akhlaq</TableHead>
                  <TableHead>Penilaian Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSantri.map((santri) => (
                  <TableRow key={santri.id}>
                    <TableCell className="font-medium">{santri.name}</TableCell>
                    <TableCell>{santri.nis}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getScoreColor(santri.averageGrade)}`}>
                        {santri.averageGrade.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(santri.recentScores?.quran || 0)}>
                        {santri.recentScores?.quran || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(santri.recentScores?.tahsin || 0)}>
                        {santri.recentScores?.tahsin || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(santri.recentScores?.akhlaq || 0)}>
                        {santri.recentScores?.akhlaq || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {santri.lastAssessment ? (
                        new Date(santri.lastAssessment).toLocaleDateString("id-ID")
                      ) : (
                        <span className="text-gray-400">Belum ada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openAssessmentForm(santri)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nilai
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssessmentHistory(santri)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Riwayat
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assessment Form Dialog */}
        {showAssessmentForm && selectedSantri && (
          <AssessmentForm
            isOpen={showAssessmentForm}
            onClose={() => setShowAssessmentForm(false)}
            onSuccess={handleAssessmentSuccess}
            halaqahId={selectedSantri.halaqahId}
            santriId={selectedSantri.id}
            santriList={[selectedSantri]}
          />
        )}

        {/* Assessment History Dialog */}
        {showAssessmentHistory && selectedSantri && (
          <AssessmentHistory
            isOpen={showAssessmentHistory}
            onClose={() => setShowAssessmentHistory(false)}
            santriId={selectedSantri.id}
            santriName={selectedSantri.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
