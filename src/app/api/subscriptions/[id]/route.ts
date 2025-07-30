import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SubscriptionService } from "@/lib/subscription-service";

// GET /api/subscriptions/[id] - Get subscription details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getSubscription(params.id);

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error getting subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PATCH /api/subscriptions/[id] - Update subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const { action, ...data } = body;

    let result;

    switch (action) {
      case "pause":
        result = await SubscriptionService.pauseSubscription(
          params.id,
          data.reason,
        );
        break;

      case "resume":
        result = await SubscriptionService.resumeSubscription(params.id);
        break;

      case "cancel":
        result = await SubscriptionService.cancelSubscription(
          params.id,
          data.reason,
        );
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      message: `Subscription ${action}ed successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
