'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Image,
  MessageSquare
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  publishedAt: string;
  category: string;
  views: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
}

const NewsPage = () => {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          setNews(data.news);
        } else {
          throw new Error('Failed to fetch news');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
        
        // Fallback data
        setNews([
          {
            id: '1',
            title: 'Wisuda Hafidz Angkatan ke-15: 25 Santri Berhasil Menyelesaikan 30 Juz',
            excerpt: 'Alhamdulillah, pada hari Minggu kemarin telah dilaksanakan wisuda hafidz untuk 25 santri yang berhasil menyelesaikan hafalan 30 juz Al-Quran.',
            content: 'Lorem ipsum dolor sit amet...',
            image: '/news/wisuda-hafidz.jpg',
            author: 'Ustadz Ahmad Fauzi',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'PRESTASI',
            views: 1250,
            status: 'PUBLISHED',
            featured: true
          },
          {
            id: '2',
            title: 'Program Beasiswa Tahfidz untuk Keluarga Kurang Mampu',
            excerpt: 'Rumah Tahfidz Baitus Shuffah membuka program beasiswa penuh untuk 50 santri dari keluarga kurang mampu.',
            content: 'Lorem ipsum dolor sit amet...',
            image: '/news/beasiswa.jpg',
            author: 'Tim Admin',
            publishedAt: '2024-01-10T14:30:00Z',
            category: 'PENGUMUMAN',
            views: 890,
            status: 'PUBLISHED',
            featured: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleAddNews = () => {
    setShowAddModal(true);
  };

  const handleEditNews = (news: NewsItem) => {
    setCurrentNews(news);
    setShowEditModal(true);
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      return;
    }
    
    if (isDeleting) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Menghapus berita...');
      
      // For testing, let's try to use the test endpoint first
      const testResponse = await fetch('/api/news/test');
      const testData = await testResponse.json();
      console.log('News API test response:', testData);
      
      // Now try the actual delete
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', response.status);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Handle different response statuses
      if (response.status === 401) {
        toast.error('Anda tidak memiliki izin untuk menghapus berita');
        return;
      }
      
      if (response.status === 404) {
        toast.error('Berita tidak ditemukan');
        // Remove from local state anyway
        setNews(news.filter(item => item.id !== id));
        return;
      }
      
      // Parse response data
      let data;
      try {
        data = await response.json();
        console.log('Delete response data:', data);
      } catch (e) {
        console.error('Error parsing response:', e);
        if (response.ok) {
          // If status is OK but JSON parsing failed, consider it a success
          setNews(news.filter(item => item.id !== id));
          toast.success('Berita berhasil dihapus');
        } else {
          toast.error('Gagal menghapus berita. Respons server tidak valid.');
        }
        return;
      }
      
      if (response.ok) {
        // Update local state
        setNews(news.filter(item => item.id !== id));
        toast.success(data?.message || 'Berita berhasil dihapus');
        
        // Refresh the page to ensure we have the latest data
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        // Handle API error
        const errorMessage = data?.error || 'Failed to delete news';
        console.error('API error:', errorMessage);
        
        // Try fallback method
        console.log('Attempting fallback delete method...');
        try {
          const fallbackResponse = await fetch('/api/news/delete-fallback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
          });
          
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackResponse.ok && fallbackData.success) {
            // Update local state
            setNews(news.filter(item => item.id !== id));
            toast.success('Berita berhasil dihapus (menggunakan metode alternatif)');
            
            // Refresh the page to ensure we have the latest data
            setTimeout(() => {
              router.refresh();
            }, 1000);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback delete failed:', fallbackErr);
        }
        
        toast.error(`Gagal menghapus berita: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error deleting news:', err);
      toast.error('Gagal menghapus berita. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ['ALL', 'PRESTASI', 'PENGUMUMAN', 'KEGIATAN', 'FASILITAS'];
  const statuses = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

  // Form state for add/edit news
  const [formData, setFormData] = useState<{
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    featured: boolean;
  }>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'PENGUMUMAN',
    status: 'DRAFT',
    featured: false
  });

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (showAddModal) {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: 'PENGUMUMAN',
        status: 'DRAFT',
        featured: false
      });
    } else if (showEditModal && currentNews) {
      setFormData({
        title: currentNews.title,
        excerpt: currentNews.excerpt,
        content: currentNews.content,
        image: currentNews.image || '',
        category: currentNews.category,
        status: currentNews.status,
        featured: currentNews.featured
      });
    }
  }, [showAddModal, showEditModal, currentNews]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isEditing = showEditModal && currentNews;
      const url = isEditing ? `/api/news/${currentNews?.id}` : '/api/news';
      const method = isEditing ? 'PUT' : 'POST';
      
      const loadingToast = toast.loading(isEditing ? 'Menyimpan perubahan...' : 'Menambahkan berita baru...');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          author: 'Admin' // In a real app, get this from the logged-in user
        })
      });
      
      toast.dismiss(loadingToast);
      
      if (response.ok) {
        const data = await response.json();
        
        if (isEditing) {
          setNews(news.map(item => item.id === currentNews?.id ? { ...item, ...formData } : item));
          setShowEditModal(false);
          toast.success('Berita berhasil diperbarui');
        } else {
          setNews([{ ...data.news, id: data.news.id || Date.now().toString() }, ...news]);
          setShowAddModal(false);
          toast.success('Berita berhasil ditambahkan');
        }
        
        // Refresh the page to ensure we have the latest data
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save news');
      }
    } catch (err) {
      console.error('Error saving news:', err);
      toast.error(`Gagal menyimpan berita: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Berita
            </h1>
            <p className="text-gray-600">
              Kelola berita dan pengumuman
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddNews}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Berita
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari berita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'ALL' ? 'Semua Status' : status}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'ALL' ? 'Semua Kategori' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Berita</CardTitle>
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
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Tidak ada berita yang ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Judul
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penulis
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNews.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md">
                              {item.image && (
                                <Image className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.excerpt.substring(0, 60)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.author}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(item.publishedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1 text-gray-400" />
                            {item.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditNews(item)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Add/Edit News Modal would go here */}
        {/* For brevity, I'm not including the full modal implementation */}
        {/* In a real application, you would implement a form with fields for title, content, etc. */}
      </div>

      {/* Add News Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tambah Berita Baru</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitNews} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul berita"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Ringkasan singkat berita"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Isi berita lengkap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={6}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <Input
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="URL gambar (opsional)"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      {categories.filter(c => c !== 'ALL').map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      {statuses.filter(s => s !== 'ALL').map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Tampilkan sebagai berita unggulan
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    Simpan Berita
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit News Modal */}
      {showEditModal && currentNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Berita</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitNews} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul berita"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Ringkasan singkat berita"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Isi berita lengkap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={6}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                  <Input
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="URL gambar (opsional)"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      {categories.filter(c => c !== 'ALL').map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      {statuses.filter(s => s !== 'ALL').map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured-edit"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured-edit" className="ml-2 block text-sm text-gray-900">
                    Tampilkan sebagai berita unggulan
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NewsPage;