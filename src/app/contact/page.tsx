"use client";

import React, { useState } from "react";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Building,
  CreditCard,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Show success message
    toast.success(
      "Pesan Anda telah terkirim! Kami akan menghubungi Anda segera.",
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setLoading(false);
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hubungi Kami
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                Kami Siap Membantu Anda
              </p>
              <p className="text-lg text-teal-200 mt-2">
                Jangan ragu untuk menghubungi kami dengan pertanyaan atau
                informasi
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
              <span className="text-gray-600">Kontak</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  Alamat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Jl. Untung Suropati Labuhan Ratu
                  <br />
                  Kec. Labuhan Ratu
                  <br />
                  Kota Bandar Lampung
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-teal-600" />
                  Telepon & WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Telepon: 0822-8978-2223
                  <br />
                  WhatsApp: 0822-8978-2223
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-teal-600" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Senin - Jumat: 08.00 - 16.00
                  <br />
                  Sabtu: 08.00 - 12.00
                  <br />
                  Minggu: Tutup
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-teal-600" />
                  Kirim Pesan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nama Lengkap
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Masukkan alamat email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nomor Telepon
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subjek
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Masukkan subjek pesan"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tulis pesan Anda di sini..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <LoadingButton
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      loading={loading}
                      loadingText="Mengirim..."
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Pesan
                    </LoadingButton>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Map and Additional Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    Lokasi Kami
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.3125306309093!2d105.2582!3d-5.3813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjInNTIuNyJTIDEwNcKwMTUnMjkuNSJF!5e0!3m2!1sen!2sid!4v1627282752489!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="TPQ Baitus Shuffah Location"
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      Kami berlokasi di kawasan strategis di Labuhan Ratu,
                      Bandar Lampung. Mudah diakses dengan transportasi umum dan
                      memiliki area parkir yang luas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-50 to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                    Informasi Donasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Dukung program pendidikan Al-Quran kami melalui donasi:
                  </p>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                      <span className="font-medium">
                        Bank Syariah Indonesia
                      </span>
                      <span>7890123456</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                      <span className="font-medium">Bank Mandiri</span>
                      <span>1234567890</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/donate">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Donasi Sekarang
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Pertanyaan Umum
              </h2>
              <p className="text-gray-600">
                Beberapa pertanyaan yang sering ditanyakan
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">
                    Bagaimana cara mendaftarkan anak saya?
                  </h3>
                  <p className="text-gray-600">
                    Anda dapat mendaftarkan anak Anda dengan mengunjungi kantor
                    kami atau mendaftar online melalui website ini. Klik menu
                    "Pendaftaran" untuk informasi lebih lanjut.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">
                    Berapa biaya pendidikan di TPQ Baitus Shuffah?
                  </h3>
                  <p className="text-gray-600">
                    Biaya pendidikan bervariasi tergantung program yang dipilih.
                    Kami juga menyediakan beasiswa bagi keluarga kurang mampu.
                    Silakan hubungi kami untuk informasi biaya terbaru.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">
                    Apa saja program yang tersedia?
                  </h3>
                  <p className="text-gray-600">
                    Kami menawarkan program Tahfidz Al-Quran, Tahsin Al-Quran,
                    dan Pendidikan Akhlak. Setiap program dirancang untuk
                    memenuhi kebutuhan perkembangan anak.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-teal-600 mb-2">
                    Apakah ada program untuk orang dewasa?
                  </h3>
                  <p className="text-gray-600">
                    Ya, kami juga menyediakan program khusus untuk orang dewasa
                    yang ingin belajar Al-Quran. Program ini diadakan di waktu
                    yang fleksibel.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Siap Bergabung dengan Kami?
              </h2>
              <p className="mb-6 text-teal-100 max-w-2xl mx-auto">
                Jadilah bagian dari keluarga TPQ Baitus Shuffah dan bantu anak
                Anda menjadi generasi Qur'ani yang berakhlak mulia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-white text-teal-600 hover:bg-teal-50"
                >
                  <Link href="/register">Daftar Sekarang</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-teal-700"
                >
                  <Link href="/programs">Lihat Program</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
