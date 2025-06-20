'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  CheckCircle, 
  Download, 
  Home, 
  Heart,
  Calendar,
  User,
  Hash,
  ArrowRight,
  Share2,
  MessageCircle
} from 'lucide-react';

const DonationSuccessPage = () => {
  const searchParams = useSearchParams();
  const [donationData, setDonationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get donation details from URL params or API
    const orderId = searchParams.get('order_id');
    const statusCode = searchParams.get('status_code');
    const transactionStatus = searchParams.get('transaction_status');
    const devMode = searchParams.get('dev_mode') === 'true';
    
    const fetchDonationData = async () => {
      try {
        setLoading(true);
        
        if (devMode) {
          // In development mode, use data from URL params if available
          const mockDonationData = {
            orderId: orderId || 'donation_dev_mode',
            amount: parseInt(searchParams.get('amount') || '1000000'),
            donationType: searchParams.get('type') || 'GENERAL',
            donorName: searchParams.get('donor_name') || 'Donatur Anonim',
            donorEmail: searchParams.get('donor_email') || 'anonymous@example.com',
            paymentMethod: 'Development Mode',
            paidAt: new Date().toISOString(),
            reference: orderId || 'DEV_MODE_REFERENCE',
            message: searchParams.get('message') || 'Donasi dalam mode pengembangan',
            isAnonymous: searchParams.get('is_anonymous') === 'true',
            status: 'DEVELOPMENT_MODE',
            categoryName: searchParams.get('category_name') || 'Donasi Umum'
          };
          
          setDonationData(mockDonationData);
          setLoading(false);
          return;
        }
        
        // In production, fetch real data from API
        if (orderId) {
          try {
            const response = await fetch(`/api/donations/${orderId}`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.donation) {
                setDonationData({
                  ...data.donation,
                  // Parse type field if it contains category info (format: categoryId:categoryName)
                  donationType: data.donation.type?.split(':')[0] || data.donation.type,
                  categoryName: data.donation.type?.includes(':') 
                    ? data.donation.type.split(':')[1] 
                    : getDonationTypeLabel(data.donation.type),
                  paidAt: data.donation.paidAt || data.donation.createdAt || new Date().toISOString()
                });
              } else {
                // Fallback to mock data if API returns error
                fallbackToMockData(orderId);
              }
            } else {
              // Fallback to mock data if API call fails
              fallbackToMockData(orderId);
            }
          } catch (error) {
            console.error('Error fetching donation data:', error);
            fallbackToMockData(orderId);
          }
        } else {
          fallbackToMockData();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in donation success page:', error);
        fallbackToMockData();
        setLoading(false);
      }
    };
    
    const fallbackToMockData = (id?: string) => {
      // Mock donation data as fallback
      const mockDonationData = {
        orderId: id || 'donation_1707123456_xyz789',
        amount: 1000000,
        donationType: 'GENERAL',
        categoryName: 'Donasi Umum',
        donorName: 'Donatur',
        donorEmail: 'donor@example.com',
        paymentMethod: 'Bank Transfer',
        paidAt: new Date().toISOString(),
        reference: id || 'DON001234567890',
        message: 'Semoga bermanfaat untuk kemajuan rumah tahfidz',
        isAnonymous: false,
        status: 'PAID'
      };
      
      setDonationData(mockDonationData);
    };
    
    fetchDonationData();
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDonationTypeLabel = (type: string) => {
    switch (type) {
      case 'GENERAL': return 'Donasi Umum';
      case 'BUILDING': return 'Pembangunan Gedung';
      case 'SCHOLARSHIP': return 'Beasiswa Santri';
      case 'EQUIPMENT': return 'Peralatan';
      case 'RAMADAN': return 'Program Ramadan';
      case 'QURBAN': return 'Program Qurban';
      default: return type;
    }
  };

  const shareToWhatsApp = () => {
    const message = `Alhamdulillah, saya telah berdonasi sebesar ${formatCurrency(donationData.amount)} untuk ${getDonationTypeLabel(donationData.donationType)} di Rumah Tahfidz Baitus Shuffah. Mari bersama-sama membangun generasi penghafal Al-Quran! 🤲\n\nInfo lebih lanjut: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memproses donasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Jazakallahu Khairan!
            </h1>
            <p className="text-gray-600">
              Donasi Anda telah berhasil diterima dan sangat berarti bagi kami
            </p>
          </div>

          {/* Donation Details */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Detail Donasi
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Hash className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">ID Donasi</span>
                  </div>
                  <span className="font-medium text-gray-900">{donationData.reference}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Donatur</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {donationData.isAnonymous ? 'Donatur Anonim' : donationData.donorName}
                    </div>
                    {!donationData.isAnonymous && donationData.donorEmail && (
                      <div className="text-sm text-gray-500">{donationData.donorEmail}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Kategori Donasi</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {donationData.categoryName || getDonationTypeLabel(donationData.donationType)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Tanggal Donasi</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(donationData.paidAt)}
                  </span>
                </div>

                {donationData.message && (
                  <div className="py-3 border-b border-gray-100">
                    <div className="flex items-start">
                      <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <span className="text-gray-600 block mb-1">Pesan/Doa:</span>
                        <p className="text-gray-900 italic">"{donationData.message}"</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">Jumlah Donasi</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(donationData.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Status: DITERIMA</span>
            </div>
          </div>

          {/* Islamic Quote */}
          <div className="mb-8 p-6 bg-teal-50 rounded-lg text-center">
            <p className="text-teal-800 font-medium mb-2 text-lg">
              "مَن تَصَدَّقَ بِعَدْلِ تَمْرَةٍ مِنْ كَسْبٍ طَيِّبٍ"
            </p>
            <p className="text-teal-700 text-sm">
              "Barangsiapa bersedekah senilai sebiji kurma dari penghasilan yang halal..."
            </p>
            <p className="text-teal-600 text-xs mt-2">- HR. Bukhari</p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Bukti Donasi
              </Button>
              
              <Button variant="outline" className="w-full" onClick={shareToWhatsApp}>
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan ke WhatsApp
              </Button>
            </div>

            <Link href="/#donation" className="block">
              <Button variant="outline" className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Donasi Lagi
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button className="w-full" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Terima Kasih atas Kepercayaan Anda
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• Donasi Anda akan digunakan sesuai dengan kategori yang dipilih</p>
              <p>• Laporan penggunaan dana akan dipublikasikan secara berkala</p>
              <p>• Bukti donasi telah dikirim ke email yang terdaftar</p>
              <p>• Semoga Allah SWT membalas kebaikan Anda dengan berlipat ganda</p>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Hubungi kami: <strong>+62 21 1234 5678</strong> | <strong>info@rumahtahfidz.com</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationSuccessPageWithSuspense = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <DonationSuccessPage />
    </Suspense>
  );
};

export default DonationSuccessPageWithSuspense;
