import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/categories - Get all donation categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.donationCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            donations: {
              where: {
                status: "PAID",
              },
            },
            campaigns: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Calculate progress for each category
    const categoriesWithProgress = categories.map((category) => ({
      ...category,
      progress: category.target > 0 ? (category.collected / category.target) * 100 : 0,
      donationCount: category._count.donations,
      campaignCount: category._count.campaigns,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithProgress,
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

// POST /api/donations/categories - Create new donation category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: title",
        },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingCategory = await prisma.donationCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category with this slug already exists",
        },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.donationCategory.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        target: parseInt(data.target) || 0,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        urgent: data.urgent || false,
        isActive: data.isActive !== false, // Default to true
        order: parseInt(data.order) || 0,
        image: data.image,
      },
    });

    return NextResponse.json({
      success: true,
      category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating donation category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create donation category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
