import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testConnection } from "@/lib/db-test";
// Default donation categories (fallback)
const defaultCategories = [
  {
    title: "Donasi Umum",
    slug: "donasi-umum",
    description: "Untuk operasional sehari-hari rumah tahfidz",
    target: 100000000,
    collected: 75000000,
    icon: "Heart",
    color: "text-red-600",
    bgColor: "bg-red-50",
    urgent: false,
    isActive: true,
    order: 1,
  },
  {
    title: "Pembangunan Gedung",
    slug: "pembangunan-gedung",
    description: "Renovasi dan pembangunan fasilitas baru",
    target: 500000000,
    collected: 320000000,
    icon: "Building",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    urgent: true,
    isActive: true,
    order: 2,
  },
  {
    title: "Beasiswa Santri",
    slug: "beasiswa-santri",
    description: "Bantuan biaya pendidikan untuk santri kurang mampu",
    target: 200000000,
    collected: 150000000,
    icon: "GraduationCap",
    color: "text-green-600",
    bgColor: "bg-green-50",
    urgent: false,
    isActive: true,
    order: 3,
  },
  {
    title: "Buku & Alat Tulis",
    slug: "buku-alat-tulis",
    description: "Pengadaan Al-Quran dan buku pembelajaran",
    target: 50000000,
    collected: 35000000,
    icon: "BookOpen",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    urgent: false,
    isActive: true,
    order: 4,
  },
  {
    title: "Konsumsi Santri",
    slug: "konsumsi-santri",
    description: "Biaya makan dan snack untuk santri",
    target: 80000000,
    collected: 60000000,
    icon: "Utensils",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    urgent: false,
    isActive: true,
    order: 5,
  },
];

// GET /api/donations/categories/db - Get donation categories from database
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active") === "true";

    const categories = await prisma.donationCategory.findMany({
      orderBy: { order: "asc" },
      where: activeOnly ? { isActive: true } : undefined,
    });

    if (!categories || categories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: [],
      });
    }

    // Validasi parameter 'active'
    const activeParam = url.searchParams.get("active");
    if (activeParam && activeParam !== "true" && activeParam !== "false") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid 'active' parameter. Must be 'true' or 'false'.",
        },
        { status: 400 },
      );
    }
    await testConnection();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching donation categories from DB:", error);
    // Return a proper server error response

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation categories from database.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/donations/categories/db/seed - Seed donation categories in database

export async function POST() {
  try {
    const existingCategories = await prisma.donationCategory.findMany();

    if (existingCategories.length > 0) {
      return NextResponse.json({
        success: true,
        message: `${existingCategories.length} donation categories already exist in database. No seeding needed.`,
        categories: existingCategories,
      });
    }

    const categories = await prisma.$transaction(
      defaultCategories.map((category) =>
        prisma.donationCategory.create({
          data: category,
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: `${categories.length} donation categories seeded successfully in database`,
      categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed donation categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
