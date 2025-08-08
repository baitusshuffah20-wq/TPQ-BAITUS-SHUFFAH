import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Get all users with their basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user count by role
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users,
      roleCounts,
      message: users.length === 0 ? "No users found in database" : `Found ${users.length} users`
    });

  } catch (error) {
    console.error("Error checking users:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check users",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email and password are required"
      }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        email,
        suggestion: "User with this email does not exist in database"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      passwordCheck: {
        isValid: isPasswordValid,
        message: isPasswordValid ? "Password is correct" : "Password is incorrect"
      }
    });

  } catch (error) {
    console.error("Error checking login:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check login",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
