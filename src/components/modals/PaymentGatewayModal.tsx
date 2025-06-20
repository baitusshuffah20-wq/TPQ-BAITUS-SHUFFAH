'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  paymentData: {
    orderId: string;
    amount: number;
    description: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  };
}

interface PaymentMethod {
  method: string;
  name: string;
  icon: React.ReactNode;
  admin_fee: number;
  total_amount: number;
  formatted_admin_fee: string;
  formatted_total_amount: string;
  description: string;
  estimatedTime: string;
}

const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentData
}) => {
  const [step, setStep] = useState<'methods' | 'processing' | 'instructions'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);

  useEffect(() => {
    if (isOpen && paymentData?.amount && paymentData.amount > 0) {
      loadPaymentMethods();
    }
  }, [isOpen, paymentData?.amount]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/create?amount=${paymentData?.amount || 0}`);
      const result = await response.json();

      if (result.success) {
        const methods = result.data.payment_methods.map((method: any) => ({
          ...method,
          icon: getPaymentMethodIcon(method.method),
          description: getPaymentMethodDescription(method.method),
          estimatedTime: getPaymentMethodTime(method.method)
        }));
        setPaymentMethods(methods);
      } else {
        toast.error('Gagal memuat metode pembayaran');
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Terjadi kesalahan saat memuat metode pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleProceedPayment = async () => {
    if (!selectedMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      const paymentRequest = {
        orderId: paymentData?.orderId || '',
        amount: paymentData?.amount || 0,
        items: paymentData?.items || [],
        customer: {
          firstName: paymentData?.customerName?.split(' ')[0] || '',
          lastName: paymentData?.customerName?.split(' ').slice(1).join(' ') || '',
          email: paymentData?.customerEmail || '',
          phone: paymentData?.customerPhone || ''
        },
        paymentMethod: selectedMethod,
        metadata: {
          description: paymentData?.description || '',
          source: 'admin_panel'
        }
      };

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      const result = await response.json();

      if (result.success) {
        setPaymentToken(result.data.token);
        
        // Load Midtrans Snap
        const script = document.createElement('script');
        script.src = result.data.snap_url;
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        
        script.onload = () => {
          // @ts-ignore
          window.snap.pay(result.data.token, {
            onSuccess: (result: any) => {
              console.log('Payment success:', result);
              toast.success('Pembayaran berhasil!');
              onSuccess({
                ...result,
                orderId: paymentData?.orderId || '',
                amount: paymentData?.amount || 0,
                paymentMethod: selectedMethod
              });
              onClose();
            },
            onPending: (result: any) => {
              console.log('Payment pending:', result);
              setPaymentInstructions(result);
              setStep('instructions');
              toast.info('Pembayaran sedang diproses');
            },
            onError: (result: any) => {
              console.log('Payment error:', result);
              toast.error('Pembayaran gagal');
              setStep('methods');
            },
            onClose: () => {
              console.log('Payment popup closed');
              setStep('methods');
            }
          });
        };

        document.head.appendChild(script);
      } else {
        toast.error(result.message || 'Gagal membuat transaksi pembayaran');
        setStep('methods');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
      setStep('methods');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="h-6 w-6" />;
      case 'bank_transfer': return <Building2 className="h-6 w-6" />;
      case 'gopay':
      case 'shopeepay':
      case 'dana':
      case 'linkaja':
      case 'ovo': return <Smartphone className="h-6 w-6" />;
      case 'qris': return <QrCode className="h-6 w-6" />;
      case 'cstore': return <Wallet className="h-6 w-6" />;
      default: return <DollarSign className="h-6 w-6" />;
    }
  };

  const getPaymentMethodDescription = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Bayar dengan kartu kredit/debit';
      case 'bank_transfer': return 'Transfer melalui ATM, internet banking, atau mobile banking';
      case 'gopay': return 'Bayar dengan saldo GoPay';
      case 'shopeepay': return 'Bayar dengan saldo ShopeePay';
      case 'dana': return 'Bayar dengan saldo DANA';
      case 'linkaja': return 'Bayar dengan saldo LinkAja';
      case 'ovo': return 'Bayar dengan saldo OVO';
      case 'qris': return 'Scan QR code dengan aplikasi e-wallet';
      case 'cstore': return 'Bayar di Indomaret terdekat';
      default: return 'Metode pembayaran digital';
    }
  };

  const getPaymentMethodTime = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Instan';
      case 'bank_transfer': return '1-24 jam';
      case 'gopay':
      case 'shopeepay':
      case 'dana':
      case 'linkaja':
      case 'ovo': return 'Instan';
      case 'qris': return 'Instan';
      case 'cstore': return '1-3 hari';
      default: return 'Bervariasi';
    }
  };

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Metode Pembayaran</h3>
        <p className="text-gray-600">
          Total: <span className="font-bold text-teal-600">
            Rp {(paymentData?.amount || 0).toLocaleString('id-ID')}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {paymentMethods.map((method) => (
            <div
              key={method.method}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.method
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaymentMethodSelect(method.method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.method ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {method.estimatedTime}
                      </span>
                      {method.admin_fee > 0 && (
                        <span className="text-xs text-orange-600">
                          +{method.formatted_admin_fee} biaya admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{method.formatted_total_amount}</p>
                  {selectedMethod === method.method && (
                    <CheckCircle className="h-5 w-5 text-teal-600 ml-auto mt-1" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button 
          onClick={handleProceedPayment}
          disabled={!selectedMethod || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            'Lanjutkan Pembayaran'
          )}
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Memproses Pembayaran</h3>
      <p className="text-gray-600 mb-4">Mohon tunggu, kami sedang menyiapkan pembayaran Anda...</p>
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Transaksi aman dengan enkripsi SSL</span>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setStep('methods')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900">Instruksi Pembayaran</h3>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Pembayaran Sedang Diproses</span>
        </div>
        <p className="text-yellow-700 text-sm">
          Silakan selesaikan pembayaran sesuai instruksi yang diberikan.
        </p>
      </div>

      {paymentInstructions && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Detail Pembayaran:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono">{paymentData?.orderId || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jumlah:</span>
              <span className="font-bold">Rp {(paymentData?.amount || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Metode:</span>
              <span>{paymentMethods.find(m => m.method === selectedMethod)?.name}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
        <Button onClick={() => window.location.reload()}>
          Refresh Status
        </Button>
      </div>
    </div>
  );

  if (!isOpen || !paymentData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {step === 'methods' && 'Pembayaran Online'}
                {step === 'processing' && 'Memproses Pembayaran'}
                {step === 'instructions' && 'Instruksi Pembayaran'}
              </CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'methods' && renderPaymentMethods()}
            {step === 'processing' && renderProcessing()}
            {step === 'instructions' && renderInstructions()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
