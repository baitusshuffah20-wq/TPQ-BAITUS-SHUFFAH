#!/usr/bin/env node

/**
 * APK Build Scheduler
 *
 * Schedules automatic APK builds using cron-like syntax
 */

const cron = require("node-cron");
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

class APKScheduler {
  constructor() {
    this.config = this.loadConfig();
    this.tasks = new Map();
  }

  log(message, color = "reset") {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  loadConfig() {
    const configPath = "apk-scheduler.config.json";
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (error) {
        this.log("Warning: Invalid scheduler config, using defaults", "yellow");
      }
    }

    return {
      schedules: [
        {
          name: "Daily Preview Build",
          cron: "0 2 * * *", // Daily at 2 AM
          profile: "preview",
          enabled: false,
        },
        {
          name: "Weekly Production Build",
          cron: "0 3 * * 0", // Weekly on Sunday at 3 AM
          profile: "production",
          enabled: false,
        },
      ],
      notifications: {
        onSuccess: true,
        onFailure: true,
        webhook: null,
      },
      retries: {
        maxAttempts: 3,
        delay: 300000, // 5 minutes
      },
    };
  }

  saveConfig() {
    fs.writeFileSync(
      "apk-scheduler.config.json",
      JSON.stringify(this.config, null, 2),
    );
  }

  async executeBuild(profile) {
    this.log(`🚀 Starting scheduled build: ${profile}`, "cyan");

    try {
      const command = `node scripts/auto-apk-generator.js auto ${profile}`;
      execSync(command, { stdio: "inherit" });

      this.log(`✅ Scheduled build completed: ${profile}`, "green");

      if (this.config.notifications.onSuccess) {
        await this.sendNotification(
          `✅ Scheduled APK build completed: ${profile}`,
          "success",
        );
      }

      return true;
    } catch (error) {
      this.log(`❌ Scheduled build failed: ${error.message}`, "red");

      if (this.config.notifications.onFailure) {
        await this.sendNotification(
          `❌ Scheduled APK build failed: ${profile}\nError: ${error.message}`,
          "error",
        );
      }

      return false;
    }
  }

