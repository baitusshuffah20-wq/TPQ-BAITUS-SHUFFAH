import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment-gateway/[id] - Get specific payment gateway
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id: params.id },
    });

    if (!gateway) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      gateway,
    });
  } catch (error) {
    console.error("Error fetching payment gateway:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment gateway",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT /api/payment-gateway/[id] - Update payment gateway
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();

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

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existingGateway.name) {
      const nameExists = await prisma.paymentGateway.findFirst({
        where: {
          name: data.name,
          id: { not: params.id },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment gateway with this name already exists",
          },
          { status: 400 },
        );
      }
    }

    // Update payment gateway
    const gateway = await prisma.paymentGateway.update({
      where: { id: params.id },
      data: {
        name: data.name,
        type: data.type,
        provider: data.provider,
        isActive: data.isActive,
        config: data.config,
        fees: data.fees,
        description: data.description,
        logo: data.logo,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      gateway,
      message: "Payment gateway updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment gateway:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment gateway",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/payment-gateway/[id] - Delete payment gateway
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
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

    // Check if gateway is being used in any transactions
    const transactionCount = await prisma.transaction.count({
      where: { paymentGatewayId: params.id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete payment gateway that has been used in transactions",
        },
        { status: 400 },
      );
    }

    // Delete payment gateway
    await prisma.paymentGateway.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Payment gateway deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment gateway:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete payment gateway",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
