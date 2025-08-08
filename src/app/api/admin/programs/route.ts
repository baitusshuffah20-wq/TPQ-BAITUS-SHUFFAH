import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleDatabaseError } from "@/lib/errorHandler";

// GET - Fetch all programs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ageGroup: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.isActive = status === "active";
    }

    // Get programs with pagination
    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" }
        ],
        skip,
        take: limit,
      }),
      prisma.program.count({ where }),
    ]);

    return NextResponse.json({
      programs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching programs:", error);
    return handleDatabaseError(error);
  }
}

// POST - Create new program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      features,
      duration,
      ageGroup,
      schedule,
      price,
      image,
      isActive = true,
      order = 0,
    } = body;

    // Validation
    if (!title || !description || !features || !duration || !ageGroup || !schedule || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        title,
        description,
        features,
        duration,
        ageGroup,
        schedule,
        price,
        image,
        isActive,
        order,
      },
    });

    return NextResponse.json({
      message: "Program created successfully",
      program,
    });

  } catch (error) {
    console.error("Error creating program:", error);
    return handleDatabaseError(error);
  }
}
