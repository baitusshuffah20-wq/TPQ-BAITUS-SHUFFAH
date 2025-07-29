"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  Heart,
  Loader2,
  QrCode,
  Smartphone,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import useErrorHandler from "@/hooks/useErrorHandler";
import useApi from "@/hooks/useApi";
import { useToast } from "@/components/ui/toast";
import UniversalCart from "@/components/payment/UniversalCart";
import UniversalCheckout from "@/components/payment/UniversalCheckout";

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

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

interface SPPMetadata {
  studentId: string;
  studentName?: string;
  studentNis?: string;
  month: number;
  year: number;
  sppSettingId?: string;
  originalAmount?: number;
  paidAmount?: number;
  discount?: number;
  fine?: number;
  dueDate?: string;
}

interface DonationMetadata {
  donationType: string;
  message?: string;
  isAnonymous?: boolean;
}

interface GeneralMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

type CartItemMetadata = SPPMetadata | DonationMetadata | GeneralMetadata;

interface CartItem {
  id: string;
  cartId: string;
  itemType: string;
  itemId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  metadata?: CartItemMetadata;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  orderId?: string;
  amount: number;
  status: string;
  fallbackToManual?: boolean;
  error?: string;
}

interface DonationFormProps {
  selectedCategory: string;
  selectedCategoryData?: DonationCategory;
  getIconComponent: (iconName: string) => React.ElementType;
}

