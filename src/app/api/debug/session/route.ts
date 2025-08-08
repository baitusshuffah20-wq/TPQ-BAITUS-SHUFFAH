import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get session using getServerSession
    const session = await getServerSession(authOptions);
    
    // Get token using getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Get URL info
    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get("callbackUrl");

    return NextResponse.json({
      success: true,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          avatar: session.user.avatar,
        },
        expires: session.expires,
      } : null,
      token: token ? {
        sub: token.sub,
        role: token.role,
        avatar: token.avatar,
        iat: token.iat,
        exp: token.exp,
      } : null,
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
      },
      request: {
        url: request.url,
        callbackUrl,
        headers: {
          host: request.headers.get("host"),
          "user-agent": request.headers.get("user-agent"),
          cookie: request.headers.get("cookie") ? "PRESENT" : "NOT PRESENT",
        }
      },
      redirectLogic: {
        hasSession: !!session,
        hasToken: !!token,
        userRole: session?.user?.role || token?.role || "NONE",
        suggestedRedirect: getSuggestedRedirect(session?.user?.role || token?.role as any, callbackUrl),
      }
    });

  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function getSuggestedRedirect(role: string | undefined, callbackUrl: string | null): string {
  // If there's a specific callback URL, use it
  if (callbackUrl && callbackUrl !== "/dashboard") {
    return callbackUrl;
  }

  // Default redirect based on role
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "MUSYRIF":
      return "/dashboard/musyrif";
    case "WALI":
      return "/dashboard/wali";
    default:
      return "/dashboard/user";
  }
}
