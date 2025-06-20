'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  Upload,
  Save,
  Edit,
  Eye,
  Image,
  FileText,
  Settings,
  Info,
  Target,
  History
} from 'lucide-react';

const InstitutionSettingsPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [institutionData, setInstitutionData] = useState({
    basic: {
      name: 'TPQ Baitus Shuffah',
      shortName: 'TPQ BS',
      description: 'Lembaga Pendidikan Tahfidz Al-Quran',
      established: '2020',
      type: 'Lembaga Pendidikan Islam',
      accreditation: 'A',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    contact: {
      address: 'Jl. Masjid Raya No. 123, Jakarta Selatan',
      phone: '+62 21 1234 5678',
      whatsapp: '+62 812 3456 7890',
      email: 'info@tpqbaitusshuffah.com',
      website: 'https://tpqbaitusshuffah.com',
      socialMedia: {
        facebook: 'https://facebook.com/tpqbaitusshuffah',
        instagram: 'https://instagram.com/tpqbaitusshuffah',
        youtube: 'https://youtube.com/@tpqbaitusshuffah'
      }
    },
    content: {
      vision: 'Menjadi lembaga pendidikan tahfidz Al-Quran terdepan yang mencetak generasi Qurani yang berakhlak mulia.',
      mission: [
        'Menyelenggarakan pendidikan tahfidz Al-Quran yang berkualitas',
        'Membentuk karakter santri yang berakhlak mulia',
        'Mengembangkan potensi santri secara optimal',
        'Menciptakan lingkungan belajar yang kondusif'
      ],
      history: 'TPQ Baitus Shuffah didirikan pada tahun 2020 dengan visi menjadi lembaga pendidikan tahfidz terdepan. Dimulai dengan 20 santri, kini telah berkembang menjadi lembaga yang dipercaya oleh ratusan keluarga.',
      facilities: [
        'Ruang kelas ber-AC',
        'Perpustakaan Al-Quran',
        'Masjid untuk sholat berjamaah',
        'Kantin sehat',
        'Area bermain anak'
      ],
      programs: [
        'Tahfidz Al-Quran',
        'Tahsin Al-Quran',
        'Kajian Tafsir',
        'Pendidikan Akhlak',
        'Kegiatan Ekstrakurikuler'
      ]
    },
    operational: {
      operatingHours: {
        weekdays: '07:00 - 17:00',
        saturday: '07:00 - 15:00',
        sunday: 'Tutup'
      },
      academicYear: '2024/2025',
      semester: 'Ganjil',
      totalStudents: 250,
      totalTeachers: 15,
      totalClasses: 12
    }
  });

  const tabs = [
    { key: 'basic', label: 'Informasi Dasar', icon: Building },
    { key: 'contact', label: 'Kontak', icon: Phone },
    { key: 'content', label: 'Konten', icon: FileText },
    { key: 'branding', label: 'Branding', icon: Image },
    { key: 'operational', label: 'Operasional', icon: Settings }
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setInstitutionData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, parentField: string, field: string, value: any) => {
    setInstitutionData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [parentField]: {
          ...(prev[section as keyof typeof prev] as any)[parentField],
          [field]: value
        }
      }
    }));
  };

  const handleArrayInputChange = (section: string, field: string, index: number, value: string) => {
    setInstitutionData(prev => {
      const newArray = [...((prev[section as keyof typeof prev] as any)[field] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section: string, field: string) => {
    setInstitutionData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: [...((prev[section as keyof typeof prev] as any)[field] || []), '']
      }
    }));
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setInstitutionData(prev => {
      const newArray = [...((prev[section as keyof typeof prev] as any)[field] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newArray
        }
      };
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Here you would typically call an API
      alert('Pengaturan lembaga berhasil disimpan!');
      setIsEditing(false);
    } catch (error) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    try {
      // Here you would typically upload to server
      alert('Logo berhasil diupload!');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      alert('Gagal upload logo');
    }
  };

  const handleUploadFavicon = async () => {
    if (!faviconFile) return;
    try {
      // Here you would typically upload to server
      alert('Favicon berhasil diupload!');
      setFaviconFile(null);
      setFaviconPreview(null);
    } catch (error) {
      alert('Gagal upload favicon');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Lembaga</h1>
            <p className="text-gray-600">Kelola informasi dan pengaturan lembaga</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Pengaturan
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            )}
          </div>
        </div>

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

            {/* Institution Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    {logoPreview || institutionData.basic.logo ? (
                      <img 
                        src={logoPreview || institutionData.basic.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-teal-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{institutionData.basic.name}</h3>
                  <p className="text-xs text-gray-500">{institutionData.basic.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {selectedTab === 'basic' && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lembaga
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.basic.name}
                          onChange={(e) => handleInputChange('basic', 'name', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.basic.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Singkat
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.basic.shortName}
                          onChange={(e) => handleInputChange('basic', 'shortName', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.basic.shortName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun Berdiri
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.basic.established}
                          onChange={(e) => handleInputChange('basic', 'established', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.basic.established}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Lembaga
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.basic.type}
                          onChange={(e) => handleInputChange('basic', 'type', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.basic.type}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Akreditasi
                      </label>
                      {isEditing ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.basic.accreditation}
                          onChange={(e) => handleInputChange('basic', 'accreditation', e.target.value)}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{institutionData.basic.accreditation}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={institutionData.basic.description}
                        onChange={(e) => handleInputChange('basic', 'description', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{institutionData.basic.description}</p>
                    )}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.contact.phone}
                          onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.contact.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.contact.whatsapp}
                          onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.contact.whatsapp}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.contact.email}
                          onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.contact.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.contact.website}
                          onChange={(e) => handleInputChange('contact', 'website', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.contact.website}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={institutionData.contact.address}
                        onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{institutionData.contact.address}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Media Sosial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.contact.socialMedia.facebook}
                            onChange={(e) => handleNestedInputChange('contact', 'socialMedia', 'facebook', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.contact.socialMedia.facebook}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.contact.socialMedia.instagram}
                            onChange={(e) => handleNestedInputChange('contact', 'socialMedia', 'instagram', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.contact.socialMedia.instagram}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          YouTube
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.contact.socialMedia.youtube}
                            onChange={(e) => handleNestedInputChange('contact', 'socialMedia', 'youtube', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.contact.socialMedia.youtube}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'content' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visi & Misi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visi
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.content.vision}
                          onChange={(e) => handleInputChange('content', 'vision', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.content.vision}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Misi
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {institutionData.content.mission.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={item}
                                onChange={(e) => handleArrayInputChange('content', 'mission', index, e.target.value)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('content', 'mission', index)}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('content', 'mission')}
                          >
                            Tambah Misi
                          </Button>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {institutionData.content.mission.map((item, index) => (
                            <li key={index} className="text-gray-900">{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sejarah</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <textarea
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={institutionData.content.history}
                        onChange={(e) => handleInputChange('content', 'history', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{institutionData.content.history}</p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fasilitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-2">
                          {institutionData.content.facilities.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={item}
                                onChange={(e) => handleArrayInputChange('content', 'facilities', index, e.target.value)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('content', 'facilities', index)}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('content', 'facilities')}
                          >
                            Tambah Fasilitas
                          </Button>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {institutionData.content.facilities.map((item, index) => (
                            <li key={index} className="text-gray-900">{item}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Program</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-2">
                          {institutionData.content.programs.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={item}
                                onChange={(e) => handleArrayInputChange('content', 'programs', index, e.target.value)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('content', 'programs', index)}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('content', 'programs')}
                          >
                            Tambah Program
                          </Button>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {institutionData.content.programs.map((item, index) => (
                            <li key={index} className="text-gray-900">{item}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === 'branding' && (
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Lembaga
                      </label>
                      <div className="space-y-4">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {logoPreview || institutionData.basic.logo ? (
                            <img
                              src={logoPreview || institutionData.basic.logo}
                              alt="Logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        {isEditing && (
                          <div className="space-y-2">
                            <label className="block">
                              <span className="sr-only">Pilih logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                              />
                            </label>
                            {logoFile && (
                              <Button size="sm" onClick={handleUploadLogo}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon
                      </label>
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {faviconPreview || institutionData.basic.favicon ? (
                            <img
                              src={faviconPreview || institutionData.basic.favicon}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Globe className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        {isEditing && (
                          <div className="space-y-2">
                            <label className="block">
                              <span className="sr-only">Pilih favicon</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFaviconChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                              />
                            </label>
                            {faviconFile && (
                              <Button size="sm" onClick={handleUploadFavicon}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Favicon
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Panduan Upload</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Logo: Ukuran minimal 200x200px, format PNG/JPG</li>
                      <li>• Favicon: Ukuran 32x32px atau 64x64px, format ICO/PNG</li>
                      <li>• Maksimal ukuran file: 2MB</li>
                      <li>• Gunakan background transparan untuk hasil terbaik</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === 'operational' && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Operasional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun Akademik
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.operational.academicYear}
                          onChange={(e) => handleInputChange('operational', 'academicYear', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900">{institutionData.operational.academicYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      {isEditing ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          value={institutionData.operational.semester}
                          onChange={(e) => handleInputChange('operational', 'semester', e.target.value)}
                        >
                          <option value="Ganjil">Ganjil</option>
                          <option value="Genap">Genap</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{institutionData.operational.semester}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Jam Operasional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senin - Jumat
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.operational.operatingHours.weekdays}
                            onChange={(e) => handleNestedInputChange('operational', 'operatingHours', 'weekdays', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.operational.operatingHours.weekdays}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sabtu
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.operational.operatingHours.saturday}
                            onChange={(e) => handleNestedInputChange('operational', 'operatingHours', 'saturday', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.operational.operatingHours.saturday}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minggu
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={institutionData.operational.operatingHours.sunday}
                            onChange={(e) => handleNestedInputChange('operational', 'operatingHours', 'sunday', e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900">{institutionData.operational.operatingHours.sunday}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Statistik</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{institutionData.operational.totalStudents}</p>
                        <p className="text-sm text-gray-600">Total Santri</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{institutionData.operational.totalTeachers}</p>
                        <p className="text-sm text-gray-600">Total Musyrif</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{institutionData.operational.totalClasses}</p>
                        <p className="text-sm text-gray-600">Total Halaqah</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstitutionSettingsPage;
