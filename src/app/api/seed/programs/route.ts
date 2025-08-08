import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const programsData = [
  {
    title: "Tahfidz Al-Quran Intensif",
    description: "Program hafalan Al-Quran intensif dengan metode modern dan bimbingan ustadz berpengalaman. Target hafalan 30 juz dalam 2 tahun.",
    features: "Bimbingan ustadz berpengalaman, Metode hafalan modern, Muraja'ah rutin, Evaluasi berkala, Sertifikat resmi, Kelas kecil maksimal 15 santri",
    duration: "2 tahun",
    ageGroup: "10-17 tahun",
    schedule: "Senin-Jumat 08:00-12:00, Sabtu 08:00-10:00",
    price: "Rp 800,000/bulan",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500",
    isActive: true,
    order: 1,
  },
  {
    title: "Tahsin & Tajwid",
    description: "Program perbaikan bacaan Al-Quran dengan fokus pada tajwid, makhorijul huruf, dan kelancaran bacaan sesuai kaidah yang benar.",
    features: "Perbaikan makhorijul huruf, Pembelajaran tajwid lengkap, Praktek bacaan langsung, Rekaman evaluasi, Modul pembelajaran, Sertifikat kelulusan",
    duration: "6 bulan",
    ageGroup: "7-60 tahun",
    schedule: "Selasa & Kamis 16:00-17:30, Sabtu 14:00-15:30",
    price: "Rp 400,000/bulan",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500",
    isActive: true,
    order: 2,
  },
  {
    title: "Baca Tulis Al-Quran (BTQ)",
    description: "Program dasar untuk belajar membaca dan menulis huruf Arab serta Al-Quran dari nol hingga lancar membaca dengan benar.",
    features: "Pengenalan huruf hijaiyah, Belajar menulis Arab, Metode Iqro dan Qiroati, Bimbingan individual, Praktek menulis, Progress tracking",
    duration: "8 bulan",
    ageGroup: "5-12 tahun",
    schedule: "Senin, Rabu, Jumat 15:00-16:30",
    price: "Rp 300,000/bulan",
    image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500",
    isActive: true,
    order: 3,
  },
  {
    title: "Tahfidz Juz 30 (Juz Amma)",
    description: "Program khusus hafalan Juz 30 (Juz Amma) untuk anak-anak dengan metode yang menyenangkan dan mudah diingat.",
    features: "Metode hafalan anak, Lagu dan gerakan, Reward system, Kompetisi hafalan, Buku panduan, Evaluasi mingguan",
    duration: "4 bulan",
    ageGroup: "5-10 tahun",
    schedule: "Senin-Kamis 16:00-17:00",
    price: "Rp 350,000/bulan",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    isActive: true,
    order: 4,
  },
  {
    title: "Kajian Tafsir Al-Quran",
    description: "Program kajian mendalam tentang tafsir Al-Quran dengan pendekatan kontemporer untuk memahami makna dan hikmah ayat-ayat Al-Quran.",
    features: "Tafsir kontemporer, Diskusi interaktif, Referensi kitab klasik, Aplikasi dalam kehidupan, Materi digital, Sertifikat kajian",
    duration: "1 tahun",
    ageGroup: "17-60 tahun",
    schedule: "Sabtu 19:30-21:00, Minggu 08:00-09:30",
    price: "Rp 200,000/bulan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    isActive: true,
    order: 5,
  },
  {
    title: "Qiroah & Seni Baca Al-Quran",
    description: "Program pelatihan seni baca Al-Quran dengan berbagai lagu dan irama untuk meningkatkan keindahan tilawah.",
    features: "7 lagu qiroah, Teknik pernafasan, Pelatihan suara, Kompetisi tilawah, Recording studio, Sertifikat qori/qoriah",
    duration: "10 bulan",
    ageGroup: "12-25 tahun",
    schedule: "Rabu 19:00-20:30, Sabtu 16:00-17:30",
    price: "Rp 450,000/bulan",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
    isActive: true,
    order: 6,
  },
  {
    title: "Bahasa Arab Dasar",
    description: "Program pembelajaran bahasa Arab dari dasar untuk memahami Al-Quran dan literatur Islam dengan lebih baik.",
    features: "Nahwu dan Shorof, Kosakata harian, Percakapan Arab, Teks klasik, Kamus digital, Ujian berkala",
    duration: "1 tahun",
    ageGroup: "13-40 tahun",
    schedule: "Selasa & Kamis 19:30-21:00",
    price: "Rp 300,000/bulan",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
    isActive: true,
    order: 7,
  },
  {
    title: "Kelas Dewasa Intensif",
    description: "Program khusus untuk orang dewasa yang ingin belajar Al-Quran dengan jadwal fleksibel dan metode yang sesuai untuk dewasa.",
    features: "Jadwal fleksibel, Kelas private/semi private, Materi disesuaikan, Konsultasi spiritual, Progress personal, Sertifikat",
    duration: "Fleksibel",
    ageGroup: "25-60 tahun",
    schedule: "Konsultasi jadwal, Weekend available",
    price: "Rp 600,000/bulan",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
    isActive: true,
    order: 8,
  }
];

export async function POST() {
  try {
    // Clear existing programs
    await prisma.program.deleteMany({});
    
    // Insert new programs
    const programs = await prisma.program.createMany({
      data: programsData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${programs.count} programs`,
      programs: programsData.map(p => ({ title: p.title, price: p.price })),
    });

  } catch (error) {
    console.error("Error seeding programs:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to seed programs",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      count: programs.length,
      programs: programs.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        ageGroup: p.ageGroup,
        duration: p.duration,
        isActive: p.isActive,
        order: p.order,
      })),
    });

  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch programs",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
