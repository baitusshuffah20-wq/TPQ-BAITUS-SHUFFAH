'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  CreditCard, 
  Search, 
  Filter,
  Download,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Payment {
  id: string;
  santriName: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  method?: string;
  reference?: string;
}

const PaymentsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/login');
      } else {
        setUser(parsedUser);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock data - in real app, fetch from API
  const payments: Payment[] = [
    {
      id: '1',
      santriName: 'Ahmad Fauzi',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      status: 'PAID',
      method: 'BANK_TRANSFER',
      reference: 'TRX001'
    },
    {
      id: '2',
      santriName: 'Siti Aisyah',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      status: 'PENDING',
      reference: 'TRX002'
    },
    {
      id: '3',
      santriName: 'Muhammad Rizki',
      type: 'REGISTRATION',
      amount: 1000000,
      dueDate: '2024-01-30',
      status: 'OVERDUE',
      reference: 'TRX003'
    },
    {
      id: '4',
      santriName: 'Fatimah Zahra',
      type: 'BOOK',
      amount: 200000,
      dueDate: '2024-02-20',
      paidDate: '2024-02-18',
      status: 'PAID',
      method: 'E_WALLET',
      reference: 'TRX004'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'PAID').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    overdue: payments.filter(p => p.status === 'OVERDUE').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  };

  const handleCreatePayment = async (paymentData: any) => {
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'spp',
          santriId: paymentData.santriId,
          amount: paymentData.amount,
          paymentType: paymentData.type
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Midtrans payment page
        window.open(result.redirectUrl, '_blank');
        setShowCreateModal(false);
      } else {
        alert('Gagal membuat pembayaran: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Terjadi kesalahan saat membuat pembayaran');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Pembayaran
            </h1>
            <p className="text-gray-600">
              Kelola pembayaran SPP dan biaya lainnya
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Tagihan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lunas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Pendapatan
              </h3>
              <p className="text-3xl font-bold text-teal-600">
                {formatCurrency(stats.paidAmount)}
              </p>
              <p className="text-sm text-gray-500">
                dari {formatCurrency(stats.totalAmount)} total tagihan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tingkat Pembayaran
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round((stats.paid / stats.total) * 100)}%
              </p>
              <p className="text-sm text-gray-500">
                dari total tagihan yang dibuat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Cari santri atau jenis pembayaran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PAID">Lunas</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Terlambat</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Jenis</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Jatuh Tempo</th>
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
                          <p className="text-sm text-gray-500">ID: {payment.reference}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{payment.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'PENDING' && (
                            <Button variant="outline" size="sm">
                              Kirim Reminder
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
