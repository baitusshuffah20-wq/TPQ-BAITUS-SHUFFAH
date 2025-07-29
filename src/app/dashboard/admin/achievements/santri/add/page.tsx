"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Award,
  User,
  Calendar,
  Check,
  X,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ACHIEVEMENT_BADGES,
  AchievementBadge,
  getRarityColor,
  getRarityText,
  getCategoryColor,
  getCategoryText,
} from "@/lib/achievement-data";
import AchievementCard from "@/components/achievements/AchievementCard";

// Mock data for santri
const MOCK_SANTRI = [
  {
    id: "santri_1",
    name: "Ahmad Fauzi",
    nis: "TPQ001",
    halaqah: "Halaqah Al-Fatihah",
  },
  {
    id: "santri_2",
    name: "Siti Aisyah",
    nis: "TPQ002",
    halaqah: "Halaqah Al-Fatihah",
  },
  {
    id: "santri_3",
    name: "Muhammad Rizki",
    nis: "TPQ003",
    halaqah: "Halaqah Al-Baqarah",
  },
  {
    id: "santri_4",
    name: "Nur Fadilah",
    nis: "TPQ004",
    halaqah: "Halaqah Al-Baqarah",
  },
  {
    id: "santri_5",
    name: "Abdul Rahman",
    nis: "TPQ005",
    halaqah: "Halaqah Al-Imran",
  },
];

