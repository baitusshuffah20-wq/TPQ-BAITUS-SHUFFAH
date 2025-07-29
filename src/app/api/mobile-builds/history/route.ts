import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface BuildRecord {
  buildId: string;
  platform: "android" | "ios";
  appType: "wali" | "musyrif";
  status: "building" | "completed" | "failed";
  config: any;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
  artifactPath?: string;
  duration?: number;
}

const HISTORY_FILE = path.join(process.cwd(), "data", "build-history.json");

async function ensureHistoryFile() {
  const dataDir = path.dirname(HISTORY_FILE);
  if (!existsSync(dataDir)) {
    await require("fs/promises").mkdir(dataDir, { recursive: true });
  }

  if (!existsSync(HISTORY_FILE)) {
    await writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
  }
}

async function loadBuildHistory(): Promise<BuildRecord[]> {
  await ensureHistoryFile();
  try {
    const data = await readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading build history:", error);
    return [];
  }
}

async function saveBuildHistory(history: BuildRecord[]) {
  await ensureHistoryFile();
  await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const appType = searchParams.get("appType");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    let builds = await loadBuildHistory();

    // Apply filters
    if (appType) {
      builds = builds.filter((build) => build.appType === appType);
    }

    if (platform) {
      builds = builds.filter((build) => build.platform === platform);
    }

    if (status) {
      builds = builds.filter((build) => build.status === status);
    }

    // Sort by creation date (newest first)
    builds.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply limit
    builds = builds.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: builds.length,
      completed: builds.filter((b) => b.status === "completed").length,
      failed: builds.filter((b) => b.status === "failed").length,
      building: builds.filter((b) => b.status === "building").length,
      byAppType: {
        wali: builds.filter((b) => b.appType === "wali").length,
        musyrif: builds.filter((b) => b.appType === "musyrif").length,
      },
      byPlatform: {
        android: builds.filter((b) => b.platform === "android").length,
        ios: builds.filter((b) => b.platform === "ios").length,
      },
    };

    return NextResponse.json({
      success: true,
      builds,
      stats,
    });
  } catch (error) {
    console.error("Error fetching build history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch build history" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const buildRecord: BuildRecord = await request.json();

    // Validate required fields
    if (!buildRecord.buildId || !buildRecord.platform || !buildRecord.appType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const history = await loadBuildHistory();

    // Check if build already exists
    const existingIndex = history.findIndex(
      (build) => build.buildId === buildRecord.buildId,
    );

    if (existingIndex >= 0) {
      // Update existing build
      history[existingIndex] = {
        ...history[existingIndex],
        ...buildRecord,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new build
      history.push({
        ...buildRecord,
        createdAt: buildRecord.createdAt || new Date().toISOString(),
      });
    }

    await saveBuildHistory(history);

    return NextResponse.json({
      success: true,
      message: "Build record saved successfully",
    });
  } catch (error) {
    console.error("Error saving build record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save build record" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get("buildId");

    if (!buildId) {
      return NextResponse.json(
        { success: false, error: "Build ID is required" },
        { status: 400 },
      );
    }

    const history = await loadBuildHistory();
    const filteredHistory = history.filter(
      (build) => build.buildId !== buildId,
    );

    if (history.length === filteredHistory.length) {
      return NextResponse.json(
        { success: false, error: "Build not found" },
        { status: 404 },
      );
    }

    await saveBuildHistory(filteredHistory);

    return NextResponse.json({
      success: true,
      message: "Build record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting build record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete build record" },
      { status: 500 },
    );
  }
}
