'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Heart, 
  Target, 
  Users, 
  TrendingUp,
  Building,
  BookOpen,
  GraduationCap,
  Utensils,
  CreditCard,
  Smartphone,
  QrCode,
  ArrowRight,
  Check,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface DonationCategory {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  icon: string;
  color: string;
  bgColor: string;
  urgent?: boolean;
  isActive?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

// Map icon strings to Lucide components
const iconMap: Record<string, React.ElementType> = {
  'Heart': Heart,
  'Building': Building,
  'GraduationCap': GraduationCap,
  'BookOpen': BookOpen,
  'Utensils': Utensils,
  'Target': Target,
  'Users': Users,
  'TrendingUp': TrendingUp
};

const DonationSection = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [donationCategories, setDonationCategories] = useState<DonationCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [donorData, setDonorData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    isAnonymous: false
  });

  // Fetch donation categories from API
  useEffect(() => {
    const fetchDonationCategories = async () => {
      try {
        setIsLoadingCategories(true);
        
        // First try to get categories from database
        let response;
        try {
          response = await fetch('/api/donations/categories/db?active=true');
        } catch (fetchError) {
          console.error('Network error fetching categories:', fetchError);
          throw new Error('Network error when fetching donation categories');
        }
        
        if (!response.ok) {
          console.error('API error response:', response.status, response.statusText);
          throw new Error(`Failed to fetch donation categories: ${response.status} ${response.statusText}`);
        }
        
        let data;
        try {
          // Check content type before parsing
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            // Not JSON, get as text and log
            const responseText = await response.text();
            console.error('Non-JSON response received:', responseText);
            console.error('Content-Type:', contentType);
            throw new Error('Server did not return JSON. Received: ' + (contentType || 'unknown content type'));
          }
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          // Try to get the response text to see what's being returned
          try {
            const responseText = await response.text();
            console.error('Response text:', responseText);
          } catch (textError) {
            console.error('Could not get response text:', textError);
          }
          throw new Error('Invalid response from server');
        }
        
        if (data.success && data.categories && data.categories.length > 0) {
          setDonationCategories(data.categories);
          // Set the first category as selected by default
          setSelectedCategory(data.categories[0].id);
          return;
        }
        
        // If no categories in database, try to seed them
        try {
          const seedResponse = await fetch('/api/donations/categories/db', {
            method: 'POST'
          });
          
          if (seedResponse.ok) {
            // Check content type before parsing
            const contentType = seedResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response from seed API:', await seedResponse.text());
              throw new Error('Seed API did not return JSON');
            }
            const seedData = await seedResponse.json();
            
            if (seedData.success && seedData.categories && seedData.categories.length > 0) {
              setDonationCategories(seedData.categories);
              setSelectedCategory(seedData.categories[0].id);
              return;
            }
          }
        } catch (seedError) {
          console.error('Error seeding donation categories in DB:', seedError);
        }
        
        // If database approach fails, try the old SiteSettings approach
        try {
          const oldResponse = await fetch('/api/donations/categories?active=true');
          
          if (oldResponse.ok) {
            // Check content type before parsing
            const contentType = oldResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response from old API:', await oldResponse.text());
              throw new Error('Old API did not return JSON');
            }
            const oldData = await oldResponse.json();
            
            if (oldData.success && oldData.categories && oldData.categories.length > 0) {
              setDonationCategories(oldData.categories);
              setSelectedCategory(oldData.categories[0].id);
              return;
            }
          }
          
          // Try to seed old categories if none exist
          const seedOldResponse = await fetch('/api/donations/categories/seed', {
            method: 'POST'
          });
          
          if (seedOldResponse.ok) {
            // Check content type before parsing
            const contentType = seedOldResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response from seed old API:', await seedOldResponse.text());
              throw new Error('Seed old API did not return JSON');
            }
            const seedOldData = await seedOldResponse.json();
            
            if (seedOldData.success && seedOldData.categories && seedOldData.categories.length > 0) {
              setDonationCategories(seedOldData.categories);
              setSelectedCategory(seedOldData.categories[0].id);
              return;
            }
          }
        } catch (oldError) {
          console.error('Error with old categories approach:', oldError);
        }
        
        // Fallback to default categories if all approaches fail
        const fallbackCategories = [
          {
            id: 'general',
            title: 'Donasi Umum',
            description: 'Untuk operasional sehari-hari rumah tahfidz',
            target: 100000000,
            collected: 75000000,
            icon: 'Heart',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          },
          {
            id: 'building',
            title: 'Pembangunan Gedung',
            description: 'Renovasi dan pembangunan fasilitas baru',
            target: 500000000,
            collected: 320000000,
            icon: 'Building',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            urgent: true
          },
          {
            id: 'scholarship',
            title: 'Beasiswa Santri',
            description: 'Bantuan biaya pendidikan untuk santri kurang mampu',
            target: 200000000,
            collected: 150000000,
            icon: 'GraduationCap',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          }
        ];
        
        setDonationCategories(fallbackCategories);
        setSelectedCategory('general');
        console.warn('Using fallback categories after all API approaches failed');
      } catch (error) {
        console.error('Error fetching donation categories:', error);
        setError('Failed to load donation categories. Please try again later.');
        // Set fallback categories
        setDonationCategories([
          {
            id: 'general',
            title: 'Donasi Umum',
            description: 'Untuk operasional sehari-hari rumah tahfidz',
            target: 100000000,
            collected: 75000000,
            icon: 'Heart',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          }
        ]);
        setSelectedCategory('general');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchDonationCategories();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank',
      name: 'Transfer Bank',
      icon: CreditCard,
      description: 'BCA, Mandiri, BNI, BRI'
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: Smartphone,
      description: 'GoPay, OVO, DANA, ShopeePay'
    },
    {
      id: 'qris',
      name: 'QRIS',
      icon: QrCode,
      description: 'Scan QR Code untuk pembayaran'
    }
  ];

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const selectedCategoryData = donationCategories.find(cat => cat.id === selectedCategory);
  const finalAmount = selectedAmount || parseInt(customAmount) || 0;

  // Function to get icon component from string
  const getIconComponent = (iconName: string): React.ElementType => {
    if (!iconName) return Heart; // Default to Heart if no icon name provided
    return iconMap[iconName] || Heart; // Default to Heart if icon not found
  };

  const handleDonationSubmit = async () => {
    if (finalAmount === 0) return;

    setIsLoading(true);

    try {
      // Get category name for display
      const categoryName = selectedCategoryData?.title || 'Umum';
      
      // Prepare payment data
      const paymentData = {
        type: 'donation',
        amount: finalAmount,
        donationData: {
          donorName: donorData.name || 'Donatur Anonim',
          donorEmail: donorData.email || 'anonymous@example.com',
          donorPhone: donorData.phone || '08123456789',
          type: selectedCategory, // This will be used as the type in the database
          message: donorData.message,
          isAnonymous: donorData.isAnonymous,
          categoryName: categoryName
        }
      };
      
      // Only add categoryId if it's a valid ID from the database
      if (selectedCategoryData && selectedCategoryData.id && selectedCategoryData.id !== 'general') {
        // @ts-ignore
        paymentData.donationData.categoryId = selectedCategoryData.id;
      }
      
      console.log('Sending payment data:', paymentData);
      
      // Create payment directly without cart
      let response;
      try {
        response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });
      } catch (fetchError) {
        console.error('Network error creating payment:', fetchError);
        throw new Error('Network error when creating payment. Please check your internet connection.');
      }

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          // Check content type before parsing
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            // Try to parse error response as JSON
            const errorData = await response.json();
            console.error('Server error response:', response.status, errorData);
            
            if (errorData.error) {
              errorMessage = errorData.error;
              if (errorData.details) {
                errorMessage += ` - ${errorData.details}`;
              }
            }
          } else {
            // Not JSON, get as text
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText);
            errorMessage = `Server error: ${response.status} - Non-JSON response`;
          }
        } catch (parseError) {
          // If can't parse as JSON, get as text
          try {
            const errorText = await response.text();
            console.error('Server error response (text):', response.status, errorText);
            errorMessage = `${errorMessage} - ${errorText}`;
          } catch (textError) {
            console.error('Error getting response text:', textError);
            errorMessage = `${errorMessage} - Could not read error details`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parse response as JSON
      let result;
      try {
        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // Not JSON, get as text and log
          const responseText = await response.text();
          console.error('Non-JSON response received:', responseText);
          console.error('Content-Type:', contentType);
          throw new Error('Server did not return JSON. Received: ' + (contentType || 'unknown content type'));
        }
      } catch (jsonError) {
        console.error('Error parsing payment response:', jsonError);
        // Try to get the response text
        try {
          const responseText = await response.text();
          console.error('Response text:', responseText);
        } catch (textError) {
          console.error('Error getting response text:', textError);
        }
        throw new Error('Could not process payment response from server');
      }
      console.log('Payment creation result:', result);

      if (result.success) {
        // Check if we're in development mode
        if (result.devMode) {
          alert('PERHATIAN: Aplikasi berjalan dalam mode pengembangan. Konfigurasi Midtrans belum diatur.\n\n' +
                'Data donasi telah disimpan, tetapi tidak ada proses pembayaran yang sebenarnya.\n\n' +
                'Kategori: ' + categoryName + '\n' +
                'Jumlah: ' + formatCurrency(finalAmount) + '\n' +
                'Donatur: ' + (donorData.isAnonymous ? 'Anonim' : donorData.name));
        }
        
        // Redirect to Midtrans payment page
        if (result.redirectUrl) {
          window.open(result.redirectUrl, '_blank');
        } else {
          console.warn('No redirect URL provided in successful response');
          alert('Donasi berhasil dibuat, tetapi tidak ada URL pembayaran. Silakan hubungi admin.');
        }
      } else {
        const errorMessage = result.error || 'Terjadi kesalahan';
        const errorDetails = result.details ? `\nDetail: ${result.details}` : '';
        console.error('Donation error:', errorMessage, errorDetails);
        alert(`Gagal membuat donasi: ${errorMessage}${errorDetails}`);
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
      alert(`Terjadi kesalahan saat membuat donasi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonorDataChange = (field: string, value: string | boolean) => {
    setDonorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Donasi untuk Kemajuan Tahfidz
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Berpartisipasilah dalam membangun generasi penghafal Al-Quran. 
            Setiap donasi Anda sangat berarti untuk kemajuan pendidikan Islam.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Categories */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Pilih Kategori Donasi
            </h3>
            
            {isLoadingCategories ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Memuat kategori donasi...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {donationCategories.map((category) => {
                  const Icon = getIconComponent(category.icon);
                  const percentage = (category.collected / category.target) * 100;
                  
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedCategory === category.id 
                          ? 'ring-2 ring-teal-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${category.bgColor} ${category.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          {category.urgent && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                              Mendesak
                            </span>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg">
                          {category.title}
                        </CardTitle>
                        
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Terkumpul</span>
                            <span className="font-semibold text-gray-900">
                              {formatPercentage(category.collected, category.target)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Amount Info */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(category.collected)}
                          </span>
                          <span className="text-gray-600">
                            Target: {formatCurrency(category.target)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  Form Donasi
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Selected Category Info */}
                {selectedCategoryData && (
                  <div className={`p-4 rounded-lg ${selectedCategoryData.bgColor}`}>
                    <div className="flex items-center mb-2">
                      {React.createElement(
                        getIconComponent(selectedCategoryData.icon),
                        { className: `h-4 w-4 mr-2 ${selectedCategoryData.color}` }
                      )}
                      <span className="font-semibold text-gray-900">
                        {selectedCategoryData.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedCategoryData.description}
                    </p>
                  </div>
                )}

                {/* Quick Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Nominal Donasi
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          selectedAmount === amount
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                  
                  <Input
                    type="number"
                    placeholder="Nominal lainnya"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Metode Pembayaran
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            selectedPayment === method.id
                              ? 'bg-teal-50 border-teal-300 text-teal-900'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 mr-3 text-gray-600" />
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-gray-500">{method.description}</div>
                            </div>
                            {selectedPayment === method.id && (
                              <Check className="h-5 w-5 text-teal-600 ml-auto" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Donor Info */}
                <div className="space-y-4">
                  <Input
                    placeholder="Nama Donatur (Opsional)"
                    value={donorData.name}
                    onChange={(e) => handleDonorDataChange('name', e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email (Opsional)"
                    value={donorData.email}
                    onChange={(e) => handleDonorDataChange('email', e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="No. HP (Opsional)"
                    value={donorData.phone}
                    onChange={(e) => handleDonorDataChange('phone', e.target.value)}
                  />
                  <Input
                    placeholder="Pesan/Doa (Opsional)"
                    value={donorData.message}
                    onChange={(e) => handleDonorDataChange('message', e.target.value)}
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={donorData.isAnonymous}
                      onChange={(e) => handleDonorDataChange('isAnonymous', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                      Donasi sebagai anonim
                    </label>
                  </div>
                </div>

                {/* Total & Submit */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Donasi:
                    </span>
                    <span className="text-2xl font-bold text-teal-600">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                  
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={finalAmount === 0}
                    loading={isLoading}
                    onClick={handleDonationSubmit}
                  >
                    {isLoading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Donasi Anda akan digunakan sesuai kategori yang dipilih
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Donation Impact */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Dampak Donasi Anda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'santri',
                icon: Users,
                bgColor: 'bg-teal-100',
                iconColor: 'text-teal-600',
                title: '250+ Santri Terbantu',
                description: 'Donasi Anda membantu biaya pendidikan santri dari keluarga kurang mampu'
              },
              {
                id: 'fasilitas',
                icon: Target,
                bgColor: 'bg-yellow-100',
                iconColor: 'text-yellow-600',
                title: 'Fasilitas Berkualitas',
                description: 'Membantu pengadaan fasilitas pembelajaran yang modern dan nyaman'
              },
              {
                id: 'kualitas',
                icon: TrendingUp,
                bgColor: 'bg-green-100',
                iconColor: 'text-green-600',
                title: 'Kualitas Pendidikan',
                description: 'Meningkatkan kualitas pembelajaran dan metode tahfidz yang efektif'
              }
            ].map((item) => (
              <div key={item.id} className="text-center">
                <div className={`${item.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
