"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Award,
  Star,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  ageGroup: string;
  price: string;
  icon: string;
  order: number;
  isActive: boolean;
  enrolledCount: number;
  createdAt: string;
}

const ProgramsPage = () => {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/programs");
        const data = await response.json();

        if (data.success) {
          setPrograms(data.programs);
        } else {
          throw new Error("Failed to fetch programs");
        }
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs");

        // Fallback data
        setPrograms([
          {
            id: "1",
            title: "Tahfidz Intensif",
            description:
              "Program unggulan untuk menghafal Al-Quran 30 Juz dengan metode terbukti efektif",
            features: [
              "Bimbingan ustadz hafidz berpengalaman",
              "Metode pembelajaran modern",
              "Target 1 halaman per hari",
              "Evaluasi mingguan",
              "Sertifikat resmi",
            ],
            duration: "2-3 Tahun",
            ageGroup: "10-15 Tahun",
            price: "Rp 500.000/bulan",
            icon: "BookOpen",
            order: 1,
            isActive: true,
            enrolledCount: 25,
            createdAt: "2023-01-01T00:00:00Z",
          },
          {
            id: "2",
            title: "Tahfidz Reguler",
            description:
              "Program tahfidz dengan jadwal fleksibel untuk santri yang masih bersekolah",
            features: [
              "Jadwal sore dan weekend",
              "Target sesuai kemampuan",
              "Bimbingan personal",
              "Murajaah rutin",
              "Laporan progress bulanan",
            ],
            duration: "3-4 Tahun",
            ageGroup: "8-15 Tahun",
            price: "Rp 300.000/bulan",
            icon: "Users",
            order: 2,
            isActive: true,
            enrolledCount: 40,
            createdAt: "2023-01-02T00:00:00Z",
          },
          {
            id: "3",
            title: "Tahsin & Tajwid",
            description:
              "Program perbaikan bacaan Al-Quran dengan kaidah tajwid yang benar",
            features: [
              "Perbaikan makhorijul huruf",
              "Pembelajaran tajwid lengkap",
              "Praktik langsung",
              "Audio recording",
              "Evaluasi berkala",
            ],
            duration: "6 Bulan",
            ageGroup: "7-15 Tahun",
            price: "Rp 200.000/bulan",
            icon: "Star",
            order: 3,
            isActive: true,
            enrolledCount: 30,
            createdAt: "2023-01-03T00:00:00Z",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Form state for add/edit program
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    features: string;
    duration: string;
    ageGroup: string;
    price: string;
    icon: string;
    isActive: boolean;
  }>({
    title: "",
    description: "",
    features: "",
    duration: "",
    ageGroup: "",
    price: "",
    icon: "BookOpen",
    isActive: true,
  });

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (showAddModal) {
      setFormData({
        title: "",
        description: "",
        features: "",
        duration: "",
        ageGroup: "",
        price: "",
        icon: "BookOpen",
        isActive: true,
      });
    } else if (showEditModal && currentProgram) {
      setFormData({
        title: currentProgram.title,
        description: currentProgram.description,
        features: currentProgram.features.join("\n"),
        duration: currentProgram.duration,
        ageGroup: currentProgram.ageGroup,
        price: currentProgram.price,
        icon: currentProgram.icon,
        isActive: currentProgram.isActive,
      });
    }
  }, [showAddModal, showEditModal, currentProgram]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddProgram = () => {
    setShowAddModal(true);
  };

  const handleEditProgram = (program: Program) => {
    setCurrentProgram(program);
    setShowEditModal(true);
  };

  const handleSubmitProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const isEditing = showEditModal && currentProgram;
      const url = isEditing
        ? `/api/programs/${currentProgram?.id}`
        : "/api/programs";
      const method = isEditing ? "PUT" : "POST";

      // Show loading toast
      const loadingToast = toast.loading(
        isEditing ? "Menyimpan perubahan..." : "Menambahkan program baru...",
      );

      // Parse features from textarea to array
      const featuresArray = formData.features
        .split("\n")
        .filter((f) => f.trim() !== "");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
          order: isEditing ? currentProgram.order : programs.length + 1,
          enrolledCount: isEditing ? currentProgram.enrolledCount : 0,
        }),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();

        if (isEditing) {
          setPrograms(
            programs.map((item) =>
              item.id === currentProgram?.id
                ? {
                    ...item,
                    ...formData,
                    features: featuresArray,
                  }
                : item,
            ),
          );
          setShowEditModal(false);
          toast.success("Program berhasil diperbarui");
        } else {
          const newProgram = {
            ...data.program,
            id: data.program.id || Date.now().toString(),
            features: featuresArray,
            order: programs.length + 1,
            enrolledCount: 0,
            createdAt: new Date().toISOString(),
          };
          setPrograms([...programs, newProgram]);
          setShowAddModal(false);
          toast.success("Program berhasil ditambahkan");
        }

        // Refresh the page to ensure we have the latest data
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save program");
      }
    } catch (err) {
      console.error("Error saving program:", err);
      toast.error(
        `Gagal menyimpan program: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus program ini?")) {
      try {
        const response = await fetch(`/api/programs/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setPrograms(programs.filter((item) => item.id !== id));
        } else {
          throw new Error("Failed to delete program");
        }
      } catch (err) {
        console.error("Error deleting program:", err);
        alert("Gagal menghapus program. Silakan coba lagi.");
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setPrograms(
          programs.map((item) =>
            item.id === id ? { ...item, isActive } : item,
          ),
        );
      } else {
        throw new Error(
          `Failed to ${isActive ? "activate" : "deactivate"} program`,
        );
      }
    } catch (err) {
      console.error(
        `Error ${isActive ? "activating" : "deactivating"} program:`,
        err,
      );
      alert(
        `Gagal ${isActive ? "mengaktifkan" : "menonaktifkan"} program. Silakan coba lagi.`,
      );
    }
  };

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    const currentIndex = programs.findIndex((p) => p.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === programs.length - 1)
    ) {
      return; // Can't move further
    }

    const newPrograms = [...programs];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap order values
    const currentOrder = newPrograms[currentIndex].order;
    newPrograms[currentIndex].order = newPrograms[targetIndex].order;
    newPrograms[targetIndex].order = currentOrder;

    // Swap positions in array
    [newPrograms[currentIndex], newPrograms[targetIndex]] = [
      newPrograms[targetIndex],
      newPrograms[currentIndex],
    ];

    setPrograms(newPrograms);

    // In a real app, you would update the order in the database
    try {
      await fetch(`/api/programs/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          newOrder: newPrograms[targetIndex].order,
        }),
      });
    } catch (err) {
      console.error("Error reordering programs:", err);
      // Revert changes on error
      setPrograms(programs);
      alert("Gagal mengubah urutan program. Silakan coba lagi.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-5 w-5 text-teal-600" />;
      case "Users":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "Star":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "Award":
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredPrograms = programs.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && item.isActive) ||
      (statusFilter === "INACTIVE" && !item.isActive);
    return matchesSearch && matchesStatus;
  });

  // Sort by order
  const sortedPrograms = [...filteredPrograms].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Program
            </h1>
            <p className="text-gray-600">Kelola program pembelajaran</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Program
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Program</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
              </div>
            ) : sortedPrograms.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">
                  Tidak ada program yang ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Urutan
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Program
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Durasi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Usia
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Harga
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Santri
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedPrograms.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-900">
                              {item.order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveOrder(item.id, "up")}
                                disabled={index === 0}
                                className={`${index === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"}`}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveOrder(item.id, "down")}
                                disabled={index === sortedPrograms.length - 1}
                                className={`${index === sortedPrograms.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"}`}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                              {getIconComponent(item.icon)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description.substring(0, 60)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {item.duration}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.ageGroup}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {item.price}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Tidak Aktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {item.enrolledCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleToggleStatus(item.id, !item.isActive)
                              }
                              className={
                                item.isActive
                                  ? "text-gray-600 hover:text-gray-900"
                                  : "text-green-600 hover:text-green-900"
                              }
                              title={item.isActive ? "Deactivate" : "Activate"}
                            >
                              {item.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditProgram(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProgram(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Program Modal would go here */}
        {/* For brevity, I'm not including the full modal implementation */}
        {/* In a real application, you would implement a form with fields for title, description, etc. */}
      </div>

      {/* Add Program Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Tambah Program Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitProgram} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Program
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Judul program"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Deskripsi program"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitur (satu per baris)
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Masukkan fitur program (satu per baris)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi
                    </label>
                    <Input
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Contoh: 2-3 Tahun"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelompok Usia
                    </label>
                    <Input
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      placeholder="Contoh: 10-15 Tahun"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <Input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Contoh: Rp 500.000/bulan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ikon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="BookOpen">Buku (BookOpen)</option>
                    <option value="Users">Pengguna (Users)</option>
                    <option value="Star">Bintang (Star)</option>
                    <option value="Award">Penghargaan (Award)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Program aktif
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    Simpan Program
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditModal && currentProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Edit Program
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitProgram} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Program
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Judul program"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Deskripsi program"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitur (satu per baris)
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Masukkan fitur program (satu per baris)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi
                    </label>
                    <Input
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Contoh: 2-3 Tahun"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelompok Usia
                    </label>
                    <Input
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      placeholder="Contoh: 10-15 Tahun"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <Input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Contoh: Rp 500.000/bulan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ikon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="BookOpen">Buku (BookOpen)</option>
                    <option value="Users">Pengguna (Users)</option>
                    <option value="Star">Bintang (Star)</option>
                    <option value="Award">Penghargaan (Award)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive-edit"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive-edit"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Program aktif
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowEditModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProgramsPage;
