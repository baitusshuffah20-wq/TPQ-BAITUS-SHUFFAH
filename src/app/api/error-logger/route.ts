import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.message) {
      return NextResponse.json(
        { success: false, error: "Error message is required" },
        { status: 400 },
      );
    }

    // Validate userId if provided
    let validUserId = null;
    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = data.userId;
      }
    }

    // Create error log in database
    const errorLog = await prisma.errorLog.create({
      data: {
        message: data.message,
        stack: data.stack || null,
        level: data.severity || data.level || "ERROR",
        source: data.context || data.source || null,
        url: data.url || null,
        userAgent: data.userAgent || null,
        userId: validUserId,
      },
    });

    return NextResponse.json({
      success: true,
      errorLogId: errorLog.id,
    });
  } catch (error) {
    console.error("Error logging error:", error);

    // Even if logging fails, return success to avoid cascading errors
    return NextResponse.json({
      success: true,
      message: "Error occurred while logging error",
    });
  }
}
