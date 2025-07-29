# 📱 Build Instructions - TPQ Wali Santri App

Panduan lengkap untuk build dan deployment aplikasi mobile TPQ Wali Santri.

## 🚀 Quick Start

### Prerequisites

```bash
# Install Node.js (v16+)
# Install Expo CLI
npm install -g @expo/cli

# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login
```

### Setup Project

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Setup build environment (automated)
npm run setup:build

# Generate required assets
npm run generate:assets

# Start development server
npm start
```

### 🎯 New Build Module Commands

```bash
# Interactive APK builder with profile selection
npm run build:apk

# Quick preview build (APK)
npm run build:preview

# Production build (APK)
npm run build:production

# Check build status
npm run build:status

# Setup build environment
npm run setup:build

# Generate asset templates
npm run generate:assets
```

## 🛠️ Development

### Running on Simulator/Device

```bash
# Android (requires Android Studio)
npm run android

# iOS (macOS only, requires Xcode)
npm run ios

# Web browser (for testing)
npm run web
```

### Development with Physical Device

1. Install **Expo Go** app on your phone
2. Scan QR code from terminal
3. App will load on your device

## 🏗️ Building for Production

### 1. Configure EAS Project

```bash
# Initialize EAS project
eas build:configure

# Update app.json with your project details
```

### 2. Android APK Build

```bash
# Build APK for testing
eas build --profile preview --platform android

# Build production APK
eas build --profile production --platform android
```

### 3. iOS Build (macOS required)

```bash
# Build for iOS App Store
eas build --profile production --platform ios
```

## 📦 Build Profiles

### Development Build

- **Purpose**: Internal testing dengan development tools
- **Command**: `eas build --profile development`
- **Output**: Development client

### Preview Build

- **Purpose**: Testing sebelum production
- **Command**: `eas build --profile preview`
- **Output**: APK untuk Android, IPA untuk iOS

### Production Build

- **Purpose**: Release ke app store
- **Command**: `eas build --profile production`
- **Output**: Optimized build untuk distribution

## 🔧 Configuration Files

### app.json

```json
{
  "expo": {
    "name": "TPQ Wali Santri",
    "slug": "tpq-wali-app",
    "version": "1.0.0",
    "android": {
      "package": "com.tpqbaitusshuffah.wali"
    },
    "ios": {
      "bundleIdentifier": "com.tpqbaitusshuffah.wali"
    }
  }
}
```

### eas.json

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

## 📱 Platform-Specific Setup

### Android Setup

1. **Install Android Studio**
2. **Setup Android SDK**
3. **Create Keystore** (for production):
   ```bash
   keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
4. **Configure signing** in eas.json

### iOS Setup (macOS only)

1. **Install Xcode** (latest version)
2. **Apple Developer Account** (for App Store)
3. **Certificates & Provisioning Profiles**
4. **Configure signing** in eas.json

## 🚀 Deployment

### Google Play Store

```bash
# Build production APK
eas build --profile production --platform android

# Submit to Play Store
eas submit --platform android
```

### Apple App Store

```bash
# Build for iOS
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

## 🔍 Testing

### Local Testing

```bash
# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios
```

### Device Testing

1. **Install Expo Go** on device
2. **Scan QR code** from development server
3. **Test all features** thoroughly

### Production Testing

1. **Build preview APK**
2. **Install on test devices**
3. **Test without development tools**

## 📊 Build Optimization

### Bundle Size Optimization

- **Remove unused dependencies**
- **Optimize images** (use WebP format)
- **Enable Hermes** for Android
- **Tree shaking** for unused code

### Performance Optimization

- **Enable Flipper** for debugging
- **Use React DevTools**
- **Monitor memory usage**
- **Optimize re-renders**

## 🔒 Security

### Code Signing

- **Android**: Use upload keystore
- **iOS**: Use distribution certificates

### API Security

- **Environment variables** for sensitive data
- **Secure storage** for tokens
- **HTTPS only** for API calls

### App Security

- **Obfuscation** for production builds
- **Certificate pinning** for API calls
- **Root/Jailbreak detection**

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache
expo r -c

# Clear node modules
rm -rf node_modules
npm install

# Clear EAS cache
eas build --clear-cache
```

#### Android Issues

- **Gradle build failed**: Update Android SDK
- **Keystore issues**: Regenerate keystore
- **Memory issues**: Increase heap size

#### iOS Issues

- **Xcode build failed**: Update Xcode
- **Certificate issues**: Regenerate certificates
- **Simulator issues**: Reset simulator

### Debug Commands

```bash
# Check EAS build status
eas build:list

# View build logs
eas build:view [build-id]

# Check project configuration
eas config
```

## 📈 Monitoring

### Build Analytics

- **Build success rate**
- **Build duration**
- **Bundle size tracking**

### App Performance

- **Crash reporting** with Sentry
- **Performance monitoring**
- **User analytics**

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: eas build --platform android --non-interactive
```

## 📋 Checklist

### Pre-Build

- [ ] Update version number
- [ ] Test on multiple devices
- [ ] Update app icons
- [ ] Configure splash screen
- [ ] Set up environment variables

### Build Process

- [ ] Clean build environment
- [ ] Run production build
- [ ] Test APK/IPA file
- [ ] Verify app signing
- [ ] Check bundle size

### Post-Build

- [ ] Upload to app stores
- [ ] Update release notes
- [ ] Monitor crash reports
- [ ] Gather user feedback

## 📞 Support

### Build Issues

- **Expo Discord**: Community support
- **EAS Documentation**: Official docs
- **Stack Overflow**: Technical questions

### Contact

- **Email**: tech@tpqbaitusshuffah.com
- **Phone**: (021) 123-4567

---

**Barakallahu fiikum** - Semoga proses build berjalan lancar! 🚀
