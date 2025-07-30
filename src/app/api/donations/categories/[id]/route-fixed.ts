import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/categories/[id] - Get specific category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.donationCategory.findUnique({
      where: { id: params.id },
      include: {
        campaigns: {
          where: {
            isActive: true,
          },
          orderBy: {
            priority: "desc",
          },
        },
        donations: {
          where: {
            status: "PAID",
          },
          select: {
            id: true,
            amount: true,
            donorName: true,
            isAnonymous: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Latest 10 donations
        },
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
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = category.target > 0 ? (category.collected / category.target) * 100 : 0;

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        progress,
        donationCount: category._count.donations,
        campaignCount: category._count.campaigns,
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/donations/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Check if category exists
    const existingCategory = await prisma.donationCategory.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // If slug is being changed, check for uniqueness
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.donationCategory.findFirst({
        where: {
          slug: data.slug,
          id: { not: params.id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Category with this slug already exists",
          },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.donationCategory.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        target: data.target ? parseInt(data.target) : undefined,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        urgent: data.urgent,
        isActive: data.isActive,
        order: data.order ? parseInt(data.order) : undefined,
        image: data.image,
      },
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category exists
    const existingCategory = await prisma.donationCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            donations: true,
            campaigns: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has donations or campaigns
    if (existingCategory._count.donations > 0 || existingCategory._count.campaigns > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category that has donations or campaigns. Consider deactivating instead.",
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.donationCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
