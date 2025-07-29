"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Award,
  BookOpen,
  Users,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import BehaviorCriteriaForm from "@/components/behavior/BehaviorCriteriaForm";
import BehaviorCriteriaDetail from "@/components/behavior/BehaviorCriteriaDetail";

// Types
interface BehaviorCriteria {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  category:
    | "AKHLAQ"
    | "IBADAH"
    | "ACADEMIC"
    | "SOCIAL"
    | "DISCIPLINE"
    | "LEADERSHIP";
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  points: number;
  isActive: boolean;
  ageGroup: string;
  examples: string[];
  consequences?: string[];
  rewards?: string[];
  islamicReference?: {
    quranVerse?: string;
    hadith?: string;
    explanation?: string;
  };
  usage?: {
    total: number;
    recent: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BehaviorCriteriaPage() {
  const [criteria, setCriteria] = useState<BehaviorCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] =
    useState<BehaviorCriteria | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  useEffect(() => {
    loadCriteria();
  }, [pagination.page]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      console.log("?? Loading criteria data...");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("isActive", statusFilter);

      console.log("?? Request params:", params.toString());

      const response = await fetch(`/api/behavior-criteria?${params}`);
      console.log("?? Response status:", response.status);

      const data = await response.json();
      console.log("?? Response data:", data);

      if (data.success) {
        setCriteria(data.data || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        );
        console.log(`? Loaded ${data.data?.length || 0} criteria`);
      } else {
        console.error("? API error:", data.message);
        setError(data.message || "Gagal memuat data kriteria");
        setErrorType(data.error || "UNKNOWN");
        if (data.error === "TABLE_NOT_EXISTS") {
          toast.error(
            "Database belum disetup. Silakan jalankan migration terlebih dahulu.",
          );
        } else {
          toast.error(data.message || "Gagal memuat data kriteria");
        }
        setCriteria([]);
      }
    } catch (error) {
      console.error("? Network error loading criteria:", error);
      setError("Gagal terhubung ke server. Pastikan server berjalan.");
      setErrorType("NETWORK_ERROR");
      toast.error("Gagal terhubung ke server. Pastikan server berjalan.");
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    console.log("?? Search term changed:", value);
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Debounce search to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      loadCriteria();
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`?? Filter ${filterType} changed to:`, value);
    switch (filterType) {
      case "category":
        setCategoryFilter(value);
        break;
      case "type":
        setTypeFilter(value);
        break;
      case "status":
        setStatusFilter(value);
        break;
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Apply filter immediately
    setTimeout(() => loadCriteria(), 100);
  };

  const handleAddCriteria = () => {
    setSelectedCriteria(null);
    setShowAddModal(true);
  };

  const handleEditCriteria = (criteria: BehaviorCriteria) => {
    setSelectedCriteria(criteria);
    setShowEditModal(true);
  };

  const handleViewCriteria = (criteria: BehaviorCriteria) => {
    setSelectedCriteria(criteria);
    setShowDetailModal(true);
  };

  const handleDeleteCriteria = async (criteria: BehaviorCriteria) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus kriteria "${criteria.name}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/behavior-criteria?id=${criteria.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Kriteria berhasil dihapus");
        loadCriteria();
      } else {
        toast.error(data.message || "Gagal menghapus kriteria");
      }
    } catch (error) {
      console.error("Error deleting criteria:", error);
      toast.error("Gagal menghapus kriteria");
    }
  };

  const handleToggleStatus = async (criteria: BehaviorCriteria) => {
    try {
      const response = await fetch("/api/behavior-criteria", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: criteria.id,
          isActive: !criteria.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Kriteria ${!criteria.isActive ? "diaktifkan" : "dinonaktifkan"}`,
        );
        loadCriteria();
      } else {
        toast.error(data.message || "Gagal mengubah status kriteria");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Gagal mengubah status kriteria");
    }
  };

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AKHLAQ":
        return <Star className="h-4 w-4" />;
      case "IBADAH":
        return <Award className="h-4 w-4" />;
      case "ACADEMIC":
        return <BookOpen className="h-4 w-4" />;
      case "SOCIAL":
        return <Users className="h-4 w-4" />;
      case "DISCIPLINE":
        return <Shield className="h-4 w-4" />;
      case "LEADERSHIP":
        return <Crown className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AKHLAQ":
        return "text-green-600 bg-green-100";
      case "IBADAH":
        return "text-blue-600 bg-blue-100";
      case "ACADEMIC":
        return "text-purple-600 bg-purple-100";
      case "SOCIAL":
        return "text-orange-600 bg-orange-100";
      case "DISCIPLINE":
        return "text-red-600 bg-red-100";
      case "LEADERSHIP":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "text-green-600 bg-green-100";
      case "NEGATIVE":
        return "text-red-600 bg-red-100";
      case "NEUTRAL":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kriteria perilaku...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state with helpful information
  if (error && errorType) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-100 text-red-600 p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {errorType === "TABLE_NOT_EXISTS"
                ? "Database Belum Disetup"
                : "Terjadi Kesalahan"}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>

            {errorType === "TABLE_NOT_EXISTS" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Langkah Setup Database:
                </h3>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Pastikan XAMPP MySQL berjalan</li>
                  <li>
                    2. Jalankan:{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      scripts\setup-behavior-tables.bat
                    </code>
                  </li>
                  <li>3. Refresh halaman ini</li>
                </ol>
              </div>
            )}

            {errorType === "NETWORK_ERROR" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-blue-800 mb-2">
                  Periksa Koneksi:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Server Next.js berjalan di port 3000</li>
                  <li>• Tidak ada firewall yang memblokir</li>
                  <li>• Database MySQL dapat diakses</li>
                </ul>
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  setErrorType(null);
                  loadCriteria();
                }}
              >
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open("/docs/BEHAVIOR_CRITERIA_MANAGEMENT.md", "_blank")
                }
              >
                Lihat Dokumentasi
              </Button>
            </div>
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
              Manajemen Kriteria Perilaku
            </h1>
            <p className="text-gray-600">
              Kelola kriteria penilaian perilaku santri
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setErrorType(null);
                loadCriteria();
              }}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleAddCriteria}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kriteria
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari kriteria..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {loading && searchTerm && (
                  <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                <option value="AKHLAQ">Akhlaq</option>
                <option value="IBADAH">Ibadah</option>
                <option value="ACADEMIC">Akademik</option>
                <option value="SOCIAL">Sosial</option>
                <option value="DISCIPLINE">Disiplin</option>
                <option value="LEADERSHIP">Kepemimpinan</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="POSITIVE">Positif</option>
                <option value="NEGATIVE">Negatif</option>
                <option value="NEUTRAL">Netral</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Criteria Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daftar Kriteria Perilaku ({pagination.total} total)</span>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Memuat data...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Kriteria
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Tipe
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Tingkat
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Poin
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Penggunaan
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.nameArabic}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(item.category)}`}
                        >
                          {getCategoryIcon(item.category)}
                          <span className="ml-1">{item.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(item.type)}`}
                        >
                          {item.type === "POSITIVE"
                            ? "?"
                            : item.type === "NEGATIVE"
                              ? "??"
                              : "?"}
                          <span className="ml-1">{item.type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(item.severity)}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${item.points > 0 ? "text-green-600" : item.points < 0 ? "text-red-600" : "text-gray-600"}`}
                        >
                          {item.points > 0 ? "+" : ""}
                          {item.points}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            item.isActive
                              ? "text-green-600 bg-green-100 hover:bg-green-200"
                              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {item.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {item.usage?.total || 0} total
                          </div>
                          <div className="text-gray-500">
                            {item.usage?.recent || 0} bulan ini
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCriteria(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCriteria(item)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCriteria(item)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                            disabled={item.usage && item.usage.total > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {criteria.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada kriteria
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ||
                    categoryFilter !== "all" ||
                    typeFilter !== "all" ||
                    statusFilter !== "all"
                      ? "Tidak ada kriteria yang sesuai dengan filter"
                      : "Belum ada kriteria perilaku yang ditambahkan"}
                  </p>
                  {!searchTerm &&
                    categoryFilter === "all" &&
                    typeFilter === "all" &&
                    statusFilter === "all" && (
                      <Button onClick={handleAddCriteria}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Kriteria Pertama
                      </Button>
                    )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  dari {pagination.total} kriteria
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={!pagination.hasPrev}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={!pagination.hasNext}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <BehaviorCriteriaForm
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCriteria(null);
          }}
          onSave={loadCriteria}
          editData={selectedCriteria}
          title={
            showEditModal
              ? "Edit Kriteria Perilaku"
              : "Tambah Kriteria Perilaku"
          }
        />

        {/* Detail Modal */}
        <BehaviorCriteriaDetail
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCriteria(null);
          }}
          criteria={selectedCriteria}
        />
      </div>
    </DashboardLayout>
  );
}
