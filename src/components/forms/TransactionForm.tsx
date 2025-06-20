'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Save,
  X,
  Upload,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TransactionFormData {
  id?: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  accountId: string;
  santriId?: string;
  donationId?: string;
  paymentId?: string;
  transactionDate: string;
  attachments?: string[];
  tags?: string[];
}

interface TransactionFormProps {
  transaction?: TransactionFormData;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  currentUserId: string;
}

const INCOME_CATEGORIES = [
  'SPP',
  'DONATION',
  'REGISTRATION_FEE',
  'EVENT_INCOME',
  'GRANT',
  'OTHER_INCOME'
];

const EXPENSE_CATEGORIES = [
  'SALARY',
  'UTILITIES',
  'SUPPLIES',
  'MAINTENANCE',
  'TRANSPORTATION',
  'FOOD',
  'EQUIPMENT',
  'OTHER_EXPENSE'
];

const CATEGORY_LABELS = {
  // Income
  SPP: 'SPP Santri',
  DONATION: 'Donasi',
  REGISTRATION_FEE: 'Biaya Pendaftaran',
  EVENT_INCOME: 'Pendapatan Acara',
  GRANT: 'Hibah',
  OTHER_INCOME: 'Pendapatan Lainnya',
  // Expense
  SALARY: 'Gaji Ustadz/Staff',
  UTILITIES: 'Listrik & Air',
  SUPPLIES: 'Perlengkapan',
  MAINTENANCE: 'Pemeliharaan',
  TRANSPORTATION: 'Transportasi',
  FOOD: 'Konsumsi',
  EQUIPMENT: 'Peralatan',
  OTHER_EXPENSE: 'Pengeluaran Lainnya'
};

export default function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  currentUserId
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || 'INCOME',
    category: transaction?.category || '',
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    reference: transaction?.reference || '',
    accountId: transaction?.accountId || '',
    santriId: transaction?.santriId || '',
    donationId: transaction?.donationId || '',
    paymentId: transaction?.paymentId || '',
    transactionDate: transaction?.transactionDate || new Date().toISOString().split('T')[0],
    attachments: transaction?.attachments || [],
    tags: transaction?.tags || [],
    ...transaction
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isEdit = !!transaction?.id;

  useEffect(() => {
    loadSelectData();
  }, []);

  const loadSelectData = async () => {
    try {
      setLoadingData(true);
      
      // Load accounts
      const accountsResponse = await fetch('/api/financial/accounts');
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.accounts || []);
      }

      // Load santri for SPP transactions
      const santriResponse = await fetch('/api/santri');
      if (santriResponse.ok) {
        const santriData = await santriResponse.json();
        setSantriList(santriData.santri || []);
      }
    } catch (error) {
      console.error('Error loading select data:', error);
      toast.error('Gagal memuat data dropdown');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Tipe transaksi wajib dipilih';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0';
    }

    // Description validation
    if (!formData.description) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (formData.description.length < 5) {
      newErrors.description = 'Deskripsi minimal 5 karakter';
    }

    // Account validation
    if (!formData.accountId) {
      newErrors.accountId = 'Akun keuangan wajib dipilih';
    }

    // Transaction date validation
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Tanggal transaksi wajib diisi';
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
      const submitData = {
        ...formData,
        createdBy: currentUserId
      };
      await onSubmit(submitData);
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

    // Reset category when type changes
    if (name === 'type') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const getCategories = () => {
    return formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.type === 'INCOME' ? (
            <TrendingUp className="h-6 w-6 text-green-600" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-600" />
          )}
          {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Transaction Type */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipe Transaksi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'INCOME'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="INCOME"
                  checked={formData.type === 'INCOME'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isLoading}
                />
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Pemasukan</p>
                  <p className="text-sm text-gray-600">Dana masuk ke TPQ</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'EXPENSE'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="EXPENSE"
                  checked={formData.type === 'EXPENSE'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isLoading}
                />
                <TrendingDown className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Pengeluaran</p>
                  <p className="text-sm text-gray-600">Dana keluar dari TPQ</p>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-2">{errors.type}</p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Transaksi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.category ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Pilih Kategori</option>
                  {getCategories().map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akun Keuangan *
                </label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.accountId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Pilih Akun</option>
                  {accounts.filter(acc => acc.isActive).map((account) => (
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
                  Tanggal Transaksi *
                </label>
                <Input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className={errors.transactionDate ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.transactionDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.transactionDate}</p>
                )}
              </div>

              {formData.category === 'SPP' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Santri (untuk SPP)
                  </label>
                  <select
                    name="santriId"
                    value={formData.santriId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Pilih Santri</option>
                    {santriList.map((santri) => (
                      <option key={santri.id} value={santri.id}>
                        {santri.name} ({santri.nis})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Deskripsi detail transaksi..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referensi/No. Invoice
                </label>
                <Input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="INV-001, TRX-123, dll"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Transaksi:</h4>
            <div className={`p-4 rounded-lg ${formData.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {formData.type === 'INCOME' ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {CATEGORY_LABELS[formData.category as keyof typeof CATEGORY_LABELS] || 'Kategori'}
                    </p>
                    <p className="text-sm text-gray-600">{formData.description || 'Deskripsi'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${formData.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(formData.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{formData.transactionDate}</p>
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
