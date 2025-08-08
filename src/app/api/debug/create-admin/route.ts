import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
        }
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const admin = await prisma.user.create({
      data: {
        email: "admin@tpqbaitusshuffah.com",
        name: "Administrator",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
        emailVerified: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      credentials: {
        email: "admin@tpqbaitusshuffah.com",
        password: "admin123"
      }
    });

  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create admin user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check database connection and users
    const userCount = await prisma.user.count();
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      database: "Connected",
      totalUsers: userCount,
      adminUsers,
      message: userCount === 0 ? "No users found. Use POST to create admin." : "Database check complete"
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
