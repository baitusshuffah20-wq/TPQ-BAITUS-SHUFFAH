import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        musyrif: {
          include: {
            halaqah: {
              include: {
                schedules: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Password salah" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "24h" }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          halaqahId: user.halaqahId,
        },
        musyrif: user.musyrif && user.musyrif[0] ? {
          id: user.musyrif[0].id,
          name: user.musyrif[0].name,
          halaqahId: user.musyrif[0].halaqahId,
          halaqah: user.musyrif[0].halaqah ? {
            id: user.musyrif[0].halaqah.id,
            name: user.musyrif[0].halaqah.name,
            room: user.musyrif[0].halaqah.room,
          } : null,
        } : null,
        token,
      },
    });

    // Set cookie for authentication
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Error during test login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal login",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Test Login API",
    instructions: {
      method: "POST",
      body: {
        email: "musyrif@test.com",
        password: "password123"
      },
      description: "Login dengan user test yang sudah dibuat"
    }
  });
}
