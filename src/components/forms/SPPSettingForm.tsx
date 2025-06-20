'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  DollarSign,
  Save,
  X,
  BookOpen,
  Star,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SPPSettingFormData {
  id?: string;
  name: string;
  amount: number;
  description?: string;
  isActive: boolean;
  level?: string;
}

interface SPPSettingFormProps {
  sppSetting?: SPPSettingFormData;
  onSubmit: (data: SPPSettingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SPP_LEVELS = [
  { value: 'PEMULA', label: 'Pemula', icon: <BookOpen className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'MENENGAH', label: 'Menengah', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  { value: 'LANJUTAN', label: 'Lanjutan', icon: <Star className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'TAHFIDZ', label: 'Tahfidz', icon: <Award className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' }
];

export default function SPPSettingForm({ 
  sppSetting, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: SPPSettingFormProps) {
  const [formData, setFormData] = useState<SPPSettingFormData>({
    name: sppSetting?.name || '',
    amount: sppSetting?.amount || 0,
    description: sppSetting?.description || '',
    isActive: sppSetting?.isActive ?? true,
    level: sppSetting?.level || '',
    ...sppSetting
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!sppSetting?.id;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Nama SPP wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama SPP minimal 3 karakter';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah SPP harus lebih dari 0';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getLevelInfo = (level: string) => {
    return SPP_LEVELS.find(l => l.value === level);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          {isEdit ? 'Edit Pengaturan SPP' : 'Tambah Pengaturan SPP Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama SPP *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: SPP Reguler, SPP Tahfidz"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah SPP per Bulan *
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
                Jumlah: {formatCurrency(formData.amount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level/Tingkatan
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.level === ''
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value=""
                    checked={formData.level === ''}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium">Semua Level</span>
                </label>
                {SPP_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.level === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={formData.level === level.value}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    {level.icon}
                    <span className="text-sm font-medium">{level.label}</span>
                  </label>
                ))}
              </div>
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi pengaturan SPP (opsional)"
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
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label className="text-sm font-medium text-gray-700">
                Pengaturan Aktif
              </label>
              <Badge variant={formData.isActive ? 'success' : 'secondary'}>
                {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pengaturan yang tidak aktif tidak dapat digunakan untuk membuat SPP baru
            </p>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Pengaturan SPP:</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{formData.name || 'Nama SPP'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {formData.level && (
                        <Badge className={getLevelInfo(formData.level)?.color}>
                          <span className="flex items-center gap-1">
                            {getLevelInfo(formData.level)?.icon}
                            {getLevelInfo(formData.level)?.label}
                          </span>
                        </Badge>
                      )}
                      <Badge variant={formData.isActive ? 'success' : 'secondary'}>
                        {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(formData.amount)}
                  </p>
                  <p className="text-sm text-gray-500">per bulan</p>
                </div>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                  {formData.description}
                </p>
              )}
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
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
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
