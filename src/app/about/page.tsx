"use client";

import React from "react";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  BookOpen,
  Users,
  Award,
  Heart,
  MapPin,
  Phone,
  Mail,
  Building,
  Target,
  Star,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const achievements = [
    {
      icon: <Users className="h-8 w-8 text-teal-600" />,
      number: "200+",
      label: "Santri Aktif",
      description: "Santri yang aktif belajar Al-Quran",
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-green-600" />,
      number: "50+",
      label: "Santri Lulus",
      description: "Santri yang telah menyelesaikan program",
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      number: "15+",
      label: "Prestasi",
      description: "Prestasi dalam lomba tahfidz",
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      number: "5+",
      label: "Tahun",
      description: "Pengalaman mendidik generasi Qurani",
    },
  ];

  const programs = [
    {
      title: "Tahfidz Al-Quran",
      description:
        "Program menghafal Al-Quran dengan metode yang mudah dan menyenangkan",
      features: ["Metode Talaqqi", "Bimbingan Intensif", "Evaluasi Berkala"],
    },
    {
      title: "Tahsin Al-Quran",
      description:
        "Program perbaikan bacaan Al-Quran sesuai kaidah tajwid yang benar",
      features: ["Makhorijul Huruf", "Ahkamul Huruf", "Praktik Langsung"],
    },
    {
      title: "Pendidikan Akhlak",
      description: "Pembentukan karakter islami dan akhlakul karimah",
      features: ["Adab Islami", "Akhlak Mulia", "Keteladanan"],
    },
  ];

  const facilities = [
    "Ruang Kelas Ber-AC",
    "Perpustakaan Islami",
    "Musholla",
    "Kantin Sehat",
    "Area Bermain",
    "Parkir Luas",
  ];

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tentang Kami
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                Taman Pendidikan Qur'an Baitus Shuffah
              </p>
              <p className="text-lg text-teal-200 mt-2">
                Membentuk Generasi Qur'ani, Bertaqwa, dan Berakhlakul Karimah
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-teal-600 hover:text-teal-700">
                Beranda
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Tentang Kami</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Sejarah & Visi Misi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                  Sejarah TPQ Baitus Shuffah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  TPQ Baitus Shuffah didirikan dengan semangat untuk menciptakan
                  generasi-generasi pilar peradaban dunia yang qur'ani, bertaqwa
                  dan berakhlakul karimah. Berlokasi di Jl. Untung Suropati
                  Labuhan Ratu, Kec. Labuhan Ratu Kota Bandar Lampung.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Dengan bertambahnya jumlah santri dan dukungan masyarakat,
                  kami terus berkomitmen untuk memberikan pendidikan Al-Quran
                  terbaik dengan fasilitas yang memadai dan metode pembelajaran
                  yang efektif.
                </p>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-teal-800 font-medium">
                    "Menciptakan generasi Qur'ani yang bertaqwa dan berakhlakul
                    karimah"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-600" />
                  Visi & Misi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">VISI</h4>
                  <p className="text-gray-600">
                    Menjadi lembaga pendidikan Al-Quran terdepan dalam mencetak
                    generasi Qur'ani yang bertaqwa, berakhlakul karimah, dan
                    berprestasi.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">MISI</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      Menyelenggarakan pendidikan Al-Quran yang berkualitas
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      Membentuk karakter islami dan akhlakul karimah
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      Mengembangkan potensi santri secara optimal
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      Menciptakan lingkungan belajar yang kondusif dan nyaman
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pencapaian Kami
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Alhamdulillah, dengan dukungan Allah SWT dan masyarakat, kami
                telah mencapai berbagai prestasi
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {achievement.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {achievement.number}
                    </h3>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      {achievement.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Program Unggulan
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Program-program berkualitas yang dirancang untuk mengoptimalkan
                pembelajaran Al-Quran
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-600">
                      {program.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="space-y-2">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fasilitas
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fasilitas lengkap untuk mendukung proses pembelajaran yang
                optimal
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
                >
                  <Building className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <Card className="bg-gradient-to-r from-teal-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-gray-900">
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="h-8 w-8 text-teal-600" />
                  <h4 className="font-semibold text-gray-900">Alamat</h4>
                  <p className="text-gray-600 text-sm">
                    Jl. Untung Suropati Labuhan Ratu
                    <br />
                    Kec. Labuhan Ratu
                    <br />
                    Kota Bandar Lampung
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Phone className="h-8 w-8 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Telepon</h4>
                  <p className="text-gray-600">0822-8978-2223</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">baitusshuffah@gmail.com</p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/contact">Hubungi Kami</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
