const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for TurboModules
config.resolver.platforms = ["ios", "android", "native", "web"];

// Ensure proper module resolution
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "jsx",
  "js",
  "ts",
  "tsx",
];

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
