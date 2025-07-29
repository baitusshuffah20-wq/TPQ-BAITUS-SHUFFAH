import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface RouteParams {
  params: {
    buildId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { buildId } = params;

    if (!buildId) {
      return NextResponse.json(
        { success: false, error: "Build ID is required" },
        { status: 400 },
      );
    }

    // Try to get build info from status API first
    try {
      const statusResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/mobile-builds/status/${buildId}`,
      );
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success && statusData.build) {
          return generateDemoFile(statusData.build);
        }
      }
    } catch (error) {
      console.log("Status API not available, using fallback");
    }

    // Parse build info from buildId for demo purposes
    const buildInfo = parseBuildId(buildId);

    if (!buildInfo) {
      return NextResponse.json(
        { success: false, error: "Invalid build ID format" },
        { status: 400 },
      );
    }

    // In development mode, generate a demo file
    if (process.env.NODE_ENV === "development") {
      return generateDemoFile(buildInfo);
    }

    // Production mode - check for actual build files
    const historyFile = path.join(process.cwd(), "data", "build-history.json");

    if (!existsSync(historyFile)) {
      return NextResponse.json(
        { success: false, error: "Build history not found" },
        { status: 404 },
      );
    }

    const historyData = await readFile(historyFile, "utf-8");
    const builds = JSON.parse(historyData);

    const build = builds.find((b: any) => b.buildId === buildId);

    if (!build) {
      return NextResponse.json(
        { success: false, error: "Build not found" },
        { status: 404 },
      );
    }

    if (build.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Build is not completed yet" },
        { status: 400 },
      );
    }

    // Check if artifact file exists
    const artifactPath =
      build.artifactPath ||
      path.join(
        process.cwd(),
        "builds",
        buildId,
        `app.${build.platform === "android" ? "apk" : "ipa"}`,
      );

    if (!existsSync(artifactPath)) {
      return NextResponse.json(
        { success: false, error: "Build artifact not found" },
        { status: 404 },
      );
    }

    // Read the file
    const fileBuffer = await readFile(artifactPath);

    // Determine content type and filename
    const isAndroid = build.platform === "android";
    const contentType = isAndroid
      ? "application/vnd.android.package-archive"
      : "application/octet-stream";
    const extension = isAndroid ? "apk" : "ipa";
    const filename = `${build.appType}-${build.platform}-v${build.config?.version || "1.0.0"}.${extension}`;

    // Create response with file
    const response = new NextResponse(fileBuffer);

    response.headers.set("Content-Type", contentType);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    response.headers.set("Content-Length", fileBuffer.length.toString());
    response.headers.set("Cache-Control", "no-cache");

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download build" },
      { status: 500 },
    );
  }
}

// Helper function to parse build ID
function parseBuildId(buildId: string) {
  try {
    // Extract info from buildId format: build_timestamp_randomstring
    const parts = buildId.split("_");
    if (parts.length >= 3 && parts[0] === "build") {
      const timestamp = parseInt(parts[1]);
      const date = new Date(timestamp);
      return {
        buildId,
        timestamp,
        date,
        platform: "android", // Default for demo
        appType: "wali", // Default for demo
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Helper function to generate demo file
function generateDemoFile(buildInfo: any) {
  const platform = buildInfo.platform || "android";
  const appType = buildInfo.appType || "wali";
  const config = buildInfo.config || {};
  const buildDate =
    buildInfo.completedAt ||
    buildInfo.date?.toISOString() ||
    new Date().toISOString();

  // Create a demo APK content (just a text file for demo)
  const demoContent = `
TPQ Baitus Shuffah - Mobile App Demo
====================================

Build Information:
- Build ID: ${buildInfo.buildId}
- Platform: ${platform.toUpperCase()}
- App Type: ${appType.charAt(0).toUpperCase() + appType.slice(1)} Santri
- Build Date: ${buildDate}
- App Name: ${config.displayName || "TPQ Baitus Shuffah"}
- Version: ${config.version || "1.0.0"}
- Primary Color: ${config.primaryColor || "#059669"}
- Secondary Color: ${config.secondaryColor || "#10b981"}
- Template: ${config.template || "modern"}

This is a demo file for development purposes.
In production, this would be the actual ${platform.toUpperCase()} app file.

Enabled Features:
${
  config.features
    ? Object.entries(config.features)
        .filter(([_, enabled]) => enabled)
        .map(
          ([feature, _]) =>
            `- ${feature.charAt(0).toUpperCase() + feature.slice(1)}`,
        )
        .join("\n")
    : "- All default features"
}

App Configuration:
- Description: ${config.description || "Aplikasi untuk wali santri TPQ Baitus Shuffah"}
- Build Number: ${config.buildNumber || 1}

Generated by TPQ Baitus Shuffah Mobile App Generator
Development Mode - Demo File Only
`;

  const buffer = Buffer.from(demoContent, "utf-8");
  const timestamp = buildInfo.timestamp || Date.now();
  const extension = platform === "android" ? "apk" : "ipa";
  const filename = `tpq-${appType}-${platform}-demo-${timestamp}.${extension}`;

  const response = new NextResponse(buffer);

  const contentType =
    platform === "android"
      ? "application/vnd.android.package-archive"
      : "application/octet-stream";

  response.headers.set("Content-Type", contentType);
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );
  response.headers.set("Content-Length", buffer.length.toString());
  response.headers.set("Cache-Control", "no-cache");

  return response;
}
