"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Mic,
  Heart,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  halaqahId: string;
  santriId?: string;
  santriList?: any[];
}

interface AssessmentData {
  type: "QURAN" | "TAHSIN" | "AKHLAQ";
  category: string;
  surah?: string;
  ayahStart?: number;
  ayahEnd?: number;
  score: number;
  notes?: string;
  strengths?: string;
  improvements?: string;
}

export default function AssessmentForm({
  isOpen,
  onClose,
  onSuccess,
  halaqahId,
  santriId,
  santriList = [],
}: AssessmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSantriId, setSelectedSantriId] = useState(santriId || "");
  const [assessments, setAssessments] = useState<AssessmentData[]>([
    {
      type: "QURAN",
      category: "Hafalan Baru",
      score: 0,
      surah: "",
      ayahStart: 1,
      ayahEnd: 1,
      notes: "",
      strengths: "",
      improvements: "",
    },
    {
      type: "TAHSIN",
      category: "Bacaan & Tajwid",
      score: 0,
      notes: "",
      strengths: "",
      improvements: "",
    },
    {
      type: "AKHLAQ",
      category: "Perilaku & Adab",
      score: 0,
      notes: "",
      strengths: "",
      improvements: "",
    },
  ]);

  const surahList = [
    "Al-Fatihah",
    "Al-Baqarah",
    "Ali Imran",
    "An-Nisa",
    "Al-Maidah",
    "Al-An'am",
    "Al-A'raf",
    "Al-Anfal",
    "At-Taubah",
    "Yunus",
    "Hud",
    "Yusuf",
    "Ar-Ra'd",
    "Ibrahim",
    "Al-Hijr",
    "An-Nahl",
    "Al-Isra",
    "Al-Kahf",
    "Maryam",
    "Ta-Ha",
    // Add more surahs as needed
    "Al-Mulk",
    "Al-Qalam",
    "Al-Haqqah",
    "Al-Ma'arij",
    "Nuh",
    "Al-Jinn",
    "Al-Muzzammil",
    "Al-Muddaththir",
    "Al-Qiyamah",
    "Al-Insan",
    "Al-Mursalat",
    "An-Naba",
    "An-Nazi'at",
    "Abasa",
    "At-Takwir",
    "Al-Infitar",
    "Al-Mutaffifin",
    "Al-Inshiqaq",
    "Al-Buruj",
    "At-Tariq",
    "Al-A'la",
    "Al-Ghashiyah",
    "Al-Fajr",
    "Al-Balad",
    "Ash-Shams",
    "Al-Lail",
    "Ad-Duha",
    "Ash-Sharh",
    "At-Tin",
    "Al-Alaq",
    "Al-Qadr",
    "Al-Bayyinah",
    "Az-Zalzalah",
    "Al-Adiyat",
    "Al-Qari'ah",
    "At-Takathur",
    "Al-Asr",
    "Al-Humazah",
    "Al-Fil",
    "Quraish",
    "Al-Ma'un",
    "Al-Kawthar",
    "Al-Kafirun",
    "An-Nasr",
    "Al-Masad",
    "Al-Ikhlas",
    "Al-Falaq",
    "An-Nas",
  ];

  const quranCategories = [
    "Hafalan Baru",
    "Muraja'ah",
    "Tasmi'",
    "Ziyadah",
    "Evaluasi Bulanan",
  ];

  const tahsinCategories = [
    "Bacaan & Tajwid",
    "Makharijul Huruf",
    "Sifatul Huruf",
    "Ahkamul Huruf",
    "Waqaf & Ibtida",
  ];

  const akhlaqCategories = [
    "Perilaku & Adab",
    "Kedisiplinan",
    "Kerjasama",
    "Kepemimpinan",
    "Ibadah",
  ];

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const updateAssessment = (
    index: number,
    field: keyof AssessmentData,
    value: any,
  ) => {
    setAssessments((prev) =>
      prev.map((assessment, i) =>
        i === index ? { ...assessment, [field]: value } : assessment,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSantriId) {
      toast.error("Pilih santri terlebih dahulu");
      return;
    }

    // Validate that at least one assessment has a score > 0
    const validAssessments = assessments.filter((a) => a.score > 0);
    if (validAssessments.length === 0) {
      toast.error("Minimal satu penilaian harus diisi");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        santriId: selectedSantriId,
        halaqahId,
        assessorId: "cmdeg7tpn0001ebjnth10djeu", // Mock user ID - should come from auth context
        assessments: validAssessments,
      };

      console.log("?? Sending assessment payload:", payload);
      console.log("?? Valid assessments:", validAssessments);

      const response = await fetch("/api/halaqah/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("?? Response status:", response.status);
      console.log("?? Response ok:", response.ok);

      if (!response.ok) {
        console.error("? HTTP Error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("? Error response body:", errorText);
        toast.error(`HTTP Error ${response.status}: ${response.statusText}`);
        return;
      }

      const result = await response.json();
      console.log("?? API Response:", result);

      if (result.success) {
        console.log("? Assessment saved successfully");
        toast.success(result.message || "Penilaian berhasil disimpan");
        onSuccess();
        onClose();
        // Reset form
        setAssessments([
          {
            type: "QURAN",
            category: "Hafalan Baru",
            score: 0,
            surah: "",
            ayahStart: 1,
            ayahEnd: 1,
            notes: "",
            strengths: "",
            improvements: "",
          },
          {
            type: "TAHSIN",
            category: "Bacaan & Tajwid",
            score: 0,
            notes: "",
            strengths: "",
            improvements: "",
          },
          {
            type: "AKHLAQ",
            category: "Perilaku & Adab",
            score: 0,
            notes: "",
            strengths: "",
            improvements: "",
          },
        ]);
      } else {
        console.error("? API returned error:", result);
        toast.error(
          result.error || result.message || "Gagal menyimpan penilaian",
        );
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Terjadi kesalahan saat menyimpan penilaian");
    } finally {
      setLoading(false);
    }
  };

  const selectedSantri = santriList.find((s) => s.id === selectedSantriId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Penilaian Terintegrasi
          </DialogTitle>
          <DialogDescription>
            Input penilaian untuk Al-Qur'an, Tahsin, dan Akhlaq dalam satu form
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Santri Selection */}
          {!santriId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pilih Santri</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedSantriId}
                  onValueChange={setSelectedSantriId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih santri untuk dinilai" />
                  </SelectTrigger>
                  <SelectContent>
                    {santriList.map((santri) => (
                      <SelectItem key={santri.id} value={santri.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{santri.name}</span>
                          <Badge variant="outline" className="ml-2">
                            NIS: {santri.nis}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {selectedSantri && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">
                Santri yang dinilai:
              </h3>
              <p className="text-blue-800">
                {selectedSantri.name} (NIS: {selectedSantri.nis})
              </p>
            </div>
          )}

          {/* Al-Qur'an Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Penilaian Al-Qur'an
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={assessments[0].category}
                    onValueChange={(value) =>
                      updateAssessment(0, "category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quranCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Surah</Label>
                  <Select
                    value={assessments[0].surah}
                    onValueChange={(value) =>
                      updateAssessment(0, "surah", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahList.map((surah) => (
                        <SelectItem key={surah} value={surah}>
                          {surah}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ayat Mulai</Label>
                  <Input
                    type="number"
                    min="1"
                    value={assessments[0].ayahStart || ""}
                    onChange={(e) =>
                      updateAssessment(
                        0,
                        "ayahStart",
                        parseInt(e.target.value) || 1,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Ayat Selesai</Label>
                  <Input
                    type="number"
                    min="1"
                    value={assessments[0].ayahEnd || ""}
                    onChange={(e) =>
                      updateAssessment(
                        0,
                        "ayahEnd",
                        parseInt(e.target.value) || 1,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Nilai (0-100)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={assessments[0].score || ""}
                      onChange={(e) =>
                        updateAssessment(
                          0,
                          "score",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <Badge className={getGradeColor(assessments[0].score)}>
                      {getGradeLetter(assessments[0].score)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kelebihan</Label>
                  <Textarea
                    value={assessments[0].strengths || ""}
                    onChange={(e) =>
                      updateAssessment(0, "strengths", e.target.value)
                    }
                    placeholder="Catat kelebihan santri..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Perlu Diperbaiki</Label>
                  <Textarea
                    value={assessments[0].improvements || ""}
                    onChange={(e) =>
                      updateAssessment(0, "improvements", e.target.value)
                    }
                    placeholder="Catat yang perlu diperbaiki..."
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan Tambahan</Label>
                <Textarea
                  value={assessments[0].notes || ""}
                  onChange={(e) => updateAssessment(0, "notes", e.target.value)}
                  placeholder="Catatan umum untuk penilaian Al-Qur'an..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tahsin Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-5 w-5 text-blue-600" />
                Penilaian Tahsin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={assessments[1].category}
                    onValueChange={(value) =>
                      updateAssessment(1, "category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tahsinCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nilai (0-100)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={assessments[1].score || ""}
                      onChange={(e) =>
                        updateAssessment(
                          1,
                          "score",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <Badge className={getGradeColor(assessments[1].score)}>
                      {getGradeLetter(assessments[1].score)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kelebihan</Label>
                  <Textarea
                    value={assessments[1].strengths || ""}
                    onChange={(e) =>
                      updateAssessment(1, "strengths", e.target.value)
                    }
                    placeholder="Catat kelebihan dalam tahsin..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Perlu Diperbaiki</Label>
                  <Textarea
                    value={assessments[1].improvements || ""}
                    onChange={(e) =>
                      updateAssessment(1, "improvements", e.target.value)
                    }
                    placeholder="Catat yang perlu diperbaiki..."
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan Tambahan</Label>
                <Textarea
                  value={assessments[1].notes || ""}
                  onChange={(e) => updateAssessment(1, "notes", e.target.value)}
                  placeholder="Catatan umum untuk penilaian Tahsin..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Akhlaq Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Penilaian Akhlaq
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={assessments[2].category}
                    onValueChange={(value) =>
                      updateAssessment(2, "category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {akhlaqCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nilai (0-100)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={assessments[2].score || ""}
                      onChange={(e) =>
                        updateAssessment(
                          2,
                          "score",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <Badge className={getGradeColor(assessments[2].score)}>
                      {getGradeLetter(assessments[2].score)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kelebihan</Label>
                  <Textarea
                    value={assessments[2].strengths || ""}
                    onChange={(e) =>
                      updateAssessment(2, "strengths", e.target.value)
                    }
                    placeholder="Catat kelebihan dalam akhlaq..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Perlu Diperbaiki</Label>
                  <Textarea
                    value={assessments[2].improvements || ""}
                    onChange={(e) =>
                      updateAssessment(2, "improvements", e.target.value)
                    }
                    placeholder="Catat yang perlu diperbaiki..."
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan Tambahan</Label>
                <Textarea
                  value={assessments[2].notes || ""}
                  onChange={(e) => updateAssessment(2, "notes", e.target.value)}
                  placeholder="Catatan umum untuk penilaian Akhlaq..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Penilaian"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
