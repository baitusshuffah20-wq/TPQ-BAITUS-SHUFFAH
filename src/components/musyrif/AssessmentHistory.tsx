"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface Assessment {
  id: string;
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
  assessorName: string;
}

interface AssessmentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  santriId: string;
  santriName: string;
}

export default function AssessmentHistory({
  isOpen,
  onClose,
  santriId,
  santriName,
}: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (isOpen && santriId) {
      fetchAssessments();
    }
  }, [isOpen, santriId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/halaqah/assessment?santriId=${santriId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.data || []);
      } else {
        toast.error("Gagal memuat riwayat penilaian");
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Gagal memuat riwayat penilaian");
    } finally {
      setLoading(false);
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "QURAN":
        return <BookOpen className="h-4 w-4" />;
      case "TAHSIN":
        return <Star className="h-4 w-4" />;
      case "AKHLAQ":
        return <Calendar className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "QURAN":
        return "bg-green-100 text-green-800";
      case "TAHSIN":
        return "bg-blue-100 text-blue-800";
      case "AKHLAQ":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    if (filterType === "all") return true;
    return assessment.type === filterType;
  });

  const calculateAverageScore = () => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    return total / assessments.length;
  };

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    
    if (currentScore > previousScore) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (currentScore < previousScore) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const openAssessmentDetail = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowDetail(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Riwayat Penilaian - {santriName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Penilaian</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {assessments.length}
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
                      <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                      <p className={`text-2xl font-bold ${getScoreColor(calculateAverageScore())}`}>
                        {calculateAverageScore().toFixed(1)}
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
                      <p className="text-sm text-gray-600">Penilaian Terakhir</p>
                      <p className="text-sm font-medium text-gray-900">
                        {assessments.length > 0
                          ? new Date(assessments[0].assessedAt).toLocaleDateString("id-ID")
                          : "Belum ada"
                        }
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex justify-between items-center">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="QURAN">Quran</SelectItem>
                  <SelectItem value="TAHSIN">Tahsin</SelectItem>
                  <SelectItem value="AKHLAQ">Akhlaq</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Penilaian</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Materi</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment, index) => {
                        const previousAssessment = filteredAssessments[index + 1];
                        return (
                          <TableRow key={assessment.id}>
                            <TableCell>
                              {new Date(assessment.assessedAt).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeBadgeColor(assessment.type)}>
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(assessment.type)}
                                  {assessment.type}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>{assessment.category}</TableCell>
                            <TableCell>
                              {assessment.surah ? (
                                <div className="text-sm">
                                  <div className="font-medium">{assessment.surah}</div>
                                  {assessment.ayahStart && assessment.ayahEnd && (
                                    <div className="text-gray-500">
                                      Ayat {assessment.ayahStart}-{assessment.ayahEnd}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${getScoreColor(assessment.score)}`}>
                                {assessment.score}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getGradeColor(assessment.grade)}>
                                {assessment.grade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getScoreTrend(assessment.score, previousAssessment?.score)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAssessmentDetail(assessment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                {!loading && filteredAssessments.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada riwayat penilaian</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Detail Dialog */}
      {showDetail && selectedAssessment && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Penilaian</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Jenis</label>
                  <Badge className={getTypeBadgeColor(selectedAssessment.type)}>
                    {selectedAssessment.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.category}</p>
                </div>
              </div>

              {selectedAssessment.surah && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Surah</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.surah}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ayat</label>
                    <p className="text-sm text-gray-900">
                      {selectedAssessment.ayahStart}-{selectedAssessment.ayahEnd}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nilai</label>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAssessment.score)}`}>
                    {selectedAssessment.score}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Grade</label>
                  <Badge className={getGradeColor(selectedAssessment.grade)}>
                    {selectedAssessment.grade}
                  </Badge>
                </div>
              </div>

              {selectedAssessment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Catatan</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedAssessment.notes}
                  </p>
                </div>
              )}

              {selectedAssessment.strengths && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Kelebihan</label>
                  <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-md">
                    {selectedAssessment.strengths}
                  </p>
                </div>
              )}

              {selectedAssessment.improvements && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Saran Perbaikan</label>
                  <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                    {selectedAssessment.improvements}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Penilaian</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedAssessment.assessedAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
