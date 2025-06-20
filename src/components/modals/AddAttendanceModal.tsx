'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  Save,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendanceData: any) => void;
  editData?: any;
}

const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState({
    date: editData?.date || new Date().toISOString().split('T')[0],
    session: editData?.session || 'MORNING', // MORNING, AFTERNOON, EVENING
    halaqah: editData?.halaqah || '',
    musyrifId: editData?.musyrifId || '',
    musyrifName: editData?.musyrifName || '',
    location: editData?.location || '',
    topic: editData?.topic || '',
    notes: editData?.notes || '',
    attendanceList: editData?.attendanceList || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data
  const halaqahList = [
    { id: '1', name: 'Halaqah Al-Fatihah', level: 'Pemula' },
    { id: '2', name: 'Halaqah Al-Baqarah', level: 'Menengah' },
    { id: '3', name: 'Halaqah Ali Imran', level: 'Lanjutan' },
    { id: '4', name: 'Halaqah An-Nisa', level: 'Mahir' }
  ];

  const musyrifList = [
    { id: '1', name: 'Ustadz Abdullah' },
    { id: '2', name: 'Ustadzah Fatimah' },
    { id: '3', name: 'Ustadz Rahman' },
    { id: '4', name: 'Ustadzah Aisyah' }
  ];

  const santriList = [
    { id: '1', name: 'Ahmad Fauzi', nis: '24001', halaqah: 'Halaqah Al-Fatihah' },
    { id: '2', name: 'Siti Aisyah', nis: '24002', halaqah: 'Halaqah Al-Fatihah' },
    { id: '3', name: 'Muhammad Rizki', nis: '24003', halaqah: 'Halaqah Al-Baqarah' },
    { id: '4', name: 'Fatimah Zahra', nis: '24004', halaqah: 'Halaqah Ali Imran' },
    { id: '5', name: 'Abdullah Rahman', nis: '24005', halaqah: 'Halaqah An-Nisa' }
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

    // Load santri when halaqah is selected
    if (field === 'halaqah') {
      const filteredSantri = santriList.filter(s => s.halaqah === value);
      const attendanceList = filteredSantri.map(santri => ({
        santriId: santri.id,
        santriName: santri.name,
        santriNis: santri.nis,
        status: 'PRESENT', // PRESENT, ABSENT, LATE, SICK, PERMISSION
        arrivalTime: '',
        notes: ''
      }));
      
      setFormData(prev => ({
        ...prev,
        attendanceList
      }));
    }
  };

  const handleAttendanceChange = (santriId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attendanceList: prev.attendanceList.map(attendance => 
        attendance.santriId === santriId 
          ? { ...attendance, [field]: value }
          : attendance
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }

    if (!formData.halaqah) {
      newErrors.halaqah = 'Halaqah wajib dipilih';
    }

    if (!formData.musyrifId) {
      newErrors.musyrifId = 'Musyrif wajib dipilih';
    }

    if (formData.attendanceList.length === 0) {
      newErrors.attendanceList = 'Minimal harus ada satu santri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const attendanceData = {
      ...formData,
      id: editData?.id || `attendance_${Date.now()}`,
      createdAt: editData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSantri: formData.attendanceList.length,
      presentCount: formData.attendanceList.filter(a => a.status === 'PRESENT').length,
      absentCount: formData.attendanceList.filter(a => a.status === 'ABSENT').length,
      lateCount: formData.attendanceList.filter(a => a.status === 'LATE').length,
      sickCount: formData.attendanceList.filter(a => a.status === 'SICK').length,
      permissionCount: formData.attendanceList.filter(a => a.status === 'PERMISSION').length
    };

    onSave(attendanceData);
    onClose();
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      session: 'MORNING',
      halaqah: '',
      musyrifId: '',
      musyrifName: '',
      location: '',
      topic: '',
      notes: '',
      attendanceList: []
    });
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'SICK': return 'bg-blue-100 text-blue-800';
      case 'PERMISSION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ABSENT': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'LATE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SICK': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'PERMISSION': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSessionText = (session: string) => {
    switch (session) {
      case 'MORNING': return 'Pagi';
      case 'AFTERNOON': return 'Siang';
      case 'EVENING': return 'Sore';
      default: return session;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editData ? 'Edit Kehadiran' : 'Catat Kehadiran'}
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
                  <Calendar className="h-5 w-5 mr-2" />
                  Informasi Kehadiran
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sesi
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.session}
                      onChange={(e) => handleInputChange('session', e.target.value)}
                    >
                      <option value="MORNING">Pagi (07:00 - 09:00)</option>
                      <option value="AFTERNOON">Siang (13:00 - 15:00)</option>
                      <option value="EVENING">Sore (15:30 - 17:30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Halaqah *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.halaqah ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.halaqah}
                      onChange={(e) => handleInputChange('halaqah', e.target.value)}
                    >
                      <option value="">Pilih Halaqah</option>
                      {halaqahList.map(halaqah => (
                        <option key={halaqah.id} value={halaqah.name}>
                          {halaqah.name} - {halaqah.level}
                        </option>
                      ))}
                    </select>
                    {errors.halaqah && <p className="text-red-500 text-sm mt-1">{errors.halaqah}</p>}
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
                      Lokasi
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ruang kelas, masjid, dll"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topik Pembelajaran
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={formData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      placeholder="Topik yang dipelajari hari ini"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Umum
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Catatan umum tentang kegiatan pembelajaran..."
                  />
                </div>
              </div>

              {/* Attendance List */}
              {formData.attendanceList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Daftar Kehadiran Santri ({formData.attendanceList.length} santri)
                  </h3>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formData.attendanceList.filter(a => a.status === 'PRESENT').length}
                      </div>
                      <div className="text-sm text-gray-600">Hadir</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {formData.attendanceList.filter(a => a.status === 'ABSENT').length}
                      </div>
                      <div className="text-sm text-gray-600">Tidak Hadir</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {formData.attendanceList.filter(a => a.status === 'LATE').length}
                      </div>
                      <div className="text-sm text-gray-600">Terlambat</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formData.attendanceList.filter(a => a.status === 'SICK').length}
                      </div>
                      <div className="text-sm text-gray-600">Sakit</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formData.attendanceList.filter(a => a.status === 'PERMISSION').length}
                      </div>
                      <div className="text-sm text-gray-600">Izin</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Santri</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Waktu Datang</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.attendanceList.map((attendance, index) => (
                          <tr key={attendance.santriId} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-teal-600">
                                    {attendance.santriName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{attendance.santriName}</p>
                                  <p className="text-sm text-gray-500">NIS: {attendance.santriNis}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={attendance.status}
                                onChange={(e) => handleAttendanceChange(attendance.santriId, 'status', e.target.value)}
                              >
                                <option value="PRESENT">Hadir</option>
                                <option value="ABSENT">Tidak Hadir</option>
                                <option value="LATE">Terlambat</option>
                                <option value="SICK">Sakit</option>
                                <option value="PERMISSION">Izin</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="time"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={attendance.arrivalTime}
                                onChange={(e) => handleAttendanceChange(attendance.santriId, 'arrivalTime', e.target.value)}
                                disabled={attendance.status === 'ABSENT'}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={attendance.notes}
                                onChange={(e) => handleAttendanceChange(attendance.santriId, 'notes', e.target.value)}
                                placeholder="Catatan khusus..."
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.attendanceList && <p className="text-red-500 text-sm mt-2">{errors.attendanceList}</p>}
                </div>
              )}

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

export default AddAttendanceModal;
