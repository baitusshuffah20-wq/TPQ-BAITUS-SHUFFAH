#!/usr/bin/env node

/**
 * APK Build Notification System
 *
 * Sends notifications about APK build status to various channels
 */

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

class APKNotifier {
  constructor() {
    this.config = this.loadConfig();
  }

  log(message, color = "reset") {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  loadConfig() {
    const configPath = "apk-notifier.config.json";
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (error) {
        this.log("Warning: Invalid notifier config, using defaults", "yellow");
      }
    }

    return {
      discord: {
        enabled: false,
        webhook: "",
        mentions: [],
      },
      slack: {
        enabled: false,
        webhook: "",
        channel: "#builds",
      },
      telegram: {
        enabled: false,
        botToken: "",
        chatId: "",
      },
      email: {
        enabled: false,
        smtp: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "",
            pass: "",
          },
        },
        from: "",
        to: [],
      },
      webhook: {
        enabled: false,
        url: "",
        headers: {},
      },
    };
  }

  saveConfig() {
    fs.writeFileSync(
      "apk-notifier.config.json",
      JSON.stringify(this.config, null, 2),
    );
  }

  async sendDiscordNotification(buildInfo) {
    if (!this.config.discord.enabled || !this.config.discord.webhook) {
      return false;
    }

    try {
      const fetch = (await import("node-fetch")).default;

      const embed = {
        title: buildInfo.success
          ? "✅ APK Build Successful"
          : "❌ APK Build Failed",
        color: buildInfo.success ? 0x00ff00 : 0xff0000,
        fields: [
          { name: "Profile", value: buildInfo.profile, inline: true },
          { name: "Platform", value: buildInfo.platform, inline: true },
          { name: "Duration", value: `${buildInfo.duration}s`, inline: true },
          { name: "Build Type", value: buildInfo.buildType, inline: true },
          {
            name: "Started",
            value: new Date(buildInfo.startTime).toLocaleString(),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      };

      if (buildInfo.downloadUrl) {
        embed.fields.push({
          name: "Download",
          value: buildInfo.downloadUrl,
          inline: false,
        });
      }

      if (buildInfo.error) {
        embed.fields.push({
          name: "Error",
          value: buildInfo.error,
          inline: false,
        });
      }

      const payload = {
        embeds: [embed],
      };

      if (this.config.discord.mentions.length > 0) {
        payload.content = this.config.discord.mentions
          .map((id) => `<@${id}>`)
          .join(" ");
      }

      const response = await fetch(this.config.discord.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.log("📤 Discord notification sent", "green");
        return true;
      } else {
        this.log(
          `⚠️ Discord notification failed: ${response.statusText}`,
          "yellow",
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Discord notification error: ${error.message}`, "red");
      return false;
    }
  }

  async sendSlackNotification(buildInfo) {
    if (!this.config.slack.enabled || !this.config.slack.webhook) {
      return false;
    }

    try {
      const fetch = (await import("node-fetch")).default;

      const color = buildInfo.success ? "good" : "danger";
      const emoji = buildInfo.success ? ":white_check_mark:" : ":x:";

      const attachment = {
        color: color,
        title: `${emoji} APK Build ${buildInfo.success ? "Successful" : "Failed"}`,
        fields: [
          { title: "Profile", value: buildInfo.profile, short: true },
          { title: "Platform", value: buildInfo.platform, short: true },
          { title: "Duration", value: `${buildInfo.duration}s`, short: true },
          { title: "Build Type", value: buildInfo.buildType, short: true },
        ],
        ts: Math.floor(new Date(buildInfo.startTime).getTime() / 1000),
      };

      if (buildInfo.downloadUrl) {
        attachment.fields.push({
          title: "Download",
          value: buildInfo.downloadUrl,
          short: false,
        });
      }

      if (buildInfo.error) {
        attachment.fields.push({
          title: "Error",
          value: buildInfo.error,
          short: false,
        });
      }

      const payload = {
        channel: this.config.slack.channel,
        attachments: [attachment],
      };

      const response = await fetch(this.config.slack.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.log("📤 Slack notification sent", "green");
        return true;
      } else {
        this.log(
          `⚠️ Slack notification failed: ${response.statusText}`,
          "yellow",
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Slack notification error: ${error.message}`, "red");
      return false;
    }
  }

  async sendTelegramNotification(buildInfo) {
    if (
      !this.config.telegram.enabled ||
      !this.config.telegram.botToken ||
      !this.config.telegram.chatId
    ) {
      return false;
    }

    try {
      const fetch = (await import("node-fetch")).default;

      const emoji = buildInfo.success ? "✅" : "❌";
      const status = buildInfo.success ? "Successful" : "Failed";

      let message = `${emoji} *APK Build ${status}*\n\n`;
      message += `📱 *Profile:* ${buildInfo.profile}\n`;
      message += `🏗️ *Platform:* ${buildInfo.platform}\n`;
      message += `⏱️ *Duration:* ${buildInfo.duration}s\n`;
      message += `📦 *Build Type:* ${buildInfo.buildType}\n`;
      message += `🕐 *Started:* ${new Date(buildInfo.startTime).toLocaleString()}\n`;

      if (buildInfo.downloadUrl) {
        message += `\n📥 [Download APK](${buildInfo.downloadUrl})`;
      }

      if (buildInfo.error) {
        message += `\n\n❌ *Error:* ${buildInfo.error}`;
      }

      const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;
      const payload = {
        chat_id: this.config.telegram.chatId,
        text: message,
        parse_mode: "Markdown",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.log("📤 Telegram notification sent", "green");
        return true;
      } else {
        this.log(
          `⚠️ Telegram notification failed: ${response.statusText}`,
          "yellow",
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Telegram notification error: ${error.message}`, "red");
      return false;
    }
  }

  async sendEmailNotification(buildInfo) {
    if (!this.config.email.enabled || this.config.email.to.length === 0) {
      return false;
    }

    try {
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransporter(this.config.email.smtp);

      const subject = `APK Build ${buildInfo.success ? "Successful" : "Failed"} - ${buildInfo.profile}`;

      let html = `
        <h2>${buildInfo.success ? "✅" : "❌"} APK Build ${buildInfo.success ? "Successful" : "Failed"}</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td><strong>Profile</strong></td><td>${buildInfo.profile}</td></tr>
          <tr><td><strong>Platform</strong></td><td>${buildInfo.platform}</td></tr>
          <tr><td><strong>Duration</strong></td><td>${buildInfo.duration}s</td></tr>
          <tr><td><strong>Build Type</strong></td><td>${buildInfo.buildType}</td></tr>
          <tr><td><strong>Started</strong></td><td>${new Date(buildInfo.startTime).toLocaleString()}</td></tr>
      `;

      if (buildInfo.downloadUrl) {
        html += `<tr><td><strong>Download</strong></td><td><a href="${buildInfo.downloadUrl}">Download APK</a></td></tr>`;
      }

      if (buildInfo.error) {
        html += `<tr><td><strong>Error</strong></td><td style="color: red;">${buildInfo.error}</td></tr>`;
      }

      html += "</table>";

      const mailOptions = {
        from: this.config.email.from,
        to: this.config.email.to.join(", "),
        subject: subject,
        html: html,
      };

      await transporter.sendMail(mailOptions);
      this.log("📤 Email notification sent", "green");
      return true;
    } catch (error) {
      this.log(`❌ Email notification error: ${error.message}`, "red");
      return false;
    }
  }

  async sendWebhookNotification(buildInfo) {
    if (!this.config.webhook.enabled || !this.config.webhook.url) {
      return false;
    }

    try {
      const fetch = (await import("node-fetch")).default;

      const payload = {
        event: "apk_build_completed",
        buildInfo: buildInfo,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.config.webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.webhook.headers,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.log("📤 Webhook notification sent", "green");
        return true;
      } else {
        this.log(
          `⚠️ Webhook notification failed: ${response.statusText}`,
          "yellow",
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Webhook notification error: ${error.message}`, "red");
      return false;
    }
  }

  async sendAllNotifications(buildInfo) {
    this.log("📢 Sending notifications...", "cyan");

    const results = await Promise.allSettled([
      this.sendDiscordNotification(buildInfo),
      this.sendSlackNotification(buildInfo),
      this.sendTelegramNotification(buildInfo),
      this.sendEmailNotification(buildInfo),
      this.sendWebhookNotification(buildInfo),
    ]);

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length;
    const total = results.filter(
      (result) => result.status === "fulfilled",
    ).length;

    this.log(
      `📊 Notifications sent: ${successful}/${total}`,
      successful > 0 ? "green" : "yellow",
    );

    return successful > 0;
  }

  async testNotifications() {
    this.log("🧪 Testing notifications...", "cyan");

    const testBuildInfo = {
      id: "test-build-" + Date.now(),
      profile: "preview",
      platform: "android",
      buildType: "apk",
      startTime: new Date(),
      duration: 120,
      success: true,
      downloadUrl: "https://example.com/test.apk",
      easBuildId: "test-eas-id",
    };

    await this.sendAllNotifications(testBuildInfo);
  }

  showConfig() {
    this.log("📋 Notification Configuration:", "cyan");
    this.log("============================", "cyan");

    Object.entries(this.config).forEach(([service, config]) => {
      const status = config.enabled ? "🟢 Enabled" : "🔴 Disabled";
      this.log(`${status} ${service.toUpperCase()}`, "blue");
    });
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case "test":
        await this.testNotifications();
        break;

      case "config":
        this.showConfig();
        break;

      case "send":
        const buildInfoFile = args[1];
        if (buildInfoFile && fs.existsSync(buildInfoFile)) {
          const buildInfo = JSON.parse(fs.readFileSync(buildInfoFile, "utf8"));
          await this.sendAllNotifications(buildInfo);
        } else {
          this.log("❌ Build info file not found", "red");
        }
        break;

      default:
        this.log("APK Notifier Commands:", "cyan");
        this.log(
          "  test                    - Test all notifications",
          "yellow",
        );
        this.log("  config                  - Show configuration", "yellow");
        this.log(
          "  send <build-info.json>  - Send notifications for build",
          "yellow",
        );
        this.log("", "reset");
        this.log("Examples:", "cyan");
        this.log("  npm run notify:test", "blue");
        this.log("  npm run notify:config", "blue");
    }
  }
}

// Install required dependencies if not available
const requiredPackages = ["node-fetch", "nodemailer"];
requiredPackages.forEach((pkg) => {
  try {
    require(pkg);
  } catch (error) {
    console.log(`Installing ${pkg}...`);
    require("child_process").execSync(`npm install ${pkg}`, {
      stdio: "inherit",
    });
  }
});

if (require.main === module) {
  const notifier = new APKNotifier();
  notifier.run().catch((error) => {
    console.error("❌ Notifier failed:", error);
    process.exit(1);
  });
}

module.exports = APKNotifier;
