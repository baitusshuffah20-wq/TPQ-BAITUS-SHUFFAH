"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  BookOpen,
  Building,
  Check,
  GraduationCap,
  Heart,
  Loader2,
  Target,
  TrendingUp,
  Users,
  Utensils,
  Gift,
  Star,
  Info,
} from "lucide-react";
import { safeFetch, formatErrorForUser } from "@/lib/api-utils";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import DonationForm from "@/components/forms/DonationForm";

interface DonationCategory {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  icon: string;
  color: string;
  bgColor: string;
  urgent?: boolean;
  isActive?: boolean;
}

// Map icon strings to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Heart: Heart,
  Building: Building,
  GraduationCap: GraduationCap,
  BookOpen: BookOpen,
  Utensils: Utensils,
  Target: Target,
  Users: Users,
  TrendingUp: TrendingUp,
  Gift: Gift,
  Star: Star,
};

const DonationSection = () => {
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [donationCategories, setDonationCategories] = useState<
    DonationCategory[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  // useErrorHandler(); // Removed as it's not directly used here
  // const { addToast } = useToast(); // Removed as it's not directly used here

  // Fetch donation categories from API (using only one endpoint)
  useEffect(() => {
    const fetchDonationCategories = async () => {
      try {
        setIsLoadingCategories(true);
        console.log("Fetching donation categories...");
        try {
          const response = await safeFetch("/api/donations/categories");
          console.log("Database categories response:", response);

          if (response.success && response.data) {
            const data = response.data;
            console.log("Data received from API:", data);

            if (
              data.success &&
              Array.isArray(data.categories) &&
              data.categories.length > 0
            ) {
              console.log(
                "Setting categories from database (found active categories)",
              );
              setDonationCategories(data.categories);
              const firstCategoryId = data.categories[0].id;
              setSelectedCategory(firstCategoryId);
              return;
            } else if (
              data.success &&
              Array.isArray(data.categories) &&
              data.categories.length === 0
            ) {
              console.warn(
                "API returned no active donation categories. Proceeding to fallback.",
              );
              // Proceed to fallback categories if API returns an empty but successful array
            } else {
              console.warn(
                "API response invalid or missing categories. Proceeding to fallback.",
                data,
              );
              // Handle cases where data.categories is not an array or data.success is false
            }
          } else {
            console.warn("API request failed:", response.error);
          }
        } catch (fetchError) {
          console.error("Error fetching donation categories:", fetchError);
        }

        // Fallback to default categories if all approaches fail
        console.log("Using fallback categories");
        const fallbackCategories = [
          {
            id: "general",
            title: "Donasi Umum",
            description: "Untuk operasional sehari-hari rumah tahfidz",
            target: 100000000,
            collected: 75000000,
            icon: "Heart",
            color: "text-red-600",
            bgColor: "bg-red-50",
          },
          {
            id: "building",
            title: "Pembangunan Gedung",
            description: "Renovasi dan pembangunan fasilitas baru",
            target: 500000000,
            collected: 320000000,
            icon: "Building",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            urgent: true,
          },
          {
            id: "scholarship",
            title: "Beasiswa Santri",
            description: "Bantuan biaya pendidikan untuk santri kurang mampu",
            target: 200000000,
            collected: 150000000,
            icon: "GraduationCap",
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
        ];

        console.log("Setting fallback categories");
        setDonationCategories(fallbackCategories);
        console.log("Setting selected category to general");
        setSelectedCategory("general");
      } catch (error) {
        console.error("Error fetching donation categories:", error);
        setError("Gagal memuat kategori donasi. Silakan coba lagi nanti.");

        // Set fallback category
        setDonationCategories([
          {
            id: "general",
            title: "Donasi Umum",
            description: "Untuk operasional sehari-hari rumah tahfidz",
            target: 100000000,
            collected: 75000000,
            icon: "Heart",
            color: "text-red-600",
            bgColor: "bg-red-50",
          },
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchDonationCategories();
  }, []);

  // Find the selected category data
  const selectedCategoryData = useMemo(() => {
    // Ensure selectedCategory is valid
    if (!selectedCategory && donationCategories.length > 0) {
      setSelectedCategory(donationCategories[0].id);
    }

    // Try to find the selected category
    const category = donationCategories.find(
      (cat) => cat.id === selectedCategory,
    );

    if (!category && donationCategories.length) {
      console.log("Selected category not found, defaulting to first one");
      return donationCategories[0];
    }

    console.log("Selected category data:", category);
    return category;
  }, [selectedCategory, donationCategories]);

  // Function to get icon component from string
  const getIconComponent = (iconName: string): React.ElementType => {
    if (!iconName) return Heart; // Default to Heart if no icon name provided
    return iconMap[iconName] || Heart; // Default to Heart if icon not found
  };

  // Recent donors data (static for now, could be fetched from API)
  const recentDonors = [
    { name: "Hamba Allah", amount: 500000, time: "2 jam lalu" },
    { name: "Ahmad Fauzi", amount: 250000, time: "5 jam lalu" },
    { name: "Anonim", amount: 100000, time: "1 hari lalu" },
    { name: "Siti Aminah", amount: 1000000, time: "2 hari lalu" },
  ];

  return (
    <section
      id="donation"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Donasi untuk Kebaikan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bantu kami mewujudkan pendidikan Al-Qur'an yang berkualitas untuk
            generasi masa depan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Donation Categories */}
          <div className="lg:col-span-4">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-teal-500 to-green-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Program Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCategories ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-600">
                      Memuat kategori donasi...
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {donationCategories.map((category, idx) => {
                      const IconComponent = getIconComponent(category.icon);
                      const isSelected = selectedCategory === category.id;
                      const progress =
                        category.target > 0
                          ? (category.collected / category.target) * 100
                          : 0;

                      return (
                        <button
                          key={category.id ?? `category-${idx}`}
                          type="button"
                          className={`w-full text-left p-4 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-teal-50 border-l-4 border-teal-500"
                              : "hover:bg-gray-50 border-l-4 border-transparent"
                          }`}
                          onClick={() => {
                            console.log("Category clicked:", category.id);
                            setSelectedCategory(category.id);
                          }}
                        >
                          <div className="flex items-start">
                            <div
                              className={`p-2 rounded-full ${category.bgColor || "bg-teal-50"} mr-3`}
                            >
                              <IconComponent
                                className={`h-5 w-5 ${category.color || "text-teal-500"}`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                  {category.title}
                                </h3>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-teal-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {category.description}
                              </p>

                              {/* Progress bar */}
                              {category.target > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>
                                      Terkumpul:{" "}
                                      {formatCurrency(category.collected)}
                                    </span>
                                    <span>
                                      {formatPercentage(
                                        category.collected,
                                        category.target,
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-teal-500 to-green-400 rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(progress, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Target: {formatCurrency(category.target)}
                                  </div>
                                </div>
                              )}

                              {category.urgent && (
                                <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                  Mendesak
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Donors Card */}
            <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Donatur Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentDonors.map((donor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {donor.name}
                        </p>
                        <p className="text-sm text-gray-500">{donor.time}</p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(donor.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-8">
            <DonationForm
              selectedCategory={selectedCategory}
              selectedCategoryData={selectedCategoryData}
              getIconComponent={getIconComponent}
            />
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                <p>Debug: Selected Category ID: {selectedCategory}</p>
                <p>
                  Debug: Selected Category Title: {selectedCategoryData?.title}
                </p>
              </div>
            )}

            {/* Impact Card */}
            <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Dampak Donasi Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Fasilitas Belajar
                        </h4>
                        <p className="text-sm text-gray-600">
                          Membangun ruang kelas yang nyaman untuk para santri
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Beasiswa Santri
                        </h4>
                        <p className="text-sm text-gray-600">
                          Memberikan kesempatan belajar bagi yang kurang mampu
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Generasi Qur'ani
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mencetak generasi yang hafal Al-Quran dan berakhlak
                          mulia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
