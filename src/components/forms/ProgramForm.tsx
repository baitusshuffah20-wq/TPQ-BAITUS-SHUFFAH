'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus,
  Trash2,
  Save,
  X,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProgramFormData {
  id?: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  ageGroup: string;
  schedule: string;
  price: string;
  image?: string;
  isActive: boolean;
  order: number;
}

interface ProgramFormProps {
  program?: ProgramFormData;
  onSubmit: (data: ProgramFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProgramForm({ program, onSubmit, onCancel, isLoading = false }: ProgramFormProps) {
  const [formData, setFormData] = useState<ProgramFormData>({
    title: program?.title || '',
    description: program?.description || '',
    features: program?.features || [''],
    duration: program?.duration || '',
    ageGroup: program?.ageGroup || '',
    schedule: program?.schedule || '',
    price: program?.price || '',
    image: program?.image || '',
    isActive: program?.isActive ?? true,
    order: program?.order || 0,
    ...program
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!program?.id;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title) {
      newErrors.title = 'Judul program wajib diisi';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Judul program minimal 3 karakter';
    }

    // Description validation
    if (!formData.description) {
      newErrors.description = 'Deskripsi program wajib diisi';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Deskripsi program minimal 10 karakter';
    }

    // Features validation
    const validFeatures = formData.features.filter(f => f.trim() !== '');
    if (validFeatures.length === 0) {
      newErrors.features = 'Minimal harus ada 1 fitur program';
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = 'Durasi program wajib diisi';
    }

    // Age group validation
    if (!formData.ageGroup) {
      newErrors.ageGroup = 'Kelompok usia wajib diisi';
    }

    // Schedule validation
    if (!formData.schedule) {
      newErrors.schedule = 'Jadwal program wajib diisi';
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = 'Harga program wajib diisi';
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
      // Filter out empty features
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? value : feature
      )
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" />
          {isEdit ? 'Edit Program' : 'Tambah Program Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Program *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Tahfidz Al-Quran"
                  className={errors.title ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Program *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Deskripsi lengkap tentang program ini..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Program *
                </label>
                <Input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Contoh: 2-4 Tahun"
                  className={errors.duration ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelompok Usia *
                </label>
                <Input
                  type="text"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  placeholder="Contoh: 7-17 Tahun"
                  className={errors.ageGroup ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.ageGroup && (
                  <p className="text-red-500 text-xs mt-1">{errors.ageGroup}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jadwal Program *
                </label>
                <Input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  placeholder="Contoh: Senin-Jumat 14:00-17:00"
                  className={errors.schedule ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.schedule && (
                  <p className="text-red-500 text-xs mt-1">{errors.schedule}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Program *
                </label>
                <Input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Contoh: Rp 200.000/bulan"
                  className={errors.price ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Tampil
                </label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Semakin kecil angka, semakin atas posisinya
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar
                </label>
                <Input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Fitur Program</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Tambah Fitur
              </Button>
            </div>

            {errors.features && (
              <p className="text-red-500 text-sm mb-4">{errors.features}</p>
            )}

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`Fitur ${index + 1}`}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-700"
                    disabled={isLoading || formData.features.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.features.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada fitur</p>
                  <p className="text-sm text-gray-500">Klik "Tambah Fitur" untuk menambah fitur baru</p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Program</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                disabled={isLoading}
              />
              <label className="text-sm font-medium text-gray-700">
                Program Aktif
              </label>
              <Badge variant={formData.isActive ? 'success' : 'secondary'}>
                {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Program yang tidak aktif tidak akan ditampilkan di halaman publik
            </p>
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
