import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    // Build where clause
    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    // Fetch donations from database
    const donations = await prisma.donation.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donations",
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
    if (!data.donorName || !data.amount || !data.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorPhone: data.donorPhone,
        amount: parseFloat(data.amount),
        type: data.type,
        method: data.method || "MANUAL",
        status: data.status || "PENDING",
        reference: data.reference,
        message: data.message,
        isAnonymous: data.isAnonymous || false,
        categoryId: data.categoryId,
        paymentMethod: data.paymentMethod,
      },
    });

    // If donation has a category, update the collected amount
    if (data.categoryId) {
      await prisma.donationCategory.update({
        where: { id: data.categoryId },
        data: {
          collected: {
            increment: parseFloat(data.amount),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create donation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
