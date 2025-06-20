'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar,
  GraduationCap,
  Plus,
  Minus,
  Save,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Santri {
  id: string;
  nis: string;
  name: string;
  halaqah?: {
    name: string;
    level: string;
  };
}

interface SPPSetting {
  id: string;
  name: string;
  amount: number;
  level?: string;
  isActive: boolean;
}

interface MonthData {
  month: number;
  year: number;
  dueDate: string;
}

interface SPPBulkGenerateFormData {
  sppSettingId: string;
  santriIds: string[];
  months: MonthData[];
}

interface SPPBulkGenerateFormProps {
  onSubmit: (data: SPPBulkGenerateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function SPPBulkGenerateForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: SPPBulkGenerateFormProps) {
  const [formData, setFormData] = useState<SPPBulkGenerateFormData>({
    sppSettingId: '',
    santriIds: [],
    months: []
  });

  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [sppSettings, setSppSettings] = useState<SPPSetting[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<Santri[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
    initializeMonths();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Load santri
      const santriResponse = await fetch('/api/santri');
      if (santriResponse.ok) {
        const santriData = await santriResponse.json();
        setSantriList(santriData.santri || []);
      }

      // Load SPP settings
      const settingsResponse = await fetch('/api/spp/settings?isActive=true');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSppSettings(settingsData.sppSettings || []);
        // Set default SPP setting
        if (settingsData.sppSettings && settingsData.sppSettings.length > 0) {
          setFormData(prev => ({ ...prev, sppSettingId: settingsData.sppSettings[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const initializeMonths = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Initialize with current month
    const initialMonth: MonthData = {
      month: currentMonth,
      year: currentYear,
      dueDate: new Date(currentYear, currentMonth - 1, 10).toISOString().split('T')[0] // 10th of the month
    };
    
    setFormData(prev => ({ ...prev, months: [initialMonth] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // SPP Setting validation
    if (!formData.sppSettingId) {
      newErrors.sppSettingId = 'Pengaturan SPP wajib dipilih';
    }

    // Santri validation
    if (formData.santriIds.length === 0) {
      newErrors.santriIds = 'Minimal pilih 1 santri';
    }

    // Months validation
    if (formData.months.length === 0) {
      newErrors.months = 'Minimal pilih 1 bulan';
    }

    // Validate each month
    formData.months.forEach((month, index) => {
      if (!month.dueDate) {
        newErrors[`month_${index}_dueDate`] = 'Tanggal jatuh tempo wajib diisi';
      }
    });

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

  const handleSantriToggle = (santri: Santri) => {
    const isSelected = formData.santriIds.includes(santri.id);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        santriIds: prev.santriIds.filter(id => id !== santri.id)
      }));
      setSelectedSantri(prev => prev.filter(s => s.id !== santri.id));
    } else {
      setFormData(prev => ({
        ...prev,
        santriIds: [...prev.santriIds, santri.id]
      }));
      setSelectedSantri(prev => [...prev, santri]);
    }

    // Clear error when user selects santri
    if (errors.santriIds) {
      setErrors(prev => ({ ...prev, santriIds: '' }));
    }
  };

  const handleSelectAllSantri = () => {
    if (formData.santriIds.length === santriList.length) {
      // Deselect all
      setFormData(prev => ({ ...prev, santriIds: [] }));
      setSelectedSantri([]);
    } else {
      // Select all
      setFormData(prev => ({ ...prev, santriIds: santriList.map(s => s.id) }));
      setSelectedSantri(santriList);
    }
  };

  const addMonth = () => {
    const lastMonth = formData.months[formData.months.length - 1];
    let nextMonth = lastMonth.month + 1;
    let nextYear = lastMonth.year;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    const newMonth: MonthData = {
      month: nextMonth,
      year: nextYear,
      dueDate: new Date(nextYear, nextMonth - 1, 10).toISOString().split('T')[0]
    };
    
    setFormData(prev => ({
      ...prev,
      months: [...prev.months, newMonth]
    }));
  };

  const removeMonth = (index: number) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months.filter((_, i) => i !== index)
    }));
  };

  const updateMonth = (index: number, field: keyof MonthData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months.map((month, i) => 
        i === index ? { ...month, [field]: value } : month
      )
    }));
  };

  const getSelectedSPPSetting = () => {
    return sppSettings.find(s => s.id === formData.sppSettingId);
  };

  const calculateTotal = () => {
    const setting = getSelectedSPPSetting();
    if (!setting) return 0;
    return setting.amount * formData.santriIds.length * formData.months.length;
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Generate SPP Massal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SPP Setting Selection */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pengaturan SPP</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sppSettings.map((setting) => (
                <label
                  key={setting.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:cursor-pointer transition-colors ${
                    formData.sppSettingId === setting.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="sppSettingId"
                    value={setting.id}
                    checked={formData.sppSettingId === setting.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, sppSettingId: e.target.value }))}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{setting.name}</p>
                    <p className="text-sm text-gray-600">{setting.level || 'Semua Level'}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(setting.amount)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {errors.sppSettingId && (
              <p className="text-red-500 text-sm mt-2">{errors.sppSettingId}</p>
            )}
          </div>

          {/* Santri Selection */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pilih Santri</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {formData.santriIds.length} dari {santriList.length} santri dipilih
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllSantri}
                >
                  {formData.santriIds.length === santriList.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {santriList.map((santri) => (
                <label
                  key={santri.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:cursor-pointer transition-colors ${
                    formData.santriIds.includes(santri.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.santriIds.includes(santri.id)}
                    onChange={() => handleSantriToggle(santri)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{santri.name}</p>
                    <p className="text-sm text-gray-600">{santri.nis}</p>
                    {santri.halaqah && (
                      <p className="text-xs text-gray-500">{santri.halaqah.name}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {errors.santriIds && (
              <p className="text-red-500 text-sm mt-2">{errors.santriIds}</p>
            )}
          </div>

          {/* Month Selection */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Periode SPP</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addMonth}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Tambah Bulan
              </Button>
            </div>

            <div className="space-y-3">
              {formData.months.map((month, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bulan
                      </label>
                      <select
                        value={month.month}
                        onChange={(e) => updateMonth(index, 'month', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:cursor-pointer"
                        disabled={isLoading}
                      >
                        {MONTHS.map((monthName, monthIndex) => (
                          <option key={monthIndex} value={monthIndex + 1}>
                            {monthName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun
                      </label>
                      <Input
                        type="number"
                        value={month.year}
                        onChange={(e) => updateMonth(index, 'year', parseInt(e.target.value))}
                        min="2024"
                        max="2030"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jatuh Tempo
                      </label>
                      <Input
                        type="date"
                        value={month.dueDate}
                        onChange={(e) => updateMonth(index, 'dueDate', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {formData.months.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMonth(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.months && (
              <p className="text-red-500 text-sm mt-2">{errors.months}</p>
            )}
          </div>

          {/* Summary */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ringkasan Generate SPP:</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Pengaturan SPP</p>
                  <p className="font-medium text-gray-900">
                    {getSelectedSPPSetting()?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Santri</p>
                  <p className="font-bold text-blue-600">{formData.santriIds.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Bulan</p>
                  <p className="font-bold text-blue-600">{formData.months.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total SPP</p>
                  <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(calculateTotal())}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Total {formData.santriIds.length * formData.months.length} SPP akan dibuat
                </p>
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
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Memproses...' : 'Generate SPP'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
