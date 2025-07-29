"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  Download,
  User,
  Calendar,
  CreditCard,
  Building,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ManualPayment {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  proofFilePath?: string;
  bankAccount?: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  items: any[];
  createdAt: string;
  metadata?: any;
}

const ManualVerificationPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_VERIFICATION");
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  useEffect(() => {
    loadManualPayments();
  }, [statusFilter]);

  const loadManualPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/payments/manual?status=${statusFilter}`,
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        toast.error("Gagal memuat data pembayaran manual");
      }
    } catch (error) {
      console.error("Error loading manual payments:", error);
      toast.error("Gagal memuat data pembayaran manual");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING_VERIFICATION":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Menunggu Verifikasi",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "COMPLETED":
        return {
          icon: <Check className="h-4 w-4" />,
          label: "Disetujui",
          color: "bg-green-100 text-green-800",
        };
      case "CANCELLED":
        return {
          icon: <X className="h-4 w-4" />,
          label: "Ditolak",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: status,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const handleVerifyPayment = async (
    orderId: string,
    action: "APPROVE" | "REJECT",
  ) => {
    try {
      setProcessing(orderId);

      const response = await fetch("/api/payment/manual", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action,
          adminId: user?.id,
          notes: verificationNotes,
        }),
      });

      if (response.ok) {
        toast.success(
          `Pembayaran berhasil ${action === "APPROVE" ? "disetujui" : "ditolak"}`,
        );
        setShowModal(false);
        setSelectedPayment(null);
        setVerificationNotes("");
        await loadManualPayments();
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal memverifikasi pembayaran");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Gagal memverifikasi pembayaran");
    } finally {
      setProcessing(null);
    }
  };

  const openVerificationModal = (payment: ManualPayment) => {
    setSelectedPayment(payment);
    setShowModal(true);
    setVerificationNotes("");
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusOptions = [
    { value: "PENDING_VERIFICATION", label: "Menunggu Verifikasi" },
    { value: "COMPLETED", label: "Disetujui" },
    { value: "CANCELLED", label: "Ditolak" },
    { value: "ALL", label: "Semua Status" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verifikasi Pembayaran Manual
            </h1>
            <p className="text-gray-600">
              Kelola dan verifikasi pembayaran transfer manual
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button
              onClick={loadManualPayments}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan nama, order ID, atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Memuat data pembayaran...</span>
            </CardContent>
          </Card>
        ) : filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Pembayaran
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Tidak ada pembayaran yang sesuai dengan pencarian"
                  : "Belum ada pembayaran manual yang perlu diverifikasi"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const statusInfo = getStatusInfo(payment.status);

              return (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{payment.orderId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Pembayar
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {payment.customerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {payment.customerEmail}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {payment.customerPhone}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Pembayaran
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {payment.paymentMethod}
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mt-1">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Items
                            </label>
                            <div className="mt-1">
                              {payment.items.slice(0, 2).map((item, index) => (
                                <p
                                  key={index}
                                  className="text-sm text-gray-900"
                                >
                                  {item.name}
                                </p>
                              ))}
                              {payment.items.length > 2 && (
                                <p className="text-sm text-gray-600">
                                  +{payment.items.length - 2} item lainnya
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {payment.bankAccount && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Rekening Tujuan
                            </h4>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                {payment.bankAccount.bank}
                              </span>
                              {" � "}
                              <span className="font-mono">
                                {payment.bankAccount.accountNumber}
                              </span>
                              {" � "}
                              <span>{payment.bankAccount.accountName}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {payment.proofFilePath && (
                          <Button
                            onClick={() =>
                              window.open(payment.proofFilePath, "_blank")
                            }
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Lihat Bukti
                          </Button>
                        )}

                        {payment.status === "PENDING_VERIFICATION" && (
                          <Button
                            onClick={() => openVerificationModal(payment)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                            disabled={processing === payment.orderId}
                          >
                            {processing === payment.orderId ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Verifikasi
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Verification Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verifikasi Pembayaran
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Order ID:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedPayment.orderId}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Jumlah:</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Verifikasi (Opsional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    handleVerifyPayment(selectedPayment.orderId, "APPROVE")
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processing === selectedPayment.orderId}
                >
                  {processing === selectedPayment.orderId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Setujui
                </Button>

                <Button
                  onClick={() =>
                    handleVerifyPayment(selectedPayment.orderId, "REJECT")
                  }
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  disabled={processing === selectedPayment.orderId}
                >
                  <X className="h-4 w-4 mr-2" />
                  Tolak
                </Button>

                <Button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                    setVerificationNotes("");
                  }}
                  variant="outline"
                  disabled={processing === selectedPayment.orderId}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManualVerificationPage;
