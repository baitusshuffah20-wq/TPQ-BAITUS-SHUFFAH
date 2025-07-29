import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("Creating sample data...");

    // Create sample news/events
    const newsData = await prisma.news.createMany({
      data: [
        {
          title: "Peringatan Maulid Nabi Muhammad SAW",
          excerpt:
            "Peringatan Maulid Nabi Muhammad SAW akan segera dilaksanakan",
          content:
            "Akan diadakan peringatan Maulid Nabi Muhammad SAW pada tanggal 28 September 2024. Seluruh santri diharapkan hadir tepat waktu.",
          author: "Admin TPQ",
          category: "KEGIATAN",
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          createdAt: new Date(),
        },
        {
          title: "Ujian Hafalan Semester Ganjil",
          excerpt: "Ujian hafalan semester ganjil akan segera dimulai",
          content:
            "Ujian hafalan semester ganjil akan dilaksanakan mulai tanggal 5 Oktober 2024. Persiapkan diri dengan baik.",
          author: "Admin TPQ",
          category: "AKADEMIK",
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(),
        },
        {
          title: "Libur Hari Raya Idul Adha",
          excerpt: "Informasi libur Hari Raya Idul Adha",
          content:
            "TPQ akan libur pada tanggal 16-18 Juni 2024 dalam rangka Hari Raya Idul Adha. Kegiatan akan dimulai kembali pada tanggal 19 Juni 2024.",
          author: "Admin TPQ",
          category: "PENGUMUMAN",
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          createdAt: new Date(),
        },
      ],
      skipDuplicates: true,
    });

    // Create sample donations
    const donationsData = await prisma.donation.createMany({
      data: [
        {
          donorName: "Ahmad Hidayat",
          amount: 500000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          donorName: "Siti Nurhaliza",
          amount: 250000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          donorName: "Donatur Anonim",
          amount: 1000000,
          isAnonymous: true,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          donorName: "Budi Santoso",
          amount: 300000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          donorName: "Fatimah Az-Zahra",
          amount: 150000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      ],
      skipDuplicates: true,
    });

    // Get existing santri for hafalan data
    const santriList = await prisma.santri.findMany({
      take: 5,
      select: { id: true, name: true },
    });

    if (santriList.length > 0) {
      // Create sample hafalan data
      const hafalanData = await prisma.hafalan.createMany({
        data: [
          {
            santriId: santriList[0]?.id,
            surahId: 1,
            surahName: "Al-Fatihah",
            ayahStart: 1,
            ayahEnd: 7,
            type: "HAFALAN",
            status: "APPROVED",
            grade: "A",
            notes: "Hafalan sangat baik, tajwid benar",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            santriId: santriList[1]?.id,
            surahId: 2,
            surahName: "Al-Baqarah",
            ayahStart: 1,
            ayahEnd: 10,
            type: "HAFALAN",
            status: "APPROVED",
            grade: "B+",
            notes: "Hafalan baik, perlu perbaikan sedikit di tajwid",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            santriId: santriList[2]?.id,
            surahId: 3,
            surahName: "Ali Imran",
            ayahStart: 1,
            ayahEnd: 5,
            type: "HAFALAN",
            status: "PENDING",
            grade: null,
            notes: "Menunggu evaluasi",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
        skipDuplicates: true,
      });

      // Create sample SPP records
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const sppData = await prisma.sPPRecord.createMany({
        data: [
          {
            santriId: santriList[0]?.id,
            month: currentMonth,
            year: currentYear,
            amount: 100000,
            paidAmount: 100000,
            status: "PAID",
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            santriId: santriList[1]?.id,
            month: currentMonth,
            year: currentYear,
            amount: 100000,
            paidAmount: 50000,
            status: "PARTIAL",
            paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            santriId: santriList[2]?.id,
            month: currentMonth,
            year: currentYear,
            amount: 100000,
            paidAmount: 0,
            status: "UNPAID",
            paidAt: null,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
        ],
        skipDuplicates: true,
      });

      // Create sample attendance records
      const today = new Date();
      const attendanceData = await prisma.attendance.createMany({
        data: [
          {
            santriId: santriList[0]?.id,
            date: today,
            status: "PRESENT",
            notes: "Hadir tepat waktu",
            createdAt: today,
          },
          {
            santriId: santriList[1]?.id,
            date: today,
            status: "PRESENT",
            notes: "Hadir tepat waktu",
            createdAt: today,
          },
          {
            santriId: santriList[2]?.id,
            date: today,
            status: "ABSENT",
            notes: "Sakit",
            createdAt: today,
          },
        ],
        skipDuplicates: true,
      });

      return NextResponse.json({
        success: true,
        message: "Sample data created successfully",
        data: {
          news: newsData.count,
          donations: donationsData.count,
          hafalan: hafalanData.count,
          spp: sppData.count,
          attendance: attendanceData.count,
          santriUsed: santriList.length,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No santri found. Please create santri data first.",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error creating sample data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create sample data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const [
      newsCount,
      donationCount,
      hafalanCount,
      sppCount,
      attendanceCount,
      santriCount,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.donation.count(),
      prisma.hafalan.count(),
      prisma.sPPRecord.count(),
      prisma.attendance.count(),
      prisma.santri.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        news: newsCount,
        donations: donationCount,
        hafalan: hafalanCount,
        spp: sppCount,
        attendance: attendanceCount,
        santri: santriCount,
      },
    });
  } catch (error) {
    console.error("Error fetching data counts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data counts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
