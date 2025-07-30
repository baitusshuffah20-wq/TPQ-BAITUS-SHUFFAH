"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
} from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  logo?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branch: "",
    isActive: true,
    isDefault: false,
    description: "",
    logo: "",
    sortOrder: 0,
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isFormOpen) {
      if (selectedAccount) {
        // Edit mode - populate form with existing data
        setFormData({
          bankName: selectedAccount.bankName,
          accountNumber: selectedAccount.accountNumber,
          accountName: selectedAccount.accountName,
          branch: selectedAccount.branch || "",
          isActive: selectedAccount.isActive,
          isDefault: selectedAccount.isDefault,
          description: selectedAccount.description || "",
          logo: selectedAccount.logo || "",
          sortOrder: selectedAccount.sortOrder,
        });
      } else {
        // Add mode - reset form
        setFormData({
          bankName: "",
          accountNumber: "",
          accountName: "",
          branch: "",
          isActive: true,
          isDefault: false,
          description: "",
          logo: "",
          sortOrder: 0,
        });
      }
    }
  }, [isFormOpen, selectedAccount]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bank-accounts");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBankAccounts(data.bankAccounts || []);
      } else {
        console.error("Failed to load bank accounts:", data.error);
        setBankAccounts([]);
      }
    } catch (error) {
      console.error("Error loading bank accounts:", error);
      toast.error("Gagal memuat data rekening bank");
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setFormLoading(true);

      // Validate required fields
      if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
        toast.error("Nama bank, nomor rekening, dan nama pemilik harus diisi");
        return;
      }

      const url = selectedAccount
        ? `/api/bank-accounts/${selectedAccount.id}`
        : "/api/bank-accounts";

      const method = selectedAccount ? "PUT" : "POST";

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
          selectedAccount
            ? "Rekening bank berhasil diperbarui"
            : "Rekening bank berhasil ditambahkan",
        );
        setIsFormOpen(false);
        setSelectedAccount(null);
        loadBankAccounts();
      } else {
        toast.error(data.error || "Gagal menyimpan rekening bank");
      }
    } catch (error) {
      console.error("Error saving bank account:", error);
      toast.error("Terjadi kesalahan saat menyimpan rekening bank");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening bank ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Rekening bank berhasil dihapus");
        loadBankAccounts();
      } else {
        toast.error(data.error || "Gagal menghapus rekening bank");
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error("Terjadi kesalahan saat menghapus rekening bank");
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Rekening bank berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
        );
        loadBankAccounts();
      } else {
        toast.error(data.error || "Gagal mengubah status rekening bank");
      }
    } catch (error) {
      console.error("Error toggling bank account status:", error);
      toast.error("Terjadi kesalahan saat mengubah status rekening bank");
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
            <p className="mt-2 text-gray-600">Memuat data rekening bank...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Rekening Bank</h1>
            <p className="text-gray-600">
              Kelola rekening bank untuk transfer manual
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedAccount(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Rekening
          </Button>
        </div>

        {/* Bank Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((account) => (
            <Card key={account.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{account.bankName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {getStatusIcon(account.isActive)}
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nomor Rekening</p>
                  <p className="font-mono font-medium">{account.accountNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Nama Pemilik</p>
                  <p className="font-medium">{account.accountName}</p>
                </div>

                {account.branch && (
                  <div>
                    <p className="text-sm text-gray-600">Cabang</p>
                    <p className="font-medium">{account.branch}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Switch
                    checked={account.isActive}
                    onCheckedChange={(checked) =>
                      handleToggleStatus(account.id, checked)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bankAccounts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada rekening bank
              </h3>
              <p className="text-gray-600 mb-4">
                Tambahkan rekening bank untuk menerima transfer manual
              </p>
              <Button
                onClick={() => {
                  setSelectedAccount(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Rekening Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? "Edit Rekening Bank" : "Tambah Rekening Bank"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Rekening</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Select
                      value={formData.bankName}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bankName: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BCA">Bank Central Asia (BCA)</SelectItem>
                        <SelectItem value="BNI">Bank Negara Indonesia (BNI)</SelectItem>
                        <SelectItem value="BRI">Bank Rakyat Indonesia (BRI)</SelectItem>
                        <SelectItem value="Mandiri">Bank Mandiri</SelectItem>
                        <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                        <SelectItem value="Danamon">Bank Danamon</SelectItem>
                        <SelectItem value="Permata">Bank Permata</SelectItem>
                        <SelectItem value="OCBC">OCBC NISP</SelectItem>
                        <SelectItem value="Maybank">Maybank Indonesia</SelectItem>
                        <SelectItem value="BSI">Bank Syariah Indonesia (BSI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">Nomor Rekening</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      placeholder="Contoh: 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    placeholder="Nama sesuai rekening bank"
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Cabang (Opsional)</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    placeholder="Contoh: Jakarta Pusat"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Keterangan (Opsional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Keterangan tambahan tentang rekening ini"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDefault: checked })
                      }
                    />
                    <Label htmlFor="isDefault">Rekening Utama</Label>
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
                  onClick={handleSaveAccount}
                  disabled={formLoading}
                >
                  {formLoading ? "Menyimpan..." : selectedAccount ? "Update" : "Simpan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
