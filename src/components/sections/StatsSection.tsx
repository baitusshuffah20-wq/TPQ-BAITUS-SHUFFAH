'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Heart,
  TrendingUp,
  Award,
  Clock,
  MapPin
} from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: string;
  color: string;
  description: string;
}

interface OperationalInfo {
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  location: {
    address: string;
    description: string;
  };
  todayActivity: {
    attendance: number;
    description: string;
  };
}

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<StatItem[]>([]);
  const [operationalInfo, setOperationalInfo] = useState<OperationalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icon mapping
  const iconMap: Record<string, React.ElementType> = {
    Users,
    BookOpen,
    GraduationCap,
    Heart,
    TrendingUp,
    Award,
    Clock,
    MapPin
  };

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/homepage');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data.stats);
          setOperationalInfo(data.data.operationalInfo);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
        
        // Fallback to default stats
        setStats([
          {
            id: 'santri',
            label: 'Santri Aktif',
            value: 250,
            suffix: '+',
            icon: 'Users',
            color: 'text-teal-600',
            description: 'Santri yang sedang menghafal Al-Quran'
          },
          {
            id: 'hafidz',
            label: 'Hafidz/Hafidzah',
            value: 50,
            suffix: '+',
            icon: 'GraduationCap',
            color: 'text-yellow-600',
            description: 'Lulusan yang telah menyelesaikan 30 Juz'
          },
          {
            id: 'experience',
            label: 'Tahun Berpengalaman',
            value: 15,
            suffix: '',
            icon: 'Award',
            color: 'text-green-600',
            description: 'Pengalaman dalam pendidikan tahfidz'
          },
          {
            id: 'donations',
            label: 'Total Donasi',
            value: 500,
            suffix: 'Jt+',
            icon: 'Heart',
            color: 'text-red-600',
            description: 'Dana yang terkumpul untuk operasional'
          },
          {
            id: 'programs',
            label: 'Program Aktif',
            value: 8,
            suffix: '',
            icon: 'BookOpen',
            color: 'text-blue-600',
            description: 'Program pembelajaran yang tersedia'
          },
          {
            id: 'success',
            label: 'Tingkat Keberhasilan',
            value: 95,
            suffix: '%',
            icon: 'TrendingUp',
            color: 'text-purple-600',
            description: 'Santri yang berhasil menyelesaikan target'
          }
        ]);
        
        setOperationalInfo({
          hours: {
            weekdays: '07:00 - 17:00',
            saturday: '07:00 - 15:00',
            sunday: '08:00 - 12:00'
          },
          location: {
            address: 'Jl. Islamic Center No. 123, Jakarta Pusat',
            description: 'Berlokasi di pusat kota dengan akses mudah menggunakan transportasi umum'
          },
          todayActivity: {
            attendance: 0,
            description: 'Data tidak tersedia'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animation effect
  useEffect(() => {
    if (!stats.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Animate numbers
          stats.forEach((stat) => {
            let start = 0;
            const end = stat.value;
            const duration = 2000; // 2 seconds
            const increment = end / (duration / 16); // 60fps

            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                start = end;
                clearInterval(timer);
              }
              setAnimatedValues(prev => ({
                ...prev,
                [stat.id]: Math.floor(start)
              }));
            }, 16);
          });
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [stats]);

  return (
    <section id="stats-section" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pencapaian Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dengan dedikasi dan komitmen tinggi, kami telah mencapai berbagai prestasi 
            dalam pendidikan tahfidz Al-Quran
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat statistik...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center mb-16">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">Menampilkan data fallback</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => {
              const Icon = iconMap[stat.icon] || Users;
              const animatedValue = animatedValues[stat.id] || 0;
            
              return (
                <div
                  key={stat.id}
                  className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    isVisible ? 'animate-slide-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {animatedValue}{stat.suffix}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {stat.label}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Info Cards */}
        {!loading && operationalInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operational Hours */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-teal-50 text-teal-600 mr-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Jam Operasional
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Senin - Jumat</span>
                  <span className="font-medium text-gray-900">{operationalInfo.hours.weekdays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sabtu</span>
                  <span className="font-medium text-gray-900">{operationalInfo.hours.saturday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Minggu</span>
                  <span className="font-medium text-gray-900">{operationalInfo.hours.sunday}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kehadiran Hari Ini</span>
                    <span className="font-medium text-teal-600">{operationalInfo.todayActivity.attendance} santri</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 mr-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Lokasi Strategis
                </h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600">
                  {operationalInfo.location.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {operationalInfo.location.address}
                </div>
                <div className="pt-2">
                  <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                    Lihat di Google Maps →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-teal-gold rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Bergabunglah dengan Keluarga Besar Kami
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Jadilah bagian dari komunitas penghafal Al-Quran terbaik di Indonesia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Daftar Sekarang
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
