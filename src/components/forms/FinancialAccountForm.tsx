'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CreditCard,
  Building,
  Smartphone,
  Save,
  X,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FinancialAccountFormData {
  id?: string;
  name: string;
  type: 'CASH' | 'BANK' | 'DIGITAL_WALLET';
  accountNumber?: string;
  balance: number;
  isActive: boolean;
  description?: string;
}

interface FinancialAccountFormProps {
  account?: FinancialAccountFormData;
  onSubmit: (data: FinancialAccountFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ACCOUNT_TYPES = [
  { value: 'CASH', label: 'Kas/Tunai', icon: <Wallet className="h-4 w-4" /> },
  { value: 'BANK', label: 'Bank', icon: <Building className="h-4 w-4" /> },
  { value: 'DIGITAL_WALLET', label: 'Dompet Digital', icon: <Smartphone className="h-4 w-4" /> }
];

export default function FinancialAccountForm({ 
  account, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: FinancialAccountFormProps) {
  const [formData, setFormData] = useState<FinancialAccountFormData>({
    name: account?.name || '',
    type: account?.type || 'CASH',
    accountNumber: account?.accountNumber || '',
    balance: account?.balance || 0,
    isActive: account?.isActive ?? true,
    description: account?.description || '',
    ...account
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!account?.id;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Nama akun wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama akun minimal 3 karakter';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Tipe akun wajib dipilih';
    }

    // Account number validation for bank accounts
    if (formData.type === 'BANK' && !formData.accountNumber) {
      newErrors.accountNumber = 'Nomor rekening wajib diisi untuk akun bank';
    }

    // Balance validation
    if (formData.balance < 0) {
      newErrors.balance = 'Saldo tidak boleh negatif';
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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getTypeIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType?.icon || <Wallet className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType?.label || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-green-600" />
          {isEdit ? 'Edit Akun Keuangan' : 'Tambah Akun Keuangan Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Akun *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Kas Utama, Bank BCA, OVO"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Akun *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ACCOUNT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            {formData.type === 'BANK' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Rekening *
                </label>
                <Input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={errors.accountNumber ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Awal
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className={`pl-10 ${errors.balance ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.balance && (
                <p className="text-red-500 text-xs mt-1">{errors.balance}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Saldo saat ini: {formatCurrency(formData.balance)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Deskripsi akun (opsional)"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                disabled={isLoading}
              />
              <label className="text-sm font-medium text-gray-700">
                Akun Aktif
              </label>
              <Badge variant={formData.isActive ? 'success' : 'secondary'}>
                {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Akun yang tidak aktif tidak dapat digunakan untuk transaksi
            </p>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Akun:</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getTypeIcon(formData.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{formData.name || 'Nama Akun'}</p>
                  <p className="text-sm text-gray-600">{getTypeLabel(formData.type)}</p>
                  {formData.accountNumber && (
                    <p className="text-sm text-gray-500">No: {formData.accountNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(formData.balance)}
                  </p>
                  <Badge variant={formData.isActive ? 'success' : 'secondary'} className="text-xs">
                    {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
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
              {isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
