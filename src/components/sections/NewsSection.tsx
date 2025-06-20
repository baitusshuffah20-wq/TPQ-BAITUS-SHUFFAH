'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Eye,
  MessageCircle,
  Share2,
  Clock,
  Loader
} from 'lucide-react';
import { formatDate, getRelativeTime } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  publishedAt: Date | string;
  category: string;
  views: number;
  featured?: boolean;
}

const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const categories = ['Semua', 'PRESTASI', 'PENGUMUMAN', 'KEGIATAN', 'FASILITAS'];
  
  // Format category for display
  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Fetch news based on selected category
        const categoryParam = selectedCategory !== 'Semua' ? `&category=${selectedCategory}` : '';
        const response = await fetch(`/api/news?limit=6${categoryParam}`);
        const data = await response.json();
        
        if (data.success) {
          setNews(data.news);
        } else {
          throw new Error('Failed to fetch news');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  // Filter news based on category
  const filteredNews = selectedCategory === 'Semua' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  // Find featured news and regular news
  const featuredNews = news.find(item => item.featured);
  const regularNews = news.filter(item => !item.featured);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Berita & Pengumuman
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ikuti perkembangan terbaru, prestasi santri, dan berbagai kegiatan 
            di Rumah Tahfidz Baitus Shuffah
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'Semua' ? category : formatCategory(category)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat berita...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-gray-600 text-sm">Silakan coba muat ulang halaman</p>
            </div>
          </div>
        )}

        {/* Content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Featured News */}
            {featuredNews && selectedCategory === 'Semua' && (
              <div className="mb-16">
                <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image */}
                    <div className="relative h-64 lg:h-auto bg-gray-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="bg-black/50 px-2 py-1 rounded text-xs">
                          {formatCategory(featuredNews.category)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-8">
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(new Date(featuredNews.publishedAt))}
                        <span className="mx-2">•</span>
                        <User className="h-4 w-4 mr-2" />
                        {featuredNews.author}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                        {featuredNews.title}
                      </h3>

                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {featuredNews.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {featuredNews.views}
                          </div>
                        </div>

                        <Link href={`/news/${featuredNews.id}`}>
                          <Button variant="primary">
                            Baca Selengkapnya
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* News Grid */}
            {(selectedCategory === 'Semua' ? regularNews : filteredNews).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {(selectedCategory === 'Semua' ? regularNews : filteredNews).map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow hover-lift">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {formatCategory(item.category)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <button className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {getRelativeTime(new Date(item.publishedAt))}
                        <span className="mx-2">•</span>
                        <User className="h-3 w-3 mr-1" />
                        {item.author}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {item.views}
                          </div>
                        </div>

                        <Link href={`/news/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            Baca
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">Tidak ada berita yang tersedia untuk kategori ini.</p>
              </div>
            )}

            {/* Load More / View All */}
            {news.length > 0 && (
              <div className="text-center">
                <Link href="/news">
                  <Button variant="outline" size="lg">
                    Lihat Semua Berita
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
