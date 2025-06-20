'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  BookOpen, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';

interface RegisterForm {
  // Data Santri
  santriName: string;
  santriNis: string;
  santriGender: string;
  santriBirthDate: string;
  santriBirthPlace: string;
  santriAddress: string;
  santriPhone: string;
  santriEmail: string;
  
  // Data Wali
  waliName: string;
  waliEmail: string;
  waliPhone: string;
  waliAddress: string;
  waliRelation: string;
  
  // Program
  selectedProgram: string;
  
  // Agreement
  agreement: boolean;
}

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    santriName: '',
    santriNis: '',
    santriGender: '',
    santriBirthDate: '',
    santriBirthPlace: '',
    santriAddress: '',
    santriPhone: '',
    santriEmail: '',
    waliName: '',
    waliEmail: '',
    waliPhone: '',
    waliAddress: '',
    waliRelation: '',
    selectedProgram: '',
    agreement: false
  });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  const steps = [
    { id: 1, title: 'Data Santri', icon: User },
    { id: 2, title: 'Data Wali', icon: Users },
    { id: 3, title: 'Program & Konfirmasi', icon: CheckCircle }
  ];

  const programs = [
    {
      id: 'tahfidz-intensif',
      name: 'Tahfidz Intensif',
      description: 'Program unggulan untuk menghafal 30 juz',
      price: 'Rp 500.000/bulan',
      duration: '2-3 Tahun'
    },
    {
      id: 'tahfidz-reguler',
      name: 'Tahfidz Reguler',
      description: 'Program dengan jadwal fleksibel',
      price: 'Rp 300.000/bulan',
      duration: '3-4 Tahun'
    },
    {
      id: 'tahsin-tajwid',
      name: 'Tahsin & Tajwid',
      description: 'Perbaikan bacaan Al-Quran',
      price: 'Rp 200.000/bulan',
      duration: '6 Bulan'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    if (step === 1) {
      if (!formData.santriName) newErrors.santriName = 'Nama santri harus diisi';
      if (!formData.santriGender) newErrors.santriGender = 'Jenis kelamin harus dipilih';
      if (!formData.santriBirthDate) newErrors.santriBirthDate = 'Tanggal lahir harus diisi';
      if (!formData.santriBirthPlace) newErrors.santriBirthPlace = 'Tempat lahir harus diisi';
      if (!formData.santriAddress) newErrors.santriAddress = 'Alamat harus diisi';
    } else if (step === 2) {
      if (!formData.waliName) newErrors.waliName = 'Nama wali harus diisi';
      if (!formData.waliEmail) newErrors.waliEmail = 'Email wali harus diisi';
      if (!formData.waliPhone) newErrors.waliPhone = 'No. HP wali harus diisi';
      if (!formData.waliAddress) newErrors.waliAddress = 'Alamat wali harus diisi';
      if (!formData.waliRelation) newErrors.waliRelation = 'Hubungan dengan santri harus dipilih';
    } else if (step === 3) {
      if (!formData.selectedProgram) newErrors.selectedProgram = 'Program harus dipilih';
      if (!formData.agreement) newErrors.agreement = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and redirect
      alert('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
      // In real app, redirect to success page or login
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap Santri"
                name="santriName"
                value={formData.santriName}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.santriName}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="santriGender"
                  value={formData.santriGender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
                {errors.santriGender && (
                  <p className="mt-1 text-sm text-red-600">{errors.santriGender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Tempat Lahir"
                name="santriBirthPlace"
                value={formData.santriBirthPlace}
                onChange={handleInputChange}
                placeholder="Masukkan tempat lahir"
                leftIcon={<MapPin className="h-4 w-4" />}
                error={errors.santriBirthPlace}
                required
              />
              
              <Input
                label="Tanggal Lahir"
                type="date"
                name="santriBirthDate"
                value={formData.santriBirthDate}
                onChange={handleInputChange}
                leftIcon={<Calendar className="h-4 w-4" />}
                error={errors.santriBirthDate}
                required
              />
            </div>

            <Input
              label="Alamat Lengkap"
              name="santriAddress"
              value={formData.santriAddress}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap"
              leftIcon={<MapPin className="h-4 w-4" />}
              error={errors.santriAddress}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="No. HP Santri (Opsional)"
                type="tel"
                name="santriPhone"
                value={formData.santriPhone}
                onChange={handleInputChange}
                placeholder="Masukkan no. HP"
                leftIcon={<Phone className="h-4 w-4" />}
              />
              
              <Input
                label="Email Santri (Opsional)"
                type="email"
                name="santriEmail"
                value={formData.santriEmail}
                onChange={handleInputChange}
                placeholder="Masukkan email"
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap Wali"
                name="waliName"
                value={formData.waliName}
                onChange={handleInputChange}
                placeholder="Masukkan nama wali"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.waliName}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hubungan dengan Santri <span className="text-red-500">*</span>
                </label>
                <select
                  name="waliRelation"
                  value={formData.waliRelation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="">Pilih hubungan</option>
                  <option value="FATHER">Ayah</option>
                  <option value="MOTHER">Ibu</option>
                  <option value="GUARDIAN">Wali</option>
                  <option value="SIBLING">Saudara</option>
                  <option value="OTHER">Lainnya</option>
                </select>
                {errors.waliRelation && (
                  <p className="mt-1 text-sm text-red-600">{errors.waliRelation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Wali"
                type="email"
                name="waliEmail"
                value={formData.waliEmail}
                onChange={handleInputChange}
                placeholder="Masukkan email wali"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.waliEmail}
                required
              />
              
              <Input
                label="No. HP Wali"
                type="tel"
                name="waliPhone"
                value={formData.waliPhone}
                onChange={handleInputChange}
                placeholder="Masukkan no. HP wali"
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.waliPhone}
                required
              />
            </div>

            <Input
              label="Alamat Wali"
              name="waliAddress"
              value={formData.waliAddress}
              onChange={handleInputChange}
              placeholder="Masukkan alamat wali"
              leftIcon={<MapPin className="h-4 w-4" />}
              error={errors.waliAddress}
              required
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Pilih Program <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.selectedProgram === program.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedProgram: program.id }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="selectedProgram"
                        value={program.id}
                        checked={formData.selectedProgram === program.id}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{program.name}</div>
                        <div className="text-sm text-gray-600">{program.description}</div>
                        <div className="text-sm text-teal-600 font-medium">
                          {program.price} • {program.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.selectedProgram && (
                <p className="mt-1 text-sm text-red-600">{errors.selectedProgram}</p>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <label className="text-sm text-gray-700">
                    Saya menyetujui{' '}
                    <Link href="/terms" className="text-teal-600 hover:text-teal-500">
                      syarat dan ketentuan
                    </Link>{' '}
                    serta{' '}
                    <Link href="/privacy" className="text-teal-600 hover:text-teal-500">
                      kebijakan privasi
                    </Link>{' '}
                    yang berlaku.
                  </label>
                  {errors.agreement && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreement}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-gold">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  Rumah Tahfidz
                </h1>
                <p className="text-sm text-gray-600">Baitus Shuffah</p>
              </div>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Pendaftaran Santri Baru
          </h2>
          <p className="mt-2 text-gray-600">
            Lengkapi formulir berikut untuk mendaftar sebagai santri
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : isActive
                      ? 'border-teal-600 text-teal-600'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-teal-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Sebelumnya
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Link href="/">
                    <Button variant="ghost">
                      Batal
                    </Button>
                  </Link>
                  
                  {currentStep < 3 ? (
                    <Button onClick={nextStep}>
                      Selanjutnya
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} loading={isLoading}>
                      {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
