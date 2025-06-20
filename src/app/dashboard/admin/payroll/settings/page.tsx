'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Settings,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface PayrollSetting {
  id: string;
  name: string;
  baseAmount: number;
  lateDeduction: number;
  absentDeduction: number;
  bonusAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  appliesTo?: string[];
}

export default function PayrollSettingsPage() {
  const [payrollSettings, setPayrollSettings] = useState<PayrollSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PayrollSetting | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<PayrollSetting | null>(null);
  
  // Form state
  const [settingForm, setSettingForm] = useState({
    name: '',
    baseAmount: 0,
    lateDeduction: 0,
    absentDeduction: 0,
    bonusAmount: 0,
    isActive: true,
    description: '',
    appliesTo: [] as string[]
  });
  
  // Mock data
  const mockPayrollSettings: PayrollSetting[] = [
    {
      id: 'setting_1',
      name: 'Standar Penggajian Musyrif',
      baseAmount: 50000, // Rp 50.000 per jadwal
      lateDeduction: 10000, // Rp 10.000 per keterlambatan
      absentDeduction: 50000, // Rp 50.000 per ketidakhadiran
      bonusAmount: 100000, // Rp 100.000 bonus bulanan
      isActive: true,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
      description: 'Pengaturan penggajian standar untuk musyrif',
      appliesTo: ['Musyrif', 'Musyrifah']
    },
    {
      id: 'setting_2',
      name: 'Penggajian Musyrif Senior',
      baseAmount: 75000, // Rp 75.000 per jadwal
      lateDeduction: 15000, // Rp 15.000 per keterlambatan
      absentDeduction: 75000, // Rp 75.000 per ketidakhadiran
      bonusAmount: 150000, // Rp 150.000 bonus bulanan
      isActive: true,
      createdAt: '2024-01-01T08:30:00Z',
      updatedAt: '2024-01-01T08:30:00Z',
      description: 'Pengaturan penggajian untuk musyrif senior',
      appliesTo: ['Musyrif Senior', 'Musyrifah Senior']
    },
    {
      id: 'setting_3',
      name: 'Penggajian Musyrif Paruh Waktu',
      baseAmount: 40000, // Rp 40.000 per jadwal
      lateDeduction: 8000, // Rp 8.000 per keterlambatan
      absentDeduction: 40000, // Rp 40.000 per ketidakhadiran
      bonusAmount: 50000, // Rp 50.000 bonus bulanan
      isActive: false,
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-01T09:00:00Z',
      description: 'Pengaturan penggajian untuk musyrif paruh waktu',
      appliesTo: ['Musyrif Paruh Waktu']
    }
  ];
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayrollSettings(mockPayrollSettings);
    } catch (error) {
      console.error('Error loading payroll settings:', error);
      toast.error('Gagal memuat pengaturan penggajian');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter settings
  const filteredSettings = payrollSettings.filter(setting => {
    return setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           setting.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle edit setting
  const handleEditSetting = (setting: PayrollSetting) => {
    setEditingSetting(setting);
    setSettingForm({
      name: setting.name,
      baseAmount: setting.baseAmount,
      lateDeduction: setting.lateDeduction,
      absentDeduction: setting.absentDeduction,
      bonusAmount: setting.bonusAmount,
      isActive: setting.isActive,
      description: setting.description || '',
      appliesTo: setting.appliesTo || []
    });
    setIsModalOpen(true);
  };
  
  // Handle delete setting
  const handleDeleteSetting = (setting: PayrollSetting) => {
    setSettingToDelete(setting);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete setting
  const confirmDeleteSetting = () => {
    if (settingToDelete) {
      try {
        setPayrollSettings(prev => prev.filter(s => s.id !== settingToDelete.id));
        toast.success('Pengaturan penggajian berhasil dihapus');
        setIsDeleteModalOpen(false);
        setSettingToDelete(null);
      } catch (error) {
        console.error('Error deleting payroll setting:', error);
        toast.error('Gagal menghapus pengaturan penggajian');
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const now = new Date().toISOString();
      
      if (editingSetting) {
        // Update existing setting
        const updatedSetting: PayrollSetting = {
          ...editingSetting,
          ...settingForm,
          updatedAt: now
        };
        
        setPayrollSettings(prev => prev.map(s => s.id === editingSetting.id ? updatedSetting : s));
        toast.success('Pengaturan penggajian berhasil diperbarui');
      } else {
        // Add new setting
        const newSetting: PayrollSetting = {
          id: `setting_${Date.now()}`,
          ...settingForm,
          createdAt: now,
          updatedAt: now
        };
        
        setPayrollSettings(prev => [...prev, newSetting]);
        toast.success('Pengaturan penggajian berhasil ditambahkan');
      }
      
      setIsModalOpen(false);
      setEditingSetting(null);
      resetForm();
    } catch (error) {
      console.error('Error saving payroll setting:', error);
      toast.error('Gagal menyimpan pengaturan penggajian');
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSettingForm({
      name: '',
      baseAmount: 0,
      lateDeduction: 0,
      absentDeduction: 0,
      bonusAmount: 0,
      isActive: true,
      description: '',
      appliesTo: []
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pengaturan penggajian...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Pengaturan Penggajian
            </h1>
            <p className="text-gray-600">
              Kelola pengaturan penggajian untuk musyrif
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setEditingSetting(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengaturan
          </Button>
        </div>
        
        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari pengaturan penggajian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Settings List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSettings.map(setting => (
            <Card key={setting.id} className={setting.isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{setting.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Honor per Jadwal Halaqah</p>
                        <p className="text-base font-medium text-gray-900">{formatCurrency(setting.baseAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Bonus Bulanan</p>
                        <p className="text-base font-medium text-green-600">{formatCurrency(setting.bonusAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Potongan Terlambat</p>
                        <p className="text-base font-medium text-red-600">{formatCurrency(setting.lateDeduction)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Potongan Absen</p>
                        <p className="text-base font-medium text-red-600">{formatCurrency(setting.absentDeduction)}</p>
                      </div>
                    </div>
                    
                    {setting.appliesTo && setting.appliesTo.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 mb-1">Berlaku untuk:</p>
                        <div className="flex flex-wrap gap-2">
                          {setting.appliesTo.map(position => (
                            <span key={position} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {position}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Terakhir diperbarui: {formatDate(setting.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSetting(setting)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSetting(setting)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${setting.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {setting.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Tidak Aktif
                      </>
                    )}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedSetting = {
                        ...setting,
                        isActive: !setting.isActive,
                        updatedAt: new Date().toISOString()
                      };
                      setPayrollSettings(prev => prev.map(s => s.id === setting.id ? updatedSetting : s));
                      toast.success(`Pengaturan ${setting.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
                    }}
                  >
                    {setting.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredSettings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengaturan penggajian</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Tidak ada pengaturan yang sesuai dengan pencarian' : 'Belum ada pengaturan penggajian yang ditambahkan'}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Reset Pencarian
              </Button>
            ) : (
              <Button onClick={() => {
                resetForm();
                setEditingSetting(null);
                setIsModalOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengaturan
              </Button>
            )}
          </div>
        )}
        
        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSetting ? 'Edit Pengaturan Penggajian' : 'Tambah Pengaturan Penggajian'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pengaturan
                      </label>
                      <input
                        type="text"
                        value={settingForm.name}
                        onChange={(e) => setSettingForm({ ...settingForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        value={settingForm.description}
                        onChange={(e) => setSettingForm({ ...settingForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows={2}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Honor per Jadwal Halaqah (Rp)
                      </label>
                      <input
                        type="number"
                        value={settingForm.baseAmount}
                        onChange={(e) => setSettingForm({ ...settingForm, baseAmount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Potongan Keterlambatan (Rp)
                      </label>
                      <input
                        type="number"
                        value={settingForm.lateDeduction}
                        onChange={(e) => setSettingForm({ ...settingForm, lateDeduction: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Potongan Ketidakhadiran (Rp)
                      </label>
                      <input
                        type="number"
                        value={settingForm.absentDeduction}
                        onChange={(e) => setSettingForm({ ...settingForm, absentDeduction: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bonus Bulanan (Rp)
                      </label>
                      <input
                        type="number"
                        value={settingForm.bonusAmount}
                        onChange={(e) => setSettingForm({ ...settingForm, bonusAmount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berlaku untuk
                      </label>
                      <div className="space-y-2">
                        {['Musyrif', 'Musyrifah', 'Musyrif Senior', 'Musyrifah Senior', 'Musyrif Paruh Waktu'].map(position => (
                          <div key={position} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`position-${position}`}
                              checked={settingForm.appliesTo.includes(position)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSettingForm({
                                    ...settingForm,
                                    appliesTo: [...settingForm.appliesTo, position]
                                  });
                                } else {
                                  setSettingForm({
                                    ...settingForm,
                                    appliesTo: settingForm.appliesTo.filter(p => p !== position)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`position-${position}`} className="ml-2 block text-sm text-gray-900">
                              {position}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={settingForm.isActive}
                        onChange={(e) => setSettingForm({ ...settingForm, isActive: e.target.checked })}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Aktif
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingSetting(null);
                      }}
                    >
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingSetting ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && settingToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Konfirmasi Hapus
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus pengaturan penggajian "{settingToDelete.name}"? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSettingToDelete(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={confirmDeleteSetting}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}