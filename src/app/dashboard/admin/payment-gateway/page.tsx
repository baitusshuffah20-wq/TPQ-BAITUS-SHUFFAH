"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  type:
    | "BANK_TRANSFER"
    | "E_WALLET"
    | "QRIS"
    | "VIRTUAL_ACCOUNT"
    | "CREDIT_CARD";
  provider: string;
  isActive: boolean;
  config: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
    qrisCode?: string;
  };
  fees: {
    fixedFee: number;
    percentageFee: number;
    minFee: number;
    maxFee: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PaymentGatewayPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    provider: "",
    isActive: true,
    config: {
      serverKey: "",
      clientKey: "",
      apiKey: "",
      secretKey: "",
      accountNumber: "",
      accountName: "",
      bankCode: "",
      qrisCode: "",
    },
    fees: {
      fixedFee: 0,
      percentageFee: 0,
      minFee: 0,
      maxFee: 0,
    },
  });

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isFormOpen) {
      if (selectedGateway) {
        // Edit mode - populate form with existing data
        setFormData({
          name: selectedGateway.name,
          type: selectedGateway.type,
          provider: selectedGateway.provider,
          isActive: selectedGateway.isActive,
          config: selectedGateway.config,
          fees: selectedGateway.fees,
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          type: "",
          provider: "",
          isActive: true,
          config: {
            serverKey: "",
            clientKey: "",
            apiKey: "",
            secretKey: "",
            accountNumber: "",
            accountName: "",
            bankCode: "",
            qrisCode: "",
          },
          fees: {
            fixedFee: 0,
            percentageFee: 0,
            minFee: 0,
            maxFee: 0,
          },
        });
      }
    }
  }, [isFormOpen, selectedGateway]);

  const loadPaymentGateways = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-gateway");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGateways(data.gateways || []);
      } else {
        console.error("Failed to load payment gateways:", data.error);
        setGateways([]);
      }
    } catch (error) {
      console.error("Error loading payment gateways:", error);
      toast.error("Gagal memuat data payment gateway");
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGateway = async () => {
    try {
      setFormLoading(true);

      // Validate required fields
      if (!formData.name || !formData.type || !formData.provider) {
        toast.error("Nama, tipe, dan provider harus diisi");
        return;
      }

      const url = selectedGateway
        ? `/api/payment-gateway/${selectedGateway.id}`
        : "/api/payment-gateway";

      const method = selectedGateway ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          selectedGateway
            ? "Payment gateway berhasil diperbarui"
            : "Payment gateway berhasil ditambahkan",
        );
        setIsFormOpen(false);
        setSelectedGateway(null);
        loadPaymentGateways();
      } else {
        toast.error(data.error || "Gagal menyimpan payment gateway");
      }
    } catch (error) {
      console.error("Error saving payment gateway:", error);
      toast.error("Terjadi kesalahan saat menyimpan payment gateway");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGateway = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus payment gateway ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-gateway/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment gateway berhasil dihapus");
        loadPaymentGateways();
      } else {
        toast.error(data.error || "Gagal menghapus payment gateway");
      }
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      toast.error("Terjadi kesalahan saat menghapus payment gateway");
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/payment-gateway`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Payment gateway berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
        );
        loadPaymentGateways();
      } else {
        toast.error(data.error || "Gagal mengubah status payment gateway");
      }
    } catch (error) {
      console.error("Error toggling payment gateway status:", error);
      toast.error("Terjadi kesalahan saat mengubah status payment gateway");
    }
  };



  const getGatewayIcon = (type: string) => {
    switch (type) {
      case "BANK_TRANSFER":
        return <Building2 className="h-5 w-5" />;
      case "E_WALLET":
        return <Smartphone className="h-5 w-5" />;
      case "QRIS":
        return <QrCode className="h-5 w-5" />;
      case "VIRTUAL_ACCOUNT":
        return <CreditCard className="h-5 w-5" />;
      case "CREDIT_CARD":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data payment gateway...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Gateway</h1>
          <p className="text-gray-600">
            Kelola metode pembayaran yang tersedia
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedGateway(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Gateway
        </Button>
      </div>

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getGatewayIcon(gateway.type)}
                  <CardTitle className="text-lg">{gateway.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(gateway.isActive)}
                  <Badge variant={gateway.isActive ? "default" : "secondary"}>
                    {gateway.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium">{gateway.provider}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Biaya</p>
                <p className="font-medium">
                  {gateway.fees.percentageFee > 0 &&
                    `${gateway.fees.percentageFee}%`}
                  {gateway.fees.fixedFee > 0 &&
                    ` + Rp ${gateway.fees.fixedFee.toLocaleString()}`}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Switch
                  checked={gateway.isActive}
                  onCheckedChange={(checked) =>
                    handleToggleStatus(gateway.id, checked)
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGateway(gateway);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGateway(gateway.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gateways.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada payment gateway
            </h3>
            <p className="text-gray-600 mb-4">
              Tambahkan payment gateway untuk menerima pembayaran
            </p>
            <Button
              onClick={() => {
                setSelectedGateway(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Gateway Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGateway ? "Edit Payment Gateway" : "Tambah Payment Gateway"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Gateway</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Midtrans"
                  />
                </div>

                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) =>
                      setFormData({ ...formData, provider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIDTRANS">Midtrans</SelectItem>
                      <SelectItem value="XENDIT">Xendit</SelectItem>
                      <SelectItem value="DOKU">DOKU</SelectItem>
                      <SelectItem value="GOPAY">GoPay</SelectItem>
                      <SelectItem value="OVO">OVO</SelectItem>
                      <SelectItem value="DANA">DANA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Tipe Pembayaran</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                    <SelectItem value="QRIS">QRIS</SelectItem>
                    <SelectItem value="VIRTUAL_ACCOUNT">Virtual Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Konfigurasi</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serverKey">Server Key</Label>
                  <Input
                    id="serverKey"
                    type="password"
                    value={formData.config.serverKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, serverKey: e.target.value },
                      })
                    }
                    placeholder="Server key dari provider"
                  />
                </div>

                <div>
                  <Label htmlFor="clientKey">Client Key</Label>
                  <Input
                    id="clientKey"
                    value={formData.config.clientKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, clientKey: e.target.value },
                      })
                    }
                    placeholder="Client key dari provider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.config.apiKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, apiKey: e.target.value },
                      })
                    }
                    placeholder="API key (opsional)"
                  />
                </div>

                <div>
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={formData.config.secretKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, secretKey: e.target.value },
                      })
                    }
                    placeholder="Secret key (opsional)"
                  />
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Biaya</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="percentageFee">Biaya Persentase (%)</Label>
                  <Input
                    id="percentageFee"
                    type="number"
                    step="0.1"
                    value={formData.fees.percentageFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fees: { ...formData.fees, percentageFee: parseFloat(e.target.value) || 0 },
                      })
                    }
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="fixedFee">Biaya Tetap (Rp)</Label>
                  <Input
                    id="fixedFee"
                    type="number"
                    value={formData.fees.fixedFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fees: { ...formData.fees, fixedFee: parseInt(e.target.value) || 0 },
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={formLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveGateway}
                disabled={formLoading}
              >
                {formLoading ? "Menyimpan..." : selectedGateway ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
