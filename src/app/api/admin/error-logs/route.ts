import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const status = searchParams.get("status"); // 'resolved', 'unresolved', or null for all

    // Build query
    const whereClause: any = {};
    if (status === "resolved") {
      whereClause.resolved = true;
    } else if (status === "unresolved") {
      whereClause.resolved = false;
    }

    // Fetch error logs
    const errorLogs = await prisma.errorLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      errorLogs,
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch error logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
