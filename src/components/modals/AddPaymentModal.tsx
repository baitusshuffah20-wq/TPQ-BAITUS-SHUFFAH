'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { X, Save, DollarSign } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: any) => void;
  editData?: any;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState({
    santriId: editData?.santriId || '',
    santriName: editData?.santriName || '',
    paymentType: editData?.paymentType || 'SPP',
    amount: editData?.amount || '',
    paymentDate: editData?.paymentDate || new Date().toISOString().split('T')[0],
    status: editData?.status || 'PENDING'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const santriList = [
    { id: '1', name: 'Ahmad Fauzi', nis: '24001' },
    { id: '2', name: 'Siti Aisyah', nis: '24002' },
    { id: '3', name: 'Muhammad Rizki', nis: '24003' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'santriId') {
      const selectedSantri = santriList.find(s => s.id === value);
      if (selectedSantri) {
        setFormData(prev => ({
          ...prev,
          santriName: selectedSantri.name
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = 'Santri wajib dipilih';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah pembayaran wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const paymentData = {
      ...formData,
      id: editData?.id || `payment_${Date.now()}`,
      createdAt: editData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(paymentData);
    onClose();

    setFormData({
      santriId: '',
      santriName: '',
      paymentType: 'SPP',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editData ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru'}
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Informasi Pembayaran
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Santri *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.santriId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.santriId}
                      onChange={(e) => handleInputChange('santriId', e.target.value)}
                    >
                      <option value="">Pilih Santri</option>
                      {santriList.map(santri => (
                        <option key={santri.id} value={santri.id}>
                          {santri.name} - {santri.nis}
                        </option>
                      ))}
                    </select>
                    {errors.santriId && <p className="text-red-500 text-sm mt-1">{errors.santriId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Pembayaran
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                    >
                      <option value="SPP">SPP Bulanan</option>
                      <option value="DAFTAR_ULANG">Daftar Ulang</option>
                      <option value="SERAGAM">Seragam</option>
                      <option value="KEGIATAN">Kegiatan Khusus</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Pembayaran *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="Masukkan jumlah pembayaran"
                    />
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Pembayaran
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="PENDING">Menunggu Pembayaran</option>
                      <option value="PAID">Lunas</option>
                      <option value="OVERDUE">Terlambat</option>
                    </select>
                  </div>
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editData ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPaymentModal;
