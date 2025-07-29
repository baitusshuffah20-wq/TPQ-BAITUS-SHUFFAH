# 📱 Admin Mobile App Generator Module - TPQ Baitus Shuffah

Module lengkap untuk admin generate 2 aplikasi mobile terpisah (Wali dan Musyrif) dengan kustomisasi penuh melalui dashboard admin.

## 🎯 **Overview**

Module ini memungkinkan admin untuk:

- **Generate 2 APK terpisah**: Aplikasi khusus Wali dan aplikasi khusus Musyrif
- **Kustomisasi penuh**: Logo, icon, warna, template, dan fitur
- **Multi-platform**: Generate untuk Android APK dan iOS IPA
- **Real-time monitoring**: Monitor progress build secara real-time
- **Asset management**: Upload dan kelola assets aplikasi
- **Build history**: Track semua builds yang pernah dibuat

## 📦 **Module Structure**

### 🎨 **Frontend Components**

```
src/app/dashboard/admin/mobile-app-generator/
├── page.tsx                 # Main generator interface
├── layout.tsx              # Layout wrapper
└── components/
    ├── AppConfigForm.tsx    # Form konfigurasi aplikasi
    ├── FeatureSelector.tsx  # Selector fitur aplikasi
    ├── AssetUploader.tsx    # Upload assets
    ├── BuildMonitor.tsx     # Monitor build progress
    └── BuildHistory.tsx     # Riwayat builds
```

### 🔧 **Backend APIs**

```
src/app/api/mobile-builds/
├── generate/route.ts        # Generate APK/IPA
├── upload-asset/route.ts    # Upload assets
├── history/route.ts         # Build history
├── download/[buildId]/route.ts  # Download builds
└── preview/route.ts         # Preview aplikasi
```

## 🚀 **Features**

### 📱 **Dual App Generation**

#### **Aplikasi Wali Santri**

- **Dashboard**: Ringkasan informasi santri
- **Progress Santri**: Perkembangan belajar
- **Pembayaran SPP**: Sistem pembayaran online
- **Pesan & Notifikasi**: Komunikasi dengan musyrif
- **Profil Wali**: Manajemen data wali
- **Absensi Santri**: Melihat kehadiran
- **Jadwal Pelajaran**: Jadwal santri
- **Prestasi**: Pencapaian santri
- **Donasi**: Sistem donasi TPQ
- **Event**: Informasi kegiatan

#### **Aplikasi Musyrif**

- **Dashboard Musyrif**: Dashboard khusus musyrif
- **Manajemen Santri**: Kelola data santri
- **Input Absensi**: Input kehadiran santri
- **Input Nilai**: Penilaian santri
- **Jadwal Mengajar**: Kelola jadwal mengajar
- **Laporan**: Generate laporan progress
- **Komunikasi**: Komunikasi dengan wali
- **Profil Musyrif**: Manajemen profil
- **Materi Pelajaran**: Kelola kurikulum
- **Penilaian**: Sistem assessment

### 🎨 **Visual Customization**

#### **Template Design**

- **Modern**: Design modern dengan warna cerah
- **Classic**: Design klasik tradisional
- **Islamic**: Design bernuansa islami hijau
- **Minimal**: Design minimalis dan clean

#### **Color Customization**

- **Primary Color**: Warna utama aplikasi
- **Secondary Color**: Warna sekunder
- **Color Picker**: Visual color picker
- **Live Preview**: Preview real-time

#### **Asset Management**

- **App Icon**: Upload icon aplikasi (1024x1024)
- **Splash Screen**: Upload splash screen (1284x2778)
- **Auto Resize**: Otomatis resize ke ukuran yang dibutuhkan
- **Multiple Formats**: Support PNG, JPG, SVG

### 🔧 **Build Configuration**

#### **Platform Support**

- **Android APK**: Generate APK untuk Android
- **iOS IPA**: Generate IPA untuk iOS
- **Cross-platform**: Build kedua platform sekaligus

