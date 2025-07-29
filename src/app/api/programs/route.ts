import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: {
        isActive: true, // Only fetch active programs
      },
      orderBy: {
        order: "asc",
      },
    });
    return NextResponse.json({
      success: true,
      programs: programs,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch programs",
      },
      { status: 500 },
    );
  }
}
