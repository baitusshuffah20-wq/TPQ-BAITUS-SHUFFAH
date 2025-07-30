"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  Building2,
  GraduationCap,
  BookOpen,
  Utensils,
  AlertCircle,
  CheckCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  target: number;
  collected: number;
  icon?: string;
  color?: string;
  bgColor?: string;
  urgent: boolean;
  isActive: boolean;
  order: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  donationCount: number;
  campaignCount: number;
}

const iconOptions = [
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "GraduationCap", label: "Education", icon: GraduationCap },
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "Utensils", label: "Food", icon: Utensils },
];

const colorOptions = [
  { value: "text-red-600", label: "Red", bgValue: "bg-red-50" },
  { value: "text-blue-600", label: "Blue", bgValue: "bg-blue-50" },
  { value: "text-green-600", label: "Green", bgValue: "bg-green-50" },
  { value: "text-purple-600", label: "Purple", bgValue: "bg-purple-50" },
  { value: "text-yellow-600", label: "Yellow", bgValue: "bg-yellow-50" },
  { value: "text-orange-600", label: "Orange", bgValue: "bg-orange-50" },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    target: "",
    icon: "Heart",
    color: "text-red-600",
    bgColor: "bg-red-50",
    urgent: false,
    isActive: true,
    order: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isFormOpen) {
      if (selectedCategory) {
        // Edit mode - populate form with existing data
        setFormData({
          title: selectedCategory.title,
          slug: selectedCategory.slug,
          description: selectedCategory.description || "",
          target: selectedCategory.target.toString(),
          icon: selectedCategory.icon || "Heart",
          color: selectedCategory.color || "text-red-600",
          bgColor: selectedCategory.bgColor || "bg-red-50",
          urgent: selectedCategory.urgent,
          isActive: selectedCategory.isActive,
          order: selectedCategory.order.toString(),
        });
      } else {
        // Add mode - reset form
        setFormData({
          title: "",
          slug: "",
          description: "",
          target: "",
          icon: "Heart",
          color: "text-red-600",
          bgColor: "bg-red-50",
          urgent: false,
          isActive: true,
          order: "",
        });
      }
    }
  }, [isFormOpen, selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donations/categories");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      } else {
        console.error("Failed to load categories:", data.error);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Gagal memuat data kategori");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      setFormLoading(true);

      // Validate required fields
      if (!formData.title) {
        toast.error("Nama kategori harus diisi");
        return;
      }

      // Generate slug if not provided
      const slug = formData.slug || formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const url = selectedCategory
        ? `/api/donations/categories/${selectedCategory.id}`
        : "/api/donations/categories";

      const method = selectedCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug,
          target: parseInt(formData.target) || 0,
          order: parseInt(formData.order) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          selectedCategory
            ? "Kategori berhasil diperbarui"
            : "Kategori berhasil ditambahkan",
        );
        setIsFormOpen(false);
        setSelectedCategory(null);
        loadCategories();
      } else {
        toast.error(data.error || "Gagal menyimpan kategori");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Terjadi kesalahan saat menyimpan kategori");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/donations/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Kategori berhasil dihapus");
        loadCategories();
      } else {
        toast.error(data.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Terjadi kesalahan saat menghapus kategori");
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/donations/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Kategori berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
        );
        loadCategories();
      } else {
        toast.error(data.error || "Gagal mengubah status kategori");
      }
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error("Terjadi kesalahan saat mengubah status kategori");
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : Heart;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Kategori Donasi</h3>
          <p className="text-gray-600">Kelola kategori untuk mengorganisir donasi</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon || "Heart");
          
          return (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      {category.urgent && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{category.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                  <div className="flex justify-between text-sm mt-1 text-gray-600">
                    <span>Rp {category.collected.toLocaleString()}</span>
                    <span>Rp {category.target.toLocaleString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span>{category.donationCount} donasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span>{category.campaignCount} campaign</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={(checked) =>
                      handleToggleStatus(category.id, checked)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada kategori donasi
            </h3>
            <p className="text-gray-600 mb-4">
              Tambahkan kategori untuk mengorganisir donasi
            </p>
            <Button
              onClick={() => {
                setSelectedCategory(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Nama Kategori *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan nama kategori"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated dari nama"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi kategori donasi"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target Dana (Rp)</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="order">Urutan</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Warna</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => {
                    const colorOption = colorOptions.find(opt => opt.value === value);
                    setFormData({
                      ...formData,
                      color: value,
                      bgColor: colorOption?.bgValue || "bg-gray-50"
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${option.bgValue} border`}>
                            <div className={`w-full h-full rounded ${option.value.replace('text-', 'bg-')}`}></div>
                          </div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
                />
                <Label htmlFor="urgent">Tandai sebagai urgent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={formLoading}
              >
                Batal
              </Button>
              <Button onClick={handleSaveCategory} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  selectedCategory ? "Perbarui" : "Simpan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
