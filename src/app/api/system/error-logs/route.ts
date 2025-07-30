import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/system/error-logs - Get error logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const source = searchParams.get("source") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { message: { contains: search, mode: "insensitive" } },
        { stack: { contains: search, mode: "insensitive" } },
      ];
    }

    if (level) {
      where.level = level;
    }

    if (source) {
      where.source = { contains: source, mode: "insensitive" };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // Get total count
    const total = await prisma.errorLog.count({ where });

    // Get error logs
    const logs = await prisma.errorLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch error logs" },
      { status: 500 }
    );
  }
}

// DELETE /api/system/error-logs - Clear all error logs
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all error logs
    const result = await prisma.errorLog.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${result.count} error logs deleted successfully`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error clearing error logs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear error logs" },
      { status: 500 }
    );
  }
}

// POST /api/system/error-logs - Create new error log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      stack,
      level = "ERROR",
      source,
      url,
      userAgent,
      userId,
    } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    // Validate userId if provided
    let validUserId = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userId;
      }
    }

    const errorLog = await prisma.errorLog.create({
      data: {
        message,
        stack,
        level,
        source,
        url,
        userAgent,
        userId: validUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Error log created successfully",
      errorLog,
    });
  } catch (error) {
    console.error("Error creating error log:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create error log" },
      { status: 500 }
    );
  }
}
