import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("🔐 Force login attempt:", { email });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      }, { status: 401 });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: "Invalid password",
      }, { status: 401 });
    }

    // Return user data for manual session creation
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      redirectUrl: user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard",
    });

  } catch (error) {
    console.error("Force login error:", error);
    return NextResponse.json({
      success: false,
      error: "Login failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Force login API is working",
    usage: "POST with { email, password } to bypass NextAuth login"
  });
}
