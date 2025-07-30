import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check if campaigns already exist
    const existingCampaigns = await prisma.donationCampaign.findMany();
    
    if (existingCampaigns.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Campaigns already exist. Use DELETE method to reset first.",
        count: existingCampaigns.length,
      });
    }

    // Get categories to link campaigns
    const categories = await prisma.donationCategory.findMany();
    
    if (categories.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No donation categories found. Please seed categories first.",
      });
    }

    // Get a user to be the creator (assuming admin user exists)
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: "No admin user found. Please create an admin user first.",
      });
    }

    // Sample campaigns data
    const campaignsData = [
      {
        title: "Renovasi Ruang Kelas Utama",
        slug: "renovasi-ruang-kelas-utama",
        description: "Membantu renovasi ruang kelas utama TPQ Baitus Shuffah untuk menciptakan lingkungan belajar yang lebih nyaman dan kondusif bagi para santri.",
        shortDesc: "Renovasi ruang kelas untuk lingkungan belajar yang lebih baik",
        content: `
          <h3>Tentang Campaign Ini</h3>
          <p>TPQ Baitus Shuffah membutuhkan renovasi ruang kelas utama yang sudah berusia lebih dari 10 tahun. Kondisi ruang kelas saat ini kurang mendukung proses pembelajaran yang optimal.</p>
          
          <h3>Yang Akan Diperbaiki:</h3>
          <ul>
            <li>Perbaikan atap yang bocor</li>
            <li>Pengecatan ulang dinding</li>
            <li>Perbaikan lantai</li>
            <li>Penambahan ventilasi udara</li>
            <li>Perbaikan sistem listrik</li>
          </ul>
          
          <h3>Manfaat:</h3>
          <p>Dengan ruang kelas yang nyaman, para santri dapat belajar dengan lebih fokus dan semangat. Ini akan berdampak positif pada kualitas pendidikan Al-Qur'an yang mereka terima.</p>
        `,
        target: 50000000,
        collected: 15000000,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        status: "ACTIVE",
        priority: 10,
        featured: true,
        urgent: true,
        location: "TPQ Baitus Shuffah, Jakarta",
        beneficiaries: 150,
        categoryId: categories.find(c => c.slug === "pembangunan-gedung")?.id || categories[0].id,
        createdById: adminUser.id,
      },
      {
        title: "Beasiswa Santri Yatim Piatu",
        slug: "beasiswa-santri-yatim-piatu",
        description: "Program beasiswa untuk santri yatim piatu agar dapat mengikuti pendidikan Al-Qur'an tanpa terkendala biaya.",
        shortDesc: "Beasiswa pendidikan untuk santri yatim piatu",
        content: `
          <h3>Program Beasiswa Santri Yatim Piatu</h3>
          <p>TPQ Baitus Shuffah berkomitmen untuk memberikan kesempatan pendidikan Al-Qur'an kepada semua anak, termasuk mereka yang berasal dari keluarga kurang mampu, khususnya anak yatim piatu.</p>
          
          <h3>Yang Akan Didapatkan Penerima Beasiswa:</h3>
          <ul>
            <li>Bebas biaya pendidikan selama 1 tahun</li>
            <li>Buku-buku pembelajaran gratis</li>
            <li>Seragam dan perlengkapan sekolah</li>
            <li>Konsumsi selama belajar</li>
            <li>Bimbingan khusus jika diperlukan</li>
          </ul>
          
          <h3>Kriteria Penerima:</h3>
          <ul>
            <li>Anak yatim piatu atau dari keluarga kurang mampu</li>
            <li>Berusia 6-15 tahun</li>
            <li>Memiliki semangat belajar Al-Qur'an</li>
            <li>Berdomisili di sekitar TPQ</li>
          </ul>
        `,
        target: 30000000,
        collected: 18000000,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-12-31"),
        status: "ACTIVE",
        priority: 8,
        featured: true,
        urgent: false,
        location: "TPQ Baitus Shuffah, Jakarta",
        beneficiaries: 25,
        categoryId: categories.find(c => c.slug === "beasiswa-santri")?.id || categories[0].id,
        createdById: adminUser.id,
      },
      {
        title: "Pengadaan Al-Qur'an dan Buku Iqro",
        slug: "pengadaan-alquran-buku-iqro",
        description: "Pengadaan Al-Qur'an dan buku Iqro baru untuk mengganti yang sudah rusak dan menambah koleksi perpustakaan TPQ.",
        shortDesc: "Pengadaan Al-Qur'an dan buku pembelajaran baru",
        content: `
          <h3>Kebutuhan Buku Pembelajaran</h3>
          <p>TPQ Baitus Shuffah membutuhkan penambahan koleksi Al-Qur'an dan buku Iqro untuk mendukung proses pembelajaran yang lebih baik.</p>
          
          <h3>Yang Akan Dibeli:</h3>
          <ul>
            <li>50 buah Al-Qur'an ukuran sedang</li>
            <li>100 set buku Iqro 1-6</li>
            <li>25 buah Juz Amma</li>
            <li>Buku panduan tajwid</li>
            <li>Buku cerita islami untuk anak</li>
          </ul>
          
          <h3>Manfaat:</h3>
          <p>Dengan tersedianya buku-buku pembelajaran yang cukup dan berkualitas, setiap santri dapat memiliki akses yang sama untuk belajar membaca Al-Qur'an dengan baik dan benar.</p>
        `,
        target: 15000000,
        collected: 8500000,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-08-31"),
        status: "ACTIVE",
        priority: 6,
        featured: false,
        urgent: false,
        location: "TPQ Baitus Shuffah, Jakarta",
        beneficiaries: 200,
        categoryId: categories.find(c => c.slug === "buku-alat-tulis")?.id || categories[0].id,
        createdById: adminUser.id,
      },
      {
        title: "Program Konsumsi Sehat Santri",
        slug: "program-konsumsi-sehat-santri",
        description: "Menyediakan konsumsi sehat dan bergizi untuk santri selama mengikuti pembelajaran di TPQ.",
        shortDesc: "Konsumsi sehat dan bergizi untuk santri",
        content: `
          <h3>Program Konsumsi Sehat</h3>
          <p>Nutrisi yang baik sangat penting untuk mendukung konsentrasi dan kesehatan santri dalam belajar. Program ini bertujuan menyediakan makanan sehat selama jam pembelajaran.</p>
          
          <h3>Menu yang Disediakan:</h3>
          <ul>
            <li>Snack sehat (buah-buahan, roti, susu)</li>
            <li>Air minum bersih</li>
            <li>Makanan bergizi saat program khusus</li>
            <li>Vitamin tambahan jika diperlukan</li>
          </ul>
          
          <h3>Jadwal Program:</h3>
          <ul>
            <li>Senin-Jumat: Snack sore</li>
            <li>Sabtu: Makan siang bersama</li>
            <li>Program khusus: Konsumsi lengkap</li>
          </ul>
        `,
        target: 20000000,
        collected: 12000000,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-12-31"),
        status: "ACTIVE",
        priority: 4,
        featured: false,
        urgent: false,
        location: "TPQ Baitus Shuffah, Jakarta",
        beneficiaries: 180,
        categoryId: categories.find(c => c.slug === "konsumsi-santri")?.id || categories[0].id,
        createdById: adminUser.id,
      },
    ];

    // Create campaigns
    const createdCampaigns = [];
    
    for (const campaignData of campaignsData) {
      const campaign = await prisma.donationCampaign.create({
        data: campaignData,
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      createdCampaigns.push(campaign);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCampaigns.length} donation campaigns`,
      campaigns: createdCampaigns,
    });
  } catch (error) {
    console.error("Error seeding donation campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed donation campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete all existing campaigns (this will also delete related updates due to cascade)
    const deletedCount = await prisma.donationCampaign.deleteMany();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount.count} donation campaigns`,
      deletedCount: deletedCount.count,
    });
  } catch (error) {
    console.error("Error deleting donation campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete donation campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.donationCampaign.findMany({
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            donations: {
              where: {
                status: "PAID",
              },
            },
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate progress for each campaign
    const campaignsWithProgress = campaigns.map((campaign) => ({
      ...campaign,
      progress: campaign.target > 0 ? (campaign.collected / campaign.target) * 100 : 0,
      donorCount: campaign._count.donations,
    }));

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithProgress,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching donation campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
