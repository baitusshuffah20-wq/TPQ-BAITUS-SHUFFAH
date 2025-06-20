'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  DollarSign,
  Receipt,
  Wallet
} from 'lucide-react';

const WaliPaymentsPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock payment data
  const payments = [
    {
      id: '1',
      type: 'SPP',
      month: 'Januari 2024',
      amount: 150000,
      dueDate: '2024-01-31',
      status: 'PENDING',
      description: 'SPP Bulanan - Ahmad Fauzi',
      childName: 'Ahmad Fauzi',
      childId: '24001'
    },
    {
      id: '2',
      type: 'SPP',
      month: 'Februari 2024',
      amount: 150000,
      dueDate: '2024-02-29',
      status: 'PENDING',
      description: 'SPP Bulanan - Ahmad Fauzi',
      childName: 'Ahmad Fauzi',
      childId: '24001'
    },
    {
      id: '3',
      type: 'SPP',
      month: 'Januari 2024',
      amount: 150000,
      dueDate: '2024-01-31',
      status: 'PENDING',
      description: 'SPP Bulanan - Siti Aisyah',
      childName: 'Siti Aisyah',
      childId: '24002'
    },
    {
      id: '4',
      type: 'SPP',
      month: 'Desember 2023',
      amount: 150000,
      dueDate: '2023-12-31',
      status: 'PAID',
      paidDate: '2023-12-28',
      paymentMethod: 'Transfer Bank',
      description: 'SPP Bulanan - Ahmad Fauzi',
      childName: 'Ahmad Fauzi',
      childId: '24001'
    },
    {
      id: '5',
      type: 'Kegiatan',
      month: 'Desember 2023',
      amount: 75000,
      dueDate: '2023-12-15',
      status: 'PAID',
      paidDate: '2023-12-10',
      paymentMethod: 'E-Wallet',
      description: 'Biaya Wisuda Hafidz',
      childName: 'Ahmad Fauzi',
      childId: '24001'
    },
    {
      id: '6',
      type: 'SPP',
      month: 'November 2023',
      amount: 150000,
      dueDate: '2023-11-30',
      status: 'OVERDUE',
      description: 'SPP Bulanan - Siti Aisyah',
      childName: 'Siti Aisyah',
      childId: '24002'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return CheckCircle;
      case 'PENDING': return Clock;
      case 'OVERDUE': return AlertCircle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.childName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || payment.status.toLowerCase() === selectedTab;
    return matchesSearch && matchesTab;
  });

  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const overduePayments = payments.filter(p => p.status === 'OVERDUE');
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
            <p className="text-gray-600">Kelola pembayaran SPP dan biaya lainnya</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Unduh Riwayat
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Bayar Sekarang
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu Pembayaran</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(totalPending)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{overduePayments.length}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(totalOverdue)}</p>
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
                  <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                  <p className="text-2xl font-bold text-gray-900">{paidPayments.length}</p>
                  <p className="text-xs text-gray-500">Bulan ini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending + totalOverdue)}</p>
                  <p className="text-xs text-gray-500">Yang harus dibayar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">Bayar SPP</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Receipt className="h-6 w-6 mb-2" />
                <span className="text-sm">Lihat Tagihan</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span className="text-sm">Unduh Kwitansi</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Jadwal Bayar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Menunggu Pembayaran', count: pendingPayments.length },
              { key: 'overdue', label: 'Terlambat', count: overduePayments.length },
              { key: 'paid', label: 'Sudah Dibayar', count: paidPayments.length },
              { key: 'all', label: 'Semua', count: payments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.key
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari pembayaran..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const StatusIcon = getStatusIcon(payment.status);
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{payment.description}</h3>
                        <p className="text-sm text-gray-500">
                          {payment.type} • {payment.month} • {payment.childName}
                        </p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            Jatuh tempo: {payment.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center justify-end mt-2">
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status === 'PAID' ? 'Lunas' : 
                           payment.status === 'PENDING' ? 'Menunggu' : 'Terlambat'}
                        </span>
                      </div>
                      {payment.status === 'PAID' && payment.paidDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dibayar: {payment.paidDate}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {payment.status === 'PAID' && payment.paymentMethod && (
                        <span>Metode: {payment.paymentMethod}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                      {payment.status === 'PAID' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Kwitansi
                        </Button>
                      )}
                      {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Bayar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pembayaran</h3>
              <p className="text-gray-500">Tidak ada pembayaran yang sesuai dengan filter yang dipilih.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaliPaymentsPage;
