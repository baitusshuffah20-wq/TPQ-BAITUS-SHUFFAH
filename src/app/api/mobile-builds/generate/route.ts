import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface AppConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  buildNumber: number;
  icon: string | null;
  splashScreen: string | null;
  primaryColor: string;
  secondaryColor: string;
  features: { [key: string]: boolean };
  template: string;
}

interface BuildRequest {
  platform: "android" | "ios";
  appType: "wali" | "musyrif";
  config: AppConfig;
}

// WebSocket connections for real-time updates
const wsConnections = new Set<any>();

function broadcastUpdate(data: any) {
  // In a real implementation, you'd use WebSocket server
  // For now, we'll store updates in a temporary store
  console.log("Broadcasting update:", data);
}

export async function POST(request: NextRequest) {
  try {
    const body: BuildRequest = await request.json();
    const { platform, appType, config } = body;

    // Validate request
    if (!platform || !appType || !config) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Generate unique build ID
    const buildId = `build-${appType}-${platform}-${Date.now()}`;

    // Create build directory
    const buildDir = path.join(process.cwd(), "builds", buildId);
    if (!existsSync(buildDir)) {
      await mkdir(buildDir, { recursive: true });
    }

    // Start build process
    broadcastUpdate({
      type: "build_started",
      buildId,
      platform,
      appType,
      timestamp: new Date().toISOString(),
    });

    // Generate app configuration files
    await generateAppConfig(buildDir, config, appType, platform);

    // Start the actual build process (async)
    startBuildProcess(buildId, buildDir, platform, appType, config);

    return NextResponse.json({
      success: true,
      buildId,
      message: `Build started for ${appType} ${platform} app`,
    });
  } catch (error) {
    console.error("Build generation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function generateAppConfig(
  buildDir: string,
  config: AppConfig,
  appType: string,
  platform: string,
) {
  // Generate app.json for Expo
  const appJson = {
    expo: {
      name: config.displayName,
      slug: `tpq-${appType}`,
      version: config.version,
      orientation: "portrait",
      icon: config.icon || "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: config.splashScreen || "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: config.primaryColor,
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.tpq.${appType}`,
        buildNumber: config.buildNumber.toString(),
      },
      android: {
        adaptiveIcon: {
          foregroundImage: config.icon || "./assets/adaptive-icon.png",
          backgroundColor: config.primaryColor,
        },
        package: `com.tpq.${appType}`,
        versionCode: config.buildNumber,
      },
      web: {
        favicon: "./assets/favicon.png",
      },
      extra: {
        appType,
        features: config.features,
        theme: {
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          template: config.template,
        },
      },
    },
  };

  await writeFile(
    path.join(buildDir, "app.json"),
    JSON.stringify(appJson, null, 2),
  );

  // Generate package.json
  const packageJson = {
    name: `tpq-${appType}`,
    version: config.version,
    main: "node_modules/expo/AppEntry.js",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
    },
    dependencies: generateDependencies(config.features),
    devDependencies: {
      "@babel/core": "^7.20.0",
      "@types/react": "~18.2.45",
      "@types/react-native": "~0.73.0",
      typescript: "^5.1.3",
    },
    private: true,
  };

  await writeFile(
    path.join(buildDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Generate theme configuration
  const themeConfig = {
    colors: {
      primary: config.primaryColor,
      secondary: config.secondaryColor,
      background: config.template === "dark" ? "#1a1a1a" : "#ffffff",
      surface: config.template === "dark" ? "#2a2a2a" : "#f5f5f5",
      text: config.template === "dark" ? "#ffffff" : "#000000",
    },
    template: config.template,
    appType,
  };

  await writeFile(
    path.join(buildDir, "theme.json"),
    JSON.stringify(themeConfig, null, 2),
  );

  // Generate feature configuration
  const featureConfig = {
    enabled: Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature),
    disabled: Object.entries(config.features)
      .filter(([_, enabled]) => !enabled)
      .map(([feature, _]) => feature),
  };

  await writeFile(
    path.join(buildDir, "features.json"),
    JSON.stringify(featureConfig, null, 2),
  );
}

function generateDependencies(features: { [key: string]: boolean }) {
  const baseDependencies = {
    expo: "~51.0.28",
    react: "18.2.0",
    "react-native": "0.74.5",
    "@expo/vector-icons": "^14.0.2",
    "expo-status-bar": "~1.12.1",
  };

  const featureDependencies: { [key: string]: { [key: string]: string } } = {
    dashboard: {
      "react-native-chart-kit": "^6.12.0",
      "react-native-svg": "15.2.0",
    },
    payment: {
      "expo-payments-stripe": "~14.0.0",
      "@react-native-async-storage/async-storage": "1.23.1",
    },
    messages: {
      "expo-notifications": "~0.28.15",
      "expo-device": "~6.0.2",
    },
    attendance: {
      "expo-camera": "~15.0.14",
      "expo-barcode-scanner": "~13.0.1",
    },
    schedule: {
      "react-native-calendars": "^1.1302.0",
    },
    reports: {
      "expo-print": "~12.0.2",
      "expo-sharing": "~12.0.1",
    },
  };

  let dependencies = { ...baseDependencies };

  Object.entries(features).forEach(([feature, enabled]) => {
    if (enabled && featureDependencies[feature]) {
      dependencies = { ...dependencies, ...featureDependencies[feature] };
    }
  });

  return dependencies;
}

async function startBuildProcess(
  buildId: string,
  buildDir: string,
  platform: string,
  appType: string,
  config: AppConfig,
) {
  try {
    broadcastUpdate({
      type: "build_progress",
      buildId,
      progress: 10,
      message: "Installing dependencies...",
    });

    // Copy mobile app template
    await copyMobileAppTemplate(buildDir, appType, config);

    broadcastUpdate({
      type: "build_progress",
      buildId,
      progress: 30,
      message: "Configuring app features...",
    });

    // Configure features
    await configureAppFeatures(buildDir, config.features, appType);

    broadcastUpdate({
      type: "build_progress",
      buildId,
      progress: 50,
      message: "Installing dependencies...",
    });

    // Check if we have cached dependencies
    const cacheDir = path.join(process.cwd(), ".build-cache");
    const packageLockPath = path.join(buildDir, "package-lock.json");
    const cachedNodeModules = path.join(cacheDir, "node_modules");

    if (
      await fs
        .access(cachedNodeModules)
        .then(() => true)
        .catch(() => false)
    ) {
      // Use cached dependencies
      await execAsync(`cp -r "${cachedNodeModules}" "${buildDir}/"`, {
        cwd: buildDir,
      });
      broadcastUpdate({
        type: "build_progress",
        buildId,
        progress: 60,
        message: "Using cached dependencies...",
      });
    } else {
      // Install dependencies and cache them
      await execAsync("npm install", { cwd: buildDir });
      await fs.mkdir(cacheDir, { recursive: true });
      await execAsync(
        `cp -r "${path.join(buildDir, "node_modules")}" "${cacheDir}/"`,
        { cwd: buildDir },
      );
    }

    broadcastUpdate({
      type: "build_progress",
      buildId,
      progress: 70,
      message: `Building ${platform} app...`,
    });

    // Build the app using cloud build for faster processing
    const buildCommand =
      platform === "android"
        ? "eas build --platform android --profile preview --non-interactive"
        : "eas build --platform ios --profile preview --non-interactive";

    // Start cloud build (faster than local build)
    const buildProcess = await execAsync(buildCommand, { cwd: buildDir });

    // For demo purposes, create a mock build result
    if (process.env.NODE_ENV === "development") {
      // In development, simulate build completion
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    broadcastUpdate({
      type: "build_progress",
      buildId,
      progress: 90,
      message: "Finalizing build...",
    });

    // Get build artifact path
    const artifactPath = await getBuildArtifactPath(buildDir, platform);

    // Store build info for download
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/mobile-builds/status/${buildId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          platform,
          appType,
          config,
          progress: 100,
          downloadUrl: `/api/mobile-builds/download/${buildId}`,
          artifactPath,
          completedAt: new Date().toISOString(),
        }),
      },
    ).catch(console.error);

    broadcastUpdate({
      type: "build_completed",
      buildId,
      progress: 100,
      downloadUrl: `/api/mobile-builds/download/${buildId}`,
      artifactPath,
    });

    // Save build record to database
    await saveBuildRecord({
      buildId,
      platform,
      appType,
      config,
      status: "completed",
      artifactPath,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Build process error:", error);

    broadcastUpdate({
      type: "build_failed",
      buildId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Save failed build record
    await saveBuildRecord({
      buildId,
      platform,
      appType,
      config,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      createdAt: new Date(),
    });
  }
}

async function copyMobileAppTemplate(
  buildDir: string,
  appType: string,
  config: AppConfig,
) {
  // Copy base mobile app template
  const templateDir = path.join(process.cwd(), "mobile-app");

  // Copy essential files
  const filesToCopy = [
    "App.tsx",
    "babel.config.js",
    "metro.config.js",
    "tsconfig.json",
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(templateDir, file);
    const destPath = path.join(buildDir, file);

    if (existsSync(sourcePath)) {
      await execAsync(`cp "${sourcePath}" "${destPath}"`);
    }
  }

  // Generate App.tsx based on app type and features
  const appTsx = generateAppTsx(appType, config);
  await writeFile(path.join(buildDir, "App.tsx"), appTsx);
}

function generateAppTsx(appType: string, config: AppConfig): string {
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature);

  return `
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens based on enabled features
${enabledFeatures
  .map(
    (feature) =>
      `import ${feature.charAt(0).toUpperCase() + feature.slice(1)}Screen from './src/screens/${feature.charAt(0).toUpperCase() + feature.slice(1)}Screen';`,
  )
  .join("\n")}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '${config.primaryColor}',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        ${enabledFeatures
          .map(
            (feature) => `
        <Tab.Screen 
          name="${feature.charAt(0).toUpperCase() + feature.slice(1)}" 
          component={${feature.charAt(0).toUpperCase() + feature.slice(1)}Screen} 
        />`,
          )
          .join("")}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
`;
}

async function configureAppFeatures(
  buildDir: string,
  features: { [key: string]: boolean },
  appType: string,
) {
  // Create screens directory
  const screensDir = path.join(buildDir, "src", "screens");
  await mkdir(screensDir, { recursive: true });

  // Generate screens for enabled features
  for (const [feature, enabled] of Object.entries(features)) {
    if (enabled) {
      const screenContent = generateScreenContent(feature, appType);
      await writeFile(
        path.join(
          screensDir,
          `${feature.charAt(0).toUpperCase() + feature.slice(1)}Screen.tsx`,
        ),
        screenContent,
      );
    }
  }
}

function generateScreenContent(feature: string, appType: string): string {
  const featureName = feature.charAt(0).toUpperCase() + feature.slice(1);

  return `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ${featureName}Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${featureName} - ${appType.toUpperCase()}</Text>
      <Text style={styles.subtitle}>Fitur ${featureName} untuk aplikasi ${appType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});
`;
}

async function getBuildArtifactPath(
  buildDir: string,
  platform: string,
): Promise<string> {
  // In a real implementation, you'd find the actual build artifact
  // For now, return a placeholder path
  return path.join(buildDir, `app.${platform === "android" ? "apk" : "ipa"}`);
}

async function saveBuildRecord(record: any) {
  // In a real implementation, save to database
  // For now, just log the record
  console.log("Saving build record:", record);
}
