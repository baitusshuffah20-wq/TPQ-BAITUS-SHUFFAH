# Perbaikan Tombol Terkait Tema

Dokumen ini menjelaskan perbaikan yang telah dilakukan untuk mengatasi masalah tombol yang tidak terlihat karena pengaturan tema.

## Masalah yang Ditemukan

Setelah analisis lebih lanjut, kami menemukan bahwa masalah tombol yang tidak terlihat terkait dengan sistem tema yang digunakan di aplikasi. Beberapa masalah spesifik:

1. Fungsi `applyButtonStyles()` di `apply-theme.ts` hanya mengatur warna latar belakang tombol tanpa mempertimbangkan kontras dengan teks
2. Tema default menggunakan warna kuning terang (`#E6CF00`) sebagai warna primer, yang menyebabkan teks putih sulit terlihat
3. Tidak ada mekanisme untuk memastikan teks tombol selalu kontras dengan latar belakang
4. Tidak ada border pada tombol yang membantu membedakan tombol dari latar belakang

## Perubahan yang Dilakukan

### 1. Perbaikan Fungsi `applyButtonStyles()` di `apply-theme.ts`

Fungsi ini telah diperbarui untuk:

- Mengatur warna teks berdasarkan kontras dengan latar belakang
- Menambahkan border pada tombol untuk meningkatkan visibilitas
- Menangani tombol outline dan ghost dengan lebih baik

```typescript
function applyButtonStyles(theme: ThemeConfig): void {
  // Primary buttons
  const primaryButtons = document.querySelectorAll(
    ".btn-primary, .bg-primary, .bg-teal-600, .bg-teal-700",
  );
  primaryButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.primary;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.primary,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.primary, -20)}`;
  });

  // Secondary buttons
  const secondaryButtons = document.querySelectorAll(
    ".btn-secondary, .bg-secondary",
  );
  secondaryButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.secondary;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.secondary,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.secondary, -20)}`;
  });

  // ... kode lainnya ...
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#333333" : "#ffffff";
}
```

### 2. Perubahan Tema Default di `theme-context.tsx`

Tema default telah diubah untuk meningkatkan kontras:

```typescript
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#008080", // Teal (diubah dari kuning emas untuk kontras yang lebih baik)
    secondary: "#E6CF00", // Kuning emas (diubah dari teal)
    accent: "#00e0e0", // Cyan terang
    // ... kode lainnya ...
  },
  buttons: {
    primary: "#008080", // Teal (diubah dari kuning emas untuk kontras yang lebih baik)
    secondary: "#E6CF00", // Kuning emas (diubah dari teal)
    accent: "#00e0e0", // Cyan terang
    danger: "#EF4444", // Merah
    info: "#3B82F6", // Biru, lebih kontras
  },
  // ... kode lainnya ...
};
```

### 3. Penambahan CSS Global di `globals.css`

CSS global telah ditambahkan untuk memastikan tombol selalu terlihat dengan jelas:

```css
/* Button Overrides - Ensure all buttons are visible */
button {
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

button.bg-white {
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
}

button.text-white {
  color: white !important;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
}

button.text-gray-800 {
  color: #1f2937 !important;
}

/* Light background buttons need dark text */
button.bg-yellow-400,
button.bg-yellow-500,
button.bg-cyan-500,
button.bg-cyan-600,
/* ... kode lainnya ... */ {
  color: #1f2937 !important;
}

/* Dark background buttons need light text */
button.bg-teal-600,
button.bg-teal-700,
button.bg-red-600,
button.bg-red-700,
/* ... kode lainnya ... */ {
  color: white !important;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
}
```

## Hasil

Dengan perubahan ini:

1. Semua tombol sekarang memiliki warna teks yang kontras dengan latar belakang
2. Tombol memiliki border yang membantu membedakannya dari latar belakang
3. Tema default menggunakan warna yang lebih kontras
4. CSS global memastikan tombol selalu terlihat dengan jelas, terlepas dari tema yang digunakan

## Rekomendasi Tambahan

Untuk meningkatkan pengalaman pengguna lebih lanjut, beberapa rekomendasi tambahan:

1. **Pengujian Aksesibilitas**
   - Lakukan pengujian aksesibilitas untuk memastikan kontras warna memenuhi standar WCAG
   - Gunakan alat seperti Lighthouse atau axe untuk menguji aksesibilitas

2. **Mode Tema Gelap**
   - Pertimbangkan untuk menambahkan mode tema gelap
   - Pastikan semua tombol terlihat dengan jelas di mode gelap

3. **Dokumentasi Tema**
   - Buat dokumentasi tentang cara menggunakan sistem tema
   - Sertakan panduan tentang pemilihan warna yang kontras
