'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Printer,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  role: string;
  position: string;
  joinDate: string;
  bankAccount: string;
  bankName: string;
  salary: number;
  allowances: number;
  deductions: number;
}

interface Payroll {
  id: string;
  employeeId: string;
  employee: Employee;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadPayrollData();
  }, [selectedMonth, selectedYear]);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to fetch employees
      // In a real app, this would be an API call to your backend
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: 'Ustadz Ahmad',
          role: 'MUSYRIF',
          position: 'Guru Tahfidz',
          joinDate: '2023-01-15',
          bankAccount: '1234567890',
          bankName: 'Bank Syariah Indonesia',
          salary: 3500000,
          allowances: 500000,
          deductions: 200000
        },
        {
          id: '2',
          name: 'Ustadzah Fatimah',
          role: 'MUSYRIF',
          position: 'Guru Tahsin',
          joinDate: '2023-02-20',
          bankAccount: '0987654321',
          bankName: 'Bank Mandiri Syariah',
          salary: 3200000,
          allowances: 450000,
          deductions: 150000
        },
        {
          id: '3',
          name: 'Bapak Mahmud',
          role: 'ADMIN',
          position: 'Admin Keuangan',
          joinDate: '2022-11-10',
          bankAccount: '5678901234',
          bankName: 'BNI',
          salary: 4000000,
          allowances: 600000,
          deductions: 250000
        }
      ];
      
      setEmployees(mockEmployees);
      
      // Simulate API call to fetch payroll data for the selected month/year
      // In a real app, this would be an API call to your backend
      const mockPayrolls: Payroll[] = [
        {
          id: '1',
          employeeId: '1',
          employee: mockEmployees[0],
          month: selectedMonth,
          year: selectedYear,
          baseSalary: 3500000,
          allowances: 500000,
          deductions: 200000,
          netSalary: 3800000,
          status: 'PAID',
          paymentDate: '2023-06-28',
          paymentMethod: 'BANK_TRANSFER',
          reference: 'TRX123456',
          createdAt: '2023-06-25'
        },
        {
          id: '2',
          employeeId: '2',
          employee: mockEmployees[1],
          month: selectedMonth,
          year: selectedYear,
          baseSalary: 3200000,
          allowances: 450000,
          deductions: 150000,
          netSalary: 3500000,
          status: 'PENDING',
          createdAt: '2023-06-25'
        },
        {
          id: '3',
          employeeId: '3',
          employee: mockEmployees[2],
          month: selectedMonth,
          year: selectedYear,
          baseSalary: 4000000,
          allowances: 600000,
          deductions: 250000,
          netSalary: 4350000,
          status: 'DRAFT',
          createdAt: '2023-06-24'
        }
      ];
      
      setPayrolls(mockPayrolls);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('Gagal memuat data penggajian');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = () => {
    toast.success('Penggajian berhasil digenerate untuk periode ' + getMonthName(selectedMonth) + ' ' + selectedYear);
    loadPayrollData();
  };

  const handleProcessPayroll = (payrollId: string) => {
    // Update the status of the payroll to PAID
    const updatedPayrolls = payrolls.map(payroll => {
      if (payroll.id === payrollId) {
        return {
          ...payroll,
          status: 'PAID' as const,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'BANK_TRANSFER'
        };
      }
      return payroll;
    });
    
    setPayrolls(updatedPayrolls);
    toast.success('Penggajian berhasil diproses');
  };

  const handleDeletePayroll = (payrollId: string) => {
    // Remove the payroll from the list
    const updatedPayrolls = payrolls.filter(payroll => payroll.id !== payrollId);
    setPayrolls(updatedPayrolls);
    toast.success('Penggajian berhasil dihapus');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[month - 1];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Dibayar
        </Badge>;
      case 'PENDING':
        return <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Menunggu
        </Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Dibatalkan
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = payroll.employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? payroll.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Penggajian</h1>
              <p className="text-gray-600">Kelola penggajian karyawan TPQ Baitus Shuffah</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePayroll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Payroll
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Penggajian
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white w-full"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white w-full"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Karyawan
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama karyawan..."
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white w-full"
                >
                  <option value="">Semua Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="PAID">Dibayar</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Karyawan</p>
                  <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Penggajian</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daftar Penggajian</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  toast.success('Laporan penggajian berhasil diunduh');
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data penggajian...</p>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada data penggajian untuk periode ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Pokok</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tunjangan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potongan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Bersih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {payroll.employee.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{payroll.employee.name}</div>
                              <div className="text-sm text-gray-500">{payroll.employee.bankName} - {payroll.employee.bankAccount}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payroll.employee.position}</div>
                          <div className="text-xs text-gray-500">{payroll.employee.role}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.baseSalary)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.allowances)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.deductions)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payroll.netSalary)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(payroll.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => toast.success('Detail penggajian ditampilkan')}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {payroll.status !== 'PAID' && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() => handleProcessPayroll(payroll.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleDeletePayroll(payroll.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {payroll.status === 'PAID' && (
                              <button
                                className="text-purple-600 hover:text-purple-900"
                                onClick={() => toast.success('Slip gaji berhasil dicetak')}
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            )}
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
      </div>
    </DashboardLayout>
  );
}