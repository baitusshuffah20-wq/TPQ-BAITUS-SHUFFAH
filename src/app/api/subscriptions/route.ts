import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SubscriptionService } from "@/lib/subscription-service";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions - Get subscriptions
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (isActive !== null && isActive !== "") {
      whereClause.isActive = isActive === "true";
    }
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get subscriptions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/subscriptions - Create subscription
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      studentId,
      planType,
      amount,
      billingCycle,
      startDate,
      endDate,
      paymentMethod,
      gateway,
      trialDays,
      autoRenewal,
      metadata,
      createdBy,
    } = body;

    // Validation
    if (!studentId || !planType || !amount || !billingCycle) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student ID, plan type, amount, and billing cycle are required",
        },
        { status: 400 },
      );
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, role: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    // Check for existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        studentId,
        planType,
        status: { in: ["ACTIVE", "TRIAL"] },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Student already has an active subscription for this plan",
        },
        { status: 400 },
      );
    }

    // Create subscription
    const subscription = await SubscriptionService.createSubscription({
      studentId,
      planType,
      amount,
      billingCycle,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      paymentMethod,
      gateway,
      trialDays,
      autoRenewal,
      metadata,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
