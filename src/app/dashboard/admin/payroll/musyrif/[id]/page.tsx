'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  Download,
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface Musyrif {
  id: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

interface HalaqahSchedule {
  id: string;
  musyrifId: string;
  musyrifName: string;
  day: string;
  startTime: string;
  endTime: string;
  halaqahName: string;
  location: string;
  status: 'ACTIVE' | 'CANCELLED';
}

interface Attendance {
  id: string;
  scheduleId: string;
  musyrifId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

interface PayrollGeneration {
  id: string;
  musyrifId: string;
  musyrifName: string;
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  totalSchedules: number;
  attendedSchedules: number;
  lateSchedules: number;
  absentSchedules: number;
  excusedSchedules: number;
  baseAmount: number;
  deductions: number;
  bonuses: number;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  generatedAt: string;
  paidAt?: string;
  notes?: string;
}

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const payrollId = params.id as string;
  
  const [payroll, setPayroll] = useState<PayrollGeneration | null>(null);
  const [musyrif, setMusyrif] = useState<Musyrif | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPayrollData();
  }, [payrollId]);
  
  const loadPayrollData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockPayroll: PayrollGeneration = {
        id: payrollId,
        musyrifId: 'musyrif_1',
        musyrifName: 'Ahmad Fauzi',
        period: {
          month: 7,
          year: 2024,
          startDate: '2024-07-01',
          endDate: '2024-07-31'
        },
        totalSchedules: 12,
        attendedSchedules: 10,
        lateSchedules: 1,
        absentSchedules: 1,
        excusedSchedules: 0,
        baseAmount: 600000, // 12 jadwal x Rp 50.000
        deductions: 60000, // 1 terlambat (Rp 10.000) + 1 absen (Rp 50.000)
        bonuses: 100000,
        totalAmount: 640000, // 600.000 - 60.000 + 100.000
        status: 'APPROVED',
        generatedAt: '2024-07-31T14:30:00Z',
        notes: 'Penggajian bulan Juli 2024'
      };
      
      const mockMusyrif: Musyrif = {
        id: 'musyrif_1',
        name: 'Ahmad Fauzi',
        nik: '3507012345678901',
        email: 'ahmad.fauzi@example.com',
        phone: '081234567890',
        address: 'Jl. Mawar No. 10, Malang',
        position: 'Musyrif Senior',
        joinDate: '2022-01-15',
        status: 'ACTIVE',
        bankAccount: {
          bankName: 'Bank Syariah Indonesia',
          accountNumber: '7012345678',
          accountHolder: 'Ahmad Fauzi'
        }
      };
      
      // Generate mock attendance data
      const mockAttendances: Attendance[] = [];
      const daysInMonth = new Date(2024, 7, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(2024, 6, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
        
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Monday, Wednesday, Friday
          let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
          
          if (day === 5) {
            status = 'LATE';
          } else if (day === 19) {
            status = 'ABSENT';
          } else {
            status = 'PRESENT';
          }
          
          const dateStr = `2024-07-${day.toString().padStart(2, '0')}`;
          
          mockAttendances.push({
            id: `attendance_schedule_1_${dateStr}`,
            scheduleId: 'schedule_1',
            musyrifId: 'musyrif_1',
            date: dateStr,
            status,
            checkInTime: status !== 'ABSENT' ? (status === 'LATE' ? '07:45' : '07:25') : undefined,
            checkOutTime: status !== 'ABSENT' ? '09:00' : undefined,
            notes: status === 'ABSENT' ? 'Tidak hadir tanpa keterangan' : undefined
          });
        }
      }
      
      setPayroll(mockPayroll);
      setMusyrif(mockMusyrif);
      setAttendances(mockAttendances);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('Gagal memuat data penggajian');
    } finally {
      setLoading(false);
    }
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
      year: 'numeric'
    }).format(date);
  };
  
  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('id-ID', { month: 'long' });
  };
  
  // Get day name
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', { weekday: 'long' });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'LATE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ABSENT': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'EXCUSED': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'DRAFT': return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'PAID': return <DollarSign className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: 'DRAFT' | 'APPROVED' | 'PAID') => {
    try {
      if (payroll) {
        setPayroll({
          ...payroll,
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date().toISOString() : payroll.paidAt
        });
        
        toast.success(`Status penggajian berhasil diubah menjadi ${newStatus}`);
      }
    } catch (error) {
      console.error('Error changing payroll status:', error);
      toast.error('Gagal mengubah status penggajian');
    }
  };
  
  // Handle print slip gaji
  const handlePrintSlip = () => {
    toast.success('Mencetak slip gaji...');
    // In a real app, this would open a print dialog or generate a PDF
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data penggajian...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!payroll || !musyrif) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak ditemukan</h3>
            <p className="text-gray-600 mb-4">Penggajian dengan ID {payrollId} tidak ditemukan</p>
            <Button onClick={() => router.push('/dashboard/admin/payroll/musyrif')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
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
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/admin/payroll/musyrif')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Penggajian Musyrif
              </h1>
              <p className="text-gray-600">
                {musyrif.name} - {getMonthName(payroll.period.month)} {payroll.period.year}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handlePrintSlip}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak Slip
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange(
                payroll.status === 'DRAFT' ? 'APPROVED' : 
                payroll.status === 'APPROVED' ? 'PAID' : 'PAID'
              )}
              disabled={payroll.status === 'PAID'}
            >
              {payroll.status === 'DRAFT' ? 
                <CheckCircle className="h-4 w-4 mr-2" /> : 
                <DollarSign className="h-4 w-4 mr-2" />}
              {payroll.status === 'DRAFT' ? 'Setujui' : 'Bayar'}
            </Button>
          </div>
        </div>
        
        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}>
                  {getStatusIcon(payroll.status)}
                  <span className="ml-1">
                    {payroll.status === 'DRAFT' ? 'Draft' : 
                     payroll.status === 'APPROVED' ? 'Disetujui' : 'Dibayar'}
                  </span>
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  ID: {payroll.id}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Dibuat:</span> {formatDate(payroll.generatedAt.split('T')[0])}
                </div>
                {payroll.paidAt && (
                  <>
                    <span className="hidden md:inline text-gray-400">•</span>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Dibayar:</span> {formatDate(payroll.paidAt.split('T')[0])}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Musyrif Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informasi Musyrif</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{musyrif.name}</p>
                    <p className="text-xs text-gray-600">{musyrif.position}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <p className="text-sm text-gray-600">{musyrif.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <p className="text-sm text-gray-600">{musyrif.phone}</p>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-600">{musyrif.address}</p>
                </div>
                {musyrif.bankAccount && (
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{musyrif.bankAccount.bankName}</p>
                      <p className="text-xs text-gray-600">{musyrif.bankAccount.accountNumber}</p>
                      <p className="text-xs text-gray-600">{musyrif.bankAccount.accountHolder}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Payroll Summary */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ringkasan Penggajian</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Periode</p>
                    <p className="text-base font-medium text-gray-900">
                      {getMonthName(payroll.period.month)} {payroll.period.year}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(payroll.period.startDate)} - {formatDate(payroll.period.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Jadwal</p>
                    <p className="text-base font-medium text-gray-900">{payroll.totalSchedules} jadwal</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hadir</p>
                    <p className="text-base font-medium text-green-600">{payroll.attendedSchedules}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terlambat</p>
                    <p className="text-base font-medium text-yellow-600">{payroll.lateSchedules}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Absen</p>
                    <p className="text-base font-medium text-red-600">{payroll.absentSchedules}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Izin</p>
                    <p className="text-base font-medium text-blue-600">{payroll.excusedSchedules}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Honor Jadwal Halaqah</p>
                      <p className="text-base font-medium text-gray-900">{formatCurrency(payroll.baseAmount)}</p>
                      <p className="text-xs text-gray-600">
                        {payroll.totalSchedules} jadwal × Rp 50.000
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Potongan</p>
                      <p className="text-base font-medium text-red-600">-{formatCurrency(payroll.deductions)}</p>
                      <p className="text-xs text-gray-600">
                        {payroll.lateSchedules > 0 && `${payroll.lateSchedules} terlambat × Rp 10.000`}
                        {payroll.lateSchedules > 0 && payroll.absentSchedules > 0 && ', '}
                        {payroll.absentSchedules > 0 && `${payroll.absentSchedules} absen × Rp 50.000`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Bonus</p>
                    <p className="text-base font-medium text-green-600">+{formatCurrency(payroll.bonuses)}</p>
                    <p className="text-xs text-gray-600">Bonus bulanan</p>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-base font-medium text-gray-900">Total Gaji</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(payroll.totalAmount)}</p>
                    </div>
                  </div>
                </div>
                
                {payroll.notes && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Catatan:</p>
                    <p className="text-sm text-gray-800">{payroll.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Attendance Records */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Riwayat Kehadiran</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendances.map(attendance => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {getDayName(attendance.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {attendance.checkInTime || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {attendance.checkOutTime || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                          {getStatusIcon(attendance.status)}
                          <span className="ml-1">
                            {attendance.status === 'PRESENT' ? 'Hadir' : 
                             attendance.status === 'LATE' ? 'Terlambat' : 
                             attendance.status === 'ABSENT' ? 'Tidak Hadir' : 'Izin'}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {attendance.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {attendances.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data kehadiran</h3>
                  <p className="text-gray-600">
                    Belum ada data kehadiran untuk periode ini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}