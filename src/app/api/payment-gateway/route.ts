import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment-gateway - Get all payment gateways
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const where: any = {};

    if (isActive && isActive !== "ALL") {
      where.isActive = isActive === "true";
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    const gateways = await prisma.paymentGateway.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      gateways,
    });
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment gateways",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/payment-gateway - Create new payment gateway
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type || !data.provider) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, type, provider",
        },
        { status: 400 },
      );
    }

    // Check if gateway name already exists
    const existingGateway = await prisma.paymentGateway.findFirst({
      where: { name: data.name },
    });

    if (existingGateway) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway with this name already exists",
        },
        { status: 400 },
      );
    }

    // Create payment gateway
    const gateway = await prisma.paymentGateway.create({
      data: {
        name: data.name,
        type: data.type,
        provider: data.provider,
        isActive: data.isActive ?? true,
        config: data.config || {},
        fees: data.fees || {
          fixedFee: 0,
          percentageFee: 0,
          minFee: 0,
          maxFee: 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      gateway,
      message: "Payment gateway created successfully",
    });
  } catch (error) {
    console.error("Error creating payment gateway:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment gateway",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
