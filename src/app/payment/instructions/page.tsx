'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Copy,
  QrCode,
  Building,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentInstructions {
  orderId: string;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  gateway: string;
  vaNumber?: string;
  bankCode?: string;
  qrCode?: string;
  instructions: string[];
  expiryTime: string;
  status: string;
}

function PaymentInstructionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (orderId && paymentId) {
      loadPaymentInstructions();
    } else {
      router.push('/payment');
    }
  }, [orderId, paymentId]);

  useEffect(() => {
    if (paymentInstructions?.expiryTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(paymentInstructions.expiryTime).getTime();
        const distance = expiry - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Expired');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentInstructions]);

  const loadPaymentInstructions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/instructions?orderId=${orderId}&paymentId=${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentInstructions(data.data);
      } else {
        toast.error('Gagal memuat instruksi pembayaran');
        router.push('/payment');
      }
    } catch (error) {
      console.error('Error loading payment instructions:', error);
      toast.error('Gagal memuat instruksi pembayaran');
      router.push('/payment');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch(`/api/payment/status?orderId=${orderId}&paymentId=${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data.status === 'PAID' || data.data.status === 'SUCCESS') {
          toast.success('Pembayaran berhasil!');
          router.push(`/payment/success?orderId=${orderId}`);
        } else {
          toast.info('Pembayaran belum diterima');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Gagal memeriksa status pembayaran');
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card':
      case 'cc':
        return <CreditCard className="h-6 w-6" />;
      case 'bank_transfer':
      case 'bca_va':
      case 'bni_va':
      case 'bri_va':
      case 'mandiri_va':
        return <Building className="h-6 w-6" />;
      case 'gopay':
      case 'shopeepay':
      case 'dana':
      case 'ovo':
        return <Smartphone className="h-6 w-6" />;
      case 'qris':
        return <QrCode className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      'credit_card': 'Kartu Kredit',
      'cc': 'Kartu Kredit',
      'bca_va': 'BCA Virtual Account',
      'bni_va': 'BNI Virtual Account',
      'bri_va': 'BRI Virtual Account',
      'mandiri_va': 'Mandiri Virtual Account',
      'gopay': 'GoPay',
      'shopeepay': 'ShopeePay',
      'dana': 'DANA',
      'ovo': 'OVO',
      'qris': 'QRIS'
    };
    return methods[method.toLowerCase()] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat instruksi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!paymentInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Instruksi Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Instruksi pembayaran tidak dapat ditemukan atau telah kedaluwarsa.</p>
            <Button onClick={() => router.push('/payment')} className="w-full">
              Kembali ke Pembayaran
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Instruksi Pembayaran</h1>
            </div>
            <Button
              onClick={checkPaymentStatus}
              disabled={checking}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Cek Status
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Timer */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900">Waktu Pembayaran</h3>
                    <p className="text-sm text-orange-700">Selesaikan pembayaran sebelum waktu habis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900 font-mono">{timeLeft}</div>
                  <p className="text-xs text-orange-600">Sisa waktu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPaymentMethodIcon(paymentInstructions.paymentMethod)}
                {getPaymentMethodName(paymentInstructions.paymentMethod)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Order ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{paymentInstructions.orderId}</span>
                    <Button
                      onClick={() => copyToClipboard(paymentInstructions.orderId, 'Order ID')}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600">Jumlah Pembayaran</label>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {formatCurrency(paymentInstructions.amount)}
                  </div>
                </div>
              </div>

              {paymentInstructions.vaNumber && (
                <div>
                  <label className="text-sm text-gray-600">Nomor Virtual Account</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-lg bg-blue-50 px-3 py-2 rounded border-2 border-blue-200">
                      {paymentInstructions.vaNumber}
                    </span>
                    <Button
                      onClick={() => copyToClipboard(paymentInstructions.vaNumber!, 'Nomor Virtual Account')}
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {paymentInstructions.qrCode && (
                <div className="text-center">
                  <label className="text-sm text-gray-600">QR Code</label>
                  <div className="mt-2 inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={paymentInstructions.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan dengan aplikasi pembayaran Anda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Cara Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentInstructions.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Check */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Status Pembayaran</h3>
                  <p className="text-sm text-blue-700">
                    Klik "Cek Status" setelah melakukan pembayaran untuk memverifikasi transaksi
                  </p>
                </div>
                <Button
                  onClick={checkPaymentStatus}
                  disabled={checking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {checking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Mengecek...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cek Status
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">Penting untuk Diperhatikan:</h3>
              <div className="space-y-2 text-yellow-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Pastikan jumlah pembayaran sesuai dengan yang tertera</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Simpan bukti pembayaran untuk keperluan administrasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Pembayaran akan diverifikasi secara otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Hubungi admin jika pembayaran tidak terverifikasi dalam 1x24 jam</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Print Instruksi
            </Button>
            
            <Button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Instruksi Pembayaran',
                    text: `Pembayaran ${formatCurrency(paymentInstructions.amount)} - Order ID: ${paymentInstructions.orderId}`,
                    url: window.location.href
                  });
                } else {
                  copyToClipboard(window.location.href, 'Link instruksi');
                }
              }}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Bagikan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat instruksi pembayaran...</p>
        </div>
      </div>
    }>
      <PaymentInstructionsPageContent />
    </Suspense>
  );
}
