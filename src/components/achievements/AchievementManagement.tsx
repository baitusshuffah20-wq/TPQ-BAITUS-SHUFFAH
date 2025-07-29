"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle,
  Play,
  Users,
  Award,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Santri {
  id: string;
  name: string;
  nis: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  rarity: string;
}

interface AchievementManagementProps {
  onRefresh?: () => void;
}

export default function AchievementManagement({
  onRefresh,
}: AchievementManagementProps) {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [badgeList, setBadgeList] = useState<Badge[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSantriList();
    loadBadgeList();
  }, []);

  const loadSantriList = async () => {
    try {
      const response = await fetch("/api/santri");
      if (response.ok) {
        const data = await response.json();
        setSantriList(data.santri || []);
      }
    } catch (error) {
      console.error("Error loading santri:", error);
    }
  };

  const loadBadgeList = async () => {
    try {
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        setBadgeList(data.badges || []);
      }
    } catch (error) {
      console.error("Error loading badges:", error);
    }
  };

  const awardAchievement = async () => {
    if (!selectedSantri || !selectedBadge) {
      toast.error("Pilih santri dan badge terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/achievements/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santriId: selectedSantri,
          badgeId: selectedBadge,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedSantri("");
        setSelectedBadge("");
        setShowAwardDialog(false);
        onRefresh?.();
      } else {
        toast.error(data.error || "Gagal memberikan achievement");
      }
    } catch (error) {
      console.error("Error awarding achievement:", error);
      toast.error("Gagal memberikan achievement");
    } finally {
      setLoading(false);
    }
  };

  const checkAllAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/achievements/check", {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `${data.message}. ${data.totalNewAchievements} achievement baru diberikan.`,
        );
        onRefresh?.();
      } else {
        toast.error(data.error || "Gagal memeriksa achievement");
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      toast.error("Gagal memeriksa achievement");
    } finally {
      setLoading(false);
    }
  };

  const checkSantriAchievements = async (santriId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/achievements/check?santriId=${santriId}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (response.ok) {
        const santriName =
          santriList.find((s) => s.id === santriId)?.name || "Santri";
        toast.success(
          `${data.count} achievement baru diberikan kepada ${santriName}`,
        );
        onRefresh?.();
      } else {
        toast.error(data.error || "Gagal memeriksa achievement");
      }
    } catch (error) {
      console.error("Error checking santri achievements:", error);
      toast.error("Gagal memeriksa achievement");
    } finally {
      setLoading(false);
    }
  };

  const filteredSantri = santriList.filter(
    (santri) =>
      santri.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      santri.nis.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Management Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Management Achievement
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAwardDialog(true)}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Berikan Achievement
              </Button>
              <Button
                onClick={checkAllAchievements}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Periksa Semua
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Periksa Achievement
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Periksa dan berikan achievement otomatis berdasarkan aktivitas
                santri
              </p>
              <Button
                onClick={checkAllAchievements}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-2" />
                Jalankan
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Award Manual</h4>
              <p className="text-sm text-gray-600 mb-3">
                Berikan achievement secara manual kepada santri tertentu
              </p>
              <Button
                onClick={() => setShowAwardDialog(true)}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                <Award className="h-4 w-4 mr-2" />
                Berikan
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Statistik</h4>
              <p className="text-sm text-gray-600 mb-3">
                Lihat statistik achievement dan progress santri
              </p>
              <Button
                size="sm"
                className="bg-gray-600 hover:bg-gray-700"
                disabled={loading}
              >
                <Users className="h-4 w-4 mr-2" />
                Lihat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Award Achievement Dialog */}
      {showAwardDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Berikan Achievement</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Santri
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari santri..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedSantri}
                  onChange={(e) => setSelectedSantri(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih Santri</option>
                  {filteredSantri.map((santri) => (
                    <option key={santri.id} value={santri.id}>
                      {santri.name} ({santri.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Badge
                </label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih Badge</option>
                  {badgeList.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name} ({badge.points} poin)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={awardAchievement}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                disabled={loading || !selectedSantri || !selectedBadge}
              >
                {loading ? "Memproses..." : "Berikan"}
              </Button>
              <Button
                onClick={() => {
                  setShowAwardDialog(false);
                  setSelectedSantri("");
                  setSelectedBadge("");
                  setSearchTerm("");
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
                disabled={loading}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Santri Check */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Periksa Achievement Per Santri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {santriList.slice(0, 6).map((santri) => (
              <div key={santri.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{santri.name}</h4>
                    <p className="text-sm text-gray-600">{santri.nis}</p>
                  </div>
                  <Button
                    onClick={() => checkSantriAchievements(santri.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