  async executeBuildWithRetry(profile) {
    const maxAttempts = this.config.retries.maxAttempts;
    const delay = this.config.retries.delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.log(
        `📱 Build attempt ${attempt}/${maxAttempts} for ${profile}`,
        "blue",
      );

      const success = await this.executeBuild(profile);
      if (success) {
        return true;
      }

      if (attempt < maxAttempts) {
        this.log(`⏳ Waiting ${delay / 1000}s before retry...`, "yellow");
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.log(`❌ All ${maxAttempts} attempts failed for ${profile}`, "red");
    return false;
  }

  async sendNotification(message, type) {
    this.log(
      `📢 Notification: ${message}`,
      type === "success" ? "green" : "red",
    );

    // Webhook notification
    if (this.config.notifications.webhook) {
      try {
        const fetch = (await import("node-fetch")).default;
        await fetch(this.config.notifications.webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message,
            type: type,
            timestamp: new Date().toISOString(),
          }),
        });
        this.log("📤 Webhook notification sent", "green");
      } catch (error) {
        this.log(`⚠️ Webhook notification failed: ${error.message}`, "yellow");
      }
    }
  }

  scheduleBuilds() {
    this.log("⏰ Setting up build schedules...", "cyan");

    this.config.schedules.forEach((schedule, index) => {
      if (!schedule.enabled) {
        this.log(`⏸️ Schedule disabled: ${schedule.name}`, "yellow");
        return;
      }

      if (!cron.validate(schedule.cron)) {
        this.log(`❌ Invalid cron expression: ${schedule.cron}`, "red");
        return;
      }

      const task = cron.schedule(
        schedule.cron,
        async () => {
          this.log(`⏰ Triggered scheduled build: ${schedule.name}`, "cyan");
          await this.executeBuildWithRetry(schedule.profile);
        },
        {
          scheduled: false,
          timezone: "Asia/Jakarta",
        },
      );

      this.tasks.set(index, task);
      task.start();

      this.log(`✅ Scheduled: ${schedule.name} (${schedule.cron})`, "green");
    });

    if (this.tasks.size === 0) {
      this.log("⚠️ No schedules enabled", "yellow");
    } else {
      this.log(`🎯 ${this.tasks.size} build schedules active`, "green");
    }
  }

  showStatus() {
    this.log("📊 Scheduler Status:", "cyan");
    this.log("==================", "cyan");

    this.config.schedules.forEach((schedule, index) => {
      const status = schedule.enabled ? "🟢 Active" : "🔴 Disabled";
      const nextRun =
        schedule.enabled && cron.validate(schedule.cron)
          ? this.getNextRunTime(schedule.cron)
          : "N/A";

      this.log(`${status} ${schedule.name}`, "blue");
      this.log(`  Cron: ${schedule.cron}`, "blue");
      this.log(`  Profile: ${schedule.profile}`, "blue");
      this.log(`  Next run: ${nextRun}`, "blue");
      this.log("", "reset");
    });
  }

  getNextRunTime(cronExpression) {
    try {
      // Simple next run calculation (would need a proper cron library for accuracy)
      return "Next scheduled time (calculation needed)";
    } catch (error) {
      return "Invalid cron expression";
    }
  }

  enableSchedule(index) {
    if (index >= 0 && index < this.config.schedules.length) {
      this.config.schedules[index].enabled = true;
      this.saveConfig();
      this.log(`✅ Schedule ${index} enabled`, "green");
    } else {
      this.log("❌ Invalid schedule index", "red");
    }
  }

  disableSchedule(index) {
    if (index >= 0 && index < this.config.schedules.length) {
      this.config.schedules[index].enabled = false;
      this.saveConfig();

      // Stop the task if running
      if (this.tasks.has(index)) {
        this.tasks.get(index).stop();
        this.tasks.delete(index);
      }

      this.log(`⏸️ Schedule ${index} disabled`, "yellow");
    } else {
      this.log("❌ Invalid schedule index", "red");
    }
  }

  addSchedule(name, cron, profile) {
    if (!cron.validate(cron)) {
      this.log("❌ Invalid cron expression", "red");
      return;
    }

    const newSchedule = {
      name: name,
      cron: cron,
      profile: profile,
      enabled: false,
    };

    this.config.schedules.push(newSchedule);
    this.saveConfig();

    this.log(`✅ Schedule added: ${name}`, "green");
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case "start":
        this.log("🚀 Starting APK Build Scheduler", "bright");
        this.scheduleBuilds();

        // Keep the process running
        process.on("SIGINT", () => {
          this.log("🛑 Scheduler stopped", "yellow");
          process.exit(0);
        });

        // Prevent process from exiting
        setInterval(() => {}, 1000);
        break;

      case "status":
        this.showStatus();
        break;

      case "enable":
        const enableIndex = parseInt(args[1]);
        this.enableSchedule(enableIndex);
        break;

      case "disable":
        const disableIndex = parseInt(args[1]);
        this.disableSchedule(disableIndex);
        break;

      case "add":
        const [, name, cronExpr, profile] = args;
        if (name && cronExpr && profile) {
          this.addSchedule(name, cronExpr, profile);
        } else {
          this.log("Usage: add <name> <cron> <profile>", "yellow");
        }
        break;

      case "test":
        const testProfile = args[1] || "preview";
        this.log(`🧪 Testing build: ${testProfile}`, "cyan");
        await this.executeBuildWithRetry(testProfile);
        break;

      default:
        this.log("APK Build Scheduler Commands:", "cyan");
        this.log("  start              - Start the scheduler", "yellow");
        this.log("  status             - Show schedule status", "yellow");
        this.log("  enable <index>     - Enable a schedule", "yellow");
        this.log("  disable <index>    - Disable a schedule", "yellow");
        this.log("  add <name> <cron> <profile> - Add new schedule", "yellow");
        this.log("  test <profile>     - Test a build", "yellow");
        this.log("", "reset");
        this.log("Examples:", "cyan");
        this.log("  npm run schedule:start", "blue");
        this.log("  npm run schedule:status", "blue");
        this.log("  npm run schedule:enable 0", "blue");
        this.log("  npm run schedule:test preview", "blue");
    }
  }
}

// Install node-cron if not available
try {
  require("node-cron");
} catch (error) {
  console.log("Installing node-cron...");
  require("child_process").execSync("npm install node-cron", {
    stdio: "inherit",
  });
}

if (require.main === module) {
  const scheduler = new APKScheduler();
  scheduler.run().catch((error) => {
    console.error("❌ Scheduler failed:", error);
    process.exit(1);
  });
}

module.exports = APKScheduler;
