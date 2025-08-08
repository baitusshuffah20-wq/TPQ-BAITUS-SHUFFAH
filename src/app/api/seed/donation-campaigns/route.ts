import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Get donation categories first
    const categories = await prisma.donationCategory.findMany();
    
    if (categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No donation categories found. Please seed donation categories first.",
      }, { status: 400 });
    }

    // Clear existing campaigns
    await prisma.donationCampaign.deleteMany({});

    const campaignsData = [
      {
        title: "Renovasi Masjid TPQ Baitus Shuffah",
        slug: "renovasi-masjid-tpq-baitus-shuffah",
        description: "Mari bersama-sama merenovasi masjid TPQ Baitus Shuffah agar menjadi tempat ibadah dan pembelajaran yang lebih nyaman untuk para santri dan jamaah.",
        longDescription: `
Masjid TPQ Baitus Shuffah membutuhkan renovasi menyeluruh untuk meningkatkan kenyamanan ibadah dan pembelajaran. Renovasi meliputi:

**Yang akan diperbaiki:**
- Perbaikan atap dan plafon yang bocor
- Renovasi lantai dan keramik
- Perbaikan sistem listrik dan lampu
- Pengecatan ulang seluruh bangunan
- Perbaikan sound system
- Renovasi kamar mandi dan tempat wudhu

**Manfaat renovasi:**
- Tempat ibadah yang lebih nyaman
- Lingkungan pembelajaran yang kondusif
- Fasilitas yang lebih baik untuk santri
- Meningkatkan semangat belajar Al-Quran

Mari berpartisipasi dalam amal jariyah ini. Setiap rupiah yang Anda donasikan akan menjadi investasi akhirat yang terus mengalir pahalanya.
        `,
        targetAmount: 150000000, // 150 juta
        currentAmount: 45000000, // 45 juta terkumpul
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800",
        status: "ACTIVE",
        isUrgent: true,
        categoryId: categories.find(c => c.name === "Pembangunan Masjid")?.id || categories[0].id,
      },
      {
        title: "Beasiswa Santri Yatim dan Dhuafa",
        slug: "beasiswa-santri-yatim-dhuafa",
        description: "Program beasiswa untuk 50 santri yatim dan dhuafa agar dapat mengikuti program tahfidz dan pembelajaran Al-Quran secara gratis.",
        longDescription: `
Program beasiswa ini ditujukan untuk membantu anak-anak yatim dan keluarga dhuafa agar dapat mengakses pendidikan Al-Quran berkualitas di TPQ Baitus Shuffah.

**Target Penerima:**
- 50 santri yatim dan dhuafa
- Usia 5-17 tahun
- Dari keluarga kurang mampu
- Berkomitmen mengikuti program hingga selesai

**Fasilitas Beasiswa:**
- Bebas biaya SPP selama 1 tahun
- Buku dan peralatan pembelajaran gratis
- Seragam dan perlengkapan santri
- Snack dan makan siang
- Bimbingan khusus untuk yang tertinggal

**Dampak Positif:**
- Anak yatim mendapat pendidikan berkualitas
- Mengurangi angka putus sekolah
- Membentuk generasi Qurani
- Memutus rantai kemiskinan melalui pendidikan

Dengan donasi Rp 100,000, Anda sudah membantu 1 santri belajar selama 1 bulan.
        `,
        targetAmount: 60000000, // 60 juta
        currentAmount: 18500000, // 18.5 juta terkumpul
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800",
        status: "ACTIVE",
        isUrgent: true,
        categoryId: categories.find(c => c.name === "Beasiswa Santri")?.id || categories[1].id,
      },
      {
        title: "Pengadaan Al-Quran dan Buku Pembelajaran",
        slug: "pengadaan-alquran-buku-pembelajaran",
        description: "Pengadaan 200 Al-Quran baru dan buku-buku pembelajaran untuk menunjang kegiatan belajar mengajar di TPQ Baitus Shuffah.",
        longDescription: `
TPQ Baitus Shuffah membutuhkan Al-Quran dan buku pembelajaran baru untuk mengganti yang sudah rusak dan menambah koleksi perpustakaan.

**Kebutuhan:**
- 200 Al-Quran ukuran sedang (Rp 75,000/buah)
- 100 Buku Iqro (Rp 25,000/buah)
- 50 Buku Tajwid (Rp 50,000/buah)
- 30 Buku Tafsir Anak (Rp 100,000/buah)
- 20 Buku Hadits Pilihan (Rp 80,000/buah)
- Rak buku dan lemari penyimpanan

**Manfaat:**
- Setiap santri memiliki Al-Quran sendiri
- Pembelajaran lebih efektif
- Perpustakaan yang lengkap
- Santri dapat meminjam buku untuk dibaca di rumah

**Pahala Berlipat:**
Setiap kali Al-Quran dan buku tersebut dibaca oleh santri, Anda akan mendapat pahala yang terus mengalir. Investasi terbaik untuk akhirat!
        `,
        targetAmount: 25000000, // 25 juta
        currentAmount: 8750000, // 8.75 juta terkumpul
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
        status: "ACTIVE",
        isUrgent: false,
        categoryId: categories.find(c => c.name === "Sarana Pembelajaran")?.id || categories[3].id,
      },
      {
        title: "Program Tahfidz Intensif Ramadan",
        slug: "program-tahfidz-intensif-ramadan",
        description: "Program khusus tahfidz intensif selama bulan Ramadan dengan target hafalan 1 juz untuk setiap santri.",
        longDescription: `
Program tahfidz intensif khusus bulan Ramadan dengan metode pembelajaran yang intensif dan menyenangkan.

**Program Meliputi:**
- Kelas tahfidz 4 jam/hari
- Bimbingan ustadz hafidz berpengalaman
- Metode muraja'ah yang efektif
- Kompetisi hafalan dengan hadiah menarik
- Iftar bersama setiap hari
- Sertifikat untuk yang mencapai target

**Target:**
- 100 santri peserta
- Hafalan minimal 1 juz/santri
- Perbaikan kualitas bacaan
- Peningkatan kecintaan pada Al-Quran

**Kebutuhan Dana:**
- Honor ustadz tambahan
- Konsumsi iftar dan sahur
- Hadiah kompetisi
- Sertifikat dan piagam
- Peralatan pembelajaran

Bulan Ramadan adalah waktu terbaik untuk menghafal Al-Quran. Mari dukung program ini!
        `,
        targetAmount: 40000000, // 40 juta
        currentAmount: 12000000, // 12 juta terkumpul
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-04-15'),
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        status: "ACTIVE",
        isUrgent: false,
        categoryId: categories.find(c => c.name === "Program Tahfidz")?.id || categories[5].id,
      },
      {
        title: "Bantuan Kesejahteraan Ustadz",
        slug: "bantuan-kesejahteraan-ustadz",
        description: "Program bantuan kesejahteraan untuk 15 ustadz TPQ Baitus Shuffah yang telah berdedikasi mengajar dengan ikhlas.",
        longDescription: `
Para ustadz TPQ Baitus Shuffah telah berdedikasi mengajar dengan penuh keikhlasan. Saatnya kita membantu meningkatkan kesejahteraan mereka.

**Profil Ustadz:**
- 15 ustadz tetap
- Mengajar rata-rata 6 jam/hari
- Sudah mengabdi 3-15 tahun
- Memiliki keluarga yang perlu dinafkahi
- Gaji masih di bawah standar

**Program Bantuan:**
- Tunjangan kesejahteraan bulanan
- Bantuan kesehatan dan pengobatan
- Bonus hari raya
- Pelatihan dan pengembangan skill
- Asuransi kecelakaan

**Dampak Positif:**
- Ustadz lebih fokus mengajar
- Kualitas pembelajaran meningkat
- Loyalitas dan dedikasi terjaga
- Keluarga ustadz lebih sejahtera

Mari kita hargai jasa para ustadz yang telah mendidik generasi Qurani dengan memberikan bantuan kesejahteraan yang layak.
        `,
        targetAmount: 80000000, // 80 juta
        currentAmount: 22000000, // 22 juta terkumpul
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        status: "ACTIVE",
        isUrgent: false,
        categoryId: categories.find(c => c.name === "Kesejahteraan Ustadz")?.id || categories[4].id,
      },
      {
        title: "Digitalisasi Sistem Pembelajaran TPQ",
        slug: "digitalisasi-sistem-pembelajaran-tpq",
        description: "Pengembangan aplikasi mobile dan sistem digital untuk memodernisasi metode pembelajaran di TPQ Baitus Shuffah.",
        longDescription: `
Era digital menuntut TPQ untuk berinovasi dalam metode pembelajaran. Mari dukung digitalisasi TPQ Baitus Shuffah!

**Fitur Aplikasi:**
- Absensi digital dengan QR Code
- Tracking progress hafalan santri
- Komunikasi orang tua dan ustadz
- Materi pembelajaran digital
- Sistem pembayaran online
- Laporan perkembangan real-time

**Kebutuhan:**
- Pengembangan aplikasi mobile
- Server dan hosting
- Tablet untuk ustadz
- Pelatihan penggunaan sistem
- Maintenance dan update

**Manfaat:**
- Pembelajaran lebih efisien
- Monitoring progress lebih mudah
- Komunikasi lebih baik
- Data tersimpan aman
- TPQ lebih modern dan menarik

Investasi teknologi ini akan bermanfaat untuk jangka panjang dan meningkatkan kualitas pendidikan di TPQ.
        `,
        targetAmount: 35000000, // 35 juta
        currentAmount: 5250000, // 5.25 juta terkumpul
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-10-31'),
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        status: "ACTIVE",
        isUrgent: false,
        categoryId: categories.find(c => c.name === "Teknologi & Digital")?.id || categories[8].id,
      }
    ];

    // Insert campaigns
    const campaigns = await prisma.donationCampaign.createMany({
      data: campaignsData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${campaigns.count} donation campaigns`,
      campaigns: campaignsData.map(c => ({ 
        title: c.title, 
        target: `Rp ${c.targetAmount.toLocaleString()}`,
        current: `Rp ${c.currentAmount.toLocaleString()}`,
        percentage: Math.round((c.currentAmount / c.targetAmount) * 100)
      })),
    });

  } catch (error) {
    console.error("Error seeding donation campaigns:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to seed donation campaigns",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.donationCampaign.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(c => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        targetAmount: c.targetAmount,
        currentAmount: c.currentAmount,
        percentage: Math.round((c.currentAmount / c.targetAmount) * 100),
        status: c.status,
        isUrgent: c.isUrgent,
        category: c.category?.name,
        endDate: c.endDate,
      })),
    });

  } catch (error) {
    console.error("Error fetching donation campaigns:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch donation campaigns",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
