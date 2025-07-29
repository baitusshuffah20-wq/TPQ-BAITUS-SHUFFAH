#!/usr/bin/env node

/**
 * Setup Build Environment Script
 *
 * This script sets up the build environment for the mobile app
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, "cyan");
  try {
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} completed`, "green");
  } catch (error) {
    log(`❌ ${description} failed`, "red");
    throw error;
  }
}

async function setupBuildEnvironment() {
  log("🛠️  Setting up build environment...", "bright");
  log("====================================", "bright");

  try {
    // Install dependencies
    runCommand("npm install", "Installing dependencies");

    // Install EAS CLI globally if not installed
    try {
      execSync("eas --version", { stdio: "pipe" });
      log("✅ EAS CLI already installed", "green");
    } catch (error) {
      runCommand("npm install -g @expo/eas-cli", "Installing EAS CLI");
    }

    // Create assets directory if it doesn't exist
    const assetsDir = path.join(process.cwd(), "assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      log("✅ Created assets directory", "green");
    }

    // Create required asset files if they don't exist
    const requiredAssets = [
      "icon.png",
      "adaptive-icon.png",
      "splash.png",
      "favicon.png",
      "notification-icon.png",
    ];

    requiredAssets.forEach((asset) => {
      const assetPath = path.join(assetsDir, asset);
      if (!fs.existsSync(assetPath)) {
        log(`⚠️  Missing asset: ${asset}`, "yellow");
        log(`   Please add ${asset} to the assets directory`, "yellow");
      } else {
        log(`✅ Found asset: ${asset}`, "green");
      }
    });

    // Create fonts directory
    const fontsDir = path.join(assetsDir, "fonts");
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
      log("✅ Created fonts directory", "green");
    }

    // Check for required fonts
    const requiredFonts = [
      "Inter-Regular.ttf",
      "Inter-Medium.ttf",
      "Inter-SemiBold.ttf",
      "Inter-Bold.ttf",
    ];

    requiredFonts.forEach((font) => {
      const fontPath = path.join(fontsDir, font);
      if (!fs.existsSync(fontPath)) {
        log(`⚠️  Missing font: ${font}`, "yellow");
        log(`   Please add ${font} to the assets/fonts directory`, "yellow");
      } else {
        log(`✅ Found font: ${font}`, "green");
      }
    });

    // Validate app.json
    if (fs.existsSync("app.json")) {
      const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));

      if (
        !appJson.expo.extra?.eas?.projectId ||
        appJson.expo.extra.eas.projectId === "your-project-id-here"
      ) {
        log("⚠️  Please update the EAS project ID in app.json", "yellow");
        log("   Run: eas init to set up your project", "yellow");
      } else {
        log("✅ EAS project ID configured", "green");
      }
    }

    // Check if logged in to Expo
    try {
      const whoami = execSync("eas whoami", { encoding: "utf8" }).trim();
      log(`✅ Logged in as: ${whoami}`, "green");
    } catch (error) {
      log("⚠️  Not logged in to Expo", "yellow");
      log("   Run: eas login to authenticate", "yellow");
    }

    log("\n🎉 Build environment setup completed!", "green");
    log("\nNext steps:", "cyan");
    log("1. Add missing assets if any", "yellow");
    log("2. Run: eas login (if not logged in)", "yellow");
    log("3. Run: eas init (if project ID not set)", "yellow");
    log("4. Run: npm run build:apk to start building", "yellow");
  } catch (error) {
    log("\n❌ Setup failed:", "red");
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupBuildEnvironment();
}