const DonationForm: React.FC<DonationFormProps> = ({
  selectedCategory,
  selectedCategoryData,
  getIconComponent,
}) => {
  console.log("DonationForm received props:", {
    selectedCategory,
    selectedCategoryData,
  });

  // State management
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("bank");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"form" | "cart" | "checkout">(
    "form",
  );
  const [cartId, setCartId] = useState<string>("");
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [donorData, setDonorData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
  });

  // Initialize cart ID
  useEffect(() => {
    const existingCartId = localStorage.getItem("donationCartId");
    if (existingCartId) {
      setCartId(existingCartId);
    } else {
      const newCartId = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setCartId(newCartId);
      localStorage.setItem("donationCartId", newCartId);
    }
  }, []);

  const { handleError } = useErrorHandler();
  const api = useApi();
  const { toast } = useToast();

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "bank",
      name: "Transfer Bank",
      icon: CreditCard,
      description: "BCA, Mandiri, BNI, BRI",
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      icon: Smartphone,
      description: "GoPay, OVO, DANA, ShopeePay",
    },
    {
      id: "qris",
      name: "QRIS",
      icon: QrCode,
      description: "Scan QR Code untuk pembayaran",
    },
  ];

  // Predefined donation amounts
  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  // Calculate final amount
  const finalAmount =
    selectedAmount || (customAmount ? parseInt(customAmount, 10) : 0);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleDonorDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setDonorData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setDonorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddToCart = async () => {
    if (finalAmount === 0) {
      toast({
        title: "Jumlah Donasi Kosong",
        description: "Silakan masukkan jumlah donasi terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory || !selectedCategoryData) {
      toast({
        title: "Kategori Belum Dipilih",
        description: "Silakan pilih kategori donasi terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!donorData.name && !donorData.isAnonymous) {
      toast({
        title: "Informasi Donatur",
        description: "Silakan masukkan nama Anda atau pilih donasi anonim",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare cart item data
      const cartItemData = {
        cartId: cartId,
        itemType: "DONATION",
        itemId: selectedCategory,
        name: `Donasi ${selectedCategoryData?.title || "Umum"}`,
        description: donorData.message || selectedCategoryData?.description,
        price: finalAmount,
        quantity: 1,
        metadata: {
          categoryId: selectedCategory,
          categoryName: selectedCategoryData?.title,
          donorName: donorData.isAnonymous ? "Anonim" : donorData.name,
          donorEmail: donorData.email,
          donorPhone: donorData.phone,
          message: donorData.message,
          isAnonymous: donorData.isAnonymous,
        },
      };

      console.log("Adding donation to cart:", cartItemData);

      const result = await api.post("/api/cart", cartItemData, {
        showSuccessToast: false,
        showErrorToast: false,
      });

      if (result && result.success) {
        toast({
          title: "Donasi Ditambahkan",
          description: "Donasi berhasil ditambahkan ke keranjang",
        });

        // Move to cart step
        setCurrentStep("cart");
      } else {
        throw new Error(
          result?.message || "Gagal menambahkan donasi ke keranjang",
        );
      }
    } catch (error) {
      console.error("Error adding donation to cart:", error);
      handleError(error, "Gagal menambahkan donasi ke keranjang");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartUpdate = (summary: CartSummary) => {
    setCartSummary(summary);
  };

  const handleCheckout = (summary: CartSummary) => {
    setCartSummary(summary);
    setCurrentStep("checkout");
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    toast({
      title: "Pembayaran Berhasil",
      description: "Terima kasih atas donasi Anda",
    });

    // Reset form and cart
    resetForm();
    localStorage.removeItem("donationCartId");

    // Redirect to success page or show confirmation
    if (result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else if (result.orderId) {
      window.location.href = `/payment/manual-confirmation?orderId=${result.orderId}`;
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Pembayaran Gagal",
      description: error,
      variant: "destructive",
    });
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  const handleBackToCart = () => {
    setCurrentStep("cart");
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

  // Render different steps
  if (currentStep === "cart") {
    return (
      <div className="space-y-6">
        <UniversalCart
          cartId={cartId}
          onCheckout={handleCheckout}
          onItemUpdate={handleCartUpdate}
          showCheckoutButton={true}
          platform="web"
        />
        <div className="flex justify-center">
          <Button
            onClick={handleBackToForm}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Tambah Donasi Lain
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "checkout") {
    const customerInfo = {
      name: donorData.isAnonymous ? "Donatur Anonim" : donorData.name,
      email: donorData.email || "anonymous@example.com",
      phone: donorData.phone || "08123456789",
    };

    return (
      <UniversalCheckout
        cartSummary={cartSummary}
        customerInfo={customerInfo}
        onBack={handleBackToCart}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        platform="web"
      />
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Formulir Donasi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Selected Category */}
        {selectedCategoryData ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-full ${selectedCategoryData.bgColor || "bg-blue-100"} mr-3`}
              >
                {React.createElement(
                  getIconComponent(selectedCategoryData.icon),
                  {
                    className: `h-5 w-5 ${selectedCategoryData.color || "text-blue-500"}`,
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
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 mb-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 mr-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Pilih Kategori Donasi
                </h3>
                <p className="text-sm text-gray-600">
                  Silakan pilih kategori donasi terlebih dahulu
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Donation Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Donasi
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
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
        <div className="mb-6">
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
                name="name"
                placeholder="Masukkan nama lengkap"
                value={donorData.name}
                onChange={handleDonorDataChange}
                disabled={donorData.isAnonymous || isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="Masukkan email"
                value={donorData.email}
                onChange={handleDonorDataChange}
                disabled={donorData.isAnonymous || isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="Masukkan nomor telepon"
                value={donorData.phone}
                onChange={handleDonorDataChange}
                disabled={donorData.isAnonymous || isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesan (Opsional)
              </label>
              <textarea
                name="message"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Tulis pesan atau doa"
                value={donorData.message}
                onChange={handleDonorDataChange}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="flex items-center">
              <input
                id="anonymous"
                name="isAnonymous"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                checked={donorData.isAnonymous}
                onChange={handleDonorDataChange}
                disabled={isLoading}
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

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Metode Pembayaran
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPayment === method.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
                }`}
                onClick={() => setSelectedPayment(method.id)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    <method.icon className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-xs text-gray-500">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Ringkasan Donasi
          </h3>
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              {selectedCategoryData?.title || "Donasi Umum"}
            </div>
            <div className="font-semibold text-lg text-teal-600">
              {finalAmount > 0 ? formatCurrency(finalAmount) : "Rp 0"}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || finalAmount === 0 || !selectedCategory}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menambahkan...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Tambah ke Keranjang
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DonationForm;
