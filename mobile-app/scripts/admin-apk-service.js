#!/usr/bin/env node

/**
 * Admin APK Service
 *
 * Backend service untuk admin generate APK/IPA melalui web interface
 */

const express = require("express");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.ADMIN_APK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// WebSocket server untuk real-time updates
const wss = new WebSocket.Server({ port: 3002 });

// Storage untuk upload assets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Build status tracking
let buildStatus = {
  isBuilding: false,
  currentBuild: null,
  buildHistory: [],
  buildLogs: [],
};

// Colors untuk logging
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${colors[color]}${logMessage}${colors.reset}`);

  // Send to WebSocket clients
  broadcastToClients({
    type: "log",
    message: logMessage,
    color: color,
    timestamp: new Date().toISOString(),
  });
}

function broadcastToClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Load build configurations
function loadBuildConfigs() {
  return {
    android: {
      development: {
        name: "Android Development",
        platform: "android",
        profile: "development",
        buildType: "apk",
        description: "Debug APK untuk testing",
      },
      preview: {
        name: "Android Preview",
        platform: "android",
        profile: "preview",
        buildType: "apk",
        description: "Release APK untuk preview",
      },
      production: {
        name: "Android Production",
        platform: "android",
        profile: "production",
        buildType: "apk",
        description: "Production APK untuk release",
      },
      "production-aab": {
        name: "Android App Bundle",
        platform: "android",
        profile: "production-aab",
        buildType: "app-bundle",
        description: "AAB untuk Google Play Store",
      },
    },
    ios: {
      development: {
        name: "iOS Development",
        platform: "ios",
        profile: "development",
        buildType: "development-client",
        description: "Development build untuk testing",
      },
      preview: {
        name: "iOS Preview",
        platform: "ios",
        profile: "preview",
        buildType: "archive",
        description: "Archive untuk TestFlight",
      },
      production: {
        name: "iOS Production",
        platform: "ios",
        profile: "production",
        buildType: "archive",
        description: "Production build untuk App Store",
      },
    },
  };
}

// API Routes

// Get build configurations
app.get("/api/build-configs", (req, res) => {
  try {
    const configs = loadBuildConfigs();
    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get build status
app.get("/api/build-status", (req, res) => {
  res.json({
    success: true,
    data: buildStatus,
  });
});

// Get build history
app.get("/api/build-history", (req, res) => {
  try {
    const historyPath = "build-history.json";
    let history = [];

    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    }

    res.json({
      success: true,
      data: history.slice(-20), // Last 20 builds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start build
app.post("/api/build/start", async (req, res) => {
  try {
    const { platform, profile, autoIncrement = true } = req.body;

    if (buildStatus.isBuilding) {
      return res.status(400).json({
        success: false,
        error: "Build already in progress",
      });
    }

    const configs = loadBuildConfigs();
    const buildConfig = configs[platform]?.[profile];

    if (!buildConfig) {
      return res.status(400).json({
        success: false,
        error: "Invalid platform or profile",
      });
    }

    // Start build process
    const buildId = `build-${Date.now()}`;
    buildStatus.isBuilding = true;
    buildStatus.currentBuild = {
      id: buildId,
      platform,
      profile,
      buildConfig,
      startTime: new Date(),
      status: "starting",
    };
    buildStatus.buildLogs = [];

    log(`🚀 Starting ${buildConfig.name}...`, "cyan");

    // Broadcast build started
    broadcastToClients({
      type: "build_started",
      build: buildStatus.currentBuild,
    });

    res.json({
      success: true,
      data: {
        buildId,
        message: "Build started successfully",
      },
    });

    // Execute build in background
    executeBuild(buildConfig, autoIncrement);
  } catch (error) {
    buildStatus.isBuilding = false;
    buildStatus.currentBuild = null;

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop build
app.post("/api/build/stop", (req, res) => {
  try {
    if (!buildStatus.isBuilding) {
      return res.status(400).json({
        success: false,
        error: "No build in progress",
      });
    }

    // Kill build process (implementation needed)
    buildStatus.isBuilding = false;
    buildStatus.currentBuild.status = "cancelled";

    log("🛑 Build cancelled by admin", "yellow");

    broadcastToClients({
      type: "build_cancelled",
      build: buildStatus.currentBuild,
    });

    res.json({
      success: true,
      message: "Build cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Upload assets
app.post("/api/assets/upload", upload.array("assets"), (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: file.path,
    }));

    log(`📁 Uploaded ${uploadedFiles.length} assets`, "green");

    res.json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project info
app.get("/api/project/info", (req, res) => {
  try {
    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

    const projectInfo = {
      name: appJson.expo.name,
      slug: appJson.expo.slug,
      version: appJson.expo.version,
      buildNumber: appJson.expo.android?.versionCode || 1,
      bundleId: appJson.expo.ios?.bundleIdentifier,
      packageName: appJson.expo.android?.package,
      sdkVersion: packageJson.dependencies?.expo,
      lastModified: fs.statSync("app.json").mtime,
    };

    res.json({
      success: true,
      data: projectInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update project info
app.post("/api/project/update", (req, res) => {
  try {
    const { version, buildNumber, name } = req.body;

    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));

    if (version) appJson.expo.version = version;
    if (buildNumber) {
      appJson.expo.android = appJson.expo.android || {};
      appJson.expo.android.versionCode = parseInt(buildNumber);
    }
    if (name) appJson.expo.name = name;

    fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));

    log(`📝 Project info updated`, "green");

    res.json({
      success: true,
      message: "Project info updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Execute build function
async function executeBuild(buildConfig, autoIncrement) {
  try {
    buildStatus.currentBuild.status = "building";

    // Auto increment version if needed
    if (autoIncrement) {
      await incrementVersion(buildConfig);
    }

    // Build command
    const buildCommand = [
      "eas",
      "build",
      "--platform",
      buildConfig.platform,
      "--profile",
      buildConfig.profile,
      "--non-interactive",
    ];

    log(`Executing: ${buildCommand.join(" ")}`, "blue");

    // Execute build with real-time output
    const buildProcess = spawn(buildCommand[0], buildCommand.slice(1), {
      cwd: process.cwd(),
    });

    buildProcess.stdout.on("data", (data) => {
      const output = data.toString();
      log(output.trim(), "blue");
      buildStatus.buildLogs.push({
        type: "stdout",
        message: output,
        timestamp: new Date(),
      });
    });

    buildProcess.stderr.on("data", (data) => {
      const output = data.toString();
      log(output.trim(), "yellow");
      buildStatus.buildLogs.push({
        type: "stderr",
        message: output,
        timestamp: new Date(),
      });
    });

    buildProcess.on("close", async (code) => {
      const duration = Math.round(
        (Date.now() - buildStatus.currentBuild.startTime.getTime()) / 1000,
      );

      if (code === 0) {
        buildStatus.currentBuild.status = "completed";
        buildStatus.currentBuild.success = true;
        buildStatus.currentBuild.duration = duration;

        log(`✅ Build completed successfully! (${duration}s)`, "green");

        // Get build info
        await getBuildInfo(buildStatus.currentBuild);

        broadcastToClients({
          type: "build_completed",
          build: buildStatus.currentBuild,
        });
      } else {
        buildStatus.currentBuild.status = "failed";
        buildStatus.currentBuild.success = false;
        buildStatus.currentBuild.duration = duration;
        buildStatus.currentBuild.error = `Build failed with exit code ${code}`;

        log(`❌ Build failed with exit code ${code}`, "red");

        broadcastToClients({
          type: "build_failed",
          build: buildStatus.currentBuild,
        });
      }

      // Save to history
      saveBuildToHistory(buildStatus.currentBuild);

      // Reset status
      buildStatus.isBuilding = false;
      buildStatus.currentBuild = null;
    });
  } catch (error) {
    buildStatus.currentBuild.status = "failed";
    buildStatus.currentBuild.success = false;
    buildStatus.currentBuild.error = error.message;

    log(`❌ Build error: ${error.message}`, "red");

    broadcastToClients({
      type: "build_failed",
      build: buildStatus.currentBuild,
    });

    buildStatus.isBuilding = false;
    buildStatus.currentBuild = null;
  }
}

async function incrementVersion(buildConfig) {
  try {
    log("🔢 Auto-incrementing version...", "cyan");

    const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
    const currentVersion = appJson.expo.version;
    const currentBuildNumber = appJson.expo.android?.versionCode || 1;

    // Increment build number
    const newBuildNumber = currentBuildNumber + 1;
    appJson.expo.android = appJson.expo.android || {};
    appJson.expo.android.versionCode = newBuildNumber;

    // For production builds, increment version
    if (
      buildConfig.profile === "production" ||
      buildConfig.profile === "production-aab"
    ) {
      const versionParts = currentVersion.split(".");
      versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
      appJson.expo.version = versionParts.join(".");
      log(
        `📈 Version updated: ${currentVersion} → ${appJson.expo.version}`,
        "green",
      );
    }

    fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
    log(
      `📈 Build number updated: ${currentBuildNumber} → ${newBuildNumber}`,
      "green",
    );
  } catch (error) {
    log(`⚠️ Version increment failed: ${error.message}`, "yellow");
  }
}

async function getBuildInfo(buildInfo) {
  try {
    log("📊 Getting build information...", "cyan");

    const buildListOutput = execSync("eas build:list --limit 1 --json", {
      encoding: "utf8",
    });

    const builds = JSON.parse(buildListOutput);
    if (builds.length > 0) {
      const latestBuild = builds[0];
      buildInfo.downloadUrl = latestBuild.artifacts?.buildUrl;
      buildInfo.easBuildId = latestBuild.id;
      buildInfo.buildStatus = latestBuild.status;

      log(`📱 Build ID: ${latestBuild.id}`, "blue");
      if (buildInfo.downloadUrl) {
        log(`📥 Download URL: ${buildInfo.downloadUrl}`, "blue");
      }
    }
  } catch (error) {
    log(`⚠️ Could not get build info: ${error.message}`, "yellow");
  }
}

function saveBuildToHistory(buildInfo) {
  try {
    const historyPath = "build-history.json";
    let history = [];

    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    }

    history.push(buildInfo);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    log(`⚠️ Could not save build history: ${error.message}`, "yellow");
  }
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  log("👤 Admin connected to WebSocket", "green");

  // Send current status
  ws.send(
    JSON.stringify({
      type: "status",
      data: buildStatus,
    }),
  );

  ws.on("close", () => {
    log("👤 Admin disconnected from WebSocket", "yellow");
  });
});

// Start server
app.listen(PORT, () => {
  log(`🚀 Admin APK Service running on port ${PORT}`, "green");
  log(`📡 WebSocket server running on port 3002`, "green");
  log(`🌐 Admin panel: http://localhost:${PORT}`, "cyan");
});

module.exports = app;
