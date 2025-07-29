#!/usr/bin/env node

/**
 * Admin Integration Module
 *
 * Integrates APK generator with existing admin backend
 */

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

class AdminIntegration {
  constructor(config = {}) {
    this.adminBaseUrl = config.adminBaseUrl || "http://localhost:8000";
    this.apiKey = config.apiKey || process.env.ADMIN_API_KEY;
    this.webhookUrl = config.webhookUrl;
  }

  // Send build notification to admin backend
  async notifyBuildStatus(buildInfo) {
    try {
      const payload = {
        type: "mobile_build",
        status: buildInfo.success ? "completed" : "failed",
        platform: buildInfo.platform,
        profile: buildInfo.profile,
        buildType: buildInfo.buildType,
        startTime: buildInfo.startTime,
        duration: buildInfo.duration,
        downloadUrl: buildInfo.downloadUrl,
        easBuildId: buildInfo.easBuildId,
        error: buildInfo.error,
      };

      if (this.webhookUrl) {
        await axios.post(this.webhookUrl, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        });
      }

      // Also send to admin API
      await axios.post(`${this.adminBaseUrl}/api/mobile-builds`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      console.log("✅ Build notification sent to admin backend");
      return true;
    } catch (error) {
      console.error("❌ Failed to notify admin backend:", error.message);
      return false;
    }
  }

  // Get admin users who should receive notifications
  async getNotificationRecipients() {
    try {
      const response = await axios.get(`${this.adminBaseUrl}/api/admin-users`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("❌ Failed to get notification recipients:", error.message);
      return [];
    }
  }

  // Upload build artifact to admin storage
  async uploadBuildArtifact(filePath, buildInfo) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("Build artifact file not found");
      }

      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      form.append("buildId", buildInfo.id);
      form.append("platform", buildInfo.platform);
      form.append("profile", buildInfo.profile);

      const response = await axios.post(
        `${this.adminBaseUrl}/api/mobile-builds/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log("✅ Build artifact uploaded to admin storage");
      return response.data.downloadUrl;
    } catch (error) {
      console.error("❌ Failed to upload build artifact:", error.message);
      return null;
    }
  }

  // Create admin notification
  async createAdminNotification(
    title,
    message,
    type = "info",
    recipients = [],
  ) {
    try {
      const payload = {
        title,
        message,
        type,
        recipients,
        category: "mobile_build",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "mobile_app_builder",
        },
      };

      await axios.post(`${this.adminBaseUrl}/api/notifications`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      console.log("✅ Admin notification created");
      return true;
    } catch (error) {
      console.error("❌ Failed to create admin notification:", error.message);
      return false;
    }
  }

  // Log build activity to admin system
  async logBuildActivity(activity, details = {}) {
    try {
      const payload = {
        activity,
        details,
        timestamp: new Date().toISOString(),
        source: "mobile_app_builder",
        category: "build_activity",
      };

      await axios.post(`${this.adminBaseUrl}/api/activity-logs`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to log build activity:", error.message);
      return false;
    }
  }

  // Get admin settings for mobile builds
  async getAdminSettings() {
    try {
      const response = await axios.get(
        `${this.adminBaseUrl}/api/settings/mobile-builds`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.data || {};
    } catch (error) {
      console.error("❌ Failed to get admin settings:", error.message);
      return {};
    }
  }

  // Update admin dashboard with build metrics
  async updateBuildMetrics(metrics) {
    try {
      const payload = {
        totalBuilds: metrics.totalBuilds,
        successfulBuilds: metrics.successfulBuilds,
        failedBuilds: metrics.failedBuilds,
        averageBuildTime: metrics.averageBuildTime,
        lastBuildTime: metrics.lastBuildTime,
        platformBreakdown: metrics.platformBreakdown,
        profileBreakdown: metrics.profileBreakdown,
      };

      await axios.post(
        `${this.adminBaseUrl}/api/dashboard/mobile-build-metrics`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log("✅ Build metrics updated in admin dashboard");
      return true;
    } catch (error) {
      console.error("❌ Failed to update build metrics:", error.message);
      return false;
    }
  }
}

// Enhanced APK Service with Admin Integration
class EnhancedAPKService {
  constructor() {
    this.adminIntegration = new AdminIntegration({
      adminBaseUrl: process.env.ADMIN_BASE_URL,
      apiKey: process.env.ADMIN_API_KEY,
      webhookUrl: process.env.ADMIN_WEBHOOK_URL,
    });
  }

  async onBuildStarted(buildInfo) {
    // Log build start activity
    await this.adminIntegration.logBuildActivity("build_started", {
      platform: buildInfo.platform,
      profile: buildInfo.profile,
      buildId: buildInfo.id,
    });

    // Create admin notification
    await this.adminIntegration.createAdminNotification(
      "Mobile Build Started",
      `${buildInfo.buildConfig.name} build has been started`,
      "info",
    );
  }

  async onBuildCompleted(buildInfo) {
    // Notify admin backend
    await this.adminIntegration.notifyBuildStatus(buildInfo);

    // Log build completion activity
    await this.adminIntegration.logBuildActivity("build_completed", {
      platform: buildInfo.platform,
      profile: buildInfo.profile,
      buildId: buildInfo.id,
      duration: buildInfo.duration,
      downloadUrl: buildInfo.downloadUrl,
    });

    // Create success notification
    await this.adminIntegration.createAdminNotification(
      "Mobile Build Completed",
      `${buildInfo.buildConfig.name} build completed successfully in ${buildInfo.duration}s`,
      "success",
    );

    // Update build metrics
    await this.updateBuildMetrics();
  }

  async onBuildFailed(buildInfo) {
    // Notify admin backend
    await this.adminIntegration.notifyBuildStatus(buildInfo);

    // Log build failure activity
    await this.adminIntegration.logBuildActivity("build_failed", {
      platform: buildInfo.platform,
      profile: buildInfo.profile,
      buildId: buildInfo.id,
      duration: buildInfo.duration,
      error: buildInfo.error,
    });

    // Create error notification
    await this.adminIntegration.createAdminNotification(
      "Mobile Build Failed",
      `${buildInfo.buildConfig.name} build failed: ${buildInfo.error}`,
      "error",
    );

    // Update build metrics
    await this.updateBuildMetrics();
  }

  async updateBuildMetrics() {
    try {
      // Load build history
      const historyPath = "build-history.json";
      let history = [];

      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
      }

      // Calculate metrics
      const totalBuilds = history.length;
      const successfulBuilds = history.filter((b) => b.success).length;
      const failedBuilds = totalBuilds - successfulBuilds;
      const averageBuildTime =
        history.length > 0
          ? Math.round(
              history.reduce((sum, b) => sum + (b.duration || 0), 0) /
                history.length,
            )
          : 0;
      const lastBuildTime =
        history.length > 0 ? history[history.length - 1].startTime : null;

      // Platform breakdown
      const platformBreakdown = history.reduce((acc, build) => {
        acc[build.platform] = (acc[build.platform] || 0) + 1;
        return acc;
      }, {});

      // Profile breakdown
      const profileBreakdown = history.reduce((acc, build) => {
        acc[build.profile] = (acc[build.profile] || 0) + 1;
        return acc;
      }, {});

      const metrics = {
        totalBuilds,
        successfulBuilds,
        failedBuilds,
        averageBuildTime,
        lastBuildTime,
        platformBreakdown,
        profileBreakdown,
      };

      await this.adminIntegration.updateBuildMetrics(metrics);
    } catch (error) {
      console.error("❌ Failed to update build metrics:", error.message);
    }
  }
}

module.exports = {
  AdminIntegration,
  EnhancedAPKService,
};
