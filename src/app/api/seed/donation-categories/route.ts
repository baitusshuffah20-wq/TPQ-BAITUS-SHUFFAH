import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const donationCategoriesData = [
  {
    name: "Pembangunan Masjid",
    description: "Donasi untuk pembangunan dan renovasi masjid TPQ Baitus Shuffah",
    icon: "🕌",
    color: "#10B981",
    isActive: true,
    order: 1,
  },
  {
    name: "Beasiswa Santri",
    description: "Bantuan biaya pendidikan untuk santri kurang mampu",
    icon: "🎓",
    color: "#3B82F6",
    isActive: true,
    order: 2,
  },
  {
    name: "Operasional TPQ",
    description: "Donasi untuk kebutuhan operasional harian TPQ",
    icon: "🏫",
    color: "#8B5CF6",
    isActive: true,
    order: 3,
  },
  {
    name: "Sarana Pembelajaran",
    description: "Pengadaan buku, Al-Quran, dan peralatan pembelajaran",
    icon: "📚",
    color: "#F59E0B",
    isActive: true,
    order: 4,
  },
  {
    name: "Kesejahteraan Ustadz",
    description: "Bantuan untuk kesejahteraan para ustadz dan pengajar",
    icon: "👨‍🏫",
    color: "#EF4444",
    isActive: true,
    order: 5,
  },
  {
    name: "Program Tahfidz",
    description: "Dukungan khusus untuk program hafalan Al-Quran",
    icon: "📖",
    color: "#06B6D4",
    isActive: true,
    order: 6,
  },
  {
    name: "Kegiatan Ramadan",
    description: "Donasi untuk kegiatan khusus bulan Ramadan",
    icon: "🌙",
    color: "#84CC16",
    isActive: true,
    order: 7,
  },
  {
    name: "Santunan Yatim",
    description: "Bantuan untuk anak yatim dan dhuafa",
    icon: "🤲",
    color: "#F97316",
    isActive: true,
    order: 8,
  },
  {
    name: "Teknologi & Digital",
    description: "Pengembangan sistem digital dan teknologi pembelajaran",
    icon: "💻",
    color: "#6366F1",
    isActive: true,
    order: 9,
  },
  {
    name: "Wakaf Tunai",
    description: "Wakaf tunai untuk investasi jangka panjang TPQ",
    icon: "💰",
    color: "#059669",
    isActive: true,
    order: 10,
  }
];

export async function POST() {
  try {
    // Clear existing donation categories
    await prisma.donationCategory.deleteMany({});
    
    // Insert new donation categories
    const categories = await prisma.donationCategory.createMany({
      data: donationCategoriesData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${categories.count} donation categories`,
      categories: donationCategoriesData.map(c => ({ name: c.name, icon: c.icon })),
    });

  } catch (error) {
    console.error("Error seeding donation categories:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to seed donation categories",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const categories = await prisma.donationCategory.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        isActive: c.isActive,
        order: c.order,
      })),
    });

  } catch (error) {
    console.error("Error fetching donation categories:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch donation categories",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
