import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a fallback endpoint for deleting news items
// It bypasses authentication for testing purposes
// DO NOT USE IN PRODUCTION

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "News ID is required",
        },
        { status: 400 },
      );
    }

    console.log(
      `Attempting to delete news with ID: ${id} using fallback method`,
    );

    // Check if news exists
    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      console.log(`News with ID ${id} not found`);
      return NextResponse.json(
        {
          success: false,
          error: "News not found",
        },
        { status: 404 },
      );
    }

    console.log(`Found news item: ${news.title}`);

    // Delete news from database
    await prisma.news.delete({
      where: { id },
    });

    console.log(`Successfully deleted news with ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: "News deleted successfully using fallback method",
    });
  } catch (error) {
    console.error("Error in fallback delete endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete news",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
