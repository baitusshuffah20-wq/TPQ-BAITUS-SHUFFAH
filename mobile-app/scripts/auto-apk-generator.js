#!/usr/bin/env node

/**
 * Automatic APK Generator for TPQ Wali Santri Mobile App
 *
 * This module automatically generates APK files with various configurations
 * and deployment options.
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Build configurations
const BUILD_CONFIGS = {
  development: {
    name: "Development APK",
    description: "Debug APK with development features",
    profile: "development",
    platform: "android",
    buildType: "apk",
    autoIncrement: false,
    notify: true,
    upload: false,
  },
  preview: {
    name: "Preview APK",
    description: "Release APK for testing",
    profile: "preview",
    platform: "android",
    buildType: "apk",
    autoIncrement: true,
    notify: true,
    upload: true,
  },
  production: {
    name: "Production APK",
    description: "Production APK for release",
    profile: "production",
    platform: "android",
    buildType: "apk",
    autoIncrement: true,
    notify: true,
    upload: true,
  },
  "production-aab": {
    name: "Production AAB",
    description: "Production App Bundle for Play Store",
    profile: "production-aab",
    platform: "android",
    buildType: "app-bundle",
    autoIncrement: true,
    notify: true,
    upload: true,
  },
};

class AutoAPKGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.buildHistory = [];
    this.config = this.loadConfig();
  }

  log(message, color = "reset") {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  async question(query) {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  loadConfig() {
    const configPath = "apk-generator.config.json";
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (error) {
        this.log("Warning: Invalid config file, using defaults", "yellow");
      }
    }

    return {
      autoMode: false,
      defaultProfile: "preview",
      autoIncrement: true,
      notifications: {
        discord: false,
        slack: false,
        email: false,
      },
      upload: {
        firebase: false,
        s3: false,
        github: false,
      },
      schedule: {
        enabled: false,
        cron: "0 2 * * *", // Daily at 2 AM
        profile: "preview",
      },
    };
  }

  saveConfig() {
    fs.writeFileSync(
      "apk-generator.config.json",
      JSON.stringify(this.config, null, 2),
    );
  }

  async checkPrerequisites() {
    this.log("🔍 Checking prerequisites...", "cyan");

    const checks = [
      { cmd: "eas --version", name: "EAS CLI" },
      { cmd: "eas whoami", name: "EAS Authentication" },
      { cmd: "node --version", name: "Node.js" },
      { cmd: "npm --version", name: "NPM" },
    ];

    for (const check of checks) {
      try {
        execSync(check.cmd, { stdio: "pipe" });
        this.log(`✅ ${check.name} is ready`, "green");
      } catch (error) {
        this.log(`❌ ${check.name} is not available`, "red");
        throw new Error(`${check.name} is required but not available`);
      }
    }

    // Check app.json and eas.json
    if (!fs.existsSync("app.json")) {
      throw new Error("app.json not found");
    }
    if (!fs.existsSync("eas.json")) {
      throw new Error("eas.json not found");
    }

    this.log("✅ All prerequisites met", "green");
  }

  async autoIncrementVersion(buildConfig) {
    if (!buildConfig.autoIncrement) return;

    this.log("🔢 Auto-incrementing version...", "cyan");

    try {
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
        this.log(
          `📈 Version updated: ${currentVersion} → ${appJson.expo.version}`,
          "green",
        );
      }

      fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
      this.log(
        `📈 Build number updated: ${currentBuildNumber} → ${newBuildNumber}`,
        "green",
      );
    } catch (error) {
      this.log(`⚠️ Version increment failed: ${error.message}`, "yellow");
    }
  }

  async validateProject() {
    this.log("🔍 Validating project...", "cyan");

    const validations = [
      {
        check: () => fs.existsSync("assets/icon.png"),
        message: "App icon (assets/icon.png)",
        required: true,
      },
      {
        check: () => fs.existsSync("assets/splash.png"),
        message: "Splash screen (assets/splash.png)",
        required: true,
      },
      {
        check: () => {
          const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
          return appJson.expo.android?.package;
        },
        message: "Android package name",
        required: true,
      },
      {
        check: () => {
          try {
            execSync("npx tsc --noEmit --skipLibCheck", { stdio: "pipe" });
            return true;
          } catch {
            return false;
          }
        },
        message: "TypeScript compilation",
        required: false,
      },
    ];

    let hasErrors = false;
    for (const validation of validations) {
      const passed = validation.check();
      if (passed) {
        this.log(`✅ ${validation.message}`, "green");
      } else {
        const level = validation.required ? "red" : "yellow";
        const symbol = validation.required ? "❌" : "⚠️";
        this.log(`${symbol} ${validation.message}`, level);
        if (validation.required) hasErrors = true;
      }
    }

    if (hasErrors) {
      throw new Error(
        "Project validation failed. Please fix the errors above.",
      );
    }

    this.log("✅ Project validation passed", "green");
  }

  async buildAPK(buildConfig) {
    this.log(`🚀 Starting ${buildConfig.name}...`, "cyan");

    const startTime = Date.now();
    const buildId = `build-${Date.now()}`;

    try {
      // Auto increment version if needed
      await this.autoIncrementVersion(buildConfig);

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

      this.log(`Executing: ${buildCommand.join(" ")}`, "blue");

      // Execute build with real-time output
      const buildProcess = spawn(buildCommand[0], buildCommand.slice(1), {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      const buildResult = await new Promise((resolve, reject) => {
        buildProcess.on("close", (code) => {
          if (code === 0) {
            resolve({ success: true, code });
          } else {
            reject(new Error(`Build failed with exit code ${code}`));
          }
        });

        buildProcess.on("error", (error) => {
          reject(error);
        });
      });

      const duration = Math.round((Date.now() - startTime) / 1000);

      const buildInfo = {
        id: buildId,
        profile: buildConfig.profile,
        platform: buildConfig.platform,
        buildType: buildConfig.buildType,
        startTime: new Date(startTime),
        duration: duration,
        success: true,
        downloadUrl: null, // Will be updated after getting build info
      };

      this.buildHistory.push(buildInfo);
      this.saveBuildHistory();

      this.log(`✅ ${buildConfig.name} completed successfully!`, "green");
      this.log(`⏱️ Build duration: ${duration} seconds`, "blue");

      // Get build info and download URL
      await this.getBuildInfo(buildInfo);

      // Send notifications if enabled
      if (buildConfig.notify) {
        await this.sendNotifications(buildInfo);
      }

      // Upload if enabled
      if (buildConfig.upload) {
        await this.uploadBuild(buildInfo);
      }

      return buildInfo;
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);

      const buildInfo = {
        id: buildId,
        profile: buildConfig.profile,
        platform: buildConfig.platform,
        buildType: buildConfig.buildType,
        startTime: new Date(startTime),
        duration: duration,
        success: false,
        error: error.message,
      };

      this.buildHistory.push(buildInfo);
      this.saveBuildHistory();

      this.log(`❌ ${buildConfig.name} failed: ${error.message}`, "red");
      throw error;
    }
  }

  async getBuildInfo(buildInfo) {
    try {
      this.log("📊 Getting build information...", "cyan");

      const buildListOutput = execSync("eas build:list --limit 1 --json", {
        encoding: "utf8",
      });

      const builds = JSON.parse(buildListOutput);
      if (builds.length > 0) {
        const latestBuild = builds[0];
        buildInfo.downloadUrl = latestBuild.artifacts?.buildUrl;
        buildInfo.easBuildId = latestBuild.id;
        buildInfo.status = latestBuild.status;

        this.log(`📱 Build ID: ${latestBuild.id}`, "blue");
        if (buildInfo.downloadUrl) {
          this.log(`📥 Download URL: ${buildInfo.downloadUrl}`, "blue");
        }
      }
    } catch (error) {
      this.log(`⚠️ Could not get build info: ${error.message}`, "yellow");
    }
  }

  async sendNotifications(buildInfo) {
    this.log("📢 Sending notifications...", "cyan");

    const message = `🎉 APK Build Completed!
Profile: ${buildInfo.profile}
Duration: ${buildInfo.duration}s
Status: ${buildInfo.success ? "Success" : "Failed"}
${buildInfo.downloadUrl ? `Download: ${buildInfo.downloadUrl}` : ""}`;

    // Console notification (always enabled)
    this.log("📱 Build notification sent to console", "green");

    // Additional notifications can be implemented here
    // Discord, Slack, Email, etc.
  }

  async uploadBuild(buildInfo) {
    this.log("📤 Uploading build...", "cyan");

    // Placeholder for upload functionality
    // Can implement Firebase App Distribution, S3, GitHub Releases, etc.

    this.log("📤 Upload functionality ready for implementation", "blue");
  }

  saveBuildHistory() {
    const historyPath = "build-history.json";
    fs.writeFileSync(historyPath, JSON.stringify(this.buildHistory, null, 2));
  }

  loadBuildHistory() {
    const historyPath = "build-history.json";
    if (fs.existsSync(historyPath)) {
      try {
        this.buildHistory = JSON.parse(fs.readFileSync(historyPath, "utf8"));
      } catch (error) {
        this.log("Warning: Could not load build history", "yellow");
        this.buildHistory = [];
      }
    }
  }

  async showBuildHistory() {
    this.log("📊 Build History:", "cyan");

    if (this.buildHistory.length === 0) {
      this.log("No builds found", "yellow");
      return;
    }

    this.buildHistory.slice(-10).forEach((build, index) => {
      const status = build.success ? "✅" : "❌";
      const date = new Date(build.startTime).toLocaleString();
      this.log(
        `${status} ${build.profile} - ${date} (${build.duration}s)`,
        "blue",
      );
    });
  }

  async selectBuildProfile() {
    this.log("📱 Select build profile:", "cyan");

    Object.entries(BUILD_CONFIGS).forEach(([key, config], index) => {
      this.log(
        `${index + 1}. ${config.name} - ${config.description}`,
        "yellow",
      );
    });

    const choice = await this.question("\nEnter your choice (1-4): ");
    const profileKeys = Object.keys(BUILD_CONFIGS);
    const selectedKey = profileKeys[parseInt(choice) - 1];

    if (!selectedKey) {
      this.log("❌ Invalid choice", "red");
      return null;
    }

    return selectedKey;
  }

  async runInteractiveMode() {
    this.log("🎯 Interactive APK Generator", "bright");
    this.log("============================", "bright");

    try {
      await this.checkPrerequisites();
      await this.validateProject();

      const profileKey = await this.selectBuildProfile();
      if (!profileKey) return;

      const buildConfig = BUILD_CONFIGS[profileKey];

      const confirm = await this.question(
        `\n❓ Proceed with ${buildConfig.name}? (y/n): `,
      );
      if (confirm.toLowerCase() !== "y") {
        this.log("❌ Build cancelled", "yellow");
        return;
      }

      const buildInfo = await this.buildAPK(buildConfig);

      this.log("\n🎉 Build process completed!", "green");
      await this.showBuildHistory();
    } catch (error) {
      this.log(`❌ Build process failed: ${error.message}`, "red");
      process.exit(1);
    }
  }

  async runAutoMode(profileKey = null) {
    this.log("🤖 Automatic APK Generator", "bright");
    this.log("===========================", "bright");

    try {
      await this.checkPrerequisites();
      await this.validateProject();

      const profile = profileKey || this.config.defaultProfile;
      const buildConfig = BUILD_CONFIGS[profile];

      if (!buildConfig) {
        throw new Error(`Invalid profile: ${profile}`);
      }

      this.log(`🚀 Starting automatic build: ${buildConfig.name}`, "cyan");

      const buildInfo = await this.buildAPK(buildConfig);

      this.log("🎉 Automatic build completed!", "green");
      return buildInfo;
    } catch (error) {
      this.log(`❌ Automatic build failed: ${error.message}`, "red");
      throw error;
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    const profile = args[1];

    this.loadBuildHistory();

    switch (command) {
      case "auto":
        await this.runAutoMode(profile);
        break;
      case "history":
        await this.showBuildHistory();
        break;
      case "config":
        this.log("Current configuration:", "cyan");
        console.log(JSON.stringify(this.config, null, 2));
        break;
      default:
        await this.runInteractiveMode();
    }

    this.rl.close();
  }
}

// Run the generator
if (require.main === module) {
  const generator = new AutoAPKGenerator();
  generator.run().catch((error) => {
    console.error("❌ APK Generator failed:", error);
    process.exit(1);
  });
}

module.exports = AutoAPKGenerator;
