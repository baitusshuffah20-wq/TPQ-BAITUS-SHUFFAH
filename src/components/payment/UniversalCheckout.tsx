"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaymentMethodSelector from "./PaymentMethodSelector";
import {
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Loader2,
  FileText,
  Camera,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PaymentMethod {
  id: string;
  name: string;
  type: "GATEWAY" | "BANK_TRANSFER";
  paymentType: string;
  provider: string;
  description?: string;
  logo?: string;
  fees: {
    fixedFee: number;
    percentageFee: number;
    minFee: number;
    maxFee: number;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
  };
  isDefault?: boolean;
  sortOrder: number;
}

interface CartSummary {
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface UniversalCheckoutProps {
  cartSummary: CartSummary;
  customerInfo: CustomerInfo;
  onBack?: () => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  platform?: "web" | "mobile" | "dashboard";
}

export default function UniversalCheckout({
  cartSummary,
  customerInfo,
  onBack,
  onSuccess,
  onError,
  className = "",
  platform = "web",
}: UniversalCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [showManualTransfer, setShowManualTransfer] = useState(false);
  const [uploadedProof, setUploadedProof] = useState<File | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const calculateFee = (method: PaymentMethod) => {
    const { fixedFee, percentageFee } = method.fees;
    const percentageFeeAmount = (cartSummary.total * percentageFee) / 100;
    return fixedFee + percentageFeeAmount;
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method.type === "BANK_TRANSFER") {
      setShowManualTransfer(true);
    } else {
      setShowManualTransfer(false);
    }
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    try {
      setProcessing(true);

      if (selectedMethod.type === "BANK_TRANSFER") {
        await processManualTransfer();
      } else {
        await processGatewayPayment();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      onError?.("Gagal memproses pembayaran");
      toast.error("Gagal memproses pembayaran");
    } finally {
      setProcessing(false);
    }
  };

  const processGatewayPayment = async () => {
    const fee = calculateFee(selectedMethod!);
    const totalAmount = cartSummary.total + fee;

    const paymentRequest = {
      cartId: `cart_${Date.now()}`,
      gateway: selectedMethod!.provider,
      paymentMethod: selectedMethod!.paymentType,
      customerInfo: {
        id: null,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      billingInfo: customerInfo.address
        ? {
            address: customerInfo.address,
            city: customerInfo.city || "",
            postalCode: customerInfo.postalCode || "",
            countryCode: "ID",
          }
        : undefined,
      redirectUrl: `${window.location.origin}/payment/success`,
      items: cartSummary.items,
      amount: totalAmount,
    };

    const response = await fetch("/api/payment/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentRequest),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = data.data.paymentUrl;
      } else {
        // Show payment instructions
        setPaymentInstructions(data.data);
        onSuccess?.(data.data);
      }
    } else {
      // If gateway fails, fallback to manual transfer
      toast.error(
        "Payment gateway tidak tersedia, menggunakan transfer manual",
      );
      setShowManualTransfer(true);

      // Note: Manual method will be selected from PaymentMethodSelector
    }
  };

  const processManualTransfer = async () => {
    // Create manual payment record
    const paymentData = {
      type: "MANUAL_TRANSFER",
      method: selectedMethod!.paymentType,
      amount: cartSummary.total + calculateFee(selectedMethod!),
      customerInfo,
      items: cartSummary.items,
      bankAccount: selectedMethod!.bankDetails,
      proofFile: uploadedProof,
    };

    const formData = new FormData();
    formData.append("paymentData", JSON.stringify(paymentData));
    if (uploadedProof) {
      formData.append("proofFile", uploadedProof);
    }

    const response = await fetch("/api/payment/manual", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      onSuccess?.(data);
      toast.success("Pembayaran manual berhasil disubmit");
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || "Failed to process manual payment";
      console.error("Manual payment error:", errorData);
      throw new Error(errorMessage);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      setUploadedProof(file);
      toast.success("Bukti transfer berhasil diupload");
    }
  };

  const removeUploadedFile = () => {
    setUploadedProof(null);
    toast.success("File dihapus");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pilih Metode Pembayaran
            </h2>
            <p className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-blue-600">
                {formatCurrency(cartSummary.total)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {!showManualTransfer && (
        <PaymentMethodSelector
          amount={cartSummary.total}
          onMethodSelect={handlePaymentMethodSelect}
          selectedMethodId={selectedMethod?.id}
        />
      )}

      {/* Manual Transfer Instructions */}
      {showManualTransfer && selectedMethod?.type === "BANK_TRANSFER" && selectedMethod.bankDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Instruksi Transfer Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Account Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Informasi Rekening Tujuan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bank:</span>
                  <span className="font-semibold">
                    {selectedMethod.bankDetails.bankName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>No. Rekening:</span>
                  <span className="font-semibold font-mono">
                    {selectedMethod.bankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atas Nama:</span>
                  <span className="font-semibold">
                    {selectedMethod.bankDetails.accountName}
                  </span>
                </div>
                {selectedMethod.bankDetails.branch && (
                  <div className="flex justify-between">
                    <span>Cabang:</span>
                    <span className="font-semibold">
                      {selectedMethod.bankDetails.branch}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Jumlah Transfer:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(cartSummary.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Upload Proof */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Upload Bukti Transfer
              </h4>

              {!uploadedProof ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload bukti transfer (JPG, PNG, PDF)
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                    Pilih File
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {uploadedProof.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(uploadedProof.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={removeUploadedFile}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Petunjuk:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Transfer sesuai jumlah yang tertera</li>
                    <li>Upload bukti transfer yang jelas</li>
                    <li>Pembayaran akan diverifikasi dalam 1x24 jam</li>
                    <li>Anda akan mendapat notifikasi setelah verifikasi</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Payment Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Pembayaran aman dan terenkripsi</span>
        </div>

        <Button
          onClick={processPayment}
          disabled={
            !selectedMethod ||
            processing ||
            (showManualTransfer && !uploadedProof)
          }
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {showManualTransfer ? "Submit Pembayaran" : "Bayar Sekarang"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
