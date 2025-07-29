import { NextResponse } from "next/server";
import { aiInsights } from "@/lib/ai-insights";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const halaqahs = await prisma.halaqah.findMany({
      select: { id: true },
    });

    const allInsights = await Promise.all(
      halaqahs.map((h) => aiInsights.generateClassInsights(h.id)),
    );

    const validInsights = allInsights.filter((i) => i !== null);

    // Aggregate insights
    const aggregatedData = {
      overallTrend: "STABLE", // Simplified for now
      averageGrade:
        validInsights.reduce((sum, i) => sum + i!.averagePerformance, 0) /
        validInsights.length,
      attendanceRate:
        validInsights.reduce((sum, i) => sum + i!.attendanceRate, 0) /
        validInsights.length,
      needsAttention: validInsights.flatMap((i) => i!.needsAttention),
      topPerformers: validInsights.flatMap((i) => i!.topPerformers),
      insights: validInsights.flatMap((i) => i!.recommendations),
    };

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating class insights:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
