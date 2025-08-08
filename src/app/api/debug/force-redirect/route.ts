import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
        redirectUrl: "/login"
      }, { status: 401 });
    }

    // Determine redirect URL based on user role
    let redirectUrl = "/dashboard";
    
    switch (session.user.role) {
      case "ADMIN":
        redirectUrl = "/dashboard/admin";
        break;
      case "MUSYRIF":
        redirectUrl = "/dashboard/musyrif";
        break;
      case "WALI":
        redirectUrl = "/dashboard/wali";
        break;
      default:
        redirectUrl = "/dashboard/user";
    }

    // Get callback URL from request if provided
    const body = await request.json().catch(() => ({}));
    const callbackUrl = body.callbackUrl;
    
    if (callbackUrl && callbackUrl !== "/dashboard") {
      redirectUrl = callbackUrl;
    }

    console.log("🚀 Force redirect API called:", {
      userEmail: session.user.email,
      userRole: session.user.role,
      redirectUrl,
      callbackUrl
    });

    return NextResponse.json({
      success: true,
      message: "Redirect URL determined",
      redirectUrl,
      user: {
        email: session.user.email,
        role: session.user.role,
        id: session.user.id
      }
    });

  } catch (error) {
    console.error("Error in force redirect API:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to determine redirect URL",
      details: error instanceof Error ? error.message : "Unknown error",
      redirectUrl: "/dashboard"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Force redirect API is working",
    usage: "POST with optional { callbackUrl: string } to get redirect URL for authenticated user"
  });
}
