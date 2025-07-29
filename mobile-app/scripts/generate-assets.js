#!/usr/bin/env node

/**
 * Asset Generator Script
 *
 * This script generates required assets for the mobile app build
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

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Asset specifications
const ASSET_SPECS = {
  "icon.png": {
    size: "1024x1024",
    description: "App icon (1024x1024px)",
    required: true,
  },
  "adaptive-icon.png": {
    size: "1024x1024",
    description: "Android adaptive icon foreground (1024x1024px)",
    required: true,
  },
  "splash.png": {
    size: "1284x2778",
    description: "Splash screen image (1284x2778px for iPhone 12 Pro Max)",
    required: true,
  },
  "favicon.png": {
    size: "48x48",
    description: "Web favicon (48x48px)",
    required: false,
  },
  "notification-icon.png": {
    size: "96x96",
    description: "Notification icon (96x96px)",
    required: false,
  },
};

// Font specifications
const FONT_SPECS = {
  "Inter-Regular.ttf": {
    description: "Inter Regular font",
    weight: "400",
    required: true,
  },
  "Inter-Medium.ttf": {
    description: "Inter Medium font",
    weight: "500",
    required: true,
  },
  "Inter-SemiBold.ttf": {
    description: "Inter SemiBold font",
    weight: "600",
    required: true,
  },
  "Inter-Bold.ttf": {
    description: "Inter Bold font",
    weight: "700",
    required: true,
  },
};

function createPlaceholderSVG(width, height, text, color = "#1e40af") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}" 
        fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

function generateAssetReadme() {
  const content = `# Assets Directory

This directory contains all the assets required for building the mobile app.

## Required Assets

### Icons
${Object.entries(ASSET_SPECS)
  .map(
    ([filename, spec]) =>
      `- **${filename}**: ${spec.description} (${spec.size})`,
  )
  .join("\n")}

### Fonts
${Object.entries(FONT_SPECS)
  .map(
    ([filename, spec]) =>
      `- **${filename}**: ${spec.description} (Weight: ${spec.weight})`,
  )
  .join("\n")}

## Asset Guidelines

### App Icon (icon.png)
- Size: 1024x1024px
- Format: PNG with transparency
- Should be simple and recognizable at small sizes
- Avoid text that might be hard to read

### Adaptive Icon (adaptive-icon.png)
- Size: 1024x1024px
- Format: PNG with transparency
- Android adaptive icon foreground layer
- Should work well with different background shapes

### Splash Screen (splash.png)
- Size: 1284x2778px (iPhone 12 Pro Max resolution)
- Format: PNG
- Will be scaled for different screen sizes
- Keep important content in the center

### Fonts
- Download Inter fonts from: https://fonts.google.com/specimen/Inter
- Place TTF files in the fonts subdirectory
- Ensure proper licensing for commercial use

## Generating Assets

You can use online tools or design software to create these assets:

1. **Figma**: Free design tool with export capabilities
2. **Canva**: Easy-to-use design platform
3. **Adobe Illustrator/Photoshop**: Professional design tools
4. **GIMP**: Free alternative to Photoshop

## Asset Optimization

Before building, ensure your assets are optimized:
- Use PNG for icons and images with transparency
- Compress images without losing quality
- Test icons at different sizes to ensure clarity
`;

  return content;
}

async function generateAssets() {
  log("🎨 Generating assets for mobile app...", "bright");
  log("====================================", "bright");

  const assetsDir = path.join(process.cwd(), "assets");
  const fontsDir = path.join(assetsDir, "fonts");

  // Create directories
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    log("✅ Created assets directory", "green");
  }

  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
    log("✅ Created fonts directory", "green");
  }

  // Generate README
  const readmePath = path.join(assetsDir, "README.md");
  fs.writeFileSync(readmePath, generateAssetReadme());
  log("✅ Generated assets README.md", "green");

  // Check existing assets
  log("\n📋 Asset Status:", "cyan");

  Object.entries(ASSET_SPECS).forEach(([filename, spec]) => {
    const assetPath = path.join(assetsDir, filename);
    if (fs.existsSync(assetPath)) {
      log(`✅ ${filename} - Found`, "green");
    } else {
      log(`❌ ${filename} - Missing (${spec.description})`, "red");
    }
  });

  log("\n📝 Font Status:", "cyan");

  Object.entries(FONT_SPECS).forEach(([filename, spec]) => {
    const fontPath = path.join(fontsDir, filename);
    if (fs.existsSync(fontPath)) {
      log(`✅ ${filename} - Found`, "green");
    } else {
      log(`❌ ${filename} - Missing (${spec.description})`, "red");
    }
  });

  // Generate placeholder SVGs for reference
  const placeholdersDir = path.join(assetsDir, "placeholders");
  if (!fs.existsSync(placeholdersDir)) {
    fs.mkdirSync(placeholdersDir, { recursive: true });
  }

  // Create placeholder SVGs
  const placeholders = [
    { name: "icon-placeholder.svg", width: 1024, height: 1024, text: "ICON" },
    {
      name: "splash-placeholder.svg",
      width: 1284,
      height: 2778,
      text: "SPLASH",
    },
    {
      name: "adaptive-icon-placeholder.svg",
      width: 1024,
      height: 1024,
      text: "ADAPTIVE",
    },
  ];

  placeholders.forEach((placeholder) => {
    const svgContent = createPlaceholderSVG(
      placeholder.width,
      placeholder.height,
      placeholder.text,
    );
    const svgPath = path.join(placeholdersDir, placeholder.name);
    fs.writeFileSync(svgPath, svgContent);
  });

  log(`\n✅ Generated placeholder SVGs in ${placeholdersDir}`, "green");

  log("\n📖 Next Steps:", "cyan");
  log("1. Replace placeholder assets with your actual designs", "yellow");
  log("2. Download Inter fonts from Google Fonts", "yellow");
  log("3. Optimize all assets for mobile use", "yellow");
  log("4. Test your app icon at different sizes", "yellow");
  log("\n📚 Check assets/README.md for detailed guidelines", "blue");
}

if (require.main === module) {
  generateAssets().catch((error) => {
    console.error("❌ Asset generation failed:", error);
    process.exit(1);
  });
}
