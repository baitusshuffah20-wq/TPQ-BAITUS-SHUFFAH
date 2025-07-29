#!/usr/bin/env node

/**
 * Demo APK Generator
 *
 * Demonstrates the Auto APK Generator module capabilities
 */

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

function log(message, color = "reset") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function showHeader() {
  console.clear();
  log("🚀 Auto APK Generator Module Demo", "bright");
  log("==================================", "bright");
  log("", "reset");
}

function showFeatures() {
  log("📦 Module Features:", "cyan");
  log("", "reset");

  const features = [
    "🤖 Automatic APK Generation",
    "⏰ Scheduled Builds with Cron",
    "📢 Multi-platform Notifications",
    "📊 Build History Tracking",
    "🔢 Auto Version Increment",
    "🔍 Project Validation",
    "📱 Multiple Build Profiles",
    "🎯 Interactive & Auto Modes",
    "📈 Real-time Progress Monitoring",
    "🔄 Retry Mechanism",
    "📤 Upload Integration Ready",
    "⚙️ Configurable Settings",
  ];

  features.forEach((feature) => {
    log(`  ${feature}`, "green");
  });

  log("", "reset");
}

function showBuildProfiles() {
  log("📱 Available Build Profiles:", "cyan");
  log("", "reset");

  const profiles = [
    {
      name: "Development APK",
      description: "Debug APK with development features",
      command: "npm run apk:auto development",
    },
    {
      name: "Preview APK",
      description: "Release APK for testing",
      command: "npm run apk:auto preview",
    },
    {
      name: "Production APK",
      description: "Production APK for release",
      command: "npm run apk:auto production",
    },
    {
      name: "Production AAB",
      description: "App Bundle for Play Store",
      command: "npm run apk:auto production-aab",
    },
  ];

  profiles.forEach((profile, index) => {
    log(`${index + 1}. ${profile.name}`, "yellow");
    log(`   ${profile.description}`, "blue");
    log(`   Command: ${profile.command}`, "green");
    log("", "reset");
  });
}

function showCommands() {
  log("🎯 Available Commands:", "cyan");
  log("", "reset");

  const commandGroups = [
    {
      title: "APK Generation",
      commands: [
        { cmd: "npm run apk:generate", desc: "Interactive APK generator" },
        { cmd: "npm run apk:auto", desc: "Auto mode with default profile" },
        {
          cmd: "npm run apk:auto preview",
          desc: "Auto mode with specific profile",
        },
        { cmd: "npm run apk:history", desc: "Show build history" },
        { cmd: "npm run apk:config", desc: "Show configuration" },
      ],
    },
    {
      title: "Build Scheduling",
      commands: [
        { cmd: "npm run schedule:start", desc: "Start build scheduler" },
        { cmd: "npm run schedule:status", desc: "Show scheduler status" },
        { cmd: "npm run schedule:enable 0", desc: "Enable schedule by index" },
        { cmd: "npm run schedule:test preview", desc: "Test build profile" },
      ],
    },
    {
      title: "Notifications",
      commands: [
        { cmd: "npm run notify:test", desc: "Test all notifications" },
        { cmd: "npm run notify:config", desc: "Show notification config" },
      ],
    },
  ];

  commandGroups.forEach((group) => {
    log(`📋 ${group.title}:`, "yellow");
    group.commands.forEach((cmd) => {
      log(`  ${cmd.cmd}`, "green");
      log(`    ${cmd.desc}`, "blue");
    });
    log("", "reset");
  });
}

function showWorkflow() {
  log("🔄 Typical Workflow:", "cyan");
  log("", "reset");

  const steps = [
    "1. 🔧 Setup EAS (if not done): eas init",
    "2. 🎯 Interactive build: npm run apk:generate",
    "3. 📊 Check history: npm run apk:history",
    "4. ⏰ Setup scheduling: npm run schedule:start",
    "5. 📢 Configure notifications: Edit config files",
    "6. 🚀 Production build: npm run apk:auto production",
  ];

  steps.forEach((step) => {
    log(`  ${step}`, "green");
  });

  log("", "reset");
}

