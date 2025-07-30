import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultCategories = [
  {
    title: "Donasi Umum",
    slug: "donasi-umum",
    description: "Untuk operasional sehari-hari TPQ Baitus Shuffah",
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
    description: "Renovasi dan pembangunan fasilitas baru TPQ",
    target: 500000000,
    collected: 320000000,
    icon: "Building2",
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

export async function POST(request: NextRequest) {
  try {
    // Check if categories already exist
    const existingCategories = await prisma.donationCategory.findMany();
    
    if (existingCategories.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Categories already exist. Use DELETE method to reset first.",
        count: existingCategories.length,
      });
    }

    // Create categories
    const createdCategories = [];
    
    for (const categoryData of defaultCategories) {
      const category = await prisma.donationCategory.create({
        data: categoryData,
      });
      createdCategories.push(category);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCategories.length} donation categories`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error seeding donation categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed donation categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete all existing categories (this will also delete related donations due to foreign key constraints)
    const deletedCount = await prisma.donationCategory.deleteMany();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount.count} donation categories`,
      deletedCount: deletedCount.count,
    });
  } catch (error) {
    console.error("Error deleting donation categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete donation categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.donationCategory.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching donation categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
