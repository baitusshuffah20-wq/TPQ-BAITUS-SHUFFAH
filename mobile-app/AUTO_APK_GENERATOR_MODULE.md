# 🚀 Auto APK Generator Module - TPQ Wali Santri

Module lengkap untuk generate APK Android secara otomatis dengan berbagai fitur canggih dan automasi penuh.

## 📦 Module Components

### 🔧 **Core Scripts**

- **`auto-apk-generator.js`** - Main APK generator dengan interactive mode
- **`apk-scheduler.js`** - Scheduler untuk build otomatis dengan cron
- **`apk-notifier.js`** - Notification system ke berbagai platform
- **`eas.json`** - Enhanced EAS build configuration

### 📱 **Build Profiles Available**

#### **1. Development APK**

```json
{
  "name": "Development APK",
  "description": "Debug APK with development features",
  "profile": "development",
  "buildType": "apk",
  "autoIncrement": false
}
```

#### **2. Preview APK**

```json
{
  "name": "Preview APK",
  "description": "Release APK for testing",
  "profile": "preview",
  "buildType": "apk",
  "autoIncrement": true
}
```

#### **3. Production APK**

```json
{
  "name": "Production APK",
  "description": "Production APK for release",
  "profile": "production",
  "buildType": "apk",
  "autoIncrement": true
}
```

#### **4. Production AAB**

```json
{
  "name": "Production AAB",
  "description": "Production App Bundle for Play Store",
  "profile": "production-aab",
  "buildType": "app-bundle",
  "autoIncrement": true
}
```

## 🎯 **Available Commands**

### **APK Generation Commands**

```bash
# Interactive APK generator (RECOMMENDED)
npm run apk:generate

# Automatic mode with default profile
npm run apk:auto

# Automatic mode with specific profile
npm run apk:auto preview
npm run apk:auto production

# Show build history
npm run apk:history

# Show current configuration
npm run apk:config
```

### **Scheduler Commands**

```bash
# Start the build scheduler
npm run schedule:start

# Show scheduler status
npm run schedule:status

# Enable a schedule (by index)
npm run schedule:enable 0

# Disable a schedule (by index)
npm run schedule:disable 0

# Test a build profile
npm run schedule:test preview
```

### **Notification Commands**

```bash
# Test all notification channels
npm run notify:test

# Show notification configuration
npm run notify:config
```

## 🏗️ **Features**

### **🤖 Automatic Features**

- ✅ **Auto version increment** - Automatic version and build number increment
- ✅ **Prerequisites check** - Validates EAS CLI, authentication, etc.
- ✅ **Project validation** - Checks assets, configuration, TypeScript
- ✅ **Build monitoring** - Real-time build progress tracking
- ✅ **Error handling** - Comprehensive error detection and reporting

### **📊 Build Management**

- ✅ **Build history** - Tracks all builds with metadata
- ✅ **Build profiles** - Multiple build configurations
- ✅ **Build artifacts** - Automatic download URL retrieval
- ✅ **Build status** - Real-time status monitoring

### **⏰ Scheduling System**

- ✅ **Cron-based scheduling** - Flexible scheduling with cron expressions
- ✅ **Multiple schedules** - Support for multiple build schedules
- ✅ **Retry mechanism** - Automatic retry on build failures
- ✅ **Schedule management** - Enable/disable schedules dynamically

### **📢 Notification System**

- ✅ **Discord notifications** - Rich embed notifications
- ✅ **Slack notifications** - Channel-based notifications
- ✅ **Telegram notifications** - Bot-based messaging
- ✅ **Email notifications** - SMTP-based email alerts
- ✅ **Webhook notifications** - Custom webhook integration

## 📋 **Configuration Files**

### **1. APK Generator Config** (`apk-generator.config.json`)

```json
{
  "autoMode": false,
  "defaultProfile": "preview",
  "autoIncrement": true,
  "notifications": {
    "discord": false,
    "slack": false,
    "email": false
  },
  "upload": {
    "firebase": false,
    "s3": false,
    "github": false
  },
  "schedule": {
    "enabled": false,
    "cron": "0 2 * * *",
    "profile": "preview"
  }
}
```

### **2. Scheduler Config** (`apk-scheduler.config.json`)

```json
{
  "schedules": [
    {
      "name": "Daily Preview Build",
      "cron": "0 2 * * *",
      "profile": "preview",
      "enabled": false
    },
    {
      "name": "Weekly Production Build",
      "cron": "0 3 * * 0",
      "profile": "production",
      "enabled": false
    }
  ],
  "notifications": {
    "onSuccess": true,
    "onFailure": true,
    "webhook": null
  },
  "retries": {
    "maxAttempts": 3,
    "delay": 300000
  }
}
```

### **3. Notifier Config** (`apk-notifier.config.json`)

```json
{
  "discord": {
    "enabled": false,
    "webhook": "https://discord.com/api/webhooks/...",
    "mentions": ["user_id_1", "user_id_2"]
  },
  "slack": {
    "enabled": false,
    "webhook": "https://hooks.slack.com/services/...",
    "channel": "#builds"
  },
  "telegram": {
    "enabled": false,
    "botToken": "your_bot_token",
    "chatId": "your_chat_id"
  },
  "email": {
    "enabled": false,
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "your_email@gmail.com",
        "pass": "your_app_password"
      }
    },
    "from": "your_email@gmail.com",
    "to": ["recipient@example.com"]
  }
}
```

