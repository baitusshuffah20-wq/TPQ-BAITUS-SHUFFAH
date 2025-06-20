'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  Save,
  BookOpen,
  User,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';

interface AddHafalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hafalanData: any) => void;
  editData?: any;
}

const AddHafalanModal: React.FC<AddHafalanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState({
    santriId: editData?.santriId || '',
    santriName: editData?.santriName || '',
    surah: editData?.surah || '',
    ayahStart: editData?.ayahStart || '',
    ayahEnd: editData?.ayahEnd || '',
    type: editData?.type || 'SETORAN', // SETORAN, MURAJAAH, TASMI
    date: editData?.date || new Date().toISOString().split('T')[0],
    musyrifId: editData?.musyrifId || '',
    musyrifName: editData?.musyrifName || '',
    
    // Evaluation scores
    tajwid: editData?.tajwid || '',
    kelancaran: editData?.kelancaran || '',
    fashahah: editData?.fashahah || '',
    
    // Overall assessment
    grade: editData?.grade || '',
    status: editData?.status || 'PENDING', // PENDING, APPROVED, NEEDS_IMPROVEMENT
    notes: editData?.notes || '',
    
    // Additional info
    duration: editData?.duration || '', // in minutes
    corrections: editData?.corrections || '',
    recommendations: editData?.recommendations || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for dropdowns
  const santriList = [
    { id: '1', name: 'Ahmad Fauzi', nis: '24001' },
    { id: '2', name: 'Siti Aisyah', nis: '24002' },
    { id: '3', name: 'Muhammad Rizki', nis: '24003' }
  ];

  const surahList = [
    'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah',
    'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Taubah', 'Yunus'
  ];

  const musyrifList = [
    { id: '1', name: 'Ustadz Abdullah' },
    { id: '2', name: 'Ustadzah Fatimah' },
    { id: '3', name: 'Ustadz Rahman' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-fill santri name when santri is selected
    if (field === 'santriId') {
      const selectedSantri = santriList.find(s => s.id === value);
      if (selectedSantri) {
        setFormData(prev => ({
          ...prev,
          santriName: selectedSantri.name
        }));
      }
    }

    // Auto-fill musyrif name when musyrif is selected
    if (field === 'musyrifId') {
      const selectedMusyrif = musyrifList.find(m => m.id === value);
      if (selectedMusyrif) {
        setFormData(prev => ({
          ...prev,
          musyrifName: selectedMusyrif.name
        }));
      }
    }

    // Calculate overall grade when individual scores change
    if (['tajwid', 'kelancaran', 'fashahah'].includes(field)) {
      const newFormData = { ...formData, [field]: value };
      const scores = [
        parseInt(newFormData.tajwid) || 0,
        parseInt(newFormData.kelancaran) || 0,
        parseInt(newFormData.fashahah) || 0
      ];
      
      if (scores.every(score => score > 0)) {
        const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        setFormData(prev => ({
          ...prev,
          [field]: value,
          grade: average.toString()
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.santriId) {
      newErrors.santriId = 'Santri wajib dipilih';
    }

    if (!formData.surah) {
      newErrors.surah = 'Surah wajib dipilih';
    }

    if (!formData.ayahStart) {
      newErrors.ayahStart = 'Ayat awal wajib diisi';
    }

    if (!formData.ayahEnd) {
      newErrors.ayahEnd = 'Ayat akhir wajib diisi';
    }

    if (parseInt(formData.ayahStart) > parseInt(formData.ayahEnd)) {
      newErrors.ayahEnd = 'Ayat akhir harus lebih besar dari ayat awal';
    }

    if (!formData.musyrifId) {
      newErrors.musyrifId = 'Musyrif wajib dipilih';
    }

    if (formData.tajwid && (parseInt(formData.tajwid) < 0 || parseInt(formData.tajwid) > 100)) {
      newErrors.tajwid = 'Nilai tajwid harus antara 0-100';
    }

    if (formData.kelancaran && (parseInt(formData.kelancaran) < 0 || parseInt(formData.kelancaran) > 100)) {
      newErrors.kelancaran = 'Nilai kelancaran harus antara 0-100';
    }

    if (formData.fashahah && (parseInt(formData.fashahah) < 0 || parseInt(formData.fashahah) > 100)) {
      newErrors.fashahah = 'Nilai fashahah harus antara 0-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const hafalanData = {
      ...formData,
      id: editData?.id || `hafalan_${Date.now()}`,
      ayahRange: `${formData.ayahStart}-${formData.ayahEnd}`,
      createdAt: editData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(hafalanData);
    onClose();
    
    // Reset form
    setFormData({
      santriId: '',
      santriName: '',
      surah: '',
      ayahStart: '',
      ayahEnd: '',
      type: 'SETORAN',
      date: new Date().toISOString().split('T')[0],
      musyrifId: '',
      musyrifName: '',
      tajwid: '',
      kelancaran: '',
      fashahah: '',
      grade: '',
      status: 'PENDING',
      notes: '',
      duration: '',
      corrections: '',
      recommendations: ''
    });
    setErrors({});
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SETORAN': return 'bg-blue-100 text-blue-800';
      case 'MURAJAAH': return 'bg-green-100 text-green-800';
      case 'TASMI': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editData ? 'Edit Evaluasi Hafalan' : 'Tambah Hafalan Baru'}
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
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Informasi Hafalan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Jenis Hafalan
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="SETORAN">Setoran (Hafalan Baru)</option>
                      <option value="MURAJAAH">Murajaah (Mengulang)</option>
                      <option value="TASMI">Tasmi (Mendengarkan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surah *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.surah ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.surah}
                      onChange={(e) => handleInputChange('surah', e.target.value)}
                    >
                      <option value="">Pilih Surah</option>
                      {surahList.map(surah => (
                        <option key={surah} value={surah}>
                          {surah}
                        </option>
                      ))}
                    </select>
                    {errors.surah && <p className="text-red-500 text-sm mt-1">{errors.surah}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ayat Awal *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.ayahStart ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.ayahStart}
                      onChange={(e) => handleInputChange('ayahStart', e.target.value)}
                      placeholder="Nomor ayat awal"
                    />
                    {errors.ayahStart && <p className="text-red-500 text-sm mt-1">{errors.ayahStart}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ayat Akhir *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.ayahEnd ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.ayahEnd}
                      onChange={(e) => handleInputChange('ayahEnd', e.target.value)}
                      placeholder="Nomor ayat akhir"
                    />
                    {errors.ayahEnd && <p className="text-red-500 text-sm mt-1">{errors.ayahEnd}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Musyrif *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.musyrifId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.musyrifId}
                      onChange={(e) => handleInputChange('musyrifId', e.target.value)}
                    >
                      <option value="">Pilih Musyrif</option>
                      {musyrifList.map(musyrif => (
                        <option key={musyrif.id} value={musyrif.id}>
                          {musyrif.name}
                        </option>
                      ))}
                    </select>
                    {errors.musyrifId && <p className="text-red-500 text-sm mt-1">{errors.musyrifId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi (menit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="Durasi dalam menit"
                    />
                  </div>
                </div>
              </div>

              {/* Evaluation Scores */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Penilaian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tajwid (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.tajwid ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.tajwid}
                      onChange={(e) => handleInputChange('tajwid', e.target.value)}
                      placeholder="Nilai tajwid"
                    />
                    {errors.tajwid && <p className="text-red-500 text-sm mt-1">{errors.tajwid}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelancaran (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.kelancaran ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.kelancaran}
                      onChange={(e) => handleInputChange('kelancaran', e.target.value)}
                      placeholder="Nilai kelancaran"
                    />
                    {errors.kelancaran && <p className="text-red-500 text-sm mt-1">{errors.kelancaran}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fashahah (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.fashahah ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.fashahah}
                      onChange={(e) => handleInputChange('fashahah', e.target.value)}
                      placeholder="Nilai fashahah"
                    />
                    {errors.fashahah && <p className="text-red-500 text-sm mt-1">{errors.fashahah}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Rata-rata
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <span className={`text-lg font-bold ${formData.grade ? getGradeColor(parseInt(formData.grade)) : 'text-gray-400'}`}>
                        {formData.grade || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Status & Catatan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Evaluasi
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="PENDING">Menunggu Review</option>
                      <option value="APPROVED">Disetujui</option>
                      <option value="NEEDS_IMPROVEMENT">Perlu Perbaikan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Evaluasi
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Catatan umum tentang hafalan santri..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Koreksi & Perbaikan
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.corrections}
                      onChange={(e) => handleInputChange('corrections', e.target.value)}
                      placeholder="Detail koreksi yang perlu diperbaiki..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rekomendasi
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.recommendations}
                      onChange={(e) => handleInputChange('recommendations', e.target.value)}
                      placeholder="Rekomendasi untuk pembelajaran selanjutnya..."
                    />
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

export default AddHafalanModal;
