#!/usr/bin/env node

/**
 * Environment Management Script
 *
 * This script helps manage environment variables for different build profiles
 */

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

const ENV_PROFILES = {
  development: {
    name: "Development",
    file: ".env.development",
    description: "Local development environment",
  },
  staging: {
    name: "Staging",
    file: ".env.staging",
    description: "Staging/Preview environment",
  },
  production: {
    name: "Production",
    file: ".env.production",
    description: "Production environment",
  },
};

class EnvironmentManager {
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

  async createEnvironmentFiles() {
    log("\n🌍 Creating environment files...", "cyan");

    const examplePath = ".env.example";
    if (!fs.existsSync(examplePath)) {
      log("❌ .env.example not found", "red");
      return;
    }

    const exampleContent = fs.readFileSync(examplePath, "utf8");

    Object.entries(ENV_PROFILES).forEach(([key, profile]) => {
      const envPath = profile.file;

      if (!fs.existsSync(envPath)) {
        // Create environment-specific content
        let envContent = exampleContent;

        // Customize based on environment
        switch (key) {
          case "development":
            envContent = envContent.replace(
              "APP_ENV=development",
              "APP_ENV=development",
            );
            envContent = envContent.replace(
              "DEBUG_MODE=true",
              "DEBUG_MODE=true",
            );
            envContent = envContent.replace(
              "LOG_LEVEL=debug",
              "LOG_LEVEL=debug",
            );
            break;
          case "staging":
            envContent = envContent.replace(
              "APP_ENV=development",
              "APP_ENV=staging",
            );
            envContent = envContent.replace(
              "DEBUG_MODE=true",
              "DEBUG_MODE=false",
            );
            envContent = envContent.replace(
              "LOG_LEVEL=debug",
              "LOG_LEVEL=info",
            );
            break;
          case "production":
            envContent = envContent.replace(
              "APP_ENV=development",
              "APP_ENV=production",
            );
            envContent = envContent.replace(
              "DEBUG_MODE=true",
              "DEBUG_MODE=false",
            );
            envContent = envContent.replace(
              "LOG_LEVEL=debug",
              "LOG_LEVEL=error",
            );
            envContent = envContent.replace(
              "ENABLE_FLIPPER=true",
              "ENABLE_FLIPPER=false",
            );
            break;
        }

        fs.writeFileSync(envPath, envContent);
        log(`✅ Created ${envPath}`, "green");
      } else {
        log(`⚠️  ${envPath} already exists`, "yellow");
      }
    });
  }

  async validateEnvironmentFiles() {
    log("\n🔍 Validating environment files...", "cyan");

    const requiredVars = ["API_BASE_URL", "APP_ENV", "APP_VERSION"];

    Object.entries(ENV_PROFILES).forEach(([key, profile]) => {
      const envPath = profile.file;

      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const missingVars = [];

        requiredVars.forEach((varName) => {
          if (
            !content.includes(`${varName}=`) ||
            content.includes(`${varName}=your-`)
          ) {
            missingVars.push(varName);
          }
        });

        if (missingVars.length === 0) {
          log(`✅ ${profile.name} environment is valid`, "green");
        } else {
          log(
            `⚠️  ${profile.name} environment missing: ${missingVars.join(", ")}`,
            "yellow",
          );
        }
      } else {
        log(`❌ ${profile.name} environment file not found`, "red");
      }
    });
  }

  async selectEnvironment() {
    log("\n🌍 Select environment to configure:", "cyan");

    Object.entries(ENV_PROFILES).forEach(([key, profile], index) => {
      log(`${index + 1}. ${profile.name} - ${profile.description}`, "yellow");
    });

    const choice = await this.question("\nEnter your choice (1-3): ");
    const profileKeys = Object.keys(ENV_PROFILES);
    const selectedKey = profileKeys[parseInt(choice) - 1];

    if (!selectedKey) {
      log("❌ Invalid choice", "red");
      return null;
    }

    return selectedKey;
  }

  async configureEnvironment(envKey) {
    const profile = ENV_PROFILES[envKey];
    const envPath = profile.file;

    log(`\n⚙️  Configuring ${profile.name} environment...`, "cyan");

    if (!fs.existsSync(envPath)) {
      log(`❌ ${envPath} not found. Run create command first.`, "red");
      return;
    }

    let content = fs.readFileSync(envPath, "utf8");

    // Configure API URL
    const currentApiUrl = content.match(/API_BASE_URL=(.+)/)?.[1] || "";
    log(`Current API URL: ${currentApiUrl}`, "blue");
    const newApiUrl = await this.question(
      "Enter new API URL (or press Enter to keep current): ",
    );

    if (newApiUrl.trim()) {
      content = content.replace(
        /API_BASE_URL=.+/,
        `API_BASE_URL=${newApiUrl.trim()}`,
      );
    }

    // Configure app version
    const currentVersion = content.match(/APP_VERSION=(.+)/)?.[1] || "";
    log(`Current version: ${currentVersion}`, "blue");
    const newVersion = await this.question(
      "Enter new version (or press Enter to keep current): ",
    );

    if (newVersion.trim()) {
      content = content.replace(
        /APP_VERSION=.+/,
        `APP_VERSION=${newVersion.trim()}`,
      );
    }

    fs.writeFileSync(envPath, content);
    log(`✅ ${profile.name} environment updated`, "green");
  }

  async showEnvironmentStatus() {
    log("\n📊 Environment Status:", "cyan");

    Object.entries(ENV_PROFILES).forEach(([key, profile]) => {
      const envPath = profile.file;

      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const apiUrl = content.match(/API_BASE_URL=(.+)/)?.[1] || "Not set";
        const appEnv = content.match(/APP_ENV=(.+)/)?.[1] || "Not set";
        const version = content.match(/APP_VERSION=(.+)/)?.[1] || "Not set";

        log(`\n${profile.name}:`, "yellow");
        log(`  File: ${envPath}`, "blue");
        log(`  API URL: ${apiUrl}`, "blue");
        log(`  Environment: ${appEnv}`, "blue");
        log(`  Version: ${version}`, "blue");
      } else {
        log(`\n${profile.name}: ❌ Not configured`, "red");
      }
    });
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    log("🌍 Environment Manager for TPQ Wali Santri", "bright");
    log("==========================================", "bright");

    switch (command) {
      case "create":
        await this.createEnvironmentFiles();
        break;
      case "validate":
        await this.validateEnvironmentFiles();
        break;
      case "configure":
        const envKey = await this.selectEnvironment();
        if (envKey) {
          await this.configureEnvironment(envKey);
        }
        break;
      case "status":
        await this.showEnvironmentStatus();
        break;
      default:
        log("\nAvailable commands:", "cyan");
        log("  create    - Create environment files from template", "yellow");
        log("  validate  - Validate environment files", "yellow");
        log("  configure - Configure specific environment", "yellow");
        log("  status    - Show environment status", "yellow");
        log("\nUsage: node scripts/manage-env.js <command>", "blue");
    }

    this.rl.close();
  }
}

if (require.main === module) {
  const manager = new EnvironmentManager();
  manager.run().catch((error) => {
    console.error("❌ Environment management failed:", error);
    process.exit(1);
  });
}
