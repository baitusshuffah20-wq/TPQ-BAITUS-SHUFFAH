import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/campaigns/[id]/updates - Get campaign updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const skip = (page - 1) * limit;

    // Check if campaign exists
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
      select: { id: true, title: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    const [updates, total] = await Promise.all([
      prisma.campaignUpdate.findMany({
        where: { campaignId: params.id },
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
        skip,
        take: limit,
      }),
      prisma.campaignUpdate.count({
        where: { campaignId: params.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      updates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching campaign updates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign updates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/donations/campaigns/[id]/updates - Create campaign update
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.createdById) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, content, createdById",
        },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id: params.id },
      select: { id: true, title: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Create update
    const update = await prisma.campaignUpdate.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        campaignId: params.id,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      update,
      message: "Campaign update created successfully",
    });
  } catch (error) {
    console.error("Error creating campaign update:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign update",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
