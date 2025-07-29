"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Clock,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Heart,
  Zap,
  Loader,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  ageGroup: string;
  level?: "Pemula" | "Menengah" | "Lanjutan";
  price: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  popular?: boolean;
  order?: number;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Award,
  Star,
  Globe,
  Heart,
};

// Color mapping
const colorMap: Record<number, { color: string; bgColor: string }> = {
  1: { color: "text-teal-600", bgColor: "bg-teal-50" },
  2: { color: "text-blue-600", bgColor: "bg-blue-50" },
  3: { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  4: { color: "text-purple-600", bgColor: "bg-purple-50" },
  5: { color: "text-green-600", bgColor: "bg-green-50" },
  6: { color: "text-red-600", bgColor: "bg-red-50" },
};

const ProgramsSection = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Use try-catch for fetch to handle network errors
        let response;
        try {
          response = await fetch("/api/programs");
        } catch (fetchError) {
          console.error("Network error when fetching programs:", fetchError);
          setError(
            "Network error. Please check your connection and try again.",
          );
          setLoading(false);
          return;
        }

        if (!response.ok) {
          console.error(
            `Server error: ${response.status} ${response.statusText}`,
          );
          setError(
            `Failed to load programs: Server responded with status ${response.status}`,
          );
          setLoading(false);
          return;
        }

        // Use try-catch for JSON parsing to handle malformed responses
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
          setError("Invalid response from server. Please try again later.");
          setLoading(false);
          return;
        }

        if (data && data.success) {
          try {
            // Transform the data to match our Program interface
            const transformedPrograms = data.programs.map(
              (program: any, index: number) => {
                // Parse features from JSON string
                let features: string[] = [];
                try {
                  features = JSON.parse(program.features);
                } catch (e) {
                  features = program.features?.split(",") || [];
                }

                // Determine level based on program title or other criteria
                let level: "Pemula" | "Menengah" | "Lanjutan" = "Pemula";
                if (program.title.toLowerCase().includes("lanjutan")) {
                  level = "Lanjutan";
                } else if (program.title.toLowerCase().includes("menengah")) {
                  level = "Menengah";
                }

                // Determine if program is popular (first program or has specific flag)
                const popular =
                  index === 0 ||
                  program.title.toLowerCase().includes("intensif");

                // Get color based on order or index
                const colorIndex = program.order || index + 1;
                const { color, bgColor } = colorMap[colorIndex % 6 || 1];

                return {
                  id: program.id,
                  title: program.title,
                  description: program.description,
                  features: features,
                  duration: program.duration,
                  ageGroup: program.ageGroup,
                  level,
                  price: program.price,
                  icon: iconMap[program.icon] || BookOpen,
                  color,
                  bgColor,
                  popular,
                  order: program.order,
                };
              },
            );

            // Sort programs by order if available
            transformedPrograms.sort(
              (a: { order?: number }, b: { order?: number }) =>
                (a.order || 999) - (b.order || 999),
            );

            setPrograms(transformedPrograms);
            // Reset retry count on success
            setRetryCount(0);
          } catch (transformError) {
            console.error("Error transforming program data:", transformError);
            setError("Error processing program data. Please try again later.");
          }
        } else {
          // Handle unsuccessful response without throwing
          console.error("API returned unsuccessful response:", data);
          setError(data?.error || "Failed to load programs");
        }
      } catch (err) {
        console.error("Error in fetchPrograms:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();

    // Set up automatic retry if there's an error (max 3 retries)
    if (error && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying fetch programs (attempt ${retryCount + 1})...`);
        setRetryCount((prev) => prev + 1);
      }, 3000); // Retry after 3 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount]);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Pemula":
        return "bg-green-100 text-green-800";
      case "Menengah":
        return "bg-yellow-100 text-yellow-800";
      case "Lanjutan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Program Unggulan Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pilih program yang sesuai dengan kebutuhan dan kemampuan Anda.
            Setiap program dirancang dengan kurikulum terbaik dan bimbingan
            ustadz berpengalaman.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat program...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-gray-600 text-sm">
                {retryCount > 0 && retryCount < 3
                  ? `Mencoba ulang (${retryCount}/3)...`
                  : retryCount >= 3
                    ? "Gagal setelah beberapa percobaan. Silakan muat ulang halaman."
                    : "Silakan coba muat ulang halaman"}
              </p>
              <button
                onClick={() => {
                  setRetryCount(0); // Reset retry count
                  setError(null); // Clear error
                  setLoading(true); // Show loading state
                }}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
                disabled={retryCount > 0 && retryCount < 3}
              >
                {retryCount > 0 && retryCount < 3
                  ? "Sedang mencoba ulang..."
                  : "Coba Lagi"}
              </button>
            </div>
          </div>
        )}

        {/* Programs Grid */}
        {!loading && programs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <Card
                  key={program.id}
                  className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    program.popular ? "ring-2 ring-teal-500" : ""
                  }`}
                  variant="islamic"
                >
                  {/* Popular Badge */}
                  {program.popular && (
                    <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Populer
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg ${program.bgColor} ${program.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {program.level && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(program.level)}`}
                        >
                          {program.level}
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-xl mb-2">
                      {program.title}
                    </CardTitle>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {program.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Fitur Program:
                      </h4>
                      <ul className="space-y-2">
                        {program.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Program Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Clock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-500">Durasi</div>
                        <div className="text-sm font-medium text-gray-900">
                          {program.duration}
                        </div>
                      </div>
                      <div className="text-center">
                        <Users className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-500">Usia</div>
                        <div className="text-sm font-medium text-gray-900">
                          {program.ageGroup}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-teal-600 mb-1">
                        {program.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        *Biaya dapat diangsur
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full"
                      variant={program.popular ? "primary" : "outline"}
                      onClick={() => {
                        // Handle registration logic here
                        console.log(
                          `Registering for program: ${program.title}`,
                        );
                      }}
                    >
                      Daftar Program
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Programs Found */}
        {!loading && !error && programs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">
              Tidak ada program yang tersedia saat ini.
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tidak Yakin Program Mana yang Cocok?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Tim konsultan kami siap membantu Anda memilih program yang sesuai
              dengan kemampuan dan tujuan pembelajaran Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Konsultasi Gratis
              </Button>
              <Button variant="outline" size="lg">
                Download Brosur
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
