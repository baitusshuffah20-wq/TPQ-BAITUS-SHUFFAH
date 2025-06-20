'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

interface HalaqahFormData {
  id?: string;
  name: string;
  description: string;
  level: string;
  capacity: number;
  musyrifId: string;
  schedules: Schedule[];
}

interface HalaqahFormProps {
  halaqah?: HalaqahFormData;
  onSubmit: (data: HalaqahFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Musyrif {
  id: string;
  name: string;
  email: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 0, label: 'Minggu' }
];

const LEVELS = [
  'Pemula',
  'Dasar',
  'Menengah',
  'Lanjutan',
  'Tahfidz 1 Juz',
  'Tahfidz 5 Juz',
  'Tahfidz 10 Juz',
  'Tahfidz 15 Juz',
  'Tahfidz 20 Juz',
  'Tahfidz 30 Juz'
];

export default function HalaqahForm({ halaqah, onSubmit, onCancel, isLoading = false }: HalaqahFormProps) {
  const [formData, setFormData] = useState<HalaqahFormData>({
    name: halaqah?.name || '',
    description: halaqah?.description || '',
    level: halaqah?.level || 'Pemula',
    capacity: halaqah?.capacity || 20,
    musyrifId: halaqah?.musyrifId || '',
    schedules: halaqah?.schedules || [],
    ...halaqah
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [musyrifList, setMusyrifList] = useState<Musyrif[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isEdit = !!halaqah?.id;

  useEffect(() => {
    loadMusyrifList();
  }, []);

  const loadMusyrifList = async () => {
    try {
      setLoadingData(true);
      const response = await fetch('/api/users?role=MUSYRIF');
      if (response.ok) {
        const data = await response.json();
        setMusyrifList(data.users || []);
      }
    } catch (error) {
      console.error('Error loading musyrif:', error);
      toast.error('Gagal memuat data musyrif');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Nama halaqah wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama halaqah minimal 3 karakter';
    }

    // Level validation
    if (!formData.level) {
      newErrors.level = 'Level wajib dipilih';
    }

    // Capacity validation
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Kapasitas minimal 1 santri';
    } else if (formData.capacity > 50) {
      newErrors.capacity = 'Kapasitas maksimal 50 santri';
    }

    // Musyrif validation
    if (!formData.musyrifId) {
      newErrors.musyrifId = 'Musyrif wajib dipilih';
    }

    // Schedule validation
    if (formData.schedules.length === 0) {
      newErrors.schedules = 'Minimal harus ada 1 jadwal';
    } else {
      formData.schedules.forEach((schedule, index) => {
        if (!schedule.startTime) {
          newErrors[`schedule_${index}_startTime`] = 'Waktu mulai wajib diisi';
        }
        if (!schedule.endTime) {
          newErrors[`schedule_${index}_endTime`] = 'Waktu selesai wajib diisi';
        }
        if (schedule.startTime && schedule.endTime && schedule.startTime >= schedule.endTime) {
          newErrors[`schedule_${index}_endTime`] = 'Waktu selesai harus lebih besar dari waktu mulai';
        }
      });
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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          dayOfWeek: 1,
          startTime: '14:00',
          endTime: '16:00',
          room: ''
        }
      ]
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const updateSchedule = (index: number, field: keyof Schedule, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || '';
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
          <BookOpen className="h-6 w-6 text-teal-600" />
          {isEdit ? 'Edit Halaqah' : 'Tambah Halaqah Baru'}
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
                  Nama Halaqah *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Halaqah Al-Fatihah"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.level ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="text-red-500 text-xs mt-1">{errors.level}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Santri *
                </label>
                <Input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="20"
                  min="1"
                  max="50"
                  className={errors.capacity ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Musyrif/Pembimbing *
                </label>
                <select
                  name="musyrifId"
                  value={formData.musyrifId}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.musyrifId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Pilih Musyrif</option>
                  {musyrifList.map((musyrif) => (
                    <option key={musyrif.id} value={musyrif.id}>
                      {musyrif.name} ({musyrif.email})
                    </option>
                  ))}
                </select>
                {errors.musyrifId && (
                  <p className="text-red-500 text-xs mt-1">{errors.musyrifId}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Deskripsi halaqah (opsional)"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Schedules */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Jadwal Halaqah</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addSchedule}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </Button>
            </div>

            {errors.schedules && (
              <p className="text-red-500 text-sm mb-4">{errors.schedules}</p>
            )}

            <div className="space-y-4">
              {formData.schedules.map((schedule, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Jadwal {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSchedule(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hari
                      </label>
                      <select
                        value={schedule.dayOfWeek}
                        onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Mulai *
                      </label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                        className={errors[`schedule_${index}_startTime`] ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors[`schedule_${index}_startTime`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`schedule_${index}_startTime`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Selesai *
                      </label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                        className={errors[`schedule_${index}_endTime`] ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      {errors[`schedule_${index}_endTime`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`schedule_${index}_endTime`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ruangan
                      </label>
                      <Input
                        type="text"
                        value={schedule.room}
                        onChange={(e) => updateSchedule(index, 'room', e.target.value)}
                        placeholder="Ruang A1"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {getDayLabel(schedule.dayOfWeek)}, {schedule.startTime} - {schedule.endTime}
                      {schedule.room && (
                        <>
                          <MapPin className="h-4 w-4 inline ml-3 mr-1" />
                          {schedule.room}
                        </>
                      )}
                    </p>
                  </div>
                </Card>
              ))}

              {formData.schedules.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada jadwal</p>
                  <p className="text-sm text-gray-500">Klik "Tambah Jadwal" untuk menambah jadwal baru</p>
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
