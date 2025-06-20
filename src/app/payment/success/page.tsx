'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  CheckCircle, 
  Download, 
  Home, 
  CreditCard,
  Calendar,
  User,
  Hash,
  ArrowRight
} from 'lucide-react';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment details from URL params or API
    const orderId = searchParams.get('order_id');
    const statusCode = searchParams.get('status_code');
    const transactionStatus = searchParams.get('transaction_status');

    // Mock payment data - in real app, fetch from API using order_id
    const mockPaymentData = {
      orderId: orderId || 'SPP_1707123456_abc123',
      amount: 500000,
      paymentType: 'SPP',
      santriName: 'Ahmad Fauzi',
      santriNis: '24001',
      paymentMethod: 'Bank Transfer',
      paidAt: new Date().toISOString(),
      reference: 'TRX001234567890',
      status: 'PAID'
    };

    setPaymentData(mockPaymentData);
    setLoading(false);
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memproses pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-gray-600">
              Terima kasih, pembayaran Anda telah berhasil diproses
            </p>
          </div>

          {/* Payment Details */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Detail Pembayaran
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Hash className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">ID Transaksi</span>
                  </div>
                  <span className="font-medium text-gray-900">{paymentData.reference}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Santri</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{paymentData.santriName}</div>
                    <div className="text-sm text-gray-500">NIS: {paymentData.santriNis}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Jenis Pembayaran</span>
                  </div>
                  <span className="font-medium text-gray-900">{paymentData.paymentType}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Metode Pembayaran</span>
                  </div>
                  <span className="font-medium text-gray-900">{paymentData.paymentMethod}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Tanggal Pembayaran</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(paymentData.paidAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">Total Dibayar</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(paymentData.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Status: LUNAS</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Bukti Pembayaran
              </Button>
              
              <Link href="/dashboard/wali/payments" className="w-full">
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Lihat Riwayat Pembayaran
                </Button>
              </Link>
            </div>

            <Link href="/" className="block">
              <Button className="w-full" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bukti pembayaran telah dikirim ke email yang terdaftar</li>
              <li>• Pembayaran akan diverifikasi dalam 1x24 jam</li>
              <li>• Simpan bukti pembayaran untuk keperluan administrasi</li>
              <li>• Hubungi admin jika ada pertanyaan: +62 21 1234 5678</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccessPageWithSuspense = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPage />
    </Suspense>
  );
};

export default PaymentSuccessPageWithSuspense;
