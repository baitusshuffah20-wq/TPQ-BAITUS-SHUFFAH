'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Users,
  Save,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SantriFormData {
  id?: string;
  nis: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  phone?: string;
  email?: string;
  photo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED_OUT';
  waliId: string;
  halaqahId?: string;
  enrollmentDate: string;
  graduationDate?: string;
}

interface SantriFormProps {
  santri?: SantriFormData;
  onSubmit: (data: SantriFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Wali {
  id: string;
  name: string;
  email: string;
}

interface Halaqah {
  id: string;
  name: string;
  level: string;
}

export default function SantriForm({ santri, onSubmit, onCancel, isLoading = false }: SantriFormProps) {
  const [formData, setFormData] = useState<SantriFormData>({
    nis: santri?.nis || '',
    name: santri?.name || '',
    birthDate: santri?.birthDate || '',
    birthPlace: santri?.birthPlace || '',
    gender: santri?.gender || 'MALE',
    address: santri?.address || '',
    phone: santri?.phone || '',
    email: santri?.email || '',
    photo: santri?.photo || '',
    status: santri?.status || 'ACTIVE',
    waliId: santri?.waliId || '',
    halaqahId: santri?.halaqahId || '',
    enrollmentDate: santri?.enrollmentDate || new Date().toISOString().split('T')[0],
    graduationDate: santri?.graduationDate || '',
    ...santri
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [waliList, setWaliList] = useState<Wali[]>([]);
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isEdit = !!santri?.id;

  useEffect(() => {
    loadSelectData();
  }, []);

  const loadSelectData = async () => {
    try {
      setLoadingData(true);
      
      // Load Wali list
      const waliResponse = await fetch('/api/users?role=WALI');
      if (waliResponse.ok) {
        const waliData = await waliResponse.json();
        setWaliList(waliData.users || []);
      }

      // Load Halaqah list
      const halaqahResponse = await fetch('/api/halaqah');
      if (halaqahResponse.ok) {
        const halaqahData = await halaqahResponse.json();
        setHalaqahList(halaqahData.halaqah || []);
      }
    } catch (error) {
      console.error('Error loading select data:', error);
      toast.error('Gagal memuat data dropdown');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // NIS validation
    if (!formData.nis) {
      newErrors.nis = 'NIS wajib diisi';
    } else if (formData.nis.length < 3) {
      newErrors.nis = 'NIS minimal 3 karakter';
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Tanggal lahir wajib diisi';
    }

    // Birth place validation
    if (!formData.birthPlace) {
      newErrors.birthPlace = 'Tempat lahir wajib diisi';
    }

    // Address validation
    if (!formData.address) {
      newErrors.address = 'Alamat wajib diisi';
    }

    // Wali validation
    if (!formData.waliId) {
      newErrors.waliId = 'Wali wajib dipilih';
    }

    // Email validation (optional)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation (optional)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    // Enrollment date validation
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'Tanggal masuk wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'secondary';
      case 'GRADUATED': return 'warning';
      case 'DROPPED_OUT': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Tidak Aktif';
      case 'GRADUATED': return 'Lulus';
      case 'DROPPED_OUT': return 'Keluar';
      default: return status;
    }
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-teal-600" />
          {isEdit ? 'Edit Santri' : 'Tambah Santri Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIS (Nomor Induk Santri) *
                </label>
                <Input
                  type="text"
                  name="nis"
                  value={formData.nis}
                  onChange={handleChange}
                  placeholder="Contoh: 2024001"
                  className={errors.nis ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.nis && (
                  <p className="text-red-500 text-xs mt-1">{errors.nis}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap santri"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir *
                </label>
                <Input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={errors.birthDate ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat Lahir *
                </label>
                <Input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="Kota tempat lahir"
                  className={errors.birthPlace ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.birthPlace && (
                  <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="flex items-center gap-3">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Tidak Aktif</option>
                    <option value="GRADUATED">Lulus</option>
                    <option value="DROPPED_OUT">Keluar</option>
                  </select>
                  <Badge variant={getStatusBadgeColor(formData.status) as any}>
                    {getStatusLabel(formData.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Alamat lengkap santri"
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={errors.phone ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Akademik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wali Santri *
                </label>
                <select
                  name="waliId"
                  value={formData.waliId}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.waliId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Pilih Wali Santri</option>
                  {waliList.map((wali) => (
                    <option key={wali.id} value={wali.id}>
                      {wali.name} ({wali.email})
                    </option>
                  ))}
                </select>
                {errors.waliId && (
                  <p className="text-red-500 text-xs mt-1">{errors.waliId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Halaqah
                </label>
                <select
                  name="halaqahId"
                  value={formData.halaqahId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Pilih Halaqah (Opsional)</option>
                  {halaqahList.map((halaqah) => (
                    <option key={halaqah.id} value={halaqah.id}>
                      {halaqah.name} - {halaqah.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Masuk *
                </label>
                <Input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate}
                  onChange={handleChange}
                  className={errors.enrollmentDate ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.enrollmentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.enrollmentDate}</p>
                )}
              </div>

              {(formData.status === 'GRADUATED' || formData.status === 'DROPPED_OUT') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Keluar/Lulus
                  </label>
                  <Input
                    type="date"
                    name="graduationDate"
                    value={formData.graduationDate}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