#### **Build Profiles**

- **Development**: Debug build untuk testing
- **Preview**: Release build untuk preview
- **Production**: Production build untuk release

#### **Feature Toggle**

- **Enable/Disable**: Toggle fitur per aplikasi
- **Granular Control**: Kontrol detail setiap fitur
- **Custom Features**: Tambah fitur custom

## 🎯 **Usage Guide**

### **1. Access Module**

```
URL: /dashboard/admin/mobile-app-generator
```

### **2. Configure Wali App**

1. **Pilih tab "Aplikasi Wali"**
2. **Set basic configuration**:
   - Nama aplikasi: "TPQ Wali"
   - Versi: "1.0.0"
   - Deskripsi aplikasi
3. **Configure visual**:
   - Pilih template design
   - Set primary color: #1e40af
   - Set secondary color: #3b82f6
   - Upload app icon
   - Upload splash screen
4. **Select features**:
   - Enable/disable fitur sesuai kebutuhan
   - Semua fitur wali tersedia
5. **Generate**:
   - Click "Generate Android APK"
   - Monitor progress real-time
   - Download when complete

### **3. Configure Musyrif App**

1. **Pilih tab "Aplikasi Musyrif"**
2. **Set basic configuration**:
   - Nama aplikasi: "TPQ Musyrif"
   - Versi: "1.0.0"
   - Deskripsi aplikasi
3. **Configure visual**:
   - Pilih template: Islamic
   - Set primary color: #059669
   - Set secondary color: #10b981
   - Upload app icon (berbeda dari wali)
   - Upload splash screen
4. **Select features**:
   - Enable fitur musyrif
   - Disable fitur yang tidak diperlukan
5. **Generate**:
   - Click "Generate Android APK"
   - Monitor progress
   - Download result

### **4. Preview Apps**

- **Click "Preview"** untuk melihat tampilan aplikasi
- **Real-time preview** dengan konfigurasi aktual
- **Mobile-responsive** preview interface

### **5. Build History**

- **Track all builds** di tab "Riwayat Build"
- **Download previous builds**
- **View build details** dan status

## 🔧 **Technical Implementation**

### **Frontend Architecture**

```typescript
// Main component structure
interface AppConfig {
  id: string;
  name: string;
  displayName: string;
  version: string;
  buildNumber: number;
  icon: string | null;
  splashScreen: string | null;
  primaryColor: string;
  secondaryColor: string;
  features: { [key: string]: boolean };
  template: string;
}

// Build status tracking
interface BuildStatus {
  isBuilding: boolean;
  platform: string | null;
  appType: string | null;
  progress: number;
  status: string;
  logs: string[];
  downloadUrl: string | null;
}
```

### **Backend Architecture**

```typescript
// API endpoints
POST /api/mobile-builds/generate
POST /api/mobile-builds/upload-asset
GET  /api/mobile-builds/history
GET  /api/mobile-builds/download/[buildId]
GET  /api/mobile-builds/preview

// Build process
1. Generate app configuration files
2. Copy mobile app template
3. Configure features based on selection
4. Install dependencies
5. Build APK/IPA using EAS
6. Store build artifacts
7. Send download link
```

### **Real-time Updates**

```typescript
// WebSocket integration
const ws = new WebSocket("ws://localhost:3002");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "build_started":
    // Update UI build started
    case "build_progress":
    // Update progress bar
    case "build_completed":
    // Show download link
    case "build_failed":
    // Show error message
  }
};
```

## 📊 **Build Process Flow**

### **1. Configuration Phase**

```
Admin Input → Validation → Config Generation
```

### **2. Asset Processing**

```
Upload Assets → Resize/Optimize → Store in Build Directory
```

### **3. Code Generation**

```
Template Copy → Feature Configuration → Dependency Installation
```

### **4. Build Execution**

```
EAS Build → Progress Monitoring → Artifact Generation
```

