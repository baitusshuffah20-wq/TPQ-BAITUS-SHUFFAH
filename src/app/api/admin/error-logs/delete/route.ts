import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    // Get error log ID from request body
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Error log ID is required" },
        { status: 400 },
      );
    }

    // Check if error log exists
    const errorLog = await prisma.errorLog.findUnique({
      where: { id },
    });

    if (!errorLog) {
      return NextResponse.json(
        { success: false, error: "Error log not found" },
        { status: 404 },
      );
    }

    // Delete error log
    await prisma.errorLog.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Error log deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting error log:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete error log",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
