"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowDownRight, 
  CreditCard, 
  Building, 
  User, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WithdrawalRequestFormProps {
  availableBalance: number;
  onSuccess: () => void;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function WithdrawalRequestForm({ 
  availableBalance, 
  onSuccess 
}: WithdrawalRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    notes: "",
  });

  // Common Indonesian banks
  const commonBanks = [
    "BCA", "BRI", "BNI", "Mandiri", "CIMB Niaga", 
    "Danamon", "Permata", "OCBC NISP", "Maybank", "BTN"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      setError("Jumlah penarikan harus lebih dari 0");
      return false;
    }
    
    if (amount > availableBalance) {
      setError("Jumlah penarikan melebihi saldo tersedia");
      return false;
    }
    
    if (amount < 50000) {
      setError("Minimum penarikan adalah Rp 50.000");
      return false;
    }
    
    if (!formData.bankName.trim()) {
      setError("Nama bank harus diisi");
      return false;
    }
    
    if (!formData.accountNumber.trim()) {
      setError("Nomor rekening harus diisi");
      return false;
    }
    
    if (!formData.accountHolder.trim()) {
      setError("Nama pemilik rekening harus diisi");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/musyrif/withdrawal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          accountHolder: formData.accountHolder.trim(),
          notes: formData.notes.trim() || null,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to submit withdrawal request");
      }
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          amount: "",
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          notes: "",
        });
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(result.message || "Failed to submit withdrawal request");
      }
      
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Permintaan Penarikan Berhasil!
            </h3>
            <p className="text-gray-600 mb-4">
              Permintaan penarikan Anda telah dikirim dan sedang menunggu persetujuan admin.
            </p>
            <p className="text-sm text-gray-500">
              Anda akan menerima notifikasi setelah permintaan diproses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowDownRight className="h-5 w-5 mr-2 text-green-600" />
          Tarik Dana
        </CardTitle>
        <p className="text-sm text-gray-600">
          Saldo tersedia: <span className="font-semibold text-green-600">
            {formatCurrency(availableBalance)}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Jumlah Penarikan
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Masukkan jumlah (min. Rp 50.000)"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              min="50000"
              max={availableBalance}
              step="1000"
              required
            />
            <p className="text-xs text-gray-500">
              Minimum penarikan: Rp 50.000 • Maksimum: {formatCurrency(availableBalance)}
            </p>
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Nama Bank
            </Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Pilih atau ketik nama bank"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              list="banks"
              required
            />
            <datalist id="banks">
              {commonBanks.map(bank => (
                <option key={bank} value={bank} />
              ))}
            </datalist>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Nomor Rekening
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Masukkan nomor rekening"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              required
            />
          </div>

          {/* Account Holder */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder" className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              Nama Pemilik Rekening
            </Label>
            <Input
              id="accountHolder"
              type="text"
              placeholder="Nama sesuai rekening bank"
              value={formData.accountHolder}
              onChange={(e) => handleInputChange("accountHolder", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Pastikan nama sesuai dengan yang tertera di rekening bank
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan untuk admin..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Ajukan Penarikan
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Informasi:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Penarikan akan diproses dalam 1-3 hari kerja</li>
              <li>• Pastikan data rekening benar untuk menghindari penolakan</li>
              <li>• Anda akan mendapat notifikasi setelah penarikan diproses</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
