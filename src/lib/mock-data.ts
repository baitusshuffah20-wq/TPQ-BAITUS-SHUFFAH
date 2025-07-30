/**
 * Mock data for development and fallback purposes
 */

export const mockStats = [
  {
    id: "santri",
    label: "Santri Aktif",
    value: 150,
    suffix: "+",
    icon: "Users",
    color: "text-teal-600",
    description: "Santri yang sedang menghafal Al-Quran",
  },
  {
    id: "hafidz",
    label: "Hafidz/Hafidzah",
    value: 45,
    suffix: "+",
    icon: "GraduationCap",
    color: "text-yellow-600",
    description: "Lulusan yang telah menyelesaikan 30 Juz",
  },
  {
    id: "experience",
    label: "Tahun Berpengalaman",
    value: 15,
    suffix: "",
    icon: "Award",
    color: "text-green-600",
    description: "Pengalaman dalam pendidikan tahfidz",
  },
  {
    id: "donations",
    label: "Total Donasi",
    value: 250,
    suffix: "Jt+",
    icon: "Heart",
    color: "text-red-600",
    description: "Dana yang terkumpul untuk operasional",
  },
  {
    id: "programs",
    label: "Program Aktif",
    value: 8,
    suffix: "",
    icon: "BookOpen",
    color: "text-blue-600",
    description: "Program pembelajaran yang tersedia",
  },
  {
    id: "success",
    label: "Tingkat Keberhasilan",
    value: 95,
    suffix: "%",
    icon: "TrendingUp",
    color: "text-purple-600",
    description: "Santri yang berhasil menyelesaikan target",
  },
];

export const mockOperationalInfo = {
  hours: {
    weekdays: "07:00 - 17:00",
    saturday: "07:00 - 15:00",
    sunday: "08:00 - 12:00",
  },
  location: {
    address: "Jl. Islamic Center No. 123, Jakarta Pusat",
    description:
      "Berlokasi di pusat kota dengan akses mudah menggunakan transportasi umum",
  },
  todayActivity: {
    attendance: 125,
    description: "125 santri hadir hari ini",
  },
};

export const mockPrograms = [
  {
    id: 1,
    title: "Tahfidz Al-Quran 30 Juz",
    description: "Program menghafal Al-Quran 30 Juz dengan metode terbukti efektif",
    duration: "2-3 tahun",
    capacity: 30,
    enrolled: 25,
    level: "Semua Level",
    schedule: "Senin-Jumat 08:00-12:00",
    instructor: "Ustadz Ahmad Fauzi, Lc.",
    price: 500000,
    features: [
      "Metode menghafal yang terbukti",
      "Bimbingan ustadz berpengalaman",
      "Evaluasi berkala",
      "Sertifikat resmi"
    ],
    image: "/images/programs/tahfidz.jpg",
    category: "Tahfidz",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    title: "Tahsin Al-Quran",
    description: "Perbaikan bacaan Al-Quran sesuai kaidah tajwid yang benar",
    duration: "6 bulan",
    capacity: 20,
    enrolled: 18,
    level: "Pemula",
    schedule: "Selasa & Kamis 14:00-16:00",
    instructor: "Ustadzah Fatimah, S.Pd.I",
    price: 300000,
    features: [
      "Perbaikan makhorijul huruf",
      "Pembelajaran tajwid",
      "Praktek langsung",
      "Modul pembelajaran"
    ],
    image: "/images/programs/tahsin.jpg",
    category: "Tahsin",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    title: "Kelas Anak-Anak",
    description: "Program khusus untuk anak-anak usia 5-12 tahun",
    duration: "1 tahun",
    capacity: 25,
    enrolled: 22,
    level: "Anak-anak",
    schedule: "Sabtu-Minggu 09:00-11:00",
    instructor: "Ustadzah Aisyah, S.Pd",
    price: 200000,
    features: [
      "Metode bermain sambil belajar",
      "Materi sesuai usia",
      "Aktivitas menarik",
      "Laporan perkembangan"
    ],
    image: "/images/programs/kids.jpg",
    category: "Anak",
    isActive: true,
    order: 3,
  }
];

export const mockNews = [
  {
    id: 1,
    title: "Wisuda Santri Angkatan 2024",
    excerpt: "25 santri berhasil menyelesaikan hafalan 30 juz Al-Quran",
    content: "Alhamdulillah, TPQ Baitus Shuffah kembali meluluskan 25 santri yang telah berhasil menyelesaikan hafalan 30 juz Al-Quran...",
    image: "/images/news/wisuda-2024.jpg",
    author: "Admin TPQ",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Prestasi",
    status: "PUBLISHED",
    featured: true,
    views: 245,
  },
  {
    id: 2,
    title: "Program Tahfidz Intensif Ramadan",
    excerpt: "Program khusus selama bulan Ramadan untuk meningkatkan hafalan",
    content: "Dalam rangka menyambut bulan suci Ramadan, TPQ Baitus Shuffah mengadakan program tahfidz intensif...",
    image: "/images/news/ramadan-program.jpg",
    author: "Ustadz Ahmad",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Program",
    status: "PUBLISHED",
    featured: false,
    views: 189,
  },
  {
    id: 3,
    title: "Juara Lomba Tahfidz Tingkat Kota",
    excerpt: "Santri TPQ meraih juara 1 dalam lomba tahfidz antar TPQ se-kota",
    content: "Prestasi membanggakan kembali diraih oleh santri TPQ Baitus Shuffah dalam lomba tahfidz tingkat kota...",
    image: "/images/news/juara-lomba.jpg",
    author: "Tim Redaksi",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Prestasi",
    status: "PUBLISHED",
    featured: true,
    views: 312,
  },
  {
    id: 4,
    title: "Renovasi Gedung TPQ Selesai",
    excerpt: "Gedung TPQ telah selesai direnovasi untuk kenyamanan belajar santri",
    content: "Alhamdulillah, renovasi gedung TPQ Baitus Shuffah telah selesai dilaksanakan...",
    image: "/images/news/renovasi.jpg",
    author: "Admin TPQ",
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Fasilitas",
    status: "PUBLISHED",
    featured: false,
    views: 156,
  },
  {
    id: 5,
    title: "Kegiatan Bakti Sosial",
    excerpt: "TPQ mengadakan bakti sosial untuk masyarakat sekitar",
    content: "Sebagai bentuk kepedulian terhadap masyarakat, TPQ Baitus Shuffah mengadakan kegiatan bakti sosial...",
    image: "/images/news/baksos.jpg",
    author: "Panitia Baksos",
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Kegiatan",
    status: "PUBLISHED",
    featured: false,
    views: 98,
  },
  {
    id: 6,
    title: "Pendaftaran Santri Baru Dibuka",
    excerpt: "Pendaftaran santri baru untuk tahun ajaran 2024/2025 telah dibuka",
    content: "TPQ Baitus Shuffah membuka pendaftaran santri baru untuk tahun ajaran 2024/2025...",
    image: "/images/news/pendaftaran.jpg",
    author: "Admin TPQ",
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Pengumuman",
    status: "PUBLISHED",
    featured: true,
    views: 423,
  }
];

export const mockNewsCategories = [
  "Semua",
  "Prestasi", 
  "Program",
  "Fasilitas",
  "Kegiatan",
  "Pengumuman"
];

// Helper function to get mock data with delay simulation
export const getMockDataWithDelay = <T>(data: T, delay: number = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Helper function to simulate API response
export const createMockApiResponse = <T>(data: T, success: boolean = true) => {
  return {
    success,
    data,
    message: success ? "Data loaded successfully" : "Failed to load data",
  };
};
