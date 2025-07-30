import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/campaigns/[id] - Get specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
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
        updates: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = campaign.target > 0 ? (campaign.collected / campaign.target) * 100 : 0;

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        progress,
        donorCount: campaign._count.donations,
      },
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/donations/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Check if campaign exists
    const existingCampaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // If slug is being changed, check for uniqueness
    if (data.slug && data.slug !== existingCampaign.slug) {
      const slugExists = await prisma.donationCampaign.findFirst({
        where: {
          slug: data.slug,
          id: { not: params.id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Campaign with this slug already exists",
          },
          { status: 400 }
        );
      }
    }

    // Update campaign
    const updatedCampaign = await prisma.donationCampaign.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDesc: data.shortDesc,
        content: data.content,
        target: data.target ? parseFloat(data.target) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        priority: data.priority ? parseInt(data.priority) : undefined,
        featured: data.featured,
        urgent: data.urgent,
        image: data.image,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        location: data.location,
        beneficiaries: data.beneficiaries ? parseInt(data.beneficiaries) : undefined,
        tags: data.tags,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        categoryId: data.categoryId,
        isActive: data.isActive,
      },
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

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if campaign exists
    const existingCampaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign has donations
    if (existingCampaign._count.donations > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete campaign that has received donations. Consider deactivating instead.",
        },
        { status: 400 }
      );
    }

    // Delete campaign (this will also delete related updates due to cascade)
    await prisma.donationCampaign.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
