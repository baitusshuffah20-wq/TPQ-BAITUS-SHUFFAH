import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/campaigns/slug/[slug] - Get campaign by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const campaign = await prisma.donationCampaign.findUnique({
      where: { slug: params.slug },
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
    console.error("Error fetching campaign by slug:", error);
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
