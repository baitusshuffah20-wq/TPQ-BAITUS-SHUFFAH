'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Star,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/testimonials');
        const data = await response.json();
        
        if (data.success) {
          setTestimonials(data.testimonials);
        } else {
          throw new Error('Failed to fetch testimonials');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        
        // Fallback data
        setTestimonials([
          {
            id: '1',
            authorName: 'Ahmad Fauzi',
            authorRole: 'SANTRI',
            content: 'Alhamdulillah, berkat bimbingan ustadz-ustadz yang sabar dan metode pembelajaran yang efektif, saya berhasil menyelesaikan hafalan 30 juz dalam waktu 2,5 tahun. Pengalaman yang sangat berharga dan mengubah hidup saya.',
            rating: 5,
            isApproved: true,
            isFeatured: true,
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            authorName: 'Siti Aisyah',
            authorRole: 'WALI',
            content: 'Anak saya sangat senang belajar di sini. Selain hafalan Al-Quran, akhlaknya juga semakin baik. Para ustadz sangat perhatian dan komunikatif dengan orang tua. Sistem pembelajaran yang modern namun tetap menjaga nilai-nilai tradisional.',
            rating: 5,
            isApproved: true,
            isFeatured: false,
            createdAt: '2024-01-10T14:30:00Z'
          },
          {
            id: '3',
            authorName: 'Muhammad Rizki',
            authorRole: 'SANTRI',
            content: 'Metode pembelajaran di sini sangat menyenangkan. Tidak membosankan dan mudah dipahami. Saya yang awalnya tidak bisa membaca Al-Quran dengan baik, sekarang sudah bisa dan sedang dalam proses menghafal.',
            rating: 4,
            isApproved: false,
            isFeatured: false,
            createdAt: '2024-01-05T09:15:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleAddTestimonial = () => {
    setShowAddModal(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setShowEditModal(true);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
      try {
        const response = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setTestimonials(testimonials.filter(item => item.id !== id));
        } else {
          throw new Error('Failed to delete testimonial');
        }
      } catch (err) {
        console.error('Error deleting testimonial:', err);
        alert('Gagal menghapus testimoni. Silakan coba lagi.');
      }
    }
  };

  const handleApproveTestimonial = async (id: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved: approve })
      });
      
      if (response.ok) {
        setTestimonials(testimonials.map(item => 
          item.id === id ? { ...item, isApproved: approve } : item
        ));
      } else {
        throw new Error(`Failed to ${approve ? 'approve' : 'reject'} testimonial`);
      }
    } catch (err) {
      console.error(`Error ${approve ? 'approving' : 'rejecting'} testimonial:`, err);
      alert(`Gagal ${approve ? 'menyetujui' : 'menolak'} testimoni. Silakan coba lagi.`);
    }
  };

  const handleFeatureTestimonial = async (id: string, feature: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: feature })
      });
      
      if (response.ok) {
        setTestimonials(testimonials.map(item => 
          item.id === id ? { ...item, isFeatured: feature } : item
        ));
      } else {
        throw new Error(`Failed to ${feature ? 'feature' : 'unfeature'} testimonial`);
      }
    } catch (err) {
      console.error(`Error ${feature ? 'featuring' : 'unfeaturing'} testimonial:`, err);
      alert(`Gagal ${feature ? 'menampilkan' : 'menyembunyikan'} testimoni. Silakan coba lagi.`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'SANTRI':
        return 'Santri';
      case 'WALI':
        return 'Wali Santri';
      case 'ALUMNI':
        return 'Alumni';
      default:
        return role;
    }
  };

  const filteredTestimonials = testimonials.filter(item => {
    const matchesSearch = item.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'APPROVED' && item.isApproved) ||
                         (statusFilter === 'PENDING' && !item.isApproved) ||
                         (statusFilter === 'FEATURED' && item.isFeatured);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Testimoni
            </h1>
            <p className="text-gray-600">
              Kelola testimoni dari santri, wali, dan alumni
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddTestimonial}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Testimoni
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari testimoni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="PENDING">Menunggu Persetujuan</option>
                  <option value="FEATURED">Ditampilkan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Testimoni</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Tidak ada testimoni yang ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map((item) => (
                  <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    item.isFeatured ? 'ring-2 ring-teal-500' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                            <span className="font-bold text-teal-600">
                              {item.authorName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.authorName}</div>
                            <div className="text-sm text-gray-600">{formatRole(item.authorRole)}</div>
                          </div>
                        </div>
                        <div className="flex">
                          {item.isApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex mb-3">
                        {renderStars(item.rating)}
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        "{item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}"
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="flex space-x-2">
                          {!item.isApproved ? (
                            <button
                              onClick={() => handleApproveTestimonial(item.id, true)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveTestimonial(item.id, false)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Unapprove"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleFeatureTestimonial(item.id, !item.isFeatured)}
                            className={`${item.isFeatured ? 'text-teal-600 hover:text-teal-900' : 'text-gray-600 hover:text-gray-900'}`}
                            title={item.isFeatured ? "Unfeature" : "Feature"}
                          >
                            <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleEditTestimonial(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Testimonial Modal would go here */}
        {/* For brevity, I'm not including the full modal implementation */}
        {/* In a real application, you would implement a form with fields for author, content, etc. */}
      </div>
    </DashboardLayout>
  );
};

export default TestimonialsPage;