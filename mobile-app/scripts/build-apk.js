#!/usr/bin/env node

/**
 * Build APK Script for TPQ Wali Santri Mobile App
 *
 * This script automates the process of building APK files for different environments
 * using Expo EAS Build service.
 */

const { execSync } = require("child_process");
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
const BUILD_PROFILES = {
  development: {
    name: "Development",
    description: "Development build with debugging enabled",
    profile: "development",
  },
  preview: {
    name: "Preview",
    description: "Preview build for testing (APK)",
    profile: "preview",
  },
  production: {
    name: "Production",
    description: "Production build for release",
    profile: "production",
  },
};

class APKBuilder {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async question(query) {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  async checkPrerequisites() {
    this.log("\n🔍 Checking prerequisites...", "cyan");

    try {
      // Check if EAS CLI is installed
      execSync("eas --version", { stdio: "pipe" });
      this.log("✅ EAS CLI is installed", "green");
    } catch (error) {
      this.log("❌ EAS CLI is not installed", "red");
      this.log(
        "Please install it with: npm install -g @expo/eas-cli",
        "yellow",
      );
      process.exit(1);
    }

    try {
      // Check if logged in to Expo
      execSync("eas whoami", { stdio: "pipe" });
      this.log("✅ Logged in to Expo", "green");
    } catch (error) {
      this.log("❌ Not logged in to Expo", "red");
      this.log("Please login with: eas login", "yellow");
      process.exit(1);
    }

    // Check if app.json exists
    if (!fs.existsSync("app.json")) {
      this.log("❌ app.json not found", "red");
      process.exit(1);
    }

    // Check if eas.json exists
    if (!fs.existsSync("eas.json")) {
      this.log("❌ eas.json not found", "red");
      process.exit(1);
    }

    this.log("✅ All prerequisites met", "green");
  }

  async selectBuildProfile() {
    this.log("\n📱 Select build profile:", "cyan");

    Object.entries(BUILD_PROFILES).forEach(([key, profile], index) => {
      this.log(
        `${index + 1}. ${profile.name} - ${profile.description}`,
        "yellow",
      );
    });

    const choice = await this.question("\nEnter your choice (1-3): ");
    const profileKeys = Object.keys(BUILD_PROFILES);
    const selectedKey = profileKeys[parseInt(choice) - 1];

    if (!selectedKey) {
      this.log("❌ Invalid choice", "red");
      process.exit(1);
    }

    return selectedKey;
  }

  async updateVersion() {
    const updateVersion = await this.question(
      "\n🔢 Do you want to update the version? (y/n): ",
    );

    if (updateVersion.toLowerCase() === "y") {
      const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
      const currentVersion = appJson.expo.version;

      this.log(`Current version: ${currentVersion}`, "yellow");
      const newVersion = await this.question("Enter new version: ");

      if (newVersion && newVersion !== currentVersion) {
        appJson.expo.version = newVersion;
        appJson.expo.android.versionCode += 1;

        fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
        this.log(`✅ Version updated to ${newVersion}`, "green");
      }
    }
  }

  async buildAPK(profile) {
    this.log(`\n🚀 Starting ${BUILD_PROFILES[profile].name} build...`, "cyan");

    try {
      const buildCommand = `eas build --platform android --profile ${profile}`;
      this.log(`Executing: ${buildCommand}`, "blue");

      execSync(buildCommand, {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      this.log(
        `\n✅ ${BUILD_PROFILES[profile].name} build completed successfully!`,
        "green",
      );
      this.log("📱 You can download your APK from the Expo dashboard", "cyan");
    } catch (error) {
      this.log(`\n❌ Build failed: ${error.message}`, "red");
      process.exit(1);
    }
  }

  async showBuildStatus() {
    this.log("\n📊 Checking recent builds...", "cyan");

    try {
      execSync("eas build:list --limit 5", { stdio: "inherit" });
    } catch (error) {
      this.log("❌ Failed to fetch build status", "red");
    }
  }

  async run() {
    this.log("🏗️  TPQ Wali Santri - APK Builder", "bright");
    this.log("=====================================", "bright");

    await this.checkPrerequisites();
    const profile = await this.selectBuildProfile();
    await this.updateVersion();

    const confirm = await this.question(
      `\n❓ Proceed with ${BUILD_PROFILES[profile].name} build? (y/n): `,
    );

    if (confirm.toLowerCase() !== "y") {
      this.log("❌ Build cancelled", "yellow");
      this.rl.close();
      return;
    }

    await this.buildAPK(profile);
    await this.showBuildStatus();

    this.rl.close();
  }
}

// Run the builder
if (require.main === module) {
  const builder = new APKBuilder();
  builder.run().catch((error) => {
    console.error("❌ Build script failed:", error);
    process.exit(1);
  });
}

module.exports = APKBuilder;
