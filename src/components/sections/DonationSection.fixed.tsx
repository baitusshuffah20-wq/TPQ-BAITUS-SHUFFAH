"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
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
} from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import useErrorHandler from "@/hooks/useErrorHandler";
import useApi from "@/hooks/useApi";
import { useToast } from "@/components/ui/toast";

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
};

const DonationSection = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [donationCategories, setDonationCategories] = useState<
    DonationCategory[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [donorData, setDonorData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
  });

  const { handleError, handleApiError } = useErrorHandler();
  const api = useApi();
  const { addToast } = useToast();

  // Fetch donation categories from API
  useEffect(() => {
    const fetchDonationCategories = async () => {
      try {
        setIsLoadingCategories(true);
        console.log("Fetching donation categories...");

        // First try to get categories from database
        let response;
        try {
          response = await fetch("/api/donations/categories/db?active=true");
          console.log("Fetch response status:", response.status);
        } catch (fetchError) {
          console.error("Network error fetching categories:", fetchError);
          throw new Error("Network error when fetching donation categories");
        }

        if (!response.ok) {
          console.error(
            "API error response:",
            response.status,
            response.statusText,
          );
          throw new Error(
            `Failed to fetch donation categories: ${response.status} ${response.statusText}`,
          );
        }

        let data;
        try {
          // Check content type before parsing
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
            console.log("Received categories data:", data);
          } else {
            // Not JSON, get as text and log
            const responseText = await response.text();
            console.error("Non-JSON response received:", responseText);
            console.error("Content-Type:", contentType);
            throw new Error(
              "Server did not return JSON. Received: " +
                (contentType || "unknown content type"),
            );
          }
        } catch (jsonError) {
          console.error("Error parsing response:", jsonError);
          // Try to get the response text to see what's being returned
          try {
            const responseText = await response.text();
            console.error("Response text:", responseText);
          } catch (textError) {
            console.error("Could not get response text:", textError);
          }
          throw new Error("Invalid response from server");
        }

        if (data.success && data.categories && data.categories.length > 0) {
          console.log("Setting categories from DB:", data.categories);
          setDonationCategories(data.categories);
          // Set the first category as selected by default
          setSelectedCategory(data.categories[0].id);
          return;
        } else {
          console.log("No categories found in DB response");
        }

        // If no categories in database, try to seed them
        try {
          console.log("Trying to seed categories...");
          const seedResponse = await fetch("/api/donations/categories/db", {
            method: "POST",
          });

          if (seedResponse.ok) {
            // Check content type before parsing
            const contentType = seedResponse.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              console.error(
                "Non-JSON response from seed API:",
                await seedResponse.text(),
              );
              throw new Error("Seed API did not return JSON");
            }
            const seedData = await seedResponse.json();
            console.log("Seed response:", seedData);

            if (
              seedData.success &&
              seedData.categories &&
              seedData.categories.length > 0
            ) {
              console.log("Setting categories from seed:", seedData.categories);
              setDonationCategories(seedData.categories);
              setSelectedCategory(seedData.categories[0].id);
              return;
            }
          } else {
            console.log("Seed response not OK:", seedResponse.status);
          }
        } catch (seedError) {
          console.error("Error seeding donation categories in DB:", seedError);
        }

        // If database approach fails, try the old SiteSettings approach
        try {
          console.log("Trying old SiteSettings approach...");
          const oldResponse = await fetch(
            "/api/donations/categories?active=true",
          );

          if (oldResponse.ok) {
            // Check content type before parsing
            const contentType = oldResponse.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              console.error(
                "Non-JSON response from old API:",
                await oldResponse.text(),
              );
              throw new Error("Old API did not return JSON");
            }
            const oldData = await oldResponse.json();
            console.log("Old API response:", oldData);

            if (
              oldData.success &&
              oldData.categories &&
              oldData.categories.length > 0
            ) {
              console.log(
                "Setting categories from old API:",
                oldData.categories,
              );
              setDonationCategories(oldData.categories);
              setSelectedCategory(oldData.categories[0].id);
              return;
            }
          } else {
            console.log("Old API response not OK:", oldResponse.status);
          }

          // Try to seed old categories if none exist
          console.log("Trying to seed old categories...");
          const seedOldResponse = await fetch(
            "/api/donations/categories/seed",
            {
              method: "POST",
            },
          );

          if (seedOldResponse.ok) {
            // Check content type before parsing
            const contentType = seedOldResponse.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              console.error(
                "Non-JSON response from seed old API:",
                await seedOldResponse.text(),
              );
              throw new Error("Seed old API did not return JSON");
            }
            const seedOldData = await seedOldResponse.json();
            console.log("Seed old API response:", seedOldData);

            if (
              seedOldData.success &&
              seedOldData.categories &&
              seedOldData.categories.length > 0
            ) {
              console.log(
                "Setting categories from seed old API:",
                seedOldData.categories,
              );
              setDonationCategories(seedOldData.categories);
              setSelectedCategory(seedOldData.categories[0].id);
              return;
            }
          } else {
            console.log(
              "Seed old API response not OK:",
              seedOldResponse.status,
            );
          }
        } catch (oldError) {
          console.error("Error with old categories approach:", oldError);
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

        setDonationCategories(fallbackCategories);
        // Explicitly set the selected category
        setSelectedCategory("general");
        console.warn(
          "Using fallback categories after all API approaches failed",
        );
      } catch (error) {
        console.error("Error fetching donation categories:", error);
        setError("Failed to load donation categories. Please try again later.");
        // Set fallback categories
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
        ];
        console.log("Setting error fallback category");
        setDonationCategories(fallbackCategories);
        // Explicitly set the selected category
        setSelectedCategory("general");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchDonationCategories();
  }, []);



  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  // Find the selected category data
  const selectedCategoryData = React.useMemo(() => {
    console.log("Finding category data for:", selectedCategory);
    console.log("Available categories:", donationCategories);

    if (!selectedCategory && donationCategories.length > 0) {
      // If no category is selected yet but we have categories, select the first one
      console.log(
        "No category selected yet, selecting first category:",
        donationCategories[0].id,
      );
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        setSelectedCategory(donationCategories[0].id);
      }, 0);
      return donationCategories[0];
    }

    const category = donationCategories.find(
      (cat) => cat.id === selectedCategory,
    );

    // If selected category not found but we have categories, select the first one
    if (!category && donationCategories.length > 0) {
      console.log("Selected category not found, defaulting to first category");
      setTimeout(() => {
        setSelectedCategory(donationCategories[0].id);
      }, 0);
      return donationCategories[0];
    }

    return category;
  }, [selectedCategory, donationCategories]);
  const finalAmount = selectedAmount || parseInt(customAmount) || 0;

  // Function to get icon component from string
  const getIconComponent = (iconName: string): React.ElementType => {
    if (!iconName) return Heart; // Default to Heart if no icon name provided
    return iconMap[iconName] || Heart; // Default to Heart if icon not found
  };

  const handleDonationSubmit = async () => {
    if (finalAmount === 0) {
      addToast({
        type: "error",
        title: "Jumlah Donasi Kosong",
        message: "Silakan masukkan jumlah donasi terlebih dahulu",
      });
      return;
    }

    if (!selectedCategory || !selectedCategoryData) {
      addToast({
        type: "error",
        title: "Kategori Belum Dipilih",
        message: "Silakan pilih kategori donasi terlebih dahulu",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get category name for display
      const categoryName = selectedCategoryData?.title || "Umum";

      console.log("Submitting donation with category:", selectedCategory);
      console.log("Category data:", selectedCategoryData);
      console.log("Amount:", finalAmount);

      // Generate a cart ID if we don't have one
      const cartId =
        localStorage.getItem("cartId") ||
        `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save cart ID to localStorage
      localStorage.setItem("cartId", cartId);

      // Prepare cart data
      const cartData = {
        cartId: cartId,
        donationType: selectedCategory,
        amount: finalAmount,
        message: donorData.message,
        userId: undefined, // We don't have a user ID for anonymous donations
      };

      // Use our API hook to make the request
      try {
        console.log("Adding donation to cart:", cartData);

        // Ensure we have a valid category ID
        if (!selectedCategory || selectedCategory === "") {
          throw new Error(
            "Kategori donasi tidak valid. Silakan pilih kategori lain.",
          );
        }

        // Log the final data being sent
        console.log("Final donation cart data:", {
          cartId: cartData.cartId,
          donationType: cartData.donationType,
          amount: cartData.amount,
        });

        // First add to cart
        const cartResult = await api.post("/api/cart/donation", cartData, {
          showSuccessToast: false, // We'll handle success manually
          showErrorToast: false, // We'll handle errors manually
          errorMessage:
            "Gagal menambahkan donasi ke keranjang. Silakan coba lagi.",
        });

        if (!cartResult || !cartResult.success) {
          throw new Error(
            cartResult?.message || "Gagal menambahkan donasi ke keranjang",
          );
        }

        // Then create payment from cart
        const paymentData = {
          cartId: cartId,
          gateway: "MIDTRANS",
          customerInfo: {
            name: donorData.name || "Donatur Anonim",
            email: donorData.email || "anonymous@example.com",
            phone: donorData.phone || "08123456789",
          },
        };

        console.log("Creating payment for cart:", paymentData);

        const result = await api.post("/api/payment/cart", paymentData, {
          showSuccessToast: false, // We'll handle success manually
          showErrorToast: false, // We'll handle errors manually
          errorMessage: "Gagal membuat donasi. Silakan coba lagi.",
        });

        console.log("API response:", result);

        // Ensure result is valid and has expected structure
        if (result && typeof result === "object") {
          // Check if result has success property
          if (result.success === true) {
            // Check if result has data property with paymentUrl
            if (result.data && result.data.paymentUrl) {
              // Show success message
              addToast({
                type: "success",
                title: "Donasi Berhasil Dibuat",
                message: "Anda akan diarahkan ke halaman pembayaran",
              });

              // Log payment details
              console.log("Payment created successfully:", result.data);

              // Reset form before redirecting
              resetForm();

              // Redirect to payment page after a short delay to allow the toast to be seen
              setTimeout(() => {
                window.location.href = result.data.paymentUrl;
              }, 1000);
            } else {
              // Handle case where paymentUrl is missing
              console.error("Payment URL is missing from response:", result);
              addToast({
                type: "error",
                title: "Gagal Membuat Donasi",
                message: "URL pembayaran tidak ditemukan. Silakan coba lagi.",
              });
            }
          } else {
            // Handle case where success is false
            const errorMessage =
              result.error || result.message || "Terjadi kesalahan";
            console.error("Donation error:", errorMessage);

            addToast({
              type: "error",
              title: "Gagal Membuat Donasi",
              message: errorMessage,
            });
          }
        } else {
          // Handle case where result is not an object
          console.error("Unexpected API response format:", result);

          addToast({
            type: "error",
            title: "Gagal Membuat Donasi",
            message: "Format respons tidak valid. Silakan coba lagi.",
          });
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        handleError(apiError, "Gagal membuat donasi. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak diketahui";

      addToast({
        type: "error",
        title: "Gagal Membuat Donasi",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonorDataChange = (field: string, value: string | boolean) => {
    setDonorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setDonorData({
      name: "",
      email: "",
      phone: "",
      message: "",
      isAnonymous: false,
    });
  };

  return (
    <section id="donation" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Donasi untuk Kebaikan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bantu kami mewujudkan pendidikan Al-Qur'an yang berkualitas untuk
            generasi masa depan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Donasi</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donationCategories.map((category) => {
                      const IconComponent = getIconComponent(category.icon);
                      const isSelected = selectedCategory === category.id;
                      const progress =
                        category.target > 0
                          ? (category.collected / category.target) * 100
                          : 0;

                      return (
                        <div
                          key={category.id}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
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
                                      className="h-full bg-teal-500 rounded-full"
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
                                <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                                  Mendesak
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Formulir Donasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Selected Category */}
                  {selectedCategoryData && (
                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full ${selectedCategoryData.bgColor || "bg-teal-100"} mr-3`}
                        >
                          {React.createElement(
                            getIconComponent(selectedCategoryData.icon),
                            {
                              className: `h-5 w-5 ${selectedCategoryData.color || "text-teal-500"}`,
                            },
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedCategoryData.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedCategoryData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Donation Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Donasi
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                            selectedAmount === amount
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-teal-50 hover:border-teal-300"
                          }`}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="Jumlah lainnya"
                        className="pl-10"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                      />
                    </div>
                    {finalAmount > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        Total donasi:{" "}
                        <span className="font-semibold">
                          {formatCurrency(finalAmount)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Donor Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Informasi Donatur
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Lengkap
                        </label>
                        <Input
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          value={donorData.name}
                          onChange={(e) =>
                            handleDonorDataChange("name", e.target.value)
                          }
                          disabled={donorData.isAnonymous}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="Masukkan email"
                          value={donorData.email}
                          onChange={(e) =>
                            handleDonorDataChange("email", e.target.value)
                          }
                          disabled={donorData.isAnonymous}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nomor Telepon
                        </label>
                        <Input
                          type="tel"
                          placeholder="Masukkan nomor telepon"
                          value={donorData.phone}
                          onChange={(e) =>
                            handleDonorDataChange("phone", e.target.value)
                          }
                          disabled={donorData.isAnonymous}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pesan (Opsional)
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          rows={3}
                          placeholder="Tulis pesan atau doa"
                          value={donorData.message}
                          onChange={(e) =>
                            handleDonorDataChange("message", e.target.value)
                          }
                        ></textarea>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="anonymous"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          checked={donorData.isAnonymous}
                          onChange={(e) =>
                            handleDonorDataChange(
                              "isAnonymous",
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          htmlFor="anonymous"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Donasi sebagai anonim
                        </label>
                      </div>
                    </div>
                  </div>



                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleDonationSubmit}
                      disabled={
                        isLoading || finalAmount === 0 || !selectedCategory
                      }
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          Lanjutkan ke Pembayaran
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
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
