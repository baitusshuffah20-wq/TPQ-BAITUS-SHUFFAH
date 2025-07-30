import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/donations/campaigns - Get all donation campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { slug: { equals: search } }, // Exact match for slug
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDesc: { contains: search, mode: "insensitive" } },
      ];
    }

    // Only show active campaigns by default
    if (!searchParams.get("includeInactive")) {
      where.isActive = true;
    }

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.donationCampaign.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.donationCampaign.count({ where }),
    ]);

    // Calculate progress for each campaign
    const campaignsWithProgress = campaigns.map((campaign) => ({
      ...campaign,
      progress: campaign.target > 0 ? (campaign.collected / campaign.target) * 100 : 0,
      donorCount: campaign._count.donations,
    }));

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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

// POST /api/donations/campaigns - Create new donation campaign
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.createdById) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, createdById",
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
    const existingCampaign = await prisma.donationCampaign.findUnique({
      where: { slug },
    });

    if (existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign with this slug already exists",
        },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.donationCampaign.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        content: data.content,
        target: parseFloat(data.target) || 0,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || "ACTIVE",
        priority: parseInt(data.priority) || 0,
        featured: data.featured || false,
        urgent: data.urgent || false,
        image: data.image,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        location: data.location,
        beneficiaries: data.beneficiaries ? parseInt(data.beneficiaries) : null,
        tags: data.tags,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        categoryId: data.categoryId,
        createdById: data.createdById,
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
      campaign,
      message: "Campaign created successfully",
    });
  } catch (error) {
    console.error("Error creating donation campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create donation campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
