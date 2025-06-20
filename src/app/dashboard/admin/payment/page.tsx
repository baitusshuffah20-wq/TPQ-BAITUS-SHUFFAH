'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddPaymentModal from '@/components/modals/AddPaymentModal';
import PaymentDetailModal from '@/components/modals/PaymentDetailModal';
import PaymentGatewayModal from '@/components/modals/PaymentGatewayModal';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  santriId: string;
  santriName: string;
  paymentType: string;
  amount: number;
  paymentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [gatewayPaymentData, setGatewayPaymentData] = useState<any>(null);

  // Mock data
  const mockPayments: Payment[] = [
    {
      id: 'payment_1',
      santriId: '1',
      santriName: 'Ahmad Fauzi',
      paymentType: 'SPP',
      amount: 100000,
      paymentDate: '2024-01-15',
      status: 'PAID',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'payment_2',
      santriId: '2',
      santriName: 'Siti Aisyah',
      paymentType: 'SPP',
      amount: 100000,
      paymentDate: '2024-01-10',
      status: 'PENDING',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z'
    },
    {
      id: 'payment_3',
      santriId: '3',
      santriName: 'Muhammad Rizki',
      paymentType: 'DAFTAR_ULANG',
      amount: 250000,
      paymentDate: '2024-01-05',
      status: 'PAID',
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-01-05T14:00:00Z'
    },
    {
      id: 'payment_4',
      santriId: '4',
      santriName: 'Fatimah Zahra',
      paymentType: 'SPP',
      amount: 100000,
      paymentDate: '2024-01-20',
      status: 'OVERDUE',
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-20T11:00:00Z'
    },
    {
      id: 'payment_5',
      santriId: '5',
      santriName: 'Abdullah Rahman',
      paymentType: 'SERAGAM',
      amount: 150000,
      paymentDate: '2024-01-12',
      status: 'PAID',
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z'
    }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, typeFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType === typeFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleAddPayment = (paymentData: any) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `payment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);
    toast.success('Pembayaran berhasil ditambahkan');
  };

  const handleEditPayment = (paymentData: any) => {
    setPayments(prev => prev.map(payment =>
      payment.id === paymentData.id
        ? { ...paymentData, updatedAt: new Date().toISOString() }
        : payment
    ));
    toast.success('Pembayaran berhasil diupdate');
    setEditingPayment(null);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      toast.success('Pembayaran berhasil dihapus');
      setIsDetailModalOpen(false);
      setSelectedPayment(null);
    }
  };

  const openDetailModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setIsAddModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const openPaymentGateway = (payment: Payment) => {
    const paymentData = {
      orderId: `PAY-${payment.id}-${Date.now()}`,
      amount: payment.amount,
      description: `${getPaymentTypeText(payment.paymentType)} - ${payment.santriName}`,
      customerName: payment.santriName,
      customerEmail: 'parent@example.com', // In real app, get from santri's parent data
      customerPhone: '08123456789', // In real app, get from santri's parent data
      items: [
        {
          id: payment.id,
          name: `${getPaymentTypeText(payment.paymentType)} - ${payment.santriName}`,
          price: payment.amount,
          quantity: 1
        }
      ]
    };

    setGatewayPaymentData(paymentData);
    setIsPaymentGatewayOpen(true);
  };

  const handlePaymentGatewaySuccess = (paymentResult: any) => {
    // Update payment status to PAID
    setPayments(prev => prev.map(payment =>
      payment.id === gatewayPaymentData?.items[0]?.id
        ? { ...payment, status: 'PAID', updatedAt: new Date().toISOString() }
        : payment
    ));

    // Log payment result for debugging
    console.log('Payment gateway success:', paymentResult);

    toast.success('Pembayaran berhasil diproses!');
    setIsPaymentGatewayOpen(false);
    setGatewayPaymentData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Lunas';
      case 'PENDING': return 'Menunggu';
      case 'OVERDUE': return 'Terlambat';
      default: return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'SPP': return 'SPP Bulanan';
      case 'DAFTAR_ULANG': return 'Daftar Ulang';
      case 'SERAGAM': return 'Seragam';
      case 'KEGIATAN': return 'Kegiatan Khusus';
      case 'LAINNYA': return 'Lainnya';
      default: return type;
    }
  };

  const calculateStats = () => {
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === 'PAID').length;
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
    const overduePayments = payments.filter(p => p.status === 'OVERDUE').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
          <p className="text-gray-600">Kelola pembayaran SPP dan biaya lainnya</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembayaran
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lunas</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-red-600">{stats.overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats.totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {stats.paidAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Belum Dibayar</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {stats.pendingAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari santri atau ID pembayaran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="PAID">Lunas</option>
                <option value="PENDING">Menunggu</option>
                <option value="OVERDUE">Terlambat</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Jenis</option>
                <option value="SPP">SPP Bulanan</option>
                <option value="DAFTAR_ULANG">Daftar Ulang</option>
                <option value="SERAGAM">Seragam</option>
                <option value="KEGIATAN">Kegiatan Khusus</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Jenis</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Jumlah</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.santriName}</p>
                        <p className="text-sm text-gray-500">ID: {payment.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {getPaymentTypeText(payment.paymentType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => openPaymentGateway(payment)}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Bayar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pembayaran</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tidak ada pembayaran yang sesuai dengan filter'
                    : 'Belum ada pembayaran yang tercatat'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPayment(null);
        }}
        onSave={editingPayment ? handleEditPayment : handleAddPayment}
        editData={editingPayment}
      />

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        onEdit={() => openEditModal(selectedPayment!)}
        onDelete={() => handleDeletePayment(selectedPayment!.id)}
        payment={selectedPayment}
      />

      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => {
          setIsPaymentGatewayOpen(false);
          setGatewayPaymentData(null);
        }}
        onSuccess={handlePaymentGatewaySuccess}
        paymentData={gatewayPaymentData}
      />
    </div>
  );
}
