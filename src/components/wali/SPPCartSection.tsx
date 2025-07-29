"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building,
  ShoppingCart,
  Plus,
  Eye,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import UniversalCart from "@/components/payment/UniversalCart";
import UniversalCheckout from "@/components/payment/UniversalCheckout";

interface SPPRecord {
  id: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL" | "PENDING_VERIFICATION";
  paidAmount: number;
  discount: number;
  fine: number;
  santri: {
    id: string;
    nis: string;
    name: string;
    halaqah?: {
      name: string;
      level: string;
    };
  };
  sppSetting: {
    id: string;
    name: string;
    level?: string;
    amount: number;
  };
}

interface SPPCartSectionProps {
  className?: string;
}

export default function SPPCartSection({
  className = "",
}: SPPCartSectionProps) {
  const { user } = useAuth();
  const [sppRecords, setSppRecords] = useState<SPPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<"list" | "cart" | "checkout">(
    "list",
  );
  const [cartId, setCartId] = useState<string>("");
  const [cartSummary, setCartSummary] = useState<any>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set(),
  );

  // Initialize cart ID
  useEffect(() => {
    const existingCartId = localStorage.getItem("sppCartId");
    if (existingCartId) {
      setCartId(existingCartId);
    } else {
      const newCartId = `spp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setCartId(newCartId);
      localStorage.setItem("sppCartId", newCartId);
    }
  }, []);

  // Load SPP records
  useEffect(() => {
    if (user) {
      loadSPPRecords();
    }
  }, [user]);

  const loadSPPRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/spp/records?waliId=${user?.id}&status=PENDING,OVERDUE`,
      );

      if (response.ok) {
        const data = await response.json();
        setSppRecords(data.sppRecords || []);
      } else {
        toast.error("Gagal memuat data SPP");
      }
    } catch (error) {
      console.error("Error loading SPP records:", error);
      toast.error("Gagal memuat data SPP");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatMonth = (month: number, year: number) => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const getStatusInfo = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "PENDING";

    if (status === "PAID") {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: "Lunas",
        color: "bg-green-100 text-green-800",
      };
    } else if (status === "PENDING_VERIFICATION") {
      return {
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        label: "Verifikasi",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else if (isOverdue || status === "OVERDUE") {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        label: "Terlambat",
        color: "bg-red-100 text-red-800",
      };
    } else {
      return {
        icon: <Clock className="h-4 w-4 text-blue-600" />,
        label: "Belum Bayar",
        color: "bg-blue-100 text-blue-800",
      };
    }
  };

  const handleRecordSelect = (recordId: string, selected: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (selected) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    const unpaidRecords = sppRecords.filter(
      (record) => record.status === "PENDING" || record.status === "OVERDUE",
    );

    if (selectedRecords.size === unpaidRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(unpaidRecords.map((record) => record.id)));
    }
  };

  const handleAddToCart = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Pilih SPP yang akan dibayar");
      return;
    }

    try {
      setLoading(true);

      for (const recordId of selectedRecords) {
        const record = sppRecords.find((r) => r.id === recordId);
        if (!record) continue;

        const cartItemData = {
          cartId: cartId,
          itemType: "SPP",
          itemId: record.id,
          name: `SPP ${record.santri.name} - ${formatMonth(record.month, record.year)}`,
          description: `${record.sppSetting.name} - ${record.santri.nis}`,
          price: record.amount - record.paidAmount + record.fine,
          quantity: 1,
          metadata: {
            studentId: record.santri.id,
            studentName: record.santri.name,
            studentNis: record.santri.nis,
            month: record.month,
            year: record.year,
            sppSettingId: record.sppSetting.id,
            originalAmount: record.amount,
            paidAmount: record.paidAmount,
            discount: record.discount,
            fine: record.fine,
            dueDate: record.dueDate,
          },
        };

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartItemData),
        });

        if (!response.ok) {
          throw new Error(`Gagal menambahkan SPP ${record.santri.name}`);
        }
      }

      toast.success(
        `${selectedRecords.size} SPP berhasil ditambahkan ke keranjang`,
      );
      setCurrentStep("cart");
      setSelectedRecords(new Set());
    } catch (error) {
      console.error("Error adding SPP to cart:", error);
      toast.error("Gagal menambahkan SPP ke keranjang");
    } finally {
      setLoading(false);
    }
  };

  const handleCartUpdate = (summary: any) => {
    setCartSummary(summary);
  };

  const handleCheckout = (summary: any) => {
    setCartSummary(summary);
    setCurrentStep("checkout");
  };

  const handlePaymentSuccess = (result: any) => {
    toast.success("Pembayaran SPP berhasil diproses");

    // Reset cart and reload data
    localStorage.removeItem("sppCartId");
    setCurrentStep("list");
    loadSPPRecords();

    // Redirect to confirmation page
    if (result.orderId) {
      window.location.href = `/payment/manual-confirmation?orderId=${result.orderId}`;
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Pembayaran gagal: ${error}`);
  };

  const handleBackToList = () => {
    setCurrentStep("list");
  };

  const handleBackToCart = () => {
    setCurrentStep("cart");
  };

  // Render different steps
  if (currentStep === "cart") {
    return (
      <div className={`space-y-6 ${className}`}>
        <UniversalCart
          cartId={cartId}
          onCheckout={handleCheckout}
          onItemUpdate={handleCartUpdate}
          showCheckoutButton={true}
          platform="dashboard"
        />
        <div className="flex justify-center">
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali ke Daftar SPP
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "checkout") {
    const customerInfo = {
      name: user?.name || "Wali Santri",
      email: user?.email || "wali@example.com",
      phone: user?.phone || "08123456789",
    };

    return (
      <UniversalCheckout
        cartSummary={cartSummary}
        customerInfo={customerInfo}
        onBack={handleBackToCart}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        platform="dashboard"
        className={className}
      />
    );
  }

  // Main SPP list view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pembayaran SPP
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedRecords.size > 0 && (
                <Badge variant="secondary">
                  {selectedRecords.size} dipilih
                </Badge>
              )}
              <Button
                onClick={handleAddToCart}
                disabled={selectedRecords.size === 0 || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Bayar Sekarang
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Pilih SPP yang akan dibayar dan lanjutkan ke pembayaran
          </p>
        </CardContent>
      </Card>

      {/* SPP Records */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Memuat data SPP...</span>
          </CardContent>
        </Card>
      ) : sppRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Semua SPP Sudah Lunas
            </h3>
            <p className="text-gray-600">
              Tidak ada tagihan SPP yang perlu dibayar saat ini
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Tagihan SPP</CardTitle>
              <Button onClick={handleSelectAll} variant="outline" size="sm">
                {selectedRecords.size ===
                sppRecords.filter(
                  (r) => r.status === "PENDING" || r.status === "OVERDUE",
                ).length
                  ? "Batal Pilih Semua"
                  : "Pilih Semua"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {sppRecords.map((record) => {
                const statusInfo = getStatusInfo(record.status, record.dueDate);
                const totalAmount =
                  record.amount - record.paidAmount + record.fine;
                const canSelect =
                  record.status === "PENDING" || record.status === "OVERDUE";
                const isSelected = selectedRecords.has(record.id);

                return (
                  <div
                    key={record.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {canSelect && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleRecordSelect(record.id, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {record.santri.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {record.santri.nis} �{" "}
                              {formatMonth(record.month, record.year)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={statusInfo.color}>
                                {statusInfo.icon}
                                <span className="ml-1">{statusInfo.label}</span>
                              </Badge>
                              {record.santri.halaqah && (
                                <Badge variant="outline" className="text-xs">
                                  {record.santri.halaqah.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          {formatCurrency(totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Jatuh tempo:{" "}
                          {new Date(record.dueDate).toLocaleDateString("id-ID")}
                        </p>
                        {record.fine > 0 && (
                          <p className="text-xs text-red-600">
                            Termasuk denda: {formatCurrency(record.fine)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
