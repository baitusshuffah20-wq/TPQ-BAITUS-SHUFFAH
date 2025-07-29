import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    buildId: string;
  };
}

// In-memory storage for demo builds (in production, use database)
const buildStorage = new Map<string, any>();

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { buildId } = params;

    if (!buildId) {
      return NextResponse.json(
        { success: false, error: "Build ID is required" },
        { status: 400 },
      );
    }

    // Check if build exists in storage
    const buildInfo = buildStorage.get(buildId);

    if (!buildInfo) {
      // For demo purposes, create a default completed build
      const demoBuild = {
        buildId,
        status: "completed",
        platform: "android",
        appType: "wali",
        progress: 100,
        message: "Build completed successfully!",
        downloadUrl: `/api/mobile-builds/download/${buildId}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      buildStorage.set(buildId, demoBuild);

      return NextResponse.json({
        success: true,
        build: demoBuild,
      });
    }

    return NextResponse.json({
      success: true,
      build: buildInfo,
    });
  } catch (error) {
    console.error("Build status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get build status" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { buildId } = params;
    const buildInfo = await request.json();

    if (!buildId) {
      return NextResponse.json(
        { success: false, error: "Build ID is required" },
        { status: 400 },
      );
    }

    // Store build info
    buildStorage.set(buildId, {
      ...buildInfo,
      buildId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Build info updated",
    });
  } catch (error) {
    console.error("Build update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update build info" },
      { status: 500 },
    );
  }
}
