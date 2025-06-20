'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  DollarSign,
  User,
  Calendar,
  Receipt,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  payment: any;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  payment
}) => {
  if (!isOpen || !payment) return null;

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
      case 'PENDING': return 'Menunggu Pembayaran';
      case 'OVERDUE': return 'Terlambat';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'OVERDUE': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Pembayaran</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Header with Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Rp {(parseFloat(payment.amount) || 0).toLocaleString('id-ID')}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {payment.santriName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center">
                      <Receipt className="h-4 w-4 mr-2" />
                      {getPaymentTypeText(payment.paymentType)}
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span className="ml-2">{getStatusText(payment.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Informasi Pembayaran
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Santri
                      </label>
                      <p className="text-gray-900">{payment.santriName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Jenis Pembayaran
                      </label>
                      <p className="text-gray-900">{getPaymentTypeText(payment.paymentType)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Jumlah
                      </label>
                      <p className="text-2xl font-bold text-gray-900">
                        Rp {(parseFloat(payment.amount) || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal Pembayaran
                      </label>
                      <p className="text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Detail Transaksi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        ID Pembayaran
                      </label>
                      <p className="text-gray-900 font-mono text-sm">{payment.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal Dibuat
                      </label>
                      <p className="text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {payment.updatedAt !== payment.createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Terakhir Diupdate
                        </label>
                        <p className="text-gray-900">
                          {new Date(payment.updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ringkasan Pembayaran
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        Rp {(parseFloat(payment.amount) || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-gray-600">Total Tagihan</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        payment.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {payment.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                      </div>
                      <div className="text-sm text-gray-600">Status Pembayaran</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getPaymentTypeText(payment.paymentType)}
                      </div>
                      <div className="text-sm text-gray-600">Jenis Pembayaran</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={onDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Pembayaran
                </Button>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Pembayaran
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
