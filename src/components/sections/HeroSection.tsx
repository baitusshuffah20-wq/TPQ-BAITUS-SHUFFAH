'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  Users,
  Award,
  Heart,
  ArrowRight,
  Star
} from 'lucide-react';

const HeroSection = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg,rgb(238, 255, 0) 0%, #008080 90%, #00e0e0 100%)"
      }}
    >
      {/* Background with Islamic Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-yellow-300 text-[#008080] text-sm font-semibold mb-6 shadow">
              <Star className="h-4 w-4 mr-2 text-[#E6CF00]" />
              Rumah Tahfidz Terpercaya #1 di Indonesia
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] mb-2 leading-tight">
              Membangun Generasi
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#E6CF00] mb-6 leading-tight">
              Penghafal Al-Quran
            </h2>

            {/* Description */}
            <p className="text-xl text-[#1E293B] mb-8 leading-relaxed max-w-2xl">
              Bergabunglah dengan Rumah Tahfidz Baitus Shuffah, tempat terbaik untuk
              menghafal Al-Quran dengan metode modern dan bimbingan ustadz berpengalaman.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/programs">
                <Button
                  size="lg"
                  className="bg-[#E6CF00] text-[#1E293B] hover:bg-[#ffe066] shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-[#E6CF00]"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Lihat Program Kami
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#008080] text-white hover:bg-[#00b3b3] shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-[#008080]"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Hubungi Kami
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#00e0e0]/40">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#E6CF00] mb-1">250+</div>
                <div className="text-sm text-[#008080]">Santri Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#E6CF00] mb-1">50+</div>
                <div className="text-sm text-[#008080]">Hafidz/Hafidzah</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#E6CF00] mb-1">15</div>
                <div className="text-sm text-[#008080]">Tahun Berpengalaman</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-white/80 border border-[#E6CF00]/40 rounded-xl p-6 hover:bg-[#E6CF00]/10 transition-all duration-200 hover-lift shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E6CF00] rounded-lg mb-4">
                  <BookOpen className="h-6 w-6 text-[#008080]" />
                </div>
                <h3 className="text-lg font-semibold text-[#008080] mb-2">
                  Metode Tahfidz Modern
                </h3>
                <p className="text-[#1E293B] text-sm">
                  Sistem pembelajaran yang terbukti efektif dengan teknologi terkini
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white/80 border border-[#E6CF00]/40 rounded-xl p-6 hover:bg-[#E6CF00]/10 transition-all duration-200 hover-lift shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E6CF00] rounded-lg mb-4">
                  <Users className="h-6 w-6 text-[#008080]" />
                </div>
                <h3 className="text-lg font-semibold text-[#008080] mb-2">
                  Ustadz Berpengalaman
                </h3>
                <p className="text-[#1E293B] text-sm">
                  Dibimbing langsung oleh ustadz hafidz dengan pengalaman puluhan tahun
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white/80 border border-[#E6CF00]/40 rounded-xl p-6 hover:bg-[#E6CF00]/10 transition-all duration-200 hover-lift shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E6CF00] rounded-lg mb-4">
                  <Award className="h-6 w-6 text-[#008080]" />
                </div>
                <h3 className="text-lg font-semibold text-[#008080] mb-2">
                  Sertifikat Resmi
                </h3>
                <p className="text-[#1E293B] text-sm">
                  Mendapatkan sertifikat tahfidz yang diakui secara nasional
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-white/80 border border-[#E6CF00]/40 rounded-xl p-6 hover:bg-[#E6CF00]/10 transition-all duration-200 hover-lift shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-[#E6CF00] rounded-lg mb-4">
                  <Heart className="h-6 w-6 text-[#008080]" />
                </div>
                <h3 className="text-lg font-semibold text-[#008080] mb-2">
                  Lingkungan Islami
                </h3>
                <p className="text-[#1E293B] text-sm">
                  Suasana belajar yang kondusif dengan nilai-nilai Islam
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#00e0e0]/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#E6CF00]/20 rounded-full blur-lg"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#E6CF00]/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#E6CF00]/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Arabic Calligraphy Decoration */}
      <div className="absolute top-20 right-10 text-6xl text-[#E6CF00]/10 font-arabic hidden lg:block">
        بِسْمِ اللَّهِ
      </div>
      <div className="absolute bottom-20 left-10 text-4xl text-[#008080]/10 font-arabic hidden lg:block">
        الرَّحْمَنِ الرَّحِيمِ
      </div>
    </section>
  );
};

export default HeroSection;
