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

    // Create error log in database
    const errorLog = await prisma.errorLog.create({
      data: {
        message: data.message,
        stack: data.stack || null,
        url: data.url || null,
        userId: data.userId || null,
        userAgent: data.userAgent || null,
        severity: data.severity || "ERROR",
        context: data.context || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
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
