'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube,
  Heart,
  Users,
  GraduationCap
} from 'lucide-react';

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Program Tahfidz', href: '/programs' },
    { name: 'Pendaftaran', href: '/register' },
    { name: 'Berita', href: '/news' },
    { name: 'Galeri', href: '/gallery' },
    { name: 'Kontak', href: '/contact' },
  ];

  const programs = [
    { name: 'Tahfidz Al-Quran', href: '/programs/tahfidz' },
    { name: 'Kajian Kitab', href: '/programs/kajian' },
    { name: 'Bahasa Arab', href: '/programs/arabic' },
    { name: 'Akhlak & Adab', href: '/programs/akhlak' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'YouTube', href: '#', icon: Youtube },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center space-x-3">
              <Logo width={30} height={30} variant="dark" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">TPQ Baitus Shuffah</span>
                <span className="text-xs text-gray-300">Rumah Tahfidz Al-Qur'an</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Lembaga pendidikan Islam yang fokus pada tahfidz Al-Quran dengan 
              metode pembelajaran modern dan terintegrasi teknologi.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-teal-400" />
                <span>Jl. Untung Suropati Labuhan Ratu
Kec. Labuhan Ratu
Kota Bandar Lampung</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-teal-400" />
                <span>0822-8978-2223</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>baitusshuffah@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Program Kami
            </h4>
            <ul className="space-y-2">
              {programs.map((program) => (
                <li key={program.name}>
                  <Link 
                    href={program.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors text-sm"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistics & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Statistik
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-teal-400" />
                <span className="text-sm text-gray-300">250+ Santri Aktif</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-teal-400" />
                <span className="text-sm text-gray-300">50+ Hafidz/Hafidzah</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-teal-400" />
                <span className="text-sm text-gray-300">15 Tahun Berpengalaman</span>
              </div>
            </div>

            <h5 className="text-md font-medium mb-3 text-white">
              Ikuti Kami
            </h5>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-teal-600 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} RTPQ Baitus Shuffah. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:text-teal-400 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/sitemap" className="hover:text-teal-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
