'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CreditCard,
  Wallet,
  Building,
  Save,
  X,
  Calculator,
  Receipt,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SPPRecord {
  id: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paidAmount: number;
  discount: number;
  fine: number;
  santri: {
    id: string;
    nis: string;
    name: string;
  };
  sppSetting: {
    name: string;
    level?: string;
  };
}

interface SPPPaymentFormData {
  paidAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  accountId: string;
  discount: number;
  fine: number;
  notes?: string;
  receiptNumber?: string;
}

interface SPPPaymentFormProps {
  sppRecord: SPPRecord;
  onSubmit: (data: SPPPaymentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai', icon: <Wallet className="h-4 w-4" /> },
  { value: 'BANK_TRANSFER', label: 'Transfer Bank', icon: <Building className="h-4 w-4" /> },
  { value: 'DIGITAL_WALLET', label: 'Dompet Digital', icon: <CreditCard className="h-4 w-4" /> }
];

export default function SPPPaymentForm({ 
  sppRecord, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: SPPPaymentFormProps) {
  const [formData, setFormData] = useState<SPPPaymentFormData>({
    paidAmount: sppRecord.amount - sppRecord.paidAmount,
    paymentMethod: 'CASH',
    accountId: '',
    discount: sppRecord.discount || 0,
    fine: sppRecord.fine || 0,
    notes: '',
    receiptNumber: ''
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    loadAccounts();
    generateReceiptNumber();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await fetch('/api/financial/accounts?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        // Set default account (first active account)
        if (data.accounts && data.accounts.length > 0) {
          setFormData(prev => ({ ...prev, accountId: data.accounts[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Gagal memuat akun keuangan');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNumber = `SPP${year}${month}${random}`;
    setFormData(prev => ({ ...prev, receiptNumber }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Paid amount validation
    if (!formData.paidAmount || formData.paidAmount <= 0) {
      newErrors.paidAmount = 'Jumlah pembayaran harus lebih dari 0';
    }

    const remainingAmount = sppRecord.amount - sppRecord.paidAmount - formData.discount + formData.fine;
    if (formData.paidAmount > remainingAmount) {
      newErrors.paidAmount = `Jumlah pembayaran tidak boleh lebih dari ${formatCurrency(remainingAmount)}`;
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Metode pembayaran wajib dipilih';
    }

    // Account validation
    if (!formData.accountId) {
      newErrors.accountId = 'Akun keuangan wajib dipilih';
    }

    // Discount validation
    if (formData.discount < 0) {
      newErrors.discount = 'Diskon tidak boleh negatif';
    }

    if (formData.discount > sppRecord.amount) {
      newErrors.discount = 'Diskon tidak boleh lebih dari jumlah SPP';
    }

    // Fine validation
    if (formData.fine < 0) {
      newErrors.fine = 'Denda tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const calculateTotal = () => {
    const baseAmount = sppRecord.amount - sppRecord.paidAmount;
    const totalWithDiscountAndFine = baseAmount - formData.discount + formData.fine;
    return Math.max(0, totalWithDiscountAndFine);
  };

  const getPaymentStatus = () => {
    const total = calculateTotal();
    if (formData.paidAmount >= total) {
      return { status: 'PAID', label: 'Lunas', color: 'text-green-600' };
    } else if (formData.paidAmount > 0) {
      return { status: 'PARTIAL', label: 'Sebagian', color: 'text-yellow-600' };
    } else {
      return { status: 'PENDING', label: 'Belum Bayar', color: 'text-gray-600' };
    }
  };

  const paymentStatus = getPaymentStatus();

  if (loadingAccounts) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat form pembayaran...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          Pembayaran SPP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SPP Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi SPP</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Santri</p>
                  <p className="font-medium text-gray-900">{sppRecord.santri.name}</p>
                  <p className="text-sm text-gray-500">{sppRecord.santri.nis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="font-medium text-gray-900">
                    {getMonthName(sppRecord.month)} {sppRecord.year}
                  </p>
                  <p className="text-sm text-gray-500">{sppRecord.sppSetting.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah SPP</p>
                  <p className="font-bold text-gray-900">{formatCurrency(sppRecord.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sudah Dibayar</p>
                  <p className="font-bold text-green-600">{formatCurrency(sppRecord.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sisa Tagihan</p>
                  <p className="font-bold text-red-600">
                    {formatCurrency(sppRecord.amount - sppRecord.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jatuh Tempo</p>
                  <p className="font-medium text-gray-900">
                    {new Date(sppRecord.dueDate).toLocaleDateString('id-ID')}
                  </p>
                  {new Date(sppRecord.dueDate) < new Date() && sppRecord.status !== 'PAID' && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Terlambat
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Pembayaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Pembayaran *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`pl-10 ${errors.paidAmount ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.paidAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.paidAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:cursor-pointer transition-colors ${
                        formData.paymentMethod === method.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      {method.icon}
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akun Keuangan *
                </label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:cursor-pointer ${errors.accountId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Pilih Akun</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kwitansi
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    placeholder="SPP240001"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diskon
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`pl-10 ${errors.discount ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.discount && (
                  <p className="text-red-500 text-xs mt-1">{errors.discount}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.discount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denda Keterlambatan
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="fine"
                    value={formData.fine}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`pl-10 ${errors.fine ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.fine && (
                  <p className="text-red-500 text-xs mt-1">{errors.fine}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.fine)}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Catatan pembayaran (opsional)"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ringkasan Pembayaran:</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sisa Tagihan:</span>
                  <span className="font-medium">{formatCurrency(sppRecord.amount - sppRecord.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(formData.discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Denda:</span>
                  <span className="font-medium text-red-600">+{formatCurrency(formData.fine)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total yang Harus Dibayar:</span>
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Jumlah Pembayaran:</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(formData.paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Status Setelah Pembayaran:</span>
                  <Badge className={paymentStatus.color}>
                    {paymentStatus.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {paymentStatus.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Memproses...' : 'Proses Pembayaran'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
