import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch maintenance mode setting from database
    const maintenanceSetting = await prisma.siteSetting.findUnique({
      where: {
        key: "site.maintenanceMode",
      },
    });

    const isMaintenanceMode = maintenanceSetting?.value === "true";

    // Set cookie for middleware to use
    const response = NextResponse.json({
      success: true,
      maintenanceMode: isMaintenanceMode,
    });

    // Set cookie with maintenance mode status
    response.cookies.set(
      "maintenance_mode",
      isMaintenanceMode ? "true" : "false",
      {
        path: "/",
        maxAge: 60 * 5, // 5 minutes
        httpOnly: true,
        sameSite: "strict",
      },
    );

    return response;
  } catch (error) {
    console.error("Error fetching maintenance mode status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch maintenance mode status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request. Expected "enabled" boolean field.',
        },
        { status: 400 },
      );
    }

    // Update maintenance mode setting
    const setting = await prisma.siteSetting.upsert({
      where: {
        key: "site.maintenanceMode",
      },
      update: {
        value: enabled ? "true" : "false",
      },
      create: {
        key: "site.maintenanceMode",
        value: enabled ? "true" : "false",
        type: "BOOLEAN",
        category: "SYSTEM",
        label: "Maintenance Mode",
        description: "Enable or disable maintenance mode",
        isPublic: false,
      },
    });

    // Set cookie for middleware to use
    const response = NextResponse.json({
      success: true,
      maintenanceMode: enabled,
      setting,
    });

    // Set cookie with maintenance mode status
    response.cookies.set("maintenance_mode", enabled ? "true" : "false", {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error updating maintenance mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update maintenance mode",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