### **5. Delivery**

```
Build Complete → Store Artifact → Generate Download Link
```

## 🎨 **UI/UX Features**

### **Modern Interface**

- **Tailwind CSS**: Modern styling framework
- **Responsive Design**: Works on all devices
- **Interactive Elements**: Smooth animations
- **Color-coded Status**: Visual status indicators
- **Real-time Feedback**: Immediate visual feedback

### **User Experience**

- **Intuitive Navigation**: Easy tab-based interface
- **Drag & Drop**: Easy asset upload
- **Live Preview**: See changes immediately
- **Progress Tracking**: Clear build progress
- **Error Handling**: User-friendly error messages

### **Accessibility**

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels
- **High Contrast**: Accessible color schemes
- **Mobile Friendly**: Touch-optimized interface

## 🔒 **Security Features**

### **File Upload Security**

- **File Type Validation**: Only allow image files
- **File Size Limits**: Prevent large uploads
- **Virus Scanning**: Scan uploaded files
- **Secure Storage**: Store in protected directory

### **Build Security**

- **Isolated Environment**: Builds run in containers
- **Code Signing**: Secure app signing
- **Access Control**: Admin-only access
- **Audit Logging**: Log all build activities

## 📈 **Performance Optimization**

### **Build Performance**

- **Parallel Processing**: Multiple builds simultaneously
- **Caching**: Reuse build dependencies
- **Incremental Builds**: Only rebuild changed parts
- **Resource Management**: Optimal resource allocation

### **UI Performance**

- **Lazy Loading**: Load components on demand
- **Virtual Scrolling**: Handle large lists
- **Debounced Updates**: Prevent excessive API calls
- **Optimized Images**: Compressed assets

## 🎉 **Benefits**

### **For Admin**

- **Easy App Generation**: No technical knowledge required
- **Visual Interface**: User-friendly web interface
- **Real-time Monitoring**: See build progress live
- **Complete Control**: Full customization options
- **Dual App Management**: Manage both apps from one place

### **For Organization**

- **Separate User Experiences**: Tailored apps for each user type
- **Brand Consistency**: Consistent branding across apps
- **Feature Flexibility**: Enable/disable features as needed
- **Cost Effective**: Generate multiple apps efficiently
- **Professional Quality**: Production-ready applications

### **For Users**

- **Focused Experience**: Apps tailored to their role
- **Better Performance**: Only relevant features included
- **Consistent Design**: Professional app design
- **Regular Updates**: Easy to update and maintain

## 🚀 **Deployment**

### **Requirements**

- **Node.js 18+**: Runtime environment
- **Next.js 14+**: Framework
- **EAS CLI**: For building mobile apps
- **Sharp**: Image processing
- **WebSocket**: Real-time updates

### **Installation**

```bash
# Install dependencies
npm install sharp ws

# Setup EAS
npm install -g @expo/eas-cli
eas login

# Create directories
mkdir -p public/uploads/mobile-assets
mkdir -p data
mkdir -p builds
```

### **Environment Variables**

```bash
# .env.local
EXPO_ACCESS_TOKEN=your_expo_token
MOBILE_BUILD_WEBHOOK_URL=your_webhook_url
UPLOAD_MAX_SIZE=10485760  # 10MB
```

## 🎊 **Ready to Use**

**Module Admin Mobile App Generator telah siap digunakan untuk generate aplikasi mobile Wali dan Musyrif dengan kustomisasi penuh!**

### **Quick Start**

1. **Access**: `/dashboard/admin/mobile-app-generator`
2. **Configure**: Set app details, colors, features
3. **Upload**: Add app icon dan splash screen
4. **Generate**: Click generate untuk platform yang diinginkan
5. **Monitor**: Watch real-time build progress
6. **Download**: Download APK/IPA when complete

**🎉 Admin sekarang bisa generate 2 aplikasi mobile terpisah dengan mudah!**
