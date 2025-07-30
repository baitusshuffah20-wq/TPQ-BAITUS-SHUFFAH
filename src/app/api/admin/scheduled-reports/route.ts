import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const scheduledReports = await prisma.scheduledReport.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: scheduledReports,
    });
  } catch (error) {
    console.error("Error fetching scheduled reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      reportType,
      reportName,
      frequency,
      scheduleTime,
      recipients,
      filters,
      isActive = true,
    } = body;

    // Validate required fields
    if (!reportType || !reportName || !frequency || !scheduleTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create scheduled report
    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        reportType,
        reportName,
        frequency,
        scheduleTime,
        recipients: recipients || [],
        filters: filters || {},
        isActive,
        createdBy: session.user.id,
        nextRunDate: calculateNextRunDate(frequency, scheduleTime),
      },
    });

    return NextResponse.json({
      success: true,
      data: scheduledReport,
      message: "Scheduled report created successfully",
    });
  } catch (error) {
    console.error("Error creating scheduled report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Update next run date if frequency or schedule time changed
    if (updateData.frequency || updateData.scheduleTime) {
      const report = await prisma.scheduledReport.findUnique({
        where: { id },
      });
      
      if (report) {
        updateData.nextRunDate = calculateNextRunDate(
          updateData.frequency || report.frequency,
          updateData.scheduleTime || report.scheduleTime
        );
      }
    }

    const updatedReport = await prisma.scheduledReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedReport,
      message: "Scheduled report updated successfully",
    });
  } catch (error) {
    console.error("Error updating scheduled report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    await prisma.scheduledReport.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scheduled report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate next run date
function calculateNextRunDate(frequency: string, scheduleTime: string): Date {
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(":").map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (frequency) {
    case "DAILY":
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case "WEEKLY":
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    case "MONTHLY":
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
    default:
      nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun;
}
