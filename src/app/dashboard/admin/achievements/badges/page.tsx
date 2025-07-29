"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Star,
  Tag,
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
import BadgeForm from "@/components/achievements/BadgeForm";

export default function AchievementBadgesPage() {
  const [badges, setBadges] = useState<AchievementBadge[]>([
    ...ACHIEVEMENT_BADGES,
  ]);
  const [filteredBadges, setFilteredBadges] = useState<AchievementBadge[]>([
    ...ACHIEVEMENT_BADGES,
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<AchievementBadge | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    filterBadges();
  }, [
    searchTerm,
    categoryFilter,
    rarityFilter,
    statusFilter,
    sortField,
    sortDirection,
    badges,
  ]);

  const filterBadges = () => {
    let filtered = [...badges];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (badge) =>
          badge.name.toLowerCase().includes(searchLower) ||
          badge.description.toLowerCase().includes(searchLower) ||
          badge.nameArabic.includes(searchTerm),
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((badge) => badge.category === categoryFilter);
    }

    // Filter by rarity
    if (rarityFilter !== "all") {
      filtered = filtered.filter((badge) => badge.rarity === rarityFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (badge) => badge.isActive === (statusFilter === "active"),
      );
    }

    // Sort badges
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "rarity":
          // Sort by rarity level (COMMON < UNCOMMON < RARE < EPIC < LEGENDARY)
          const rarityOrder = {
            COMMON: 1,
            UNCOMMON: 2,
            RARE: 3,
            EPIC: 4,
            LEGENDARY: 5,
          };
          comparison =
            (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
          break;
        case "points":
          comparison = a.points - b.points;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredBadges(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddBadge = () => {
    setEditingBadge(null);
    setShowForm(true);
  };

  const handleEditBadge = (badge: AchievementBadge) => {
    setEditingBadge(badge);
    setShowForm(true);
  };

  const handleDeleteBadge = (badgeId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus badge ini?")) {
      // In a real app, we'd call an API here
      setBadges(badges.filter((badge) => badge.id !== badgeId));
      toast.success("Badge berhasil dihapus");
    }
  };

  const handleFormSubmit = (data: any) => {
    setIsSubmitting(true);

    try {
      // In a real app, we'd call an API here
      setTimeout(() => {
        if (editingBadge) {
          // Update existing badge
          const updatedBadges = badges.map((badge) =>
            badge.id === editingBadge.id ? { ...data, id: badge.id } : badge,
          );
          setBadges(updatedBadges);
          toast.success("Badge berhasil diperbarui");
        } else {
          // Add new badge
          const newBadge = {
            ...data,
            id: `badge_${Date.now()}`,
          };
          setBadges([...badges, newBadge]);
          toast.success("Badge baru berhasil ditambahkan");
        }

        setShowForm(false);
        setEditingBadge(null);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving badge:", error);
      toast.error("Gagal menyimpan badge");
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBadge(null);
  };

  if (showForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingBadge ? "Edit Badge" : "Tambah Badge Baru"}
              </h1>
              <p className="text-gray-600">
                {editingBadge
                  ? "Perbarui informasi badge"
                  : "Buat badge achievement baru"}
              </p>
            </div>
            <Button variant="outline" onClick={handleCancelForm}>
              Kembali ke Daftar
            </Button>
          </div>

          <BadgeForm
            badge={editingBadge || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
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
              Achievement Badges
            </h1>
            <p className="text-gray-600">
              Kelola badge achievement untuk santri
            </p>
          </div>
          <Button onClick={handleAddBadge}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Badge
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari badge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("name")}
                      >
                        <span>Badge</span>
                        {sortField === "name" && (
                          <ArrowUpDown
                            className={`h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("category")}
                      >
                        <span>Kategori</span>
                        {sortField === "category" && (
                          <ArrowUpDown
                            className={`h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("rarity")}
                      >
                        <span>Kelangkaan</span>
                        {sortField === "rarity" && (
                          <ArrowUpDown
                            className={`h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleSort("points")}
                      >
                        <span>Poin</span>
                        {sortField === "points" && (
                          <ArrowUpDown
                            className={`h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBadges.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Tidak ada badge yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredBadges.map((badge) => (
                      <tr key={badge.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-2xl">
                              {badge.icon}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {badge.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {badge.nameArabic}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(badge.category)}`}
                          >
                            {getCategoryText(badge.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRarityColor(badge.rarity)}`}
                          >
                            {getRarityText(badge.rarity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-900">
                              {badge.points}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              badge.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {badge.isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditBadge(badge)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBadge(badge.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