function showConfigFiles() {
  log("⚙️ Configuration Files:", "cyan");
  log("", "reset");

  const configs = [
    {
      file: "apk-generator.config.json",
      desc: "Main generator configuration",
    },
    {
      file: "apk-scheduler.config.json",
      desc: "Build scheduling configuration",
    },
    {
      file: "apk-notifier.config.json",
      desc: "Notification system configuration",
    },
    {
      file: "build-history.json",
      desc: "Build history tracking (auto-generated)",
    },
    {
      file: "eas.json",
      desc: "EAS build profiles configuration",
    },
  ];

  configs.forEach((config) => {
    log(`📄 ${config.file}`, "yellow");
    log(`   ${config.desc}`, "blue");
  });

  log("", "reset");
}

function showNotificationSetup() {
  log("📢 Notification Setup Examples:", "cyan");
  log("", "reset");

  log("🔵 Discord Setup:", "yellow");
  log("1. Create webhook in Discord server", "blue");
  log("2. Edit apk-notifier.config.json:", "blue");
  log(
    '   "discord": { "enabled": true, "webhook": "your_webhook_url" }',
    "green",
  );
  log("", "reset");

  log("💬 Slack Setup:", "yellow");
  log("1. Create incoming webhook in Slack", "blue");
  log("2. Edit apk-notifier.config.json:", "blue");
  log(
    '   "slack": { "enabled": true, "webhook": "your_webhook_url" }',
    "green",
  );
  log("", "reset");

  log("📧 Email Setup:", "yellow");
  log("1. Get SMTP credentials (Gmail App Password)", "blue");
  log("2. Edit apk-notifier.config.json:", "blue");
  log('   "email": { "enabled": true, "smtp": {...}, "to": [...] }', "green");
  log("", "reset");
}

function showSchedulingExamples() {
  log("⏰ Scheduling Examples:", "cyan");
  log("", "reset");

  const schedules = [
    { cron: "0 2 * * *", desc: "Daily at 2:00 AM" },
    { cron: "0 3 * * 0", desc: "Weekly on Sunday at 3:00 AM" },
    { cron: "0 1 1 * *", desc: "Monthly on 1st at 1:00 AM" },
    { cron: "0 9 * * 1-5", desc: "Weekdays at 9:00 AM" },
    { cron: "*/30 * * * *", desc: "Every 30 minutes" },
  ];

  schedules.forEach((schedule) => {
    log(`⏰ ${schedule.cron}`, "yellow");
    log(`   ${schedule.desc}`, "blue");
  });

  log("", "reset");
}

function showTroubleshooting() {
  log("🛠️ Troubleshooting:", "cyan");
  log("", "reset");

  const issues = [
    {
      issue: "EAS not authenticated",
      solution: "Run: eas login",
    },
    {
      issue: "Build fails with asset errors",
      solution: "Check assets/icon.png and assets/splash.png exist",
    },
    {
      issue: "TypeScript compilation errors",
      solution: "Run: npx tsc --noEmit to check errors",
    },
    {
      issue: "Notification not working",
      solution: "Test with: npm run notify:test",
    },
    {
      issue: "Schedule not running",
      solution: "Check cron expression and enable schedule",
    },
  ];

  issues.forEach((item) => {
    log(`❌ ${item.issue}`, "red");
    log(`✅ ${item.solution}`, "green");
    log("", "reset");
  });
}

async function runDemo() {
  showHeader();

  log("🎬 Starting Auto APK Generator Demo...", "cyan");
  log("", "reset");

  // Show all sections with delays for better readability
  const sections = [
    showFeatures,
    showBuildProfiles,
    showCommands,
    showWorkflow,
    showConfigFiles,
    showNotificationSetup,
    showSchedulingExamples,
    showTroubleshooting,
  ];

  for (const section of sections) {
    section();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  log("🎉 Demo completed!", "bright");
  log("", "reset");
  log("🚀 Ready to start building APKs automatically!", "green");
  log("", "reset");
  log(
    "📚 For detailed documentation, see: AUTO_APK_GENERATOR_MODULE.md",
    "blue",
  );
  log("", "reset");
}

// Run demo if called directly
if (require.main === module) {
  runDemo().catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });
}

module.exports = { runDemo };
