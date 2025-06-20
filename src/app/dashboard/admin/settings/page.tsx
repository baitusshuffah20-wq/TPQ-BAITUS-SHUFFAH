'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { toast, Toaster } from 'react-hot-toast';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  MessageSquare,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  BookOpen,
  Upload,
  X
} from 'lucide-react';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const { refreshSettings } = useSettings();
  const [selectedTab, setSelectedTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  // Define TypeScript interface for settings
  interface SettingsState {
    profile: {
      name: string;
      email: string;
      phone: string;
      address: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
    notifications: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      weeklyReports: boolean;
      monthlyReports: boolean;
    };
    system: {
      siteName: string;
      siteDescription: string;
      timezone: string;
      language: string;
      maintenanceMode: boolean;
      logo: string;
      favicon: string;
    };
    about: {
      vision: string;
      mission: string;
      history: string;
      values: string;
      achievements: string;
    };
    contact: {
      address: string;
      phone: string;
      mobile: string;
      email: string;
      whatsapp: string;
      instagram: string;
      facebook: string;
      youtube: string;
      operationalHours: string;
    };
    integrations: {
      whatsappToken: string;
      emailHost: string;
      emailPort: string;
      emailUsername: string;
      emailPassword: string;
      paymentGateway: string;
    };
    [key: string]: any;
  }
  
  // State for file previews
  const [logoPreview, setLogoPreview] = useState<string>('/logo.png');
  const [faviconPreview, setFaviconPreview] = useState<string>('/favicon.ico');
  
  // State for file objects
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      monthlyReports: true
    },
    system: {
      siteName: 'TPQ Baitus Shuffah',
      siteDescription: 'Lembaga Pendidikan Tahfidz Al-Quran',
      timezone: 'Asia/Jakarta',
      language: 'id',
      maintenanceMode: false,
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    about: {
      vision: 'Menjadi lembaga pendidikan tahfidz Al-Quran terkemuka yang melahirkan generasi Qurani berakhlak mulia.',
      mission: 'Menyelenggarakan pendidikan tahfidz Al-Quran berkualitas, membentuk karakter Islami, dan mengembangkan potensi santri secara komprehensif.',
      history: 'TPQ Baitus Shuffah didirikan pada tahun 2009 oleh sekelompok alumni pesantren yang peduli terhadap pendidikan Al-Quran. Berawal dari 15 santri, kini telah berkembang menjadi lembaga pendidikan tahfidz terpercaya.',
      values: 'Keikhlasan, Kesungguhan, Kemandirian, Keteladanan, Keberkahan',
      achievements: 'Juara 1 MTQ Tingkat Provinsi 2022, Juara 2 Tahfidz Nasional 2023, 250+ Alumni Hafidz 30 Juz'
    },
    contact: {
      address: 'Jl. Islamic Center No. 123, Jakarta Pusat',
      phone: '021-12345678',
      mobile: '081234567890',
      email: 'info@tpqbaitusshuffah.ac.id',
      whatsapp: '081234567890',
      instagram: '@tpq_baitusshuffah',
      facebook: 'TPQ Baitus Shuffah',
      youtube: 'TPQ Baitus Shuffah Official',
      operationalHours: 'Senin-Jumat: 07:00-17:00, Sabtu: 07:00-15:00, Minggu: 08:00-12:00'
    },
    integrations: {
      whatsappToken: '',
      emailHost: 'smtp.gmail.com',
      emailPort: '587',
      emailUsername: '',
      emailPassword: '',
      paymentGateway: 'midtrans'
    }
  });

  const tabs = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'notifications', label: 'Notifikasi', icon: Bell },
    { key: 'system', label: 'Sistem', icon: Settings },
    { key: 'about', label: 'Tentang TPQ', icon: BookOpen },
    { key: 'contact', label: 'Kontak', icon: Mail },
    { key: 'integrations', label: 'Integrasi', icon: Database },
    { key: 'security', label: 'Keamanan', icon: Shield }
  ];

  /**
   * Menangani pemilihan file logo
   * - Memvalidasi ukuran file (maks 2MB)
   * - Memvalidasi tipe file (hanya JPG, PNG, GIF)
   * - Membuat URL preview
   * - Menyimpan file untuk dikirim ke server
   */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file logo terlalu besar. Maksimal 2MB.');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan PNG atau JPG.');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
      
      // Update settings state
      handleInputChange('system', 'logo', previewUrl);
    }
  };
  
  /**
   * Menangani pemilihan file favicon
   * - Memvalidasi ukuran file (maks 1MB)
   * - Memvalidasi tipe file (hanya ICO, PNG)
   * - Membuat URL preview
   * - Menyimpan file untuk dikirim ke server
   */
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Ukuran file favicon terlalu besar. Maksimal 1MB.');
        return;
      }
      
      // Validate file type
      if (!['image/x-icon', 'image/png'].includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan ICO atau PNG.');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFaviconPreview(previewUrl);
      setFaviconFile(file);
      
      // Update settings state
      handleInputChange('system', 'favicon', previewUrl);
    }
  };
  
  /**
   * Menghapus file yang dipilih dan mengembalikan ke default
   * @param type - Tipe file yang akan dihapus ('logo' atau 'favicon')
   */
  const clearFileSelection = (type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      setLogoPreview('/logo.png');
      setLogoFile(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
      handleInputChange('system', 'logo', '/logo.png');
    } else {
      setFaviconPreview('/favicon.ico');
      setFaviconFile(null);
      if (faviconInputRef.current) {
        faviconInputRef.current.value = '';
      }
      handleInputChange('system', 'favicon', '/favicon.ico');
    }
  };

  /**
   * Memperbarui nilai pengaturan di state
   * @param section - Bagian pengaturan yang akan diperbarui (profile, system, dll)
   * @param field - Field yang akan diperbarui
   * @param value - Nilai baru
   */
  const handleInputChange = (section: keyof SettingsState, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Fetch settings from API when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all settings
        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        if (data.success && data.settings) {
          // Update system settings
          const newSettings = { ...settings };
          
          // System settings
          if (data.settings['site.name']) {
            newSettings.system.siteName = data.settings['site.name'].value;
          }
          
          if (data.settings['site.description']) {
            newSettings.system.siteDescription = data.settings['site.description'].value;
          }
          
          if (data.settings['site.timezone']) {
            newSettings.system.timezone = data.settings['site.timezone'].value;
          }
          
          if (data.settings['site.language']) {
            newSettings.system.language = data.settings['site.language'].value;
          }
          
          if (data.settings['site.maintenanceMode']) {
            newSettings.system.maintenanceMode = data.settings['site.maintenanceMode'].value;
          }
          
          if (data.settings['site.logo']) {
            newSettings.system.logo = data.settings['site.logo'].value;
            setLogoPreview(data.settings['site.logo'].value);
          }
          
          if (data.settings['site.favicon']) {
            newSettings.system.favicon = data.settings['site.favicon'].value;
            setFaviconPreview(data.settings['site.favicon'].value);
          }
          
          // About settings
          if (data.settings['about.vision']) {
            newSettings.about.vision = data.settings['about.vision'].value;
          }
          
          if (data.settings['about.mission']) {
            newSettings.about.mission = data.settings['about.mission'].value;
          }
          
          if (data.settings['about.history']) {
            newSettings.about.history = data.settings['about.history'].value;
          }
          
          if (data.settings['about.values']) {
            newSettings.about.values = data.settings['about.values'].value;
          }
          
          if (data.settings['about.achievements']) {
            newSettings.about.achievements = data.settings['about.achievements'].value;
          }
          
          // Contact settings
          if (data.settings['contact.address']) {
            newSettings.contact.address = data.settings['contact.address'].value;
          }
          
          if (data.settings['contact.phone']) {
            newSettings.contact.phone = data.settings['contact.phone'].value;
          }
          
          if (data.settings['contact.email']) {
            newSettings.contact.email = data.settings['contact.email'].value;
          }
          
          if (data.settings['contact.whatsapp']) {
            newSettings.contact.whatsapp = data.settings['contact.whatsapp'].value;
          }
          
          if (data.settings['contact.operationalHours']) {
            newSettings.contact.operationalHours = data.settings['contact.operationalHours'].value;
          }
          
          // Integration settings
          if (data.settings['integration.whatsapp.token']) {
            newSettings.integrations.whatsappToken = data.settings['integration.whatsapp.token'].value;
          }
          
          if (data.settings['integration.email.host']) {
            newSettings.integrations.emailHost = data.settings['integration.email.host'].value;
          }
          
          if (data.settings['integration.email.port']) {
            newSettings.integrations.emailPort = data.settings['integration.email.port'].value;
          }
          
          if (data.settings['integration.email.username']) {
            newSettings.integrations.emailUsername = data.settings['integration.email.username'].value;
          }
          
          if (data.settings['integration.email.password']) {
            newSettings.integrations.emailPassword = data.settings['integration.email.password'].value;
          }
          
          if (data.settings['integration.payment.gateway']) {
            newSettings.integrations.paymentGateway = data.settings['integration.payment.gateway'].value;
          }
          
          // Update settings state
          setSettings(newSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Gagal memuat pengaturan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
    
    // Clean up object URLs when component unmounts
    return () => {
      if (logoPreview !== '/logo.png') {
        URL.revokeObjectURL(logoPreview);
      }
      if (faviconPreview !== '/favicon.ico') {
        URL.revokeObjectURL(faviconPreview);
      }
    };
  }, []);

  /**
   * Menyimpan pengaturan ke server
   * - Membuat FormData untuk upload file
   * - Mengirim data ke API
   * - Menampilkan notifikasi sukses/error
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Simpan file logo jika ada
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        
        const uploadResponse = await fetch('/api/upload/local', {
          method: 'POST',
          body: logoFormData
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error('Gagal mengunggah logo: ' + (errorData.error || 'Unknown error'));
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error('Gagal mengunggah logo: ' + (uploadResult.error || 'Unknown error'));
        }
        
        // Simpan path logo ke database
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'site.logo',
            value: uploadResult.fileUrl,
            type: 'STRING',
            category: 'SYSTEM',
            label: 'Logo Situs',
            description: 'Logo utama situs web',
            isPublic: true
          })
        });
      }
      
      // Simpan file favicon jika ada
      if (faviconFile) {
        const faviconFormData = new FormData();
        faviconFormData.append('file', faviconFile);
        
        const uploadResponse = await fetch('/api/upload/local', {
          method: 'POST',
          body: faviconFormData
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error('Gagal mengunggah favicon: ' + (errorData.error || 'Unknown error'));
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error('Gagal mengunggah favicon: ' + (uploadResult.error || 'Unknown error'));
        }
        
        // Simpan path favicon ke database
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'site.favicon',
            value: uploadResult.fileUrl,
            type: 'STRING',
            category: 'SYSTEM',
            label: 'Favicon',
            description: 'Ikon situs untuk browser tab',
            isPublic: true
          })
        });
      }
      
      // Simpan pengaturan sistem lainnya
      const systemSettingsToSave = [
        {
          key: 'site.name',
          value: settings.system.siteName,
          type: 'STRING',
          category: 'SYSTEM',
          label: 'Nama Situs',
          description: 'Nama utama situs web',
          isPublic: true
        },
        {
          key: 'site.description',
          value: settings.system.siteDescription,
          type: 'STRING',
          category: 'SYSTEM',
          label: 'Deskripsi Situs',
          description: 'Deskripsi singkat tentang situs',
          isPublic: true
        },
        {
          key: 'site.timezone',
          value: settings.system.timezone,
          type: 'STRING',
          category: 'SYSTEM',
          label: 'Zona Waktu',
          description: 'Zona waktu default situs',
          isPublic: true
        },
        {
          key: 'site.language',
          value: settings.system.language,
          type: 'STRING',
          category: 'SYSTEM',
          label: 'Bahasa',
          description: 'Bahasa default situs',
          isPublic: true
        },
        {
          key: 'site.maintenanceMode',
          value: settings.system.maintenanceMode ? 'true' : 'false',
          type: 'BOOLEAN',
          category: 'SYSTEM',
          label: 'Mode Maintenance',
          description: 'Status mode pemeliharaan situs',
          isPublic: true
        }
      ];
      
      // Simpan semua pengaturan sistem
      for (const setting of systemSettingsToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(setting)
        });
      }
      
      // Simpan pengaturan kontak
      const contactSettingsToSave = [
        {
          key: 'contact.address',
          value: settings.contact.address,
          type: 'STRING',
          category: 'CONTACT',
          label: 'Alamat',
          description: 'Alamat fisik lembaga',
          isPublic: true
        },
        {
          key: 'contact.phone',
          value: settings.contact.phone,
          type: 'STRING',
          category: 'CONTACT',
          label: 'Telepon',
          description: 'Nomor telepon lembaga',
          isPublic: true
        },
        {
          key: 'contact.email',
          value: settings.contact.email,
          type: 'STRING',
          category: 'CONTACT',
          label: 'Email',
          description: 'Alamat email kontak',
          isPublic: true
        },
        {
          key: 'contact.whatsapp',
          value: settings.contact.whatsapp,
          type: 'STRING',
          category: 'CONTACT',
          label: 'WhatsApp',
          description: 'Nomor WhatsApp untuk kontak',
          isPublic: true
        },
        {
          key: 'contact.operationalHours',
          value: settings.contact.operationalHours,
          type: 'STRING',
          category: 'CONTACT',
          label: 'Jam Operasional',
          description: 'Jam operasional lembaga',
          isPublic: true
        }
      ];
      
      // Simpan semua pengaturan kontak
      for (const setting of contactSettingsToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(setting)
        });
      }
      
      // Simpan pengaturan tentang TPQ
      const aboutSettingsToSave = [
        {
          key: 'about.vision',
          value: settings.about.vision,
          type: 'STRING',
          category: 'ABOUT',
          label: 'Visi',
          description: 'Visi lembaga',
          isPublic: true
        },
        {
          key: 'about.mission',
          value: settings.about.mission,
          type: 'STRING',
          category: 'ABOUT',
          label: 'Misi',
          description: 'Misi lembaga',
          isPublic: true
        },
        {
          key: 'about.history',
          value: settings.about.history,
          type: 'STRING',
          category: 'ABOUT',
          label: 'Sejarah',
          description: 'Sejarah singkat lembaga',
          isPublic: true
        },
        {
          key: 'about.values',
          value: settings.about.values,
          type: 'STRING',
          category: 'ABOUT',
          label: 'Nilai-nilai',
          description: 'Nilai-nilai yang dianut lembaga',
          isPublic: true
        },
        {
          key: 'about.achievements',
          value: settings.about.achievements,
          type: 'STRING',
          category: 'ABOUT',
          label: 'Prestasi',
          description: 'Prestasi yang telah dicapai',
          isPublic: true
        }
      ];
      
      // Simpan semua pengaturan tentang TPQ
      for (const setting of aboutSettingsToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(setting)
        });
      }
      
      // Simpan pengaturan integrasi
      const integrationSettingsToSave = [
        {
          key: 'integration.whatsapp.token',
          value: settings.integrations.whatsappToken || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'WhatsApp Token',
          description: 'Token API WhatsApp',
          isPublic: false
        },
        {
          key: 'integration.email.host',
          value: settings.integrations.emailHost || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'SMTP Host',
          description: 'Host server SMTP',
          isPublic: false
        },
        {
          key: 'integration.email.port',
          value: settings.integrations.emailPort || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'SMTP Port',
          description: 'Port server SMTP',
          isPublic: false
        },
        {
          key: 'integration.email.username',
          value: settings.integrations.emailUsername || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'Email Username',
          description: 'Username untuk autentikasi SMTP',
          isPublic: false
        },
        {
          key: 'integration.email.password',
          value: settings.integrations.emailPassword || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'Email Password',
          description: 'Password untuk autentikasi SMTP',
          isPublic: false
        },
        {
          key: 'integration.payment.gateway',
          value: settings.integrations.paymentGateway || '',
          type: 'STRING',
          category: 'INTEGRATION',
          label: 'Payment Gateway',
          description: 'Layanan payment gateway yang digunakan',
          isPublic: false
        }
      ];
      
      // Simpan semua pengaturan integrasi
      for (const setting of integrationSettingsToSave) {
        try {
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(setting)
          });
          
          if (!response.ok) {
            console.warn(`Failed to save setting ${setting.key}:`, await response.text());
          }
        } catch (err) {
          console.error(`Error saving setting ${setting.key}:`, err);
        }
      }
      
      // Refresh settings context untuk menerapkan perubahan
      await refreshSettings();
      
      // Dispatch event to notify that settings have been updated
      window.dispatchEvent(new Event('settings-updated'));
      
      toast.success('Pengaturan berhasil disimpan!');
      
      // Reload halaman setelah 1 detik untuk memastikan perubahan diterapkan
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-600">Kelola pengaturan sistem dan profil Anda</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Memuat pengaturan...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSelectedTab(tab.key)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            selectedTab === tab.key
                              ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
            {selectedTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profil Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.name}
                        onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.email}
                        onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.phone}
                        onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.profile.address}
                        onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={settings.profile.currentPassword}
                            onChange={(e) => handleInputChange('profile', 'currentPassword', e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.profile.newPassword}
                          onChange={(e) => handleInputChange('profile', 'newPassword', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.profile.confirmPassword}
                          onChange={(e) => handleInputChange('profile', 'confirmPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Notifikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Notifikasi Email', description: 'Terima notifikasi melalui email' },
                      { key: 'smsNotifications', label: 'Notifikasi SMS', description: 'Terima notifikasi melalui SMS' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Terima notifikasi push di browser' },
                      { key: 'weeklyReports', label: 'Laporan Mingguan', description: 'Terima laporan mingguan via email' },
                      { key: 'monthlyReports', label: 'Laporan Bulanan', description: 'Terima laporan bulanan via email' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications] || false}
                            onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'system' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Situs
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.siteName}
                        onChange={(e) => handleInputChange('system', 'siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zona Waktu
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.timezone}
                        onChange={(e) => handleInputChange('system', 'timezone', e.target.value)}
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bahasa
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.language}
                        onChange={(e) => handleInputChange('system', 'language', e.target.value)}
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                        <option value="ar">العربية (Arabic)</option>
                      </select>
                    </div>
                    
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Situs
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                          {logoFile && (
                            <button 
                              onClick={() => clearFileSelection('logo')}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                              type="button"
                              aria-label="Remove logo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            className="hidden"
                            id="logo-upload"
                            ref={logoInputRef}
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleLogoChange}
                          />
                          <label
                            htmlFor="logo-upload"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 inline-flex items-center text-sm"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {logoFile ? 'Ganti File' : 'Pilih File'}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Format: PNG, JPG. Ukuran maks: 2MB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Favicon Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                          <img 
                            src={faviconPreview} 
                            alt="Favicon Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                          {faviconFile && (
                            <button 
                              onClick={() => clearFileSelection('favicon')}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                              type="button"
                              aria-label="Remove favicon"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            className="hidden"
                            id="favicon-upload"
                            ref={faviconInputRef}
                            accept="image/x-icon,image/png"
                            onChange={handleFaviconChange}
                          />
                          <label
                            htmlFor="favicon-upload"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 inline-flex items-center text-sm"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {faviconFile ? 'Ganti File' : 'Pilih File'}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Format: ICO, PNG. Ukuran maks: 1MB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Situs
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.system.siteDescription}
                        onChange={(e) => handleInputChange('system', 'siteDescription', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Mode Maintenance</h4>
                        <p className="text-sm text-gray-500">Aktifkan untuk menonaktifkan sementara akses publik</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'integrations' && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrasi Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Integration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Token
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.integrations.whatsappToken}
                        onChange={(e) => handleInputChange('integrations', 'whatsappToken', e.target.value)}
                        placeholder="Masukkan WhatsApp API token"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.integrations.emailHost}
                          onChange={(e) => handleInputChange('integrations', 'emailHost', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.integrations.emailPort}
                          onChange={(e) => handleInputChange('integrations', 'emailPort', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Username
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.integrations.emailUsername}
                          onChange={(e) => handleInputChange('integrations', 'emailUsername', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={settings.integrations.emailPassword}
                          onChange={(e) => handleInputChange('integrations', 'emailPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'about' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tentang TPQ Baitus Shuffah</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visi
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.about.vision}
                        onChange={(e) => handleInputChange('about', 'vision', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Misi
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.about.mission}
                        onChange={(e) => handleInputChange('about', 'mission', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sejarah
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.about.history}
                        onChange={(e) => handleInputChange('about', 'history', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nilai-nilai
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.about.values}
                        onChange={(e) => handleInputChange('about', 'values', e.target.value)}
                        placeholder="Pisahkan dengan koma"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pisahkan dengan koma, contoh: Keikhlasan, Kesungguhan, Kemandirian
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prestasi
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.about.achievements}
                        onChange={(e) => handleInputChange('about', 'achievements', e.target.value)}
                        placeholder="Pisahkan dengan koma"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pisahkan dengan koma untuk setiap prestasi
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'contact' && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Lengkap
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.address}
                        onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.phone}
                        onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handphone/WhatsApp
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.mobile}
                        onChange={(e) => handleInputChange('contact', 'mobile', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.email}
                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp (untuk tombol chat)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.whatsapp}
                        onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.instagram}
                        onChange={(e) => handleInputChange('contact', 'instagram', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.facebook}
                        onChange={(e) => handleInputChange('contact', 'facebook', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.youtube}
                        onChange={(e) => handleInputChange('contact', 'youtube', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Operasional
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={settings.contact.operationalHours}
                        onChange={(e) => handleInputChange('contact', 'operationalHours', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Keamanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Pengaturan Keamanan</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Fitur keamanan lanjutan akan tersedia dalam update mendatang.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
