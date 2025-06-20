'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import {
  Heart,
  Building,
  BookOpen,
  Users,
  CreditCard,
  Banknote,
  Target,
  CheckCircle,
  Gift,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

export default function DonatePage() {
  const [donationForm, setDonationForm] = useState({
    amount: '',
    customAmount: '',
    type: 'BUILDING',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    message: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);

  const donationTypes = [
    {
      id: 'BUILDING',
      title: 'Pembangunan Ruang Kelas',
      description: 'Bantuan untuk pembangunan fasilitas ruang kelas baru',
      icon: <Building className="h-8 w-8 text-blue-600" />,
      target: 150000000,
      collected: 45000000,
      priority: 'high'
    },
    {
      id: 'SCHOLARSHIP',
      title: 'Beasiswa Santri',
      description: 'Bantuan biaya pendidikan untuk santri kurang mampu',
      icon: <Users className="h-8 w-8 text-green-600" />,
      target: 50000000,
      collected: 18000000,
      priority: 'medium'
    },
    {
      id: 'EQUIPMENT',
      title: 'Sarana & Prasarana',
      description: 'Pengadaan Al-Quran, buku, dan peralatan belajar',
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      target: 25000000,
      collected: 12000000,
      priority: 'medium'
    },
    {
      id: 'GENERAL',
      title: 'Operasional TPQ',
      description: 'Bantuan untuk kegiatan operasional sehari-hari',
      icon: <Heart className="h-8 w-8 text-red-600" />,
      target: 30000000,
      collected: 22000000,
      priority: 'low'
    }
  ];

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000, 2500000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalAmount = donationForm.amount === 'custom' 
        ? parseInt(donationForm.customAmount) 
        : parseInt(donationForm.amount);

      if (!finalAmount || finalAmount < 10000) {
        toast.error('Minimal donasi Rp 10.000');
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Terima kasih! Donasi Anda sedang diproses.');
      
      // Reset form
      setDonationForm({
        amount: '',
        customAmount: '',
        type: 'BUILDING',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        message: '',
        isAnonymous: false
      });
    } catch (error) {
      toast.error('Gagal memproses donasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setDonationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Prioritas Tinggi</Badge>;
      case 'medium':
        return <Badge variant="warning">Prioritas Sedang</Badge>;
      case 'low':
        return <Badge variant="secondary">Prioritas Rendah</Badge>;
      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Donasi untuk TPQ Baitus Shuffah
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Bersama membangun generasi Qur'ani yang bertaqwa dan berakhlakul karimah
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-teal-600 hover:text-teal-700">
              Beranda
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Donasi</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Donation Campaigns */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Donasi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih program donasi yang ingin Anda dukung untuk kemajuan TPQ Baitus Shuffah
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {donationTypes.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {campaign.icon}
                      <div>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        {getPriorityBadge(campaign.priority)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Terkumpul</span>
                      <span className="font-semibold">
                        {formatCurrency(campaign.collected)} / {formatCurrency(campaign.target)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgress(campaign.collected, campaign.target)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getProgress(campaign.collected, campaign.target).toFixed(1)}% tercapai
                    </p>
                  </div>

                  <Button 
                    onClick={() => setDonationForm(prev => ({ ...prev, type: campaign.id }))}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Donasi Sekarang
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-green-600" />
                Form Donasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Donation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Donasi *
                  </label>
                  <select
                    name="type"
                    value={donationForm.type}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {donationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Donasi *
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationForm(prev => ({ ...prev, amount: amount.toString(), customAmount: '' }))}
                        className={`p-2 text-sm border rounded-md transition-colors ${
                          donationForm.amount === amount.toString()
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationForm(prev => ({ ...prev, amount: 'custom' }))}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        donationForm.amount === 'custom'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      Nominal Lain
                    </button>
                    {donationForm.amount === 'custom' && (
                      <Input
                        type="number"
                        name="customAmount"
                        value={donationForm.customAmount}
                        onChange={handleChange}
                        placeholder="Masukkan nominal"
                        min="10000"
                        className="flex-1"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Donor Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={donationForm.isAnonymous}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label className="text-sm text-gray-700">
                      Donasi sebagai Anonim
                    </label>
                  </div>

                  {!donationForm.isAnonymous && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <Input
                          type="text"
                          name="donorName"
                          value={donationForm.donorName}
                          onChange={handleChange}
                          placeholder="Masukkan nama lengkap"
                          required={!donationForm.isAnonymous}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <Input
                            type="email"
                            name="donorEmail"
                            value={donationForm.donorEmail}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nomor Telepon
                          </label>
                          <Input
                            type="tel"
                            name="donorPhone"
                            value={donationForm.donorPhone}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan (Opsional)
                  </label>
                  <textarea
                    name="message"
                    value={donationForm.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tulis pesan atau doa untuk TPQ Baitus Shuffah..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {loading ? 'Memproses...' : 'Donasi Sekarang'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment Methods & Info */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Banknote className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Transfer Bank</h4>
                    <p className="text-sm text-gray-600">BSI: 7208593212 a.n TPQ Baitus Shuffah</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Payment Gateway</h4>
                    <p className="text-sm text-gray-600">Kartu Kredit, E-Wallet, Virtual Account</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-600" />
                  Donatur Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Hamba Allah', amount: 500000, time: '2 jam lalu' },
                    { name: 'Ahmad Fauzi', amount: 250000, time: '5 jam lalu' },
                    { name: 'Anonim', amount: 100000, time: '1 hari lalu' },
                    { name: 'Siti Aminah', amount: 1000000, time: '2 hari lalu' }
                  ].map((donor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{donor.name}</p>
                        <p className="text-sm text-gray-600">{donor.time}</p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(donor.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Dampak Donasi Anda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Fasilitas Belajar</p>
                      <p className="text-sm text-gray-600">Membantu pembangunan ruang kelas yang nyaman</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Beasiswa Santri</p>
                      <p className="text-sm text-gray-600">Memberikan kesempatan belajar bagi yang kurang mampu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Generasi Qur'ani</p>
                      <p className="text-sm text-gray-600">Mencetak generasi yang hafal Al-Quran dan berakhlak mulia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