export default function AddSantriAchievementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1: Select Santri
  const [searchSantri, setSearchSantri] = useState("");
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [filteredSantri, setFilteredSantri] = useState(MOCK_SANTRI);

  // Step 2: Select Badge
  const [searchBadge, setSearchBadge] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(
    null,
  );
  const [filteredBadges, setFilteredBadges] = useState(ACHIEVEMENT_BADGES);

  // Step 3: Configure Achievement
  const [achievedAt, setAchievedAt] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [sendNotification, setSendNotification] = useState(true);
  const [generateCertificate, setGenerateCertificate] = useState(false);
  const [notes, setNotes] = useState("");

  // Filter santri based on search
  useEffect(() => {
    if (searchSantri) {
      const searchLower = searchSantri.toLowerCase();
      setFilteredSantri(
        MOCK_SANTRI.filter(
          (santri) =>
            santri.name.toLowerCase().includes(searchLower) ||
            santri.nis.toLowerCase().includes(searchLower) ||
            santri.halaqah.toLowerCase().includes(searchLower),
        ),
      );
    } else {
      setFilteredSantri(MOCK_SANTRI);
    }
  }, [searchSantri]);

  // Filter badges based on search and filters
  useEffect(() => {
    let filtered = [...ACHIEVEMENT_BADGES];

    if (searchBadge) {
      const searchLower = searchBadge.toLowerCase();
      filtered = filtered.filter(
        (badge) =>
          badge.name.toLowerCase().includes(searchLower) ||
          badge.description.toLowerCase().includes(searchLower) ||
          badge.nameArabic.includes(searchBadge),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((badge) => badge.category === categoryFilter);
    }

    if (rarityFilter !== "all") {
      filtered = filtered.filter((badge) => badge.rarity === rarityFilter);
    }

    // Only show active badges
    filtered = filtered.filter((badge) => badge.isActive);

    setFilteredBadges(filtered);
  }, [searchBadge, categoryFilter, rarityFilter]);

  const handleSelectSantri = (santri: any) => {
    setSelectedSantri(santri);
    setStep(2);
  };

  const handleSelectBadge = (badge: AchievementBadge) => {
    setSelectedBadge(badge);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedSantri || !selectedBadge) {
      toast.error("Pilih santri dan badge terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      // In a real app, we'd call an API here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Pencapaian santri berhasil ditambahkan");
      router.push("/dashboard/admin/achievements/santri");
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast.error("Gagal menambahkan pencapaian santri");
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pilih Santri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari santri berdasarkan nama atau NIS..."
                    value={searchSantri}
                    onChange={(e) => setSearchSantri(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredSantri.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada santri yang ditemukan
                    </div>
                  ) : (
                    filteredSantri.map((santri) => (
                      <div
                        key={santri.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedSantri?.id === santri.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectSantri(santri)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-medium text-gray-900">
                              {santri.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              NIS: {santri.nis}
                            </div>
                            <div className="text-sm text-gray-500">
                              {santri.halaqah}
                            </div>
                          </div>
                          {selectedSantri?.id === santri.id && (
                            <div className="ml-auto">
                              <Check className="h-6 w-6 text-teal-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pilih Badge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Cari badge..."
                        value={searchBadge}
                        onChange={(e) => setSearchBadge(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="HAFALAN">Hafalan</option>
                      <option value="ATTENDANCE">Kehadiran</option>
                      <option value="BEHAVIOR">Perilaku</option>
                      <option value="ACADEMIC">Akademik</option>
                      <option value="SPECIAL">Khusus</option>
                    </select>
                    <select
                      value={rarityFilter}
                      onChange={(e) => setRarityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua Kelangkaan</option>
                      <option value="COMMON">Umum</option>
                      <option value="UNCOMMON">Tidak Umum</option>
                      <option value="RARE">Langka</option>
                      <option value="EPIC">Epik</option>
                      <option value="LEGENDARY">Legendaris</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBadges.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Tidak ada badge yang ditemukan
                    </div>
                  ) : (
                    filteredBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`cursor-pointer transition-all ${
                          selectedBadge?.id === badge.id
                            ? "ring-2 ring-teal-500 ring-offset-2"
                            : ""
                        }`}
                        onClick={() => handleSelectBadge(badge)}
                      >
                        <AchievementCard
                          badge={badge}
                          isUnlocked={true}
                          showActions={false}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Pencapaian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pencapaian
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        value={achievedAt}
                        onChange={(e) => setAchievedAt(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opsi
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sendNotification"
                          checked={sendNotification}
                          onChange={(e) =>
                            setSendNotification(e.target.checked)
                          }
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="sendNotification"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Kirim notifikasi ke santri
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="generateCertificate"
                          checked={generateCertificate}
                          onChange={(e) =>
                            setGenerateCertificate(e.target.checked)
                          }
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="generateCertificate"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Buat sertifikat pencapaian
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan (opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Tambahkan catatan tentang pencapaian ini..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ringkasan
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Santri
                        </h4>
                        <div className="flex items-center mt-1">
                          <div className="flex-shrink-0 h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-teal-600" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {selectedSantri?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedSantri?.nis}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Badge
                        </h4>
                        <div className="flex items-center mt-1">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center text-xl">
                            {selectedBadge?.icon}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {selectedBadge?.name}
                            </div>
                            <div className="flex items-center">
                              {selectedBadge && (
                                <span
                                  className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${getCategoryColor(selectedBadge.category)}`}
                                >
                                  {getCategoryText(selectedBadge.category)}
                                </span>
                              )}
                              <span className="mx-1">•</span>
                              {selectedBadge && (
                                <span
                                  className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${getRarityColor(selectedBadge.rarity)}`}
                                >
                                  {getRarityText(selectedBadge.rarity)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Tanggal Pencapaian
                        </h4>
                        <div className="text-sm text-gray-900 mt-1">
                          {new Date(achievedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Opsi
                        </h4>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center">
                            {sendNotification ? (
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className="text-sm text-gray-700">
                              Kirim notifikasi
                            </span>
                          </div>
                          <div className="flex items-center">
                            {generateCertificate ? (
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className="text-sm text-gray-700">
                              Buat sertifikat
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah Pencapaian Santri
            </h1>
            <p className="text-gray-600">
              Berikan badge achievement kepada santri
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/admin/achievements/santri")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-full flex items-center">
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                step >= 1
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 2 ? "bg-teal-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                step >= 2
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 3 ? "bg-teal-500" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                step >= 3
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div
            className={`text-sm font-medium ${step >= 1 ? "text-teal-600" : "text-gray-500"}`}
          >
            Pilih Santri
          </div>
          <div
            className={`text-sm font-medium ${step >= 2 ? "text-teal-600" : "text-gray-500"}`}
          >
            Pilih Badge
          </div>
          <div
            className={`text-sm font-medium ${step >= 3 ? "text-teal-600" : "text-gray-500"}`}
          >
            Konfigurasi
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
          >
            Sebelumnya
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={
                (step === 1 && !selectedSantri) ||
                (step === 2 && !selectedBadge) ||
                loading
              }
            >
              Selanjutnya
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Pencapaian"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
