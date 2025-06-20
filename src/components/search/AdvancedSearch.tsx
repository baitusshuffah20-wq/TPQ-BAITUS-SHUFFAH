'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Users,
  BookOpen,
  CreditCard,
  SortAsc,
  SortDesc,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SearchFilters {
  query: string;
  type: 'all' | 'santri' | 'hafalan' | 'attendance' | 'payments' | 'news';
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  halaqah: string[];
  grade: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    status: [],
    halaqah: [],
    grade: {
      min: 0,
      max: 100
    },
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const searchTypes = [
    { value: 'all', label: 'Semua', icon: Search },
    { value: 'santri', label: 'Santri', icon: Users },
    { value: 'hafalan', label: 'Hafalan', icon: BookOpen },
    { value: 'attendance', label: 'Kehadiran', icon: Calendar },
    { value: 'payments', label: 'Pembayaran', icon: CreditCard },
    { value: 'news', label: 'Berita', icon: BookOpen }
  ];

  const statusOptions = {
    santri: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
    hafalan: ['PENDING', 'APPROVED', 'NEEDS_IMPROVEMENT'],
    attendance: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
    payments: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevansi' },
    { value: 'date', label: 'Tanggal' },
    { value: 'name', label: 'Nama' },
    { value: 'grade', label: 'Nilai' },
    { value: 'status', label: 'Status' }
  ];

  useEffect(() => {
    if (filters.query.length >= 3) {
      performSearch();
    } else {
      setResults([]);
      setTotalResults(0);
    }
  }, [filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in real app, this would call your search API
      const searchParams = new URLSearchParams({
        q: filters.query,
        type: filters.type,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...filters.dateRange.start && { startDate: filters.dateRange.start },
        ...filters.dateRange.end && { endDate: filters.dateRange.end },
        ...filters.status.length && { status: filters.status.join(',') },
        ...filters.halaqah.length && { halaqah: filters.halaqah.join(',') },
        minGrade: filters.grade.min.toString(),
        maxGrade: filters.grade.max.toString()
      });

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'santri',
          title: 'Muhammad Fauzi',
          subtitle: 'Halaqah Al-Baqarah',
          description: 'Santri aktif dengan prestasi hafalan yang baik',
          metadata: {
            nis: 'STR001',
            status: 'ACTIVE',
            averageGrade: 88,
            attendanceRate: 95
          },
          relevanceScore: 0.95
        },
        {
          id: '2',
          type: 'hafalan',
          title: 'Al-Baqarah Ayat 1-20',
          subtitle: 'Muhammad Fauzi',
          description: 'Setoran hafalan dengan nilai 85',
          metadata: {
            grade: 85,
            status: 'APPROVED',
            date: '2024-01-15',
            musyrif: 'Ustadz Abdullah'
          },
          relevanceScore: 0.87
        },
        {
          id: '3',
          type: 'attendance',
          title: 'Kehadiran Januari 2024',
          subtitle: 'Aisyah Zahra',
          description: 'Tingkat kehadiran 90% bulan ini',
          metadata: {
            presentDays: 18,
            totalDays: 20,
            rate: 90,
            halaqah: 'Halaqah An-Nisa'
          },
          relevanceScore: 0.75
        }
      ];

      // Filter results based on search criteria
      let filteredResults = mockResults.filter(result => {
        if (filters.type !== 'all' && result.type !== filters.type) return false;
        if (filters.status.length && !filters.status.includes(result.metadata.status)) return false;
        return result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
               result.description.toLowerCase().includes(filters.query.toLowerCase());
      });

      // Sort results
      filteredResults.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'relevance':
            aValue = a.relevanceScore;
            bValue = b.relevanceScore;
            break;
          case 'name':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'grade':
            aValue = a.metadata.grade || a.metadata.averageGrade || 0;
            bValue = b.metadata.grade || b.metadata.averageGrade || 0;
            break;
          default:
            aValue = a.relevanceScore;
            bValue = b.relevanceScore;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setResults(filteredResults);
      setTotalResults(filteredResults.length);

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Gagal melakukan pencarian');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addStatusFilter = (status: string) => {
    if (!filters.status.includes(status)) {
      updateFilter('status', [...filters.status, status]);
    }
  };

  const removeStatusFilter = (status: string) => {
    updateFilter('status', filters.status.filter(s => s !== status));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      dateRange: { start: '', end: '' },
      status: [],
      halaqah: [],
      grade: { min: 0, max: 100 },
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const exportResults = () => {
    // In real app, this would export search results to CSV/Excel
    toast.success('Fitur export akan segera tersedia');
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = searchTypes.find(t => t.value === type);
    if (typeConfig) {
      const Icon = typeConfig.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Search className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'santri': return 'bg-blue-100 text-blue-800';
      case 'hafalan': return 'bg-green-100 text-green-800';
      case 'attendance': return 'bg-yellow-100 text-yellow-800';
      case 'payments': return 'bg-purple-100 text-purple-800';
      case 'news': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pencarian Lanjutan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari santri, hafalan, kehadiran, pembayaran..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Search Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {searchTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => updateFilter('type', type.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.type === type.value
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rentang Tanggal</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    />
                  </div>
                </div>

                {/* Grade Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rentang Nilai</label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      min="0"
                      max="100"
                      value={filters.grade.min}
                      onChange={(e) => updateFilter('grade', { ...filters.grade, min: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      min="0"
                      max="100"
                      value={filters.grade.max}
                      onChange={(e) => updateFilter('grade', { ...filters.grade, max: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium mb-2">Urutkan</label>
                  <div className="space-y-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center gap-2"
                    >
                      {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      {filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </Button>
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="space-y-2">
                    {filters.type !== 'all' && statusOptions[filters.type as keyof typeof statusOptions] && (
                      <div className="space-y-1">
                        {statusOptions[filters.type as keyof typeof statusOptions].map(status => (
                          <button
                            key={status}
                            onClick={() => addStatusFilter(status)}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(filters.status.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium">Filter aktif:</span>
                  {filters.status.map(status => (
                    <Badge key={status} variant="secondary" className="flex items-center gap-1">
                      {status}
                      <button onClick={() => removeStatusFilter(status)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {filters.dateRange.start && (
                    <Badge variant="secondary">Dari: {filters.dateRange.start}</Badge>
                  )}
                  {filters.dateRange.end && (
                    <Badge variant="secondary">Sampai: {filters.dateRange.end}</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Hapus Semua
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Hasil Pencarian {totalResults > 0 && `(${totalResults})`}
            </CardTitle>
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Mencari...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.query.length >= 3 ? 'Tidak ada hasil' : 'Mulai pencarian'}
              </h3>
              <p className="text-gray-600">
                {filters.query.length >= 3 
                  ? 'Coba gunakan kata kunci yang berbeda atau ubah filter'
                  : 'Ketik minimal 3 karakter untuk memulai pencarian'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(result.type)}
                        <h4 className="font-medium text-gray-900">{result.title}</h4>
                        <Badge className={getTypeColor(result.type)}>
                          {searchTypes.find(t => t.value === result.type)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
                      <p className="text-sm text-gray-500">{result.description}</p>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Relevansi: {Math.round(result.relevanceScore * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
