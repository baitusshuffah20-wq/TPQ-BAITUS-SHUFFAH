import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/payment/methods - Get all payment methods
export async function GET(request: NextRequest) {
  try {
    // Get payment methods from database
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      methods: paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment methods",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/payment/methods - Create a new payment method
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.code || !body.gateway) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: body.name,
        code: body.code,
        gateway: body.gateway,
        isActive: body.isActive !== undefined ? body.isActive : true,
        icon: body.icon || "",
        description: body.description || "",
        fees: body.fees !== undefined ? body.fees : 0,
        minAmount: body.minAmount !== undefined ? body.minAmount : 0,
        maxAmount: body.maxAmount !== undefined ? body.maxAmount : 1000000000,
      },
    });

    return NextResponse.json({
      success: true,
      method: paymentMethod,
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment method",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
