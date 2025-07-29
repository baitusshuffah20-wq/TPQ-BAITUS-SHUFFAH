import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing halaqah API...");

    // Check if halaqah table exists
    let halaqahExists = false;
    let halaqahColumns = [];

    try {
      halaqahColumns = await prisma.$queryRaw`DESCRIBE halaqah`;
      halaqahExists = true;
      console.log("Halaqah table exists with columns:", halaqahColumns);
    } catch (error) {
      console.error("Error checking halaqah table:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Halaqah table does not exist",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Try to get all halaqah records with minimal fields
    try {
      console.log("Fetching halaqah records...");
      const halaqah = await prisma.halaqah.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          level: true,
          capacity: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(`Found ${halaqah.length} halaqah records`);

      return NextResponse.json({
        success: true,
        message: "Halaqah test successful",
        halaqah,
        count: halaqah.length,
      });
    } catch (error) {
      console.error("Error fetching halaqah records:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Error fetching halaqah records",
          error: error instanceof Error ? error.message : "Unknown error",
          stack:
            process.env.NODE_ENV !== "production" && error instanceof Error
              ? error.stack
              : undefined,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Halaqah API test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Halaqah API test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 },
    );
  }
}
