"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  FileText,
  Copy,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  Phone,
  Mail,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PaymentData {
  orderId: string;
  status: string;
  paymentStatus: string;
  amount: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  proofFilePath?: string;
  bankAccount?: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
  verifiedAt?: string;
  notes?: string;
}

function ManualConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadPaymentData();
    }
  }, [orderId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/manual?orderId=${orderId}`);

      if (response.ok) {
        const data = await response.json();
        setPaymentData(data.data);
      } else {
        toast.error("Gagal memuat data pembayaran");
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      setRefreshing(true);
      await loadPaymentData();
      toast.success("Status pembayaran diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui status");
    } finally {
      setRefreshing(false);
    }
  };

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success("Order ID disalin");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string, paymentStatus: string) => {
    if (status === "PENDING_VERIFICATION") {
      return {
        icon: <Clock className="h-6 w-6 text-yellow-600" />,
        title: "Menunggu Verifikasi",
        description: "Pembayaran Anda sedang diverifikasi oleh admin",
        color: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
        badgeColor: "bg-yellow-100 text-yellow-800",
      };
    } else if (status === "COMPLETED" && paymentStatus === "PAID") {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        title: "Pembayaran Berhasil",
        description: "Pembayaran Anda telah diverifikasi dan berhasil",
        color: "bg-green-50 border-green-200",
        textColor: "text-green-800",
        badgeColor: "bg-green-100 text-green-800",
      };
    } else if (status === "CANCELLED" || paymentStatus === "FAILED") {
      return {
        icon: <AlertCircle className="h-6 w-6 text-red-600" />,
        title: "Pembayaran Ditolak",
        description:
          "Pembayaran Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut",
        color: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        badgeColor: "bg-red-100 text-red-800",
      };
    }

    return {
      icon: <Clock className="h-6 w-6 text-gray-600" />,
      title: "Status Tidak Diketahui",
      description: "Status pembayaran tidak dapat ditentukan",
      color: "bg-gray-50 border-gray-200",
      textColor: "text-gray-800",
      badgeColor: "bg-gray-100 text-gray-800",
    };
  };

  if (!orderId) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Order ID Tidak Ditemukan
                </h2>
                <p className="text-gray-600 mb-6">
                  Silakan periksa kembali link konfirmasi pembayaran Anda
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Kembali ke Beranda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data pembayaran...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!paymentData) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Data Pembayaran Tidak Ditemukan
                </h2>
                <p className="text-gray-600 mb-6">
                  Order ID yang Anda cari tidak ditemukan dalam sistem
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Kembali ke Beranda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const statusInfo = getStatusInfo(
    paymentData.status,
    paymentData.paymentStatus,
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Konfirmasi Pembayaran Manual
                </h1>
                <p className="text-gray-600">
                  Status pembayaran untuk Order #{orderId}
                </p>
              </div>
            </div>
            <Button
              onClick={refreshStatus}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <Card className={`border-2 ${statusInfo.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">{statusInfo.icon}</div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${statusInfo.textColor}`}
                      >
                        {statusInfo.title}
                      </h3>
                      <p
                        className={`text-sm ${statusInfo.textColor} opacity-80`}
                      >
                        {statusInfo.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={statusInfo.badgeColor}>
                          {paymentData.status}
                        </Badge>
                        <Badge variant="outline">
                          {paymentData.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Detail Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order ID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {paymentData.orderId}
                        </code>
                        <Button
                          onClick={copyOrderId}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Jumlah
                      </label>
                      <p className="text-lg font-semibold text-blue-600 mt-1">
                        {formatCurrency(paymentData.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Tanggal Pembayaran
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(paymentData.createdAt)}
                      </p>
                    </div>
                    {paymentData.verifiedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Tanggal Verifikasi
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(paymentData.verifiedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {paymentData.bankAccount && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Rekening Tujuan
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Bank:</span>
                          <span className="font-semibold">
                            {paymentData.bankAccount.bank}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>No. Rekening:</span>
                          <span className="font-mono font-semibold">
                            {paymentData.bankAccount.accountNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Atas Nama:</span>
                          <span className="font-semibold">
                            {paymentData.bankAccount.accountName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentData.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Catatan
                      </h4>
                      <p className="text-sm text-gray-700">
                        {paymentData.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Proof of Transfer */}
              {paymentData.proofFilePath && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Bukti Transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Bukti Transfer
                          </p>
                          <p className="text-sm text-gray-600">
                            File yang diupload saat pembayaran
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            window.open(paymentData.proofFilePath, "_blank")
                          }
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Lihat
                        </Button>
                        <Button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = paymentData.proofFilePath!;
                            link.download = `bukti-transfer-${paymentData.orderId}`;
                            link.click();
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pembayar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nama
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {paymentData.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {paymentData.customerEmail}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Telepon
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {paymentData.customerPhone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Butuh Bantuan?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Jika Anda memiliki pertanyaan tentang pembayaran ini,
                    silakan hubungi kami:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>+62 812-3456-7890</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>admin@tpqbaitusshuffah.com</span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      window.open("https://wa.me/6281234567890", "_blank")
                    }
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Chat WhatsApp
                  </Button>
                </CardContent>
              </Card>

              {/* Timeline */}
              {paymentData.status === "PENDING_VERIFICATION" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estimasi Waktu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Pembayaran Diterima
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(paymentData.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Sedang Diverifikasi
                          </p>
                          <p className="text-xs text-gray-600">
                            Estimasi: 1x24 jam
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Pembayaran Selesai
                          </p>
                          <p className="text-xs text-gray-500">
                            Menunggu verifikasi
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function ManualConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ManualConfirmationContent />
    </Suspense>
  );
}
