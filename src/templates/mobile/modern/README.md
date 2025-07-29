# Template Mobile Modern - TPQ Baitus Shuffah

Template aplikasi mobile modern dengan desain yang bersih dan kekinian, terinspirasi dari aplikasi Kitabisa.com. Template ini dirancang khusus untuk sistem informasi TPQ (Taman Pendidikan Al-Qur'an) dengan fitur-fitur yang lengkap dan user-friendly.

## 🚀 **Update Terbaru v2.0**

### ✨ **Fitur Baru yang Ditambahkan:**

- **Animasi Smooth**: Fade in/out animations pada semua komponen
- **Pull to Refresh**: Refresh data dengan gesture pull down
- **Stats Dashboard**: Kartu statistik progress santri
- **Quick Actions**: Tombol aksi cepat untuk fitur utama
- **Floating Action Button**: FAB dengan animasi dan konteks-aware
- **Enhanced Banner**: Banner dengan progress bar dan pause on touch
- **Loading States**: Loading spinner dengan overlay
- **Search Functionality**: Search bar dengan animasi
- **Inbox System**: Sistem pesan lengkap dengan modal detail
- **Profile Management**: Halaman profil dengan statistik dan pengaturan

## 🎨 Fitur Desain

### ✨ Tampilan Modern

- **Banner Slider**: Banner otomatis dengan indikator, transisi smooth, dan progress bar
- **Stats Cards**: Dashboard statistik dengan gradient dan animasi
- **Quick Actions**: Grid aksi cepat dengan warna-warni menarik
- **Menu Grid**: Menu dengan icon yang menarik dan badge notifikasi
- **News Card**: Kartu berita dengan layout horizontal dan vertical
- **Bottom Navigation**: Navigasi bawah dengan animasi dan badge
- **Custom Header**: Header dengan gradient dan notifikasi
- **Floating Action Button**: FAB dengan animasi dan konteks-aware
- **Loading States**: Spinner dengan overlay dan animasi smooth

### 🎯 Komponen Utama

- **HomeScreen**: Halaman utama dengan banner, stats, quick actions, menu, dan berita
- **ActivityScreen**: Riwayat aktivitas dengan filter, status, dan summary cards
- **DonationScreen**: Halaman donasi dengan progress bar, kategori, dan quick amounts
- **InboxScreen**: Sistem pesan dengan kategori, search, dan modal detail
- **ProfileScreen**: Profil lengkap dengan statistik dan pengaturan
- **Custom Components**: Komponen reusable untuk konsistensi UI

## 📱 Struktur Template

```
src/templates/mobile/modern/
├── App.tsx                     # Main app component
├── HomeScreen.tsx              # Halaman utama
├── components/
│   ├── BannerSlider.tsx        # Komponen banner slider dengan animasi
│   ├── BottomNavigation.tsx    # Navigasi bawah
│   ├── CustomHeader.tsx        # Header kustom
│   ├── MenuGrid.tsx            # Grid menu
│   ├── NewsCard.tsx            # Kartu berita
│   ├── FloatingActionButton.tsx # FAB dengan animasi
│   ├── LoadingSpinner.tsx      # Loading spinner
│   └── SearchBar.tsx           # Search bar dengan animasi
├── screens/
│   ├── ActivityScreen.tsx      # Halaman aktivitas
│   ├── DonationScreen.tsx      # Halaman donasi
│   ├── InboxScreen.tsx         # Halaman inbox
│   └── ProfileScreen.tsx       # Halaman profil
├── config/
│   └── AppConfig.ts            # Konfigurasi aplikasi
└── README.md                   # Dokumentasi ini
```

## 🚀 Cara Penggunaan

### 1. Instalasi Dependencies

```bash
npm install react-native react-navigation expo-linear-gradient @expo/vector-icons
```

### 2. Import Template

```typescript
import App from './src/templates/mobile/modern/App';
import { modernAppConfig } from './src/templates/mobile/modern/config/AppConfig';

// Gunakan template dengan konfigurasi modern
<App theme="modern" />
```

### 3. Kustomisasi Konfigurasi

```typescript
import { AppConfig } from "./config/AppConfig";

const customConfig: AppConfig = {
  appName: "TPQ Baitus Shuffah",
  primaryColor: "#2E7D32",
  secondaryColor: "#4CAF50",
  // ... konfigurasi lainnya
};
```

## 🎨 Tema yang Tersedia

### 1. Modern Theme (Default)

- Primary: `#667eea` (Biru modern)
- Secondary: `#764ba2` (Ungu)
- Accent: `#f093fb` (Pink)

### 2. Islamic Theme

- Primary: `#2E7D32` (Hijau Islam)
- Secondary: `#4CAF50` (Hijau muda)
- Accent: `#FF9800` (Orange)

### 3. Blue Theme

- Primary: `#3498DB` (Biru)
- Secondary: `#5DADE2` (Biru muda)
- Accent: `#E74C3C` (Merah)

## 📋 Komponen yang Dapat Dikustomisasi

### BannerSlider

```typescript
<BannerSlider
  banners={bannerData}
  autoPlay={true}
  autoPlayInterval={4000}
  showIndicators={true}
  height={180}
/>
```

### MenuGrid

```typescript
<MenuGrid
  menuItems={menuData}
  numColumns={4}
  onMenuPress={handleMenuPress}
  title="Menu Utama"
/>
```

### NewsCard

```typescript
<NewsCard
  newsItems={newsData}
  onNewsPress={handleNewsPress}
  cardType="horizontal"
  showTitle={true}
/>
```

## 🔧 Konfigurasi Aplikasi

### AppConfig Interface

```typescript
interface AppConfig {
  // Informasi Aplikasi
  appName: string;
  appVersion: string;
  appDescription: string;

  // Warna
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Fitur
  features: {
    enableNotifications: boolean;
    enableBiometric: boolean;
    enableDarkMode: boolean;
  };

  // Kontak
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
}
```

## 📱 Fitur Aplikasi

### 1. Halaman Utama (HomeScreen)

- Banner slider otomatis
- Menu grid dengan 8 menu utama
- Berita terkini dengan thumbnail
- Header dengan notifikasi

### 2. Halaman Aktivitas (ActivityScreen)

- Filter aktivitas berdasarkan kategori
- Status aktivitas (selesai, pending, gagal)
- Summary card dengan statistik
- Timeline aktivitas

### 3. Halaman Donasi (DonationScreen)

- Quick donation dengan nominal preset
- Progress bar untuk setiap kategori donasi
- Input nominal custom
- Riwayat donasi terbaru

### 4. Navigasi Bawah

- 5 menu utama: Beranda, Aktivitas, Donasi, Inbox, Akun
- Badge notifikasi
- Animasi smooth

## 🎯 Best Practices

### 1. Konsistensi Desain

- Gunakan spacing yang konsisten (8px, 16px, 24px)
- Ikuti color scheme yang telah ditentukan
- Gunakan typography yang seragam

### 2. Performance

- Lazy loading untuk gambar
- Optimasi FlatList dengan getItemLayout
- Gunakan memo untuk komponen yang tidak berubah

### 3. Accessibility

- Tambahkan accessibilityLabel
- Gunakan contrast ratio yang baik
- Support untuk screen reader

## 🔄 Integrasi dengan Backend

### API Endpoints yang Dibutuhkan

```typescript
// Banner
GET / api / banners;
// Menu
GET / api / menus;
// News
GET / api / news;
// Activities
GET / api / activities;
// Donations
GET / api / donations;
POST / api / donations;
```

### Data Format

```typescript
// Banner Data
interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string[];
}

// Menu Data
interface MenuData {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  badge?: number;
}
```

## 📝 Customization Guide

### 1. Mengubah Warna Tema

```typescript
const customTheme = {
  ...modernAppConfig,
  primaryColor: "#YOUR_COLOR",
  secondaryColor: "#YOUR_SECONDARY_COLOR",
};
```

### 2. Menambah Menu Baru

```typescript
const newMenuItem = {
  id: "new-menu",
  title: "Menu Baru",
  icon: "add-circle",
  color: "#FF5722",
  route: "NewScreen",
};
```

### 3. Kustomisasi Banner

```typescript
const customBanner = {
  id: "custom",
  title: "Judul Custom",
  subtitle: "Subtitle custom",
  backgroundColor: ["#FF5722", "#FF9800"],
  buttonText: "Action Button",
  onPress: () => console.log("Banner pressed"),
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Icon tidak muncul**: Pastikan @expo/vector-icons terinstall
2. **Gradient tidak tampil**: Install expo-linear-gradient
3. **Navigation error**: Pastikan react-navigation setup dengan benar

### Performance Tips

1. Gunakan FlatList untuk list panjang
2. Implement lazy loading untuk gambar
3. Optimize bundle size dengan tree shaking

## 📄 License

Template ini dapat digunakan secara bebas untuk proyek TPQ atau pendidikan Islam lainnya.

## 🤝 Contributing

Silakan berkontribusi untuk meningkatkan template ini dengan:

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

---

**Dibuat dengan ❤️ untuk kemajuan pendidikan Islam di Indonesia**
