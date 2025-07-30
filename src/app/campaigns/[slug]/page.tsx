"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonationForm from "@/components/forms/DonationForm";
import {
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
  Share2,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  content?: string;
  target: number;
  collected: number;
  startDate: string;
  endDate?: string;
  status: string;
  priority: number;
  featured: boolean;
  urgent: boolean;
  image?: string;
  gallery?: string[];
  videoUrl?: string;
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
  createdBy: {
    id: string;
    name: string;
  };
  donations: Array<{
    id: string;
    amount: number;
    donorName: string;
    isAnonymous: boolean;
    createdAt: string;
  }>;
  updates: Array<{
    id: string;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
    };
  }>;
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

export default function CampaignDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCampaign();
    }
  }, [slug]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get campaign by slug using dedicated endpoint
      const response = await fetch(`/api/donations/campaigns/slug/${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (data.success && data.campaign) {
        setCampaign(data.campaign);
      } else {
        console.error("Failed to load campaign:", data);
        setError(data.error || "Campaign tidak ditemukan");
      }
    } catch (error) {
      console.error("Error loading campaign:", error);
      setError("Terjadi kesalahan saat memuat campaign");
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: campaign?.shortDesc || campaign?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin ke clipboard!");
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat campaign...</p>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !campaign) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error || "Campaign tidak ditemukan"}
                </h3>
                <p className="text-gray-600 mb-4">
                  Campaign yang Anda cari mungkin sudah tidak tersedia atau URL salah.
                </p>
                <Button onClick={() => window.history.back()}>
                  Kembali
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const IconComponent = getIconComponent(campaign.category?.icon);
  const daysRemaining = getDaysRemaining(campaign.endDate);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 mb-6">
              <a href="/campaigns" className="hover:text-green-600">Campaign</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{campaign.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Campaign Image */}
                {campaign.image && (
                  <div className="mb-6">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Campaign Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {campaign.featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Unggulan
                      </Badge>
                    )}
                    {campaign.urgent && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                    {campaign.category && (
                      <Badge variant="outline">
                        <IconComponent className={`h-3 w-3 mr-1 ${campaign.category.color || 'text-gray-600'}`} />
                        {campaign.category.title}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {campaign.title}
                  </h1>

                  {campaign.shortDesc && (
                    <p className="text-lg text-gray-600 mb-4">
                      {campaign.shortDesc}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Oleh: {campaign.createdBy.name}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Bagikan
                    </Button>
                  </div>
                </div>

                {/* Campaign Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Deskripsi</TabsTrigger>
                    <TabsTrigger value="updates">Update ({campaign.updates.length})</TabsTrigger>
                    <TabsTrigger value="donors">Donatur ({campaign.donorCount})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-6">
                    <Card>
                      <CardContent className="p-6">
                        {campaign.content ? (
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: campaign.content }}
                          />
                        ) : (
                          <p className="text-gray-600">
                            {campaign.description || "Tidak ada deskripsi tersedia."}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates" className="mt-6">
                    <div className="space-y-4">
                      {campaign.updates.length > 0 ? (
                        campaign.updates.map((update) => (
                          <Card key={update.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{update.title}</CardTitle>
                                <span className="text-sm text-gray-500">
                                  {formatDate(update.createdAt)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {update.image && (
                                <img
                                  src={update.image}
                                  alt={update.title}
                                  className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                              )}
                              <div 
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: update.content }}
                              />
                              <div className="mt-4 text-sm text-gray-600">
                                Oleh: {update.createdBy.name}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="text-center py-8">
                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Belum ada update untuk campaign ini</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="donors" className="mt-6">
                    <Card>
                      <CardContent className="p-6">
                        {campaign.donations.length > 0 ? (
                          <div className="space-y-4">
                            {campaign.donations.map((donation) => (
                              <div key={donation.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                                <div>
                                  <p className="font-medium">
                                    {donation.isAnonymous ? "Anonim" : donation.donorName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatDate(donation.createdAt)}
                                  </p>
                                </div>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(donation.amount)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Belum ada donatur untuk campaign ini</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Progress Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Donasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Terkumpul</span>
                          <span className="font-medium">{campaign.progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-3" />
                        <div className="flex justify-between text-sm mt-2 text-gray-600">
                          <span>{formatCurrency(campaign.collected)}</span>
                          <span>{formatCurrency(campaign.target)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <Users className="h-4 w-4" />
                            <span>Donatur</span>
                          </div>
                          <p className="text-lg font-semibold">{campaign.donorCount}</p>
                        </div>
                        {campaign.beneficiaries && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                              <Target className="h-4 w-4" />
                              <span>Penerima</span>
                            </div>
                            <p className="text-lg font-semibold">{campaign.beneficiaries}</p>
                          </div>
                        )}
                      </div>

                      {/* Campaign Info */}
                      <div className="pt-4 border-t space-y-2 text-sm">
                        {campaign.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{campaign.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Dimulai {formatDate(campaign.startDate)}</span>
                        </div>
                        {daysRemaining !== null && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {daysRemaining > 0 
                                ? `${daysRemaining} hari tersisa`
                                : "Campaign berakhir"
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Donation Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Donasi Sekarang</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonationForm
                        selectedCategory={campaign.category?.id || ""}
                        selectedCategoryData={{
                          id: campaign.category?.id || "",
                          title: campaign.category?.title || "Campaign",
                          description: campaign.shortDesc || campaign.description || "",
                          target: campaign.target,
                          collected: campaign.collected,
                          icon: campaign.category?.icon || "Heart",
                          color: campaign.category?.color || "text-green-600",
                          bgColor: "bg-green-50",
                          urgent: campaign.urgent,
                          isActive: campaign.isActive,
                        }}
                        getIconComponent={getIconComponent}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
