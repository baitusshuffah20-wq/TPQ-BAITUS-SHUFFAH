"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Heart,
  Building2,
  GraduationCap,
  BookOpen,
  Utensils,
  Calendar,
  Target,
  Users,
  MapPin,
  Star,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

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
  category?: {
    id: string;
    title: string;
    icon?: string;
    color?: string;
  };
  progress: number;
  donorCount: number;
}

const iconMap = {
  Heart,
  Building2,
  GraduationCap,
  BookOpen,
  Utensils,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        ...(categoryFilter !== "ALL" && { categoryId: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/donations/campaigns?${params}`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        console.error("Failed to load campaigns:", data.error);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return Heart;
    }
    return iconMap[iconName as keyof typeof iconMap];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || 
      campaign.category?.id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredCampaigns = filteredCampaigns.filter(c => c.featured);
  const regularCampaigns = filteredCampaigns.filter(c => !c.featured);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat campaign donasi...</p>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Campaign Donasi
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                Bergabunglah dalam berbagai campaign donasi untuk membantu 
                pengembangan TPQ Baitus Shuffah
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Cari campaign..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  {/* Categories will be loaded dynamically */}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="ALL">Semua Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Featured Campaigns */}
          {featuredCampaigns.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Campaign Unggulan
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} featured />
                ))}
              </div>
            </div>
          )}

          {/* Regular Campaigns */}
          {regularCampaigns.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Semua Campaign
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {filteredCampaigns.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada campaign ditemukan
                </h3>
                <p className="text-gray-600">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

// Campaign Card Component
function CampaignCard({ campaign, featured = false }: { campaign: Campaign; featured?: boolean }) {
  const IconComponent = campaign.category?.icon
    ? iconMap[campaign.category.icon as keyof typeof iconMap] || Heart
    : Heart;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining(campaign.endDate);

  return (
    <Card className={`relative overflow-hidden hover:shadow-lg transition-shadow ${featured ? 'ring-2 ring-yellow-400' : ''}`}>
      {featured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Unggulan
          </Badge>
        </div>
      )}
      
      {campaign.urgent && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        </div>
      )}

      {campaign.image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {campaign.category && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <IconComponent className={`h-4 w-4 ${campaign.category.color || 'text-gray-600'}`} />
              <span>{campaign.category.title}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">
          {campaign.title}
        </CardTitle>
        {campaign.shortDesc && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {campaign.shortDesc}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Terkumpul</span>
            <span className="font-medium">{campaign.progress.toFixed(1)}%</span>
          </div>
          <Progress value={campaign.progress} className="h-2" />
          <div className="flex justify-between text-sm mt-1 text-gray-600">
            <span>{formatCurrency(campaign.collected)}</span>
            <span>{formatCurrency(campaign.target)}</span>
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

        {/* Location & Time */}
        <div className="text-sm text-gray-600 space-y-1">
          {campaign.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{campaign.location}</span>
            </div>
          )}
          {daysRemaining !== null && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {daysRemaining > 0 
                  ? `${daysRemaining} hari tersisa`
                  : "Campaign berakhir"
                }
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/campaigns/${campaign.slug}`}>
          <Button className="w-full">
            Donasi Sekarang
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
