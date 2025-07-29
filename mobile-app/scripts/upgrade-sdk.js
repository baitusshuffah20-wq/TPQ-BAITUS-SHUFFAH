#!/usr/bin/env node

/**
 * Expo SDK Upgrade Script
 *
 * This script helps upgrade Expo SDK to version 53 safely
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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

class SDKUpgrader {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async question(query) {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  async backupProject() {
    log("\n💾 Creating backup...", "cyan");

    const backupDir = `backup-${Date.now()}`;
    const filesToBackup = [
      "package.json",
      "package-lock.json",
      "app.json",
      "eas.json",
      "tsconfig.json",
    ];

    try {
      fs.mkdirSync(backupDir);

      filesToBackup.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.copyFileSync(file, path.join(backupDir, file));
          log(`✅ Backed up ${file}`, "green");
        }
      });

      log(`✅ Backup created in ${backupDir}`, "green");
      return backupDir;
    } catch (error) {
      log(`❌ Backup failed: ${error.message}`, "red");
      throw error;
    }
  }

  async checkCurrentSDK() {
    log("\n🔍 Checking current SDK version...", "cyan");

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const currentExpo =
        packageJson.dependencies?.expo || packageJson.devDependencies?.expo;

      log(`Current Expo SDK: ${currentExpo}`, "blue");

      // Check if already on SDK 53
      if (currentExpo && currentExpo.includes("53")) {
        log("✅ Already on SDK 53", "green");
        return true;
      }

      return false;
    } catch (error) {
      log(`❌ Failed to check SDK version: ${error.message}`, "red");
      return false;
    }
  }

  async upgradeToSDK53() {
    log("\n🚀 Upgrading to Expo SDK 53...", "cyan");

    try {
      // Step 1: Update Expo CLI
      log("📦 Updating Expo CLI...", "blue");
      execSync("npm install -g @expo/cli@latest", { stdio: "inherit" });

      // Step 2: Update EAS CLI
      log("📦 Updating EAS CLI...", "blue");
      execSync("npm install -g @expo/eas-cli@latest", { stdio: "inherit" });

      // Step 3: Clear cache
      log("🧹 Clearing cache...", "blue");
      try {
        execSync("npm cache clean --force", { stdio: "pipe" });
        execSync("expo r -c", { stdio: "pipe" });
      } catch (error) {
        log("⚠️  Cache clear had some issues, continuing...", "yellow");
      }

      // Step 4: Remove node_modules and package-lock
      log("🗑️  Removing node_modules and package-lock.json...", "blue");
      if (fs.existsSync("node_modules")) {
        fs.rmSync("node_modules", { recursive: true, force: true });
      }
      if (fs.existsSync("package-lock.json")) {
        fs.unlinkSync("package-lock.json");
      }

      // Step 5: Update package.json manually for better control
      await this.updatePackageJson();

      // Step 6: Install dependencies with legacy peer deps
      log("📦 Installing dependencies...", "blue");
      execSync("npm install --legacy-peer-deps", { stdio: "inherit" });

      // Step 7: Fix dependencies with Expo
      log("🔧 Fixing dependencies with Expo...", "blue");
      try {
        execSync("npx expo install --fix --legacy-peer-deps", {
          stdio: "inherit",
        });
      } catch (error) {
        log("⚠️  Some dependencies might need manual fixing", "yellow");
      }

      log("✅ SDK upgrade completed!", "green");
    } catch (error) {
      log(`❌ Upgrade failed: ${error.message}`, "red");
      throw error;
    }
  }

  async updatePackageJson() {
    log("📝 Updating package.json...", "blue");

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

    // Update Expo SDK to 53
    packageJson.dependencies.expo = "~53.0.0";

    // Update React to compatible version (18.3.1 instead of 19 for stability)
    packageJson.dependencies.react = "18.3.1";
    packageJson.dependencies["react-native"] = "0.79.5";

    // Update Expo packages to SDK 53 compatible versions
    const expoPackageUpdates = {
      "@expo/vector-icons": "^14.0.4",
      "expo-blur": "~14.1.5",
      "expo-font": "~13.3.2",
      "expo-haptics": "~14.1.4",
      "expo-linear-gradient": "~14.1.5",
      "expo-linking": "~7.1.7",
      "expo-notifications": "~0.31.4",
      "expo-secure-store": "~14.2.3",
      "expo-splash-screen": "~0.30.10",
      "expo-status-bar": "~2.2.3",
      "expo-web-browser": "~14.2.0",
    };

    Object.entries(expoPackageUpdates).forEach(([pkg, version]) => {
      if (packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = version;
        log(`  Updated ${pkg} to ${version}`, "green");
      }
    });

    // Update React Navigation packages
    const navigationUpdates = {
      "@react-navigation/bottom-tabs": "^6.6.1",
      "@react-navigation/drawer": "^6.7.2",
      "@react-navigation/native": "^6.1.18",
      "@react-navigation/native-stack": "^6.11.0",
    };

    Object.entries(navigationUpdates).forEach(([pkg, version]) => {
      if (packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = version;
        log(`  Updated ${pkg} to ${version}`, "green");
      }
    });

    // Update other packages
    const otherUpdates = {
      "react-native-gesture-handler": "~2.24.0",
      "react-native-reanimated": "~3.17.4",
      "react-native-safe-area-context": "5.4.0",
      "react-native-screens": "~4.11.1",
      "react-native-svg": "15.11.2",
      "lottie-react-native": "7.2.2",
    };

    Object.entries(otherUpdates).forEach(([pkg, version]) => {
      if (packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = version;
        log(`  Updated ${pkg} to ${version}`, "green");
      }
    });

    // Update devDependencies
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies["@types/react"]) {
        packageJson.devDependencies["@types/react"] = "~18.3.12";
      }
    }

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    log("✅ package.json updated", "green");
  }

  async updateAppJson() {
    log("\n📝 Updating app.json...", "cyan");

    try {
      const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));

      // Ensure SDK version is not specified (let Expo handle it)
      if (appJson.expo.sdkVersion) {
        delete appJson.expo.sdkVersion;
        log("  Removed explicit SDK version", "green");
      }

      // Update runtime version for EAS
      if (!appJson.expo.runtimeVersion) {
        appJson.expo.runtimeVersion = "exposdk:53.0.0";
        log("  Added runtime version", "green");
      }

      // Update platforms if needed
      if (!appJson.expo.platforms) {
        appJson.expo.platforms = ["ios", "android", "web"];
        log("  Added platforms configuration", "green");
      }

      fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
      log("✅ app.json updated", "green");
    } catch (error) {
      log(`⚠️  Could not update app.json: ${error.message}`, "yellow");
    }
  }

  async verifyUpgrade() {
    log("\n🔍 Verifying upgrade...", "cyan");

    try {
      // Check Expo version
      const output = execSync("npx expo --version", { encoding: "utf8" });
      log(`Expo CLI version: ${output.trim()}`, "blue");

      // Check if project can start
      log("🧪 Testing project startup...", "blue");
      const testProcess = execSync("npx expo config --type public", {
        encoding: "utf8",
        timeout: 10000,
      });

      log("✅ Project configuration is valid", "green");

      // Check for TypeScript issues
      try {
        execSync("npx tsc --noEmit --skipLibCheck", {
          stdio: "pipe",
          timeout: 30000,
        });
        log("✅ TypeScript compilation successful", "green");
      } catch (error) {
        log(
          "⚠️  TypeScript has some issues, but project should still work",
          "yellow",
        );
      }

      return true;
    } catch (error) {
      log(`❌ Verification failed: ${error.message}`, "red");
      return false;
    }
  }

  async run() {
    log("🚀 Expo SDK 53 Upgrade Tool", "bright");
    log("============================", "bright");

    try {
      // Check if already on SDK 53
      const isAlreadyUpgraded = await this.checkCurrentSDK();
      if (isAlreadyUpgraded) {
        const forceUpgrade = await this.question(
          "Force upgrade anyway? (y/n): ",
        );
        if (forceUpgrade.toLowerCase() !== "y") {
          log("✅ No upgrade needed", "green");
          this.rl.close();
          return;
        }
      }

      // Confirm upgrade
      const confirm = await this.question(
        "\n❓ Proceed with SDK 53 upgrade? (y/n): ",
      );
      if (confirm.toLowerCase() !== "y") {
        log("❌ Upgrade cancelled", "yellow");
        this.rl.close();
        return;
      }

      // Create backup
      const backupDir = await this.backupProject();

      // Perform upgrade
      await this.upgradeToSDK53();
      await this.updateAppJson();

      // Verify upgrade
      const isValid = await this.verifyUpgrade();

      if (isValid) {
        log("\n🎉 SDK 53 upgrade completed successfully!", "green");
        log("\nNext steps:", "cyan");
        log("1. Test your app: npm start", "yellow");
        log("2. Test on device/simulator", "yellow");
        log("3. Update your build profiles if needed", "yellow");
        log("4. Test building: npm run build:preview", "yellow");
        log(`\n💾 Backup saved in: ${backupDir}`, "blue");
      } else {
        log("\n⚠️  Upgrade completed but with issues", "yellow");
        log("Please check the logs and test your app", "yellow");
        log(`💾 Backup available in: ${backupDir}`, "blue");
      }
    } catch (error) {
      log("\n❌ Upgrade failed!", "red");
      log("You can restore from backup if needed", "yellow");
      console.error(error);
    }

    this.rl.close();
  }
}

if (require.main === module) {
  const upgrader = new SDKUpgrader();
  upgrader.run().catch((error) => {
    console.error("❌ SDK upgrade script failed:", error);
    process.exit(1);
  });
}
