import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default donation categories
const defaultCategories = [
  {
    id: "general",
    title: "Donasi Umum",
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
    id: "building",
    title: "Pembangunan Gedung",
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
    id: "scholarship",
    title: "Beasiswa Santri",
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
    id: "books",
    title: "Buku & Alat Tulis",
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
    id: "meals",
    title: "Konsumsi Santri",
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

// Get donation categories from SiteSettings
async function getDonationCategories(activeOnly = false) {
  try {
    // Try to get categories from SiteSettings
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "donation_categories" },
    });

    if (setting) {
      const categories = JSON.parse(setting.value);

      // Filter active categories if needed
      if (activeOnly) {
        return categories.filter((cat: any) => cat.isActive);
      }

      return categories;
    }

    // If no categories found in SiteSettings, return default categories
    return defaultCategories;
  } catch (error) {
    console.error("Error getting donation categories:", error);
    return defaultCategories;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active") === "true";

    // Get categories
    const categories = await getDonationCategories(activeOnly);

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching donation categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.target ||
      !data.icon ||
      !data.color ||
      !data.bgColor
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Get existing categories
    const categories = await getDonationCategories();

    // Create new category
    const newCategory = {
      id: `category_${Date.now()}`,
      title: data.title,
      description: data.description,
      target: data.target,
      collected: data.collected || 0,
      icon: data.icon,
      color: data.color,
      bgColor: data.bgColor,
      urgent: data.urgent || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      order: data.order || categories.length + 1,
    };

    // Add new category to list
    categories.push(newCategory);

    // Save categories to SiteSettings
    await prisma.siteSetting.upsert({
      where: { key: "donation_categories" },
      update: { value: JSON.stringify(categories) },
      create: {
        key: "donation_categories",
        value: JSON.stringify(categories),
        type: "json",
        category: "donations",
        label: "Donation Categories",
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating donation category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create donation category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
