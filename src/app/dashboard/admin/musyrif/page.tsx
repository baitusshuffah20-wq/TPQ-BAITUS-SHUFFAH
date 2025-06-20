'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/components/providers/AuthProvider';
import AddMusyrifModal from '@/components/modals/AddMusyrifModal';
import MusyrifDetailModal from '@/components/modals/MusyrifDetailModal';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  User,
  Users,
  BookOpen,
  GraduationCap,
  Briefcase,
  FileText,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

const MusyrifPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMusyrif, setEditingMusyrif] = useState<any>(null);
  const [selectedMusyrif, setSelectedMusyrif] = useState<any>(null);
  const [musyrifList, setMusyrifList] = useState<any[]>([]);
  const [halaqahList, setHalaqahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Load musyrif and halaqah data
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadMusyrifData();
      loadHalaqahData();
    }
  }, [user]);

  const loadMusyrifData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching musyrif data from API...');
      const response = await fetch('/api/musyrif', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Process the data to ensure it has the expected format
        const processedData = data.musyrif.map((m: any) => {
          console.log('Processing musyrif data:', m.id, m.name);
          
          // Ensure education, experience, and certificates are arrays
          const education = Array.isArray(m.education) ? m.education : [];
          const experience = Array.isArray(m.experience) ? m.experience : [];
          const certificates = Array.isArray(m.certificates) ? m.certificates : [];
          
          console.log('Education:', education);
          console.log('Experience:', experience);
          console.log('Certificates:', certificates);
          
          // Ensure dates are properly formatted
          const birthDate = m.birthDate ? new Date(m.birthDate).toISOString() : null;
          const joinDate = m.joinDate ? new Date(m.joinDate).toISOString() : null;
          const createdAt = m.createdAt ? new Date(m.createdAt).toISOString() : null;
          const updatedAt = m.updatedAt ? new Date(m.updatedAt).toISOString() : null;
          
          return {
            ...m,
            education,
            experience,
            certificates,
            birthDate,
            joinDate,
            createdAt,
            updatedAt
          };
        });
        
        setMusyrifList(processedData);
        console.log('Loaded musyrif data:', processedData);
      } else {
        console.error('Failed to load musyrif data:', data.message);
        // Fallback to mock data if API fails
        console.log('Using mock data as fallback');
        setMusyrifList(getMockMusyrifData());
      }
    } catch (error) {
      console.error('Error loading musyrif data:', error);
      // Fallback to mock data if API fails
      console.log('Using mock data as fallback due to error');
      setMusyrifList(getMockMusyrifData());
    } finally {
      setLoading(false);
    }
  };

  const loadHalaqahData = async () => {
    try {
      console.log('Fetching halaqah data from API...');
      const response = await fetch('/api/halaqah', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Process the data to ensure it has the expected format
        const processedData = data.halaqah.map((h: any) => ({
          id: h.id,
          name: h.name,
          level: h.level,
          description: h.description,
          capacity: h.capacity,
          status: h.status,
          musyrifId: h.musyrifId,
          musyrif: h.musyrif ? {
            id: h.musyrif.id,
            name: h.musyrif.name,
            email: h.musyrif.email,
            phone: h.musyrif.phone
          } : null,
          santriCount: h._count?.santri || 0,
          schedules: h.schedules || []
        }));
        
        setHalaqahList(processedData);
        console.log('Loaded halaqah data:', processedData);
      } else {
        console.error('Failed to load halaqah data:', data.message);
        // Fallback to mock data if API fails
        console.log('Using mock data as fallback');
        setHalaqahList([
          { id: 'cmbvv5cd200146c3r9cwtdy30', name: 'Halaqah Al-Fatihah', level: 'Pemula', description: 'Halaqah untuk santri pemula yang baru belajar membaca Al-Quran', capacity: 15, status: 'ACTIVE', musyrifId: 'cmbvv5c5e00046c3r824vi1bl', musyrif: { id: 'cmbvv5c5e00046c3r824vi1bl', name: 'Ustadz Abdullah', email: 'ustadz.abdullah@rumahtahfidz.com', phone: '081234567891' }, santriCount: 1, schedules: [] },
          { id: 'cmbvv5cd200136c3rl0j1nvbb', name: 'Halaqah Al-Baqarah', level: 'Menengah', description: 'Halaqah untuk santri menengah yang sudah lancar membaca Al-Quran', capacity: 20, status: 'ACTIVE', musyrifId: 'cmbvv5c5p00066c3rfbrxeqrn', musyrif: { id: 'cmbvv5c5p00066c3rfbrxeqrn', name: 'Ustadz Ahmad', email: 'ustadz.ahmad@rumahtahfidz.com', phone: '081234567892' }, santriCount: 1, schedules: [] },
          { id: 'cmbvv5cd200126c3r1x0pu4dr', name: 'Halaqah Tahfidz 5 Juz', level: 'Tahfidz 5 Juz', description: 'Halaqah khusus untuk santri yang ingin menghafal 5 juz pertama', capacity: 12, status: 'ACTIVE', musyrifId: 'cmbvv5cct000y6c3r52d2ye2s', musyrif: { id: 'cmbvv5cct000y6c3r52d2ye2s', name: 'Ustadz Rahman', email: 'ustadz.rahman@rumahtahfidz.com', phone: '081234567893' }, santriCount: 1, schedules: [] }
        ]);
      }
    } catch (error) {
      console.error('Error loading halaqah data:', error);
      // Fallback to mock data if API fails
      console.log('Using mock data as fallback due to error');
      setHalaqahList([
        { id: 'cmbvv5cd200146c3r9cwtdy30', name: 'Halaqah Al-Fatihah', level: 'Pemula', description: 'Halaqah untuk santri pemula yang baru belajar membaca Al-Quran', capacity: 15, status: 'ACTIVE', musyrifId: 'cmbvv5c5e00046c3r824vi1bl', musyrif: { id: 'cmbvv5c5e00046c3r824vi1bl', name: 'Ustadz Abdullah', email: 'ustadz.abdullah@rumahtahfidz.com', phone: '081234567891' }, santriCount: 1, schedules: [] },
        { id: 'cmbvv5cd200136c3rl0j1nvbb', name: 'Halaqah Al-Baqarah', level: 'Menengah', description: 'Halaqah untuk santri menengah yang sudah lancar membaca Al-Quran', capacity: 20, status: 'ACTIVE', musyrifId: 'cmbvv5c5p00066c3rfbrxeqrn', musyrif: { id: 'cmbvv5c5p00066c3rfbrxeqrn', name: 'Ustadz Ahmad', email: 'ustadz.ahmad@rumahtahfidz.com', phone: '081234567892' }, santriCount: 1, schedules: [] },
        { id: 'cmbvv5cd200126c3r1x0pu4dr', name: 'Halaqah Tahfidz 5 Juz', level: 'Tahfidz 5 Juz', description: 'Halaqah khusus untuk santri yang ingin menghafal 5 juz pertama', capacity: 12, status: 'ACTIVE', musyrifId: 'cmbvv5cct000y6c3r52d2ye2s', musyrif: { id: 'cmbvv5cct000y6c3r52d2ye2s', name: 'Ustadz Rahman', email: 'ustadz.rahman@rumahtahfidz.com', phone: '081234567893' }, santriCount: 1, schedules: [] }
      ]);
    }
  };

  const getMockMusyrifData = () => {
    return [
      {
        id: '1',
        userId: 'user1',
        name: 'Ustadz Abdullah',
        gender: 'MALE',
        birthDate: '1985-05-15',
        birthPlace: 'Jakarta',
        address: 'Jl. Masjid No. 123, Jakarta Selatan',
        phone: '081234567891',
        email: 'ustadz.abdullah@rumahtahfidz.com',
        education: [
          {
            id: 'edu1',
            institution: 'Universitas Al-Azhar Indonesia',
            degree: 'S1 Pendidikan Agama Islam',
            year: '2007',
            description: 'Lulus dengan predikat cumlaude'
          },
          {
            id: 'edu2',
            institution: 'Pondok Pesantren Modern Darussalam Gontor',
            degree: 'Pendidikan Pesantren',
            year: '2003',
            description: 'Fokus pada tahfidz Al-Quran'
          }
        ],
        experience: [
          {
            id: 'exp1',
            position: 'Guru Tahfidz',
            organization: 'Pesantren Tahfidz Al-Hikmah',
            startDate: '2008-01-01',
            endDate: '2015-12-31',
            description: 'Mengajar tahfidz untuk santri tingkat menengah'
          },
          {
            id: 'exp2',
            position: 'Imam Masjid',
            organization: 'Masjid Jami Al-Hidayah',
            startDate: '2016-01-01',
            endDate: null,
            description: 'Menjadi imam dan mengajar kajian rutin'
          }
        ],
        certificates: [
          {
            id: 'cert1',
            name: 'Sertifikat Tahfidz 30 Juz',
            issuer: 'Lembaga Tahfidz Indonesia',
            issueDate: '2005-06-10',
            description: 'Sertifikasi hafalan Al-Quran 30 juz',
            documentUrl: '/documents/cert1.pdf'
          },
          {
            id: 'cert2',
            name: 'Sertifikat Pendidik Profesional',
            issuer: 'Kementerian Pendidikan',
            issueDate: '2010-08-15',
            description: 'Sertifikasi kompetensi pendidik',
            documentUrl: '/documents/cert2.pdf'
          }
        ],
        specialization: 'Tahfidz Al-Quran',
        joinDate: '2020-01-15',
        status: 'ACTIVE',
        photo: '/images/musyrif/abdullah.jpg',
        halaqahId: '1',
        halaqah: {
          id: '1',
          name: 'Halaqah Al-Fatihah',
          level: 'Pemula'
        },
        createdAt: '2020-01-15T08:00:00Z',
        updatedAt: '2023-05-20T10:30:00Z'
      },
      {
        id: '2',
        userId: 'user2',
        name: 'Ustadz Ahmad',
        gender: 'MALE',
        birthDate: '1987-06-18',
        birthPlace: 'Surabaya',
        address: 'Jl. Pesantren No. 45, Surabaya',
        phone: '081234567892',
        email: 'ustadz.ahmad@rumahtahfidz.com',
        education: [
          {
            id: 'edu3',
            institution: 'Universitas Islam Negeri Sunan Ampel',
            degree: 'S1 Ilmu Al-Quran dan Tafsir',
            year: '2010',
            description: 'Fokus pada metodologi pengajaran Al-Quran'
          }
        ],
        experience: [
          {
            id: 'exp3',
            position: 'Guru Tahsin',
            organization: 'TPQ Nurul Iman',
            startDate: '2010-08-01',
            endDate: '2018-12-31',
            description: 'Mengajar tahsin untuk anak-anak dan remaja'
          }
        ],
        certificates: [
          {
            id: 'cert3',
            name: 'Sertifikat Metode Tilawati',
            issuer: 'Pesantren Tilawati Pusat',
            issueDate: '2011-03-22',
            description: 'Sertifikasi pengajaran metode tilawati',
            documentUrl: '/documents/cert3.pdf'
          }
        ],
        specialization: 'Tahsin dan Tajwid',
        joinDate: '2020-02-10',
        status: 'ACTIVE',
        photo: '/images/musyrif/ahmad.jpg',
        halaqahId: '2',
        halaqah: {
          id: '2',
          name: 'Halaqah Al-Baqarah',
          level: 'Menengah'
        },
        createdAt: '2020-02-10T08:00:00Z',
        updatedAt: '2023-06-15T09:45:00Z'
      },
      {
        id: '3',
        userId: 'user3',
        name: 'Ustadz Rahman',
        gender: 'MALE',
        birthDate: '1988-11-05',
        birthPlace: 'Surabaya',
        address: 'Jl. Kyai No. 78, Surabaya',
        phone: '081234567893',
        email: 'ustadz.rahman@rumahtahfidz.com',
        education: [
          {
            id: 'edu4',
            institution: 'Universitas Islam Negeri Sunan Ampel',
            degree: 'S2 Studi Islam',
            year: '2015',
            description: 'Tesis tentang metodologi pengajaran Al-Quran kontemporer'
          },
          {
            id: 'edu5',
            institution: 'Pondok Pesantren Tebuireng',
            degree: 'Pendidikan Pesantren',
            year: '2006',
            description: 'Fokus pada ilmu hadits'
          }
        ],
        experience: [
          {
            id: 'exp4',
            position: 'Dosen',
            organization: 'STIQ Islamic Centre',
            startDate: '2015-09-01',
            endDate: '2020-08-31',
            description: 'Mengajar mata kuliah Ulumul Quran'
          }
        ],
        certificates: [
          {
            id: 'cert4',
            name: 'Sertifikat Sanad Qiraah Ashim',
            issuer: 'Lembaga Qiraah Indonesia',
            issueDate: '2010-11-30',
            description: 'Sertifikasi sanad qiraah riwayat Hafs',
            documentUrl: '/documents/cert4.pdf'
          }
        ],
        specialization: 'Qiraah dan Tafsir',
        joinDate: '2021-01-05',
        status: 'ACTIVE',
        photo: '/images/musyrif/rahman.jpg',
        halaqahId: '3',
        halaqah: {
          id: '3',
          name: 'Halaqah Tahfidz 5 Juz',
          level: 'Tahfidz 5 Juz'
        },
        createdAt: '2021-01-05T08:00:00Z',
        updatedAt: '2023-07-10T11:20:00Z'
      }
    ];
  };

  const handleCreateMusyrif = async (musyrifData: any) => {
    try {
      // Prepare data for API
      const apiData = {
        ...musyrifData,
        // Convert arrays to JSON strings for API
        education: musyrifData.education || [],
        experience: musyrifData.experience || [],
        certificates: musyrifData.certificates || []
      };
      
      const response = await fetch('/api/musyrif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Process the returned data to ensure it has the expected format
        const processedMusyrif = {
          ...data.musyrif,
          education: Array.isArray(data.musyrif.education) ? data.musyrif.education : [],
          experience: Array.isArray(data.musyrif.experience) ? data.musyrif.experience : [],
          certificates: Array.isArray(data.musyrif.certificates) ? data.musyrif.certificates : [],
          // Ensure dates are properly formatted
          birthDate: data.musyrif.birthDate ? new Date(data.musyrif.birthDate).toISOString() : null,
          joinDate: data.musyrif.joinDate ? new Date(data.musyrif.joinDate).toISOString() : null,
          createdAt: data.musyrif.createdAt ? new Date(data.musyrif.createdAt).toISOString() : null,
          updatedAt: data.musyrif.updatedAt ? new Date(data.musyrif.updatedAt).toISOString() : null
        };
        
        setMusyrifList(prev => [...prev, processedMusyrif]);
        alert('Musyrif berhasil ditambahkan!');
      } else {
        // If API fails, add to local state for demo
        const selectedHalaqah = halaqahList.find(h => h.id === musyrifData.halaqahId);
        const newMusyrif = {
          ...musyrifData,
          id: `musyrif_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          halaqah: selectedHalaqah || null
        };
        setMusyrifList(prev => [...prev, newMusyrif]);
        alert('Musyrif berhasil ditambahkan! (Mode demo)');
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating musyrif:', error);
      
      // Fallback for demo
      const selectedHalaqah = halaqahList.find(h => h.id === musyrifData.halaqahId);
      const newMusyrif = {
        ...musyrifData,
        id: `musyrif_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        halaqah: selectedHalaqah || null
      };
      setMusyrifList(prev => [...prev, newMusyrif]);
      alert('Musyrif berhasil ditambahkan! (Mode demo)');
      setShowAddModal(false);
    }
  };

  const handleUpdateMusyrif = async (musyrifData: any) => {
    try {
      // Prepare data for API
      const apiData = {
        ...musyrifData,
        // Convert arrays to JSON strings for API
        education: musyrifData.education || [],
        experience: musyrifData.experience || [],
        certificates: musyrifData.certificates || []
      };
      
      const response = await fetch(`/api/musyrif/${musyrifData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Process the returned data to ensure it has the expected format
        const processedMusyrif = {
          ...data.musyrif,
          education: Array.isArray(data.musyrif.education) ? data.musyrif.education : [],
          experience: Array.isArray(data.musyrif.experience) ? data.musyrif.experience : [],
          certificates: Array.isArray(data.musyrif.certificates) ? data.musyrif.certificates : [],
          // Ensure dates are properly formatted
          birthDate: data.musyrif.birthDate ? new Date(data.musyrif.birthDate).toISOString() : null,
          joinDate: data.musyrif.joinDate ? new Date(data.musyrif.joinDate).toISOString() : null,
          createdAt: data.musyrif.createdAt ? new Date(data.musyrif.createdAt).toISOString() : null,
          updatedAt: data.musyrif.updatedAt ? new Date(data.musyrif.updatedAt).toISOString() : null
        };
        
        setMusyrifList(prev => prev.map(m => m.id === musyrifData.id ? processedMusyrif : m));
        alert('Data musyrif berhasil diperbarui!');
      } else {
        // If API fails, update local state for demo
        const selectedHalaqah = halaqahList.find(h => h.id === musyrifData.halaqahId);
        setMusyrifList(prev => prev.map(m => 
          m.id === editingMusyrif?.id ? { 
            ...musyrifData, 
            updatedAt: new Date().toISOString(),
            halaqah: selectedHalaqah || null
          } : m
        ));
        alert('Data musyrif berhasil diperbarui! (Mode demo)');
      }
      
      setEditingMusyrif(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating musyrif:', error);
      
      // Fallback for demo
      const selectedHalaqah = halaqahList.find(h => h.id === musyrifData.halaqahId);
      setMusyrifList(prev => prev.map(m => 
        m.id === editingMusyrif?.id ? { 
          ...musyrifData, 
          updatedAt: new Date().toISOString(),
          halaqah: selectedHalaqah || null
        } : m
      ));
      alert('Data musyrif berhasil diperbarui! (Mode demo)');
      setEditingMusyrif(null);
      setShowAddModal(false);
    }
  };

  const handleDeleteMusyrif = async (musyrifId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data musyrif ini?')) return;

    try {
      const response = await fetch(`/api/musyrif/${musyrifId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setMusyrifList(prev => prev.filter(m => m.id !== musyrifId));
        alert('Musyrif berhasil dihapus!');
      } else {
        // If API fails, remove from local state for demo
        setMusyrifList(prev => prev.filter(m => m.id !== musyrifId));
        alert('Musyrif berhasil dihapus! (Mode demo)');
      }
      
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting musyrif:', error);
      
      // Fallback for demo
      setMusyrifList(prev => prev.filter(m => m.id !== musyrifId));
      alert('Musyrif berhasil dihapus! (Mode demo)');
      setShowDetailModal(false);
    }
  };

  const handleViewDetail = (musyrif: any) => {
    setSelectedMusyrif(musyrif);
    setShowDetailModal(true);
  };

  const handleEditMusyrif = (musyrif: any) => {
    setEditingMusyrif(musyrif);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  // Filter musyrif data
  const filteredMusyrif = musyrifList.filter(musyrif => {
    const matchesSearch = musyrif.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musyrif.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musyrif.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musyrif.halaqah?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || musyrif.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman musyrif...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not admin, don't render anything (redirect will happen)
  if (user.role !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data musyrif...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Musyrif
            </h1>
            <p className="text-gray-600">
              Kelola data musyrif dan pembimbing halaqah
            </p>
          </div>
          <Button onClick={() => {
            setEditingMusyrif(null);
            setShowAddModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Musyrif
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari musyrif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                  <option value="ON_LEAVE">Cuti</option>
                </select>
              </div>
              <div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Musyrif List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Musyrif</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMusyrif.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data musyrif</h3>
                <p className="text-gray-600 mb-6">Tambahkan musyrif baru untuk mulai mengelola data musyrif.</p>
                <Button onClick={() => {
                  setEditingMusyrif(null);
                  setShowAddModal(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Musyrif
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase">
                    <tr>
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Halaqah</th>
                      <th className="py-3 px-4">Spesialisasi</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMusyrif.map((musyrif) => (
                      <tr key={musyrif.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                              {musyrif.photo ? (
                                <img src={musyrif.photo} alt={musyrif.name} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-5 w-5 text-teal-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{musyrif.name}</div>
                              <div className="text-gray-500 text-xs">{musyrif.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-teal-600 mr-2" />
                            <span>{musyrif.halaqah?.name || 'Belum ada halaqah'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 text-teal-600 mr-2" />
                            <span>{musyrif.specialization || 'Umum'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs">
                              <Phone className="h-3 w-3 text-gray-500 mr-1" />
                              <span>{musyrif.phone}</span>
                            </div>
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 text-gray-500 mr-1" />
                              <span>{musyrif.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            musyrif.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            musyrif.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                            musyrif.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {musyrif.status === 'ACTIVE' ? 'Aktif' :
                             musyrif.status === 'INACTIVE' ? 'Tidak Aktif' :
                             musyrif.status === 'ON_LEAVE' ? 'Cuti' : musyrif.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(musyrif)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Detail
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMusyrif(musyrif)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMusyrif(musyrif.id)}
                              className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {showAddModal && (
          <AddMusyrifModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingMusyrif(null);
            }}
            onSave={editingMusyrif ? handleUpdateMusyrif : handleCreateMusyrif}
            editData={editingMusyrif}
            halaqahList={halaqahList}
          />
        )}

        {showDetailModal && selectedMusyrif && (
          <MusyrifDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            onEdit={() => handleEditMusyrif(selectedMusyrif)}
            onDelete={() => handleDeleteMusyrif(selectedMusyrif.id)}
            musyrif={selectedMusyrif}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MusyrifPage;