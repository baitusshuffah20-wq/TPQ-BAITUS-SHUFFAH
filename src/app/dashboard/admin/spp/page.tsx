'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import SPPSettingForm from '@/components/forms/SPPSettingForm';
import SPPPaymentForm from '@/components/forms/SPPPaymentForm';
import SPPBulkGenerateForm from '@/components/forms/SPPBulkGenerateForm';
import { 
  GraduationCap, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Calendar,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SPPSetting {
  id: string;
  name: string;
  amount: number;
  description?: string;
  isActive: boolean;
  level?: string;
  _count: {
    sppRecords: number;
  };
}

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
    halaqah?: {
      name: string;
      level: string;
    };
  };
  sppSetting: {
    name: string;
    level?: string;
  };
}

export default function SPPPage() {
  const [sppSettings, setSppSettings] = useState<SPPSetting[]>([]);
  const [sppRecords, setSppRecords] = useState<SPPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBulkGenerateForm, setShowBulkGenerateForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SPPSetting | null>(null);
  const [payingSPP, setPayingSPP] = useState<SPPRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'records'>('overview');
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalDiscount: 0,
    totalFine: 0,
    totalRecords: 0,
    statusCounts: {
      pending: 0,
      paid: 0,
      overdue: 0,
      partial: 0
    }
  });

  useEffect(() => {
    loadSPPData();
  }, []);

  const loadSPPData = async () => {
    try {
      setLoading(true);
      
      // Load SPP settings
      const settingsResponse = await fetch('/api/spp/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSppSettings(settingsData.sppSettings || []);
      }

      // Load recent SPP records
      const recordsResponse = await fetch('/api/spp/records?limit=10');
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setSppRecords(recordsData.sppRecords || []);
        setSummary(recordsData.summary || {
          totalAmount: 0,
          totalPaid: 0,
          totalDiscount: 0,
          totalFine: 0,
          totalRecords: 0,
          statusCounts: { pending: 0, paid: 0, overdue: 0, partial: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading SPP data:', error);
      toast.error('Gagal memuat data SPP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetting = async (settingData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/spp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingData)
      });

      if (response.ok) {
        toast.success('Pengaturan SPP berhasil dibuat');
        setShowSettingForm(false);
        loadSPPData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat pengaturan SPP');
      }
    } catch (error) {
      console.error('Error creating SPP setting:', error);
      toast.error('Gagal membuat pengaturan SPP');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!payingSPP) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/spp/records/${payingSPP.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          createdBy: 'admin-user' // Default admin user for now
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Pembayaran SPP berhasil diproses');
        setShowPaymentForm(false);
        setPayingSPP(null);
        loadSPPData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal memproses pembayaran SPP');
      }
    } catch (error) {
      console.error('Error processing SPP payment:', error);
      toast.error('Gagal memproses pembayaran SPP');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaySPP = (sppRecord: SPPRecord) => {
    setPayingSPP(sppRecord);
    setShowPaymentForm(true);
  };

  const handleBulkGenerate = async (bulkData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/spp/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`${result.count} SPP berhasil dibuat`);
        setShowBulkGenerateForm(false);
        loadSPPData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat SPP massal');
      }
    } catch (error) {
      console.error('Error bulk generating SPP:', error);
      toast.error('Gagal membuat SPP massal');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Lunas
        </Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Belum Bayar
        </Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Terlambat
        </Badge>;
      case 'PARTIAL':
        return <Badge variant="warning" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Sebagian
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const calculateCollectionRate = () => {
    if (summary.totalAmount === 0) return 0;
    return (summary.totalPaid / summary.totalAmount) * 100;
  };

  if (showSettingForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <SPPSettingForm
            sppSetting={editingSetting || undefined}
            onSubmit={handleCreateSetting}
            onCancel={() => {
              setShowSettingForm(false);
              setEditingSetting(null);
            }}
            isLoading={formLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (showPaymentForm && payingSPP) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <SPPPaymentForm
            sppRecord={payingSPP}
            onSubmit={handlePaymentSubmit}
            onCancel={() => {
              setShowPaymentForm(false);
              setPayingSPP(null);
            }}
            isLoading={formLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (showBulkGenerateForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <SPPBulkGenerateForm
            onSubmit={handleBulkGenerate}
            onCancel={() => setShowBulkGenerateForm(false)}
            isLoading={formLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen SPP</h1>
              <p className="text-gray-600">Kelola SPP santri TPQ Baitus Shuffah</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettingForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Pengaturan SPP
            </Button>
            <Button
              onClick={() => setShowBulkGenerateForm(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Generate SPP Massal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total SPP</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terkumpul</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Belum Terbayar</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalAmount - summary.totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tingkat Koleksi</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {calculateCollectionRate().toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lunas</p>
                  <p className="text-xl font-bold text-green-600">{summary.statusCounts.paid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Belum Bayar</p>
                  <p className="text-xl font-bold text-gray-600">{summary.statusCounts.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-xl font-bold text-red-600">{summary.statusCounts.overdue}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sebagian</p>
                  <p className="text-xl font-bold text-yellow-600">{summary.statusCounts.partial}</p>
                </div>
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <GraduationCap className="h-4 w-4" /> },
              { id: 'settings', label: 'Pengaturan SPP', icon: <DollarSign className="h-4 w-4" /> },
              { id: 'records', label: 'Data SPP', icon: <Calendar className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm cursor-pointer hover:cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent SPP Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SPP Terbaru</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('records')}
                  >
                    Lihat Semua
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data SPP...</p>
                  </div>
                ) : sppRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada data SPP</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sppRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{record.santri.name}</p>
                            <p className="text-sm text-gray-600">
                              {getMonthName(record.month)} {record.year} - {record.sppSetting.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(record.amount)}
                          </p>
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SPP Settings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pengaturan SPP</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('settings')}
                  >
                    Kelola
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat pengaturan...</p>
                  </div>
                ) : sppSettings.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada pengaturan SPP</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sppSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">{setting.name}</p>
                            <p className="text-sm text-gray-600">
                              {setting.level || 'Semua Level'} • {setting._count.sppRecords} SPP
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(setting.amount)}
                          </p>
                          <Badge variant={setting.isActive ? 'success' : 'secondary'} className="text-xs">
                            {setting.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daftar Pengaturan SPP</span>
                <Button
                  onClick={() => setShowSettingForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Pengaturan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat pengaturan...</p>
                </div>
              ) : sppSettings.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengaturan SPP</h3>
                  <p className="text-gray-600 mb-6">Mulai dengan membuat pengaturan SPP pertama Anda</p>
                  <Button
                    onClick={() => setShowSettingForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Buat Pengaturan Pertama
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sppSettings.map((setting) => (
                    <div key={setting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-gray-900">{setting.name}</h3>
                        </div>
                        <Badge variant={setting.isActive ? 'success' : 'secondary'}>
                          {setting.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Jumlah:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(setting.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-medium">{setting.level || 'Semua Level'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">SPP Dibuat:</span>
                          <span className="font-medium">{setting._count.sppRecords}</span>
                        </div>
                      </div>

                      {setting.description && (
                        <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSetting(setting);
                            setShowSettingForm(true);
                          }}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'records' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data SPP Santri</span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    onClick={() => setShowBulkGenerateForm(true)}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Generate SPP Massal
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data SPP...</p>
                </div>
              ) : sppRecords.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data SPP</h3>
                  <p className="text-gray-600 mb-6">Mulai dengan generate SPP untuk santri</p>
                  <Button
                    onClick={() => setShowBulkGenerateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Generate SPP Pertama
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Periode</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Jenis SPP</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Jumlah</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Terbayar</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Jatuh Tempo</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sppRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{record.santri.name}</p>
                              <p className="text-sm text-gray-600">{record.santri.nis}</p>
                              {record.santri.halaqah && (
                                <p className="text-xs text-gray-500">{record.santri.halaqah.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {getMonthName(record.month)} {record.year}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div>
                              <p>{record.sppSetting.name}</p>
                              {record.sppSetting.level && (
                                <p className="text-xs text-gray-500">{record.sppSetting.level}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(record.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-green-600">
                              {formatCurrency(record.paidAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {new Date(record.dueDate).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {record.status !== 'PAID' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePaySPP(record)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Bayar SPP"
                                >
                                  <DollarSign className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                title="Lihat Detail"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