## 🚀 **Usage Examples**

### **1. Interactive Build**

```bash
npm run apk:generate
```

Output:

```
🎯 Interactive APK Generator
============================
🔍 Checking prerequisites...
✅ EAS CLI is ready
✅ EAS Authentication is ready
✅ All prerequisites met

📱 Select build profile:
1. Development APK - Debug APK with development features
2. Preview APK - Release APK for testing
3. Production APK - Production APK for release
4. Production AAB - Production App Bundle for Play Store

Enter your choice (1-4): 2

❓ Proceed with Preview APK? (y/n): y

🚀 Starting Preview APK...
🔢 Auto-incrementing version...
📈 Build number updated: 5 → 6
🚀 Starting Preview APK...
Executing: eas build --platform android --profile preview --non-interactive

✅ Preview APK completed successfully!
⏱️ Build duration: 180 seconds
📱 Build ID: abc123-def456
📥 Download URL: https://expo.dev/artifacts/...
```

### **2. Automatic Build**

```bash
npm run apk:auto production
```

### **3. Scheduled Builds**

```bash
# Start scheduler
npm run schedule:start

# Enable daily preview builds
npm run schedule:enable 0

# Check status
npm run schedule:status
```

### **4. Notification Setup**

```bash
# Test notifications
npm run notify:test

# Configure Discord webhook
# Edit apk-notifier.config.json:
{
  "discord": {
    "enabled": true,
    "webhook": "https://discord.com/api/webhooks/your_webhook",
    "mentions": ["123456789"]
  }
}
```

## 📊 **Build History Tracking**

Build history disimpan dalam `build-history.json`:

```json
[
  {
    "id": "build-1640995200000",
    "profile": "preview",
    "platform": "android",
    "buildType": "apk",
    "startTime": "2021-12-31T17:00:00.000Z",
    "duration": 180,
    "success": true,
    "downloadUrl": "https://expo.dev/artifacts/...",
    "easBuildId": "abc123-def456"
  }
]
```

## 🔧 **Advanced Features**

### **1. Custom Build Hooks**

Module mendukung custom hooks untuk:

- Pre-build validation
- Post-build processing
- Custom notifications
- Upload integrations

### **2. Environment-based Builds**

```bash
# Development environment
NODE_ENV=development npm run apk:auto development

# Production environment
NODE_ENV=production npm run apk:auto production
```

### **3. Parallel Builds**

```bash
# Build multiple profiles simultaneously
npm run apk:auto preview &
npm run apk:auto production &
wait
```

### **4. CI/CD Integration**

```yaml
# GitHub Actions example
- name: Build APK
  run: npm run apk:auto production

- name: Send Notifications
  run: npm run notify:test
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. EAS Authentication**

```bash
# Login to EAS
eas login

# Check authentication
eas whoami
```

#### **2. Build Failures**

```bash
# Check build logs
eas build:list

# View specific build
eas build:view [BUILD_ID]
```

#### **3. Asset Issues**

```bash
# Validate project
npm run apk:generate
# Will show validation errors
```

### **Error Codes**

- **ERR_NO_EAS**: EAS CLI not installed
- **ERR_NOT_AUTHENTICATED**: Not logged in to EAS
- **ERR_INVALID_CONFIG**: Invalid configuration
- **ERR_BUILD_FAILED**: Build process failed
- **ERR_NOTIFICATION_FAILED**: Notification sending failed

## 📈 **Performance Optimization**

### **Build Speed Optimization**

- ✅ **Parallel processing** - Multiple builds simultaneously
- ✅ **Cache optimization** - Reuse build cache
- ✅ **Incremental builds** - Only rebuild changed parts
- ✅ **Resource management** - Optimal resource allocation

### **Notification Optimization**

- ✅ **Batch notifications** - Send multiple notifications together
- ✅ **Retry mechanism** - Automatic retry on failures
- ✅ **Rate limiting** - Respect API rate limits
- ✅ **Async processing** - Non-blocking notification sending

## 🎉 **Benefits**

### **Developer Experience**

- ✅ **One-command building** - Simple command execution
- ✅ **Interactive interface** - User-friendly prompts
- ✅ **Comprehensive logging** - Detailed build information
- ✅ **Error handling** - Clear error messages and solutions

### **Production Ready**

- ✅ **Multiple environments** - Development, staging, production
- ✅ **Automated workflows** - Scheduled builds and notifications
- ✅ **Build tracking** - Complete build history
- ✅ **Quality assurance** - Pre-build validation

### **Team Collaboration**

- ✅ **Shared configurations** - Team-wide build settings
- ✅ **Notification system** - Keep team informed
- ✅ **Build artifacts** - Easy access to APK files
- ✅ **Documentation** - Comprehensive usage guides

## 🚀 **Next Steps**

1. **Setup EAS**: `eas init` (if not done)
2. **Configure notifications**: Edit notification configs
3. **Test builds**: `npm run apk:generate`
4. **Setup scheduling**: `npm run schedule:start`
5. **Production deployment**: Use production profiles

**🎊 Module Auto APK Generator siap digunakan untuk automasi build APK yang lengkap dan profesional!**
