#!/usr/bin/env node

/**
 * TurboModuleRegistry Fix Script
 *
 * This script fixes TurboModuleRegistry issues in Expo SDK 53
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

class TurboModuleFixer {
  async checkExpoGoCompatibility() {
    log("\n🔍 Checking Expo Go compatibility...", "cyan");

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const expoVersion = packageJson.dependencies?.expo;

      log(`Current Expo SDK: ${expoVersion}`, "blue");

      // Check if using packages that require development build
      const problematicPackages = [
        "react-native-reanimated",
        "react-native-gesture-handler",
        "react-native-screens",
        "react-native-safe-area-context",
        "lottie-react-native",
      ];

      const foundProblematic = [];
      problematicPackages.forEach((pkg) => {
        if (packageJson.dependencies[pkg]) {
          foundProblematic.push(pkg);
        }
      });

      if (foundProblematic.length > 0) {
        log("⚠️  Found packages that may require development build:", "yellow");
        foundProblematic.forEach((pkg) => {
          log(`  - ${pkg}`, "yellow");
        });
        return false;
      }

      return true;
    } catch (error) {
      log(`❌ Error checking compatibility: ${error.message}`, "red");
      return false;
    }
  }

  async createMetroConfig() {
    log("\n📝 Creating Metro configuration...", "cyan");

    const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TurboModules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

// Add transformer options for better compatibility
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
`;

    fs.writeFileSync("metro.config.js", metroConfig);
    log("✅ Metro configuration created", "green");
  }

  async updateAppJson() {
    log("\n📝 Updating app.json for better compatibility...", "cyan");

    try {
      const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));

      // Add jsEngine configuration
      if (!appJson.expo.jsEngine) {
        appJson.expo.jsEngine = "hermes";
        log("  Added Hermes JS engine", "green");
      }

      // Add newArchEnabled for better compatibility
      if (!appJson.expo.android) {
        appJson.expo.android = {};
      }

      if (!appJson.expo.android.newArchEnabled) {
        appJson.expo.android.newArchEnabled = false;
        log("  Disabled new architecture for compatibility", "green");
      }

      // Ensure proper runtime version
      if (!appJson.expo.runtimeVersion) {
        appJson.expo.runtimeVersion = "exposdk:53.0.0";
        log("  Added runtime version", "green");
      }

      fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
      log("✅ app.json updated", "green");
    } catch (error) {
      log(`❌ Error updating app.json: ${error.message}`, "red");
    }
  }

  async createDevelopmentBuild() {
    log("\n🏗️ Creating development build for better compatibility...", "cyan");

    try {
      // Check if EAS is configured
      if (!fs.existsSync("eas.json")) {
        log("❌ EAS not configured. Please run: eas init", "red");
        return false;
      }

      log("Building development client...", "blue");
      execSync("eas build --profile development --platform android --local", {
        stdio: "inherit",
        timeout: 300000, // 5 minutes timeout
      });

      log("✅ Development build created", "green");
      return true;
    } catch (error) {
      log(`⚠️  Development build failed: ${error.message}`, "yellow");
      log("You can try building on EAS servers instead", "yellow");
      return false;
    }
  }

  async fixPackageCompatibility() {
    log("\n🔧 Fixing package compatibility...", "cyan");

    try {
      // Update to more compatible versions
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      // Use more stable versions for Expo Go compatibility
      const compatibleVersions = {
        "react-native-reanimated": "~3.10.1",
        "react-native-gesture-handler": "~2.16.1",
        "react-native-screens": "~3.31.1",
        "react-native-safe-area-context": "4.10.5",
      };

      let updated = false;
      Object.entries(compatibleVersions).forEach(([pkg, version]) => {
        if (packageJson.dependencies[pkg]) {
          packageJson.dependencies[pkg] = version;
          log(`  Updated ${pkg} to ${version}`, "green");
          updated = true;
        }
      });

      if (updated) {
        fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
        log("✅ Package versions updated for compatibility", "green");

        // Reinstall dependencies
        log("📦 Reinstalling dependencies...", "blue");
        execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
        log("✅ Dependencies reinstalled", "green");
      }
    } catch (error) {
      log(`❌ Error fixing compatibility: ${error.message}`, "red");
    }
  }

  async createExpoGoCompatibleVersion() {
    log("\n📱 Creating Expo Go compatible version...", "cyan");

    try {
      // Create a simplified version for Expo Go
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      // Remove packages that cause TurboModule issues in Expo Go
      const problematicPackages = [
        "lottie-react-native",
        "react-native-chart-kit",
        "react-native-vector-icons",
      ];

      const backupDeps = {};
      problematicPackages.forEach((pkg) => {
        if (packageJson.dependencies[pkg]) {
          backupDeps[pkg] = packageJson.dependencies[pkg];
          delete packageJson.dependencies[pkg];
          log(`  Temporarily removed ${pkg}`, "yellow");
        }
      });

      // Save backup
      fs.writeFileSync(
        "package.backup.json",
        JSON.stringify({ dependencies: backupDeps }, null, 2),
      );
      fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

      log("✅ Created Expo Go compatible version", "green");
      log("💾 Backup saved to package.backup.json", "blue");

      return true;
    } catch (error) {
      log(`❌ Error creating compatible version: ${error.message}`, "red");
      return false;
    }
  }

  async restorePackages() {
    log("\n🔄 Restoring original packages...", "cyan");

    try {
      if (fs.existsSync("package.backup.json")) {
        const backup = JSON.parse(
          fs.readFileSync("package.backup.json", "utf8"),
        );
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

        Object.entries(backup.dependencies).forEach(([pkg, version]) => {
          packageJson.dependencies[pkg] = version;
          log(`  Restored ${pkg}`, "green");
        });

        fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
        fs.unlinkSync("package.backup.json");

        log("✅ Packages restored", "green");
      }
    } catch (error) {
      log(`❌ Error restoring packages: ${error.message}`, "red");
    }
  }

  async showSolutions() {
    log("\n💡 TurboModuleRegistry Solutions:", "cyan");
    log("", "reset");
    log("1. 🏗️  Use Development Build (Recommended)", "yellow");
    log("   - More stable with native modules", "blue");
    log("   - Better performance", "blue");
    log("   - Full feature support", "blue");
    log("   Command: eas build --profile development", "green");
    log("", "reset");
    log("2. 📱 Use Expo Go Compatible Version", "yellow");
    log("   - Remove problematic packages temporarily", "blue");
    log("   - Test core functionality", "blue");
    log("   - Limited features", "blue");
    log("   Command: npm run fix:expo-go", "green");
    log("", "reset");
    log("3. 🌐 Use Web Version", "yellow");
    log("   - Full feature support", "blue");
    log("   - No native module issues", "blue");
    log("   - Good for testing UI/UX", "blue");
    log("   Command: npm run web", "green");
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    log("🔧 TurboModuleRegistry Fix Tool", "bright");
    log("===============================", "bright");

    switch (command) {
      case "check":
        await this.checkExpoGoCompatibility();
        break;
      case "metro":
        await this.createMetroConfig();
        break;
      case "app-config":
        await this.updateAppJson();
        break;
      case "dev-build":
        await this.createDevelopmentBuild();
        break;
      case "fix-packages":
        await this.fixPackageCompatibility();
        break;
      case "expo-go":
        await this.createExpoGoCompatibleVersion();
        break;
      case "restore":
        await this.restorePackages();
        break;
      case "solutions":
        await this.showSolutions();
        break;
      default:
        log("\nAvailable commands:", "cyan");
        log("  check        - Check Expo Go compatibility", "yellow");
        log("  metro        - Create Metro configuration", "yellow");
        log("  app-config   - Update app.json", "yellow");
        log("  dev-build    - Create development build", "yellow");
        log("  fix-packages - Fix package compatibility", "yellow");
        log("  expo-go      - Create Expo Go compatible version", "yellow");
        log("  restore      - Restore original packages", "yellow");
        log("  solutions    - Show all solutions", "yellow");
        log("\nUsage: node scripts/fix-turbo-module.js <command>", "blue");
    }
  }
}

if (require.main === module) {
  const fixer = new TurboModuleFixer();
  fixer.run().catch((error) => {
    console.error("❌ Fix script failed:", error);
    process.exit(1);
  });
}
