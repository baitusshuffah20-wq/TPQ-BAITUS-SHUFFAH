import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/payment-gateway/[id]/toggle - Toggle payment gateway status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();
    const { isActive } = data;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "isActive must be a boolean value",
        },
        { status: 400 },
      );
    }

    // Check if gateway exists
    const existingGateway = await prisma.paymentGateway.findUnique({
      where: { id: params.id },
    });

    if (!existingGateway) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway not found",
        },
        { status: 404 },
      );
    }

    // Update gateway status
    const gateway = await prisma.paymentGateway.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      gateway,
      message: `Payment gateway ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling payment gateway status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle payment gateway status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
