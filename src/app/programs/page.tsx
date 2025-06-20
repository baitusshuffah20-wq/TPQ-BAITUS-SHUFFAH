'use client';

import React from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  Users,
  Heart,
  Star,
  Clock,
  Calendar,
  CheckCircle,
  Award
} from 'lucide-react';

export default function ProgramsPage() {
  const programs = [
    {
      id: 'tahfidz',
      title: 'Program Tahfidz Al-Quran',
      description: 'Program menghafal Al-Quran dengan metode yang mudah dan menyenangkan',
      icon: <BookOpen className="h-10 w-10 text-teal-600" />,
      features: [
        'Metode Talaqqi yang mudah diikuti',
        'Bimbingan intensif oleh pengajar berpengalaman',
        'Evaluasi hafalan berkala',
        'Sertifikat hafalan per juz'
      ],
      levels: [
        {
          name: 'Pemula',
          target: 'Juz 30',
          duration: '6 bulan'
        },
        {
          name: 'Menengah',
          target: 'Juz 29-27',
          duration: '1 tahun'
        },
        {
          name: 'Lanjutan',
          target: 'Juz 26-1',
          duration: '3 tahun'
        }
      ],
      schedule: 'Senin - Jumat, 16.00 - 17.30 WIB',
      ageRange: '7 - 15 tahun',
      color: 'teal'
    },
    {
      id: 'tahsin',
      title: 'Program Tahsin Al-Quran',
      description: 'Program perbaikan bacaan Al-Quran sesuai kaidah tajwid yang benar',
      icon: <Star className="h-10 w-10 text-blue-600" />,
      features: [
        'Pengenalan makhorijul huruf',
        'Praktik ahkamul huruf',
        'Latihan membaca dengan tartil',
        'Ujian bacaan berkala'
      ],
      levels: [
        {
          name: 'Dasar',
          target: 'Pengenalan huruf & harakat',
          duration: '3 bulan'
        },
        {
          name: 'Menengah',
          target: 'Tajwid dasar & kelancaran',
          duration: '6 bulan'
        },
        {
          name: 'Mahir',
          target: 'Qiroah & tartil sempurna',
          duration: '1 tahun'
        }
      ],
      schedule: 'Senin, Rabu, Jumat, 15.00 - 16.30 WIB',
      ageRange: '5 - 15 tahun',
      color: 'blue'
    },
    {
      id: 'akhlak',
      title: 'Program Pendidikan Akhlak',
      description: 'Pembentukan karakter islami dan akhlakul karimah',
      icon: <Heart className="h-10 w-10 text-red-600" />,
      features: [
        'Pembelajaran adab islami sehari-hari',
        'Praktik ibadah yang benar',
        'Kisah-kisah teladan Rasulullah dan sahabat',
        'Pembiasaan akhlak mulia'
      ],
      levels: [
        {
          name: 'Tingkat 1',
          target: 'Adab dasar & ibadah harian',
          duration: '6 bulan'
        },
        {
          name: 'Tingkat 2',
          target: 'Akhlak dalam keluarga & masyarakat',
          duration: '6 bulan'
        },
        {
          name: 'Tingkat 3',
          target: 'Muamalah & kepemimpinan',
          duration: '1 tahun'
        }
      ],
      schedule: 'Selasa & Kamis, 16.00 - 17.30 WIB',
      ageRange: '6 - 15 tahun',
      color: 'red'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmad Fauzi',
      role: 'Orang Tua Santri',
      content: 'Alhamdulillah, anak saya sudah hafal 3 juz dalam waktu 1 tahun berkat program tahfidz di TPQ Baitus Shuffah. Metode pembelajarannya sangat efektif dan menyenangkan.',
      avatar: '/avatars/testimonial-1.jpg'
    },
    {
      name: 'Siti Aisyah',
      role: 'Orang Tua Santri',
      content: 'Program tahsin sangat membantu anak saya memperbaiki bacaan Al-Quran. Sekarang dia sudah bisa membaca dengan tartil dan sesuai tajwid.',
      avatar: '/avatars/testimonial-2.jpg'
    },
    {
      name: 'Muhammad Rizki',
      role: 'Alumni Santri',
      content: 'Pendidikan akhlak yang saya dapatkan di TPQ Baitus Shuffah sangat bermanfaat dalam kehidupan sehari-hari. Saya belajar bagaimana menjadi muslim yang baik.',
      avatar: '/avatars/testimonial-3.jpg'
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Program Pendidikan
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                Program Unggulan TPQ Baitus Shuffah
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
              <span className="text-gray-600">Program</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Introduction */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Pendidikan Berkualitas</h2>
            <p className="text-gray-600">
              TPQ Baitus Shuffah menawarkan berbagai program pendidikan Al-Quran dan pembentukan akhlak
              yang dirancang untuk mengembangkan potensi santri secara optimal. Setiap program memiliki
              kurikulum terstruktur dan diajarkan oleh pengajar yang berpengalaman.
            </p>
          </div>

          {/* Programs List */}
          <div className="space-y-16 mb-16">
            {programs.map((program, index) => (
              <div key={program.id} id={program.id} className="scroll-mt-20">
                <Card className={`border-${program.color}-100 hover:shadow-lg transition-shadow`}>
                  <CardHeader className={`bg-gradient-to-r from-${program.color}-50 to-${program.color}-100 rounded-t-lg`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className={`p-4 rounded-full bg-white shadow-md`}>
                        {program.icon}
                      </div>
                      <div>
                        <CardTitle className={`text-2xl text-${program.color}-700`}>
                          {program.title}
                        </CardTitle>
                        <p className="text-gray-600 mt-2">{program.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Features */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className={`h-5 w-5 text-${program.color}-600 mr-2`} />
                          Fitur Program
                        </h3>
                        <ul className="space-y-2">
                          {program.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className={`w-2 h-2 bg-${program.color}-500 rounded-full mt-2`}></div>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Levels */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Award className={`h-5 w-5 text-${program.color}-600 mr-2`} />
                          Tingkatan
                        </h3>
                        <div className="space-y-3">
                          {program.levels.map((level, idx) => (
                            <div key={idx} className={`p-3 rounded-md bg-${program.color}-50 border border-${program.color}-100`}>
                              <h4 className={`font-medium text-${program.color}-700`}>{level.name}</h4>
                              <p className="text-sm text-gray-600">Target: {level.target}</p>
                              <p className="text-sm text-gray-600">Durasi: {level.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule & Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className={`h-5 w-5 text-${program.color}-600 mr-2`} />
                          Informasi Jadwal
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <Clock className={`h-5 w-5 text-${program.color}-600 flex-shrink-0`} />
                            <div>
                              <p className="font-medium text-gray-700">Jadwal</p>
                              <p className="text-gray-600">{program.schedule}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className={`h-5 w-5 text-${program.color}-600 flex-shrink-0`} />
                            <div>
                              <p className="font-medium text-gray-700">Usia</p>
                              <p className="text-gray-600">{program.ageRange}</p>
                            </div>
                          </div>
                          <Button asChild className={`mt-4 bg-${program.color}-600 hover:bg-${program.color}-700 w-full`}>
                            <Link href="/register">
                              Daftar Program
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Testimoni Santri & Orang Tua</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Apa kata mereka tentang program pendidikan di TPQ Baitus Shuffah
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                        <img 
                          src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0d9488&color=fff`} 
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Jawaban untuk pertanyaan yang sering diajukan tentang program kami
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">Apakah ada tes masuk untuk program tahfidz?</h3>
                  <p className="text-gray-600">
                    Tidak ada tes masuk khusus, namun kami akan melakukan asesmen awal untuk menentukan tingkat kemampuan santri agar bisa ditempatkan di kelas yang sesuai.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">Berapa biaya untuk mengikuti program?</h3>
                  <p className="text-gray-600">
                    Biaya program bervariasi tergantung jenis dan durasinya. Kami juga menyediakan beasiswa bagi keluarga kurang mampu. Silakan hubungi kami untuk informasi biaya terbaru.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">Apakah orang tua bisa memantau perkembangan anak?</h3>
                  <p className="text-gray-600">
                    Ya, kami menyediakan laporan perkembangan berkala dan pertemuan orang tua-guru setiap 3 bulan sekali untuk membahas kemajuan santri.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">Bagaimana jika anak saya belum bisa membaca Al-Quran?</h3>
                  <p className="text-gray-600">
                    Kami memiliki program tahsin dasar untuk santri yang belum bisa membaca Al-Quran. Santri akan diajarkan dari pengenalan huruf hijaiyah hingga mampu membaca dengan lancar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Siap Bergabung dengan Kami?</h2>
              <p className="mb-6 text-teal-100 max-w-2xl mx-auto">
                Jadilah bagian dari keluarga TPQ Baitus Shuffah dan bantu anak Anda menjadi generasi Qur'ani yang berakhlak mulia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-white text-teal-600 hover:bg-teal-50">
                  <Link href="/register">
                    Daftar Sekarang
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-teal-700">
                  <Link href="/contact">
                    Hubungi Kami
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}