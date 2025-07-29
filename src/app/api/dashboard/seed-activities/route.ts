import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/dashboard/seed-activities - Create sample activities for testing
export async function POST(request: NextRequest) {
  try {
    console.log("🌱 Seeding dashboard activities...");

    // Create sample news/events
    const newsEvents = await prisma.news.createMany({
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

    // Get some santri for creating sample activities
    const santriList = await prisma.santri.findMany({
      take: 5,
    });

    if (santriList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No santri found. Please add santri first.",
        },
        { status: 400 },
      );
    }

    // Create sample assessments (hafalan)
    const assessments = await prisma.assessment.createMany({
      data: santriList.slice(0, 3).map((santri, index) => ({
        santriId: santri.id,
        type: "HAFALAN",
        score: 85 + index * 5, // 85, 90, 95
        notes: `Hafalan Al-Fatihah dan Al-Baqarah ayat 1-${10 + index * 5}`,
        createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000), // 1, 2, 3 days ago
      })),
      skipDuplicates: true,
    });

    // Create sample donations
    const donations = await prisma.donation.createMany({
      data: [
        {
          donorName: "Ahmad Wijaya",
          amount: 500000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          donorName: "Donatur Anonim",
          amount: 250000,
          isAnonymous: true,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          donorName: "Siti Nurhaliza",
          amount: 1000000,
          isAnonymous: false,
          status: "CONFIRMED",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      ],
      skipDuplicates: true,
    });

    // Get SPP settings for creating sample SPP records
    const sppSettings = await prisma.sPPSetting.findMany({
      where: { isActive: true },
      take: 1,
    });

    let sppRecords = { count: 0 };
    if (sppSettings.length > 0) {
      // Create sample SPP records
      sppRecords = await prisma.sPPRecord.createMany({
        data: santriList.slice(0, 2).map((santri, index) => ({
          santriId: santri.id,
          sppSettingId: sppSettings[0].id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          amount: sppSettings[0].amount,
          paidAmount: sppSettings[0].amount,
          status: "PAID",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          paidDate: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000), // 1, 2 days ago
          createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        })),
        skipDuplicates: true,
      });
    }

    console.log("✅ Sample activities created successfully");

    return NextResponse.json({
      success: true,
      message: "Sample activities created successfully",
      data: {
        newsEvents: newsEvents.count,
        assessments: assessments.count,
        donations: donations.count,
        sppRecords: sppRecords.count,
        santriUsed: santriList.length,
      },
    });
  } catch (error) {
    console.error("❌ Error seeding activities:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed activities",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET /api/dashboard/seed-activities - Check current activities count
export async function GET(request: NextRequest) {
  try {
    const [
      newsCount,
      hafalanCount,
      donationCount,
      sppRecordCount,
      santriCount,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.hafalan.count(),
      prisma.donation.count(),
      prisma.sPPRecord.count(),
      prisma.santri.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        news: newsCount,
        hafalan: hafalanCount,
        donations: donationCount,
        sppRecords: sppRecordCount,
        santri: santriCount,
      },
    });
  } catch (error) {
    console.error("❌ Error checking activities:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check activities",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
