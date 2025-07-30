"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Target,
  TrendingUp,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  target: number;
  collected: number;
  startDate: string;
  endDate?: string;
  status: string;
  priority: number;
  featured: boolean;
  urgent: boolean;
  image?: string;
  location?: string;
  beneficiaries?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    title: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  progress: number;
  donorCount: number;
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donations/campaigns");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        console.error("Failed to load campaigns:", data.error);
        toast.error("Gagal memuat data campaign");
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Terjadi kesalahan saat memuat data campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus campaign ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/donations/campaigns/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Campaign berhasil dihapus");
        loadCampaigns();
      } else {
        toast.error(data.error || "Gagal menghapus campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Terjadi kesalahan saat menghapus campaign");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PAUSED":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PAUSED">Dijeda</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buat Campaign Baru
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {campaign.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {campaign.urgent && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">{campaign.status}</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {campaign.title}
                  </CardTitle>
                  {campaign.shortDesc && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {campaign.shortDesc}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{campaign.progress.toFixed(1)}%</span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
                <div className="flex justify-between text-sm mt-1 text-gray-600">
                  <span>Rp {campaign.collected.toLocaleString()}</span>
                  <span>Rp {campaign.target.toLocaleString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{campaign.donorCount} donatur</span>
                </div>
                {campaign.beneficiaries && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span>{campaign.beneficiaries} penerima</span>
                  </div>
                )}
              </div>

              {/* Category & Location */}
              {(campaign.category || campaign.location) && (
                <div className="text-sm text-gray-600">
                  {campaign.category && (
                    <p>Kategori: {campaign.category.title}</p>
                  )}
                  {campaign.location && (
                    <p>Lokasi: {campaign.location}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCampaign(campaign.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada campaign donasi
            </h3>
            <p className="text-gray-600 mb-4">
              Buat campaign donasi pertama untuk mulai mengumpulkan dana
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Campaign Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
