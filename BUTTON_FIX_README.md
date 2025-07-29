# Perbaikan Tombol di Halaman Admin

Dokumen ini menjelaskan perbaikan yang telah dilakukan untuk mengatasi masalah tombol yang tidak terlihat karena menggunakan warna tombol dan teks putih di halaman admin.

## Masalah yang Ditemukan

Beberapa tombol di halaman admin tidak terlihat dengan jelas karena:

1. Tombol dengan varian `secondary` menggunakan latar belakang kuning terang (`#e4fd00`) dengan teks putih (`color: white`), yang membuat teks sulit terlihat
2. Tombol dengan varian `accent` juga menggunakan teks putih yang tidak kontras dengan latar belakang terang
3. Beberapa kelas tombol seperti `btn-accent`, `btn-danger`, dan `btn-info` tidak didefinisikan dengan baik di CSS
4. Banyak tombol menggunakan kelas CSS langsung seperti `className="bg-green-600 hover:bg-green-700"` yang menimpa gaya tombol yang ditetapkan di komponen Button

## Perubahan yang Dilakukan

### 1. Perbaikan Komprehensif Komponen Button

File: `src/components/ui/Button.tsx`

- Mengganti penggunaan kelas CSS kustom dengan kelas Tailwind langsung untuk memastikan konsistensi
- Menetapkan warna latar belakang dan teks yang kontras untuk setiap varian tombol
- Memastikan semua tombol memiliki tampilan yang konsisten

```javascript
// Sebelum
const variants = {
  primary:
    "btn-primary text-white hover:opacity-90 focus:ring-teal-500 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  secondary:
    "btn-secondary text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  accent:
    "btn-accent text-white hover:opacity-90 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  // ...
};

// Sesudah
const variants = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  secondary:
    "bg-yellow-400 text-gray-800 hover:bg-yellow-500 focus:ring-yellow-400 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  accent:
    "bg-cyan-500 text-gray-800 hover:bg-cyan-600 focus:ring-cyan-500 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  info: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md",
  outline:
    "border-2 border-teal-600 text-teal-600 bg-white hover:bg-teal-600 hover:text-white focus:ring-teal-500",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
};
```

### 2. Perbaikan Tombol di Halaman Halaqah

File-file yang diperbarui:

- `src/app/dashboard/admin/halaqah/page.tsx`
- `src/app/dashboard/admin/halaqah/quran/page.tsx`
- `src/app/dashboard/admin/halaqah/tahsin/page.tsx`
- `src/app/dashboard/admin/halaqah/akhlak/page.tsx`

Perubahan:

- Mengganti kelas CSS langsung dengan varian tombol yang sesuai
- Menghapus kelas warna latar belakang dan teks yang menimpa gaya tombol
- Memastikan semua tombol menggunakan varian yang tepat untuk konsistensi

```javascript
// Sebelum
<Button
  onClick={() => setShowForm(true)}
  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
>
  <Plus className="h-4 w-4" />
  Tambah Halaqah Baru
</Button>

// Sesudah
<Button
  variant="accent"
  onClick={() => setShowForm(true)}
  className="flex items-center gap-2"
>
  <Plus className="h-4 w-4" />
  Tambah Halaqah Baru
</Button>
```

## Perubahan Tambahan

Setelah melihat masih ada tombol yang tidak terlihat di beberapa halaman admin, kami melakukan perbaikan tambahan:

### 1. Perbaikan Komprehensif Komponen Button

- Menambahkan border pada semua varian tombol untuk meningkatkan visibilitas
- Mengubah varian `ghost` agar menggunakan latar belakang putih dan border abu-abu
- Memastikan semua tombol memiliki kontras yang cukup antara latar belakang dan teks

```javascript
const variants = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 focus:ring-opacity-50 shadow-sm hover:shadow-md border border-teal-700",
  secondary:
    "bg-yellow-400 text-gray-800 hover:bg-yellow-500 focus:ring-yellow-400 focus:ring-opacity-50 shadow-sm hover:shadow-md border border-yellow-500",
  accent:
    "bg-cyan-500 text-gray-800 hover:bg-cyan-600 focus:ring-cyan-500 focus:ring-opacity-50 shadow-sm hover:shadow-md border border-cyan-600",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-opacity-50 shadow-sm hover:shadow-md border border-red-600",
  info: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md border border-blue-600",
  outline:
    "border-2 border-teal-600 text-teal-600 bg-white hover:bg-teal-600 hover:text-white focus:ring-teal-500",
  ghost:
    "bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300",
};
```

### 2. Perbaikan Tombol di Halaman Santri

- Mengubah tombol "Tambah Santri" untuk menggunakan varian `primary`
- Mengubah tombol "Hapus" untuk menggunakan varian `danger` yang lebih terlihat

### 3. Perbaikan Tombol di Halaman Admin Utama

- Menambahkan border pada tombol aksi cepat untuk meningkatkan visibilitas
- Memastikan teks tombol memiliki kontras yang cukup dengan latar belakang

### 4. Penambahan CSS Global untuk Tombol

Menambahkan aturan CSS global untuk memastikan semua tombol terlihat dengan jelas:

```css
/* Button Overrides - Ensure all buttons are visible */
button {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

button.bg-white {
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
}

button.text-white {
  color: white !important;
}

button.text-gray-800 {
  color: #1f2937 !important;
}
```

## Hasil

Dengan perubahan ini, semua tombol di halaman admin sekarang memiliki kontras yang lebih baik antara latar belakang dan teks, dan semua tombol terlihat dengan jelas:

1. Tombol `primary`: Latar belakang teal (`#008080`) dengan teks putih dan border teal gelap
2. Tombol `secondary`: Latar belakang kuning (`#yellow-400`) dengan teks abu-abu gelap dan border kuning
3. Tombol `accent`: Latar belakang cyan (`#cyan-500`) dengan teks abu-abu gelap dan border cyan
4. Tombol `danger`: Latar belakang merah (`#red-500`) dengan teks putih dan border merah
5. Tombol `info`: Latar belakang biru (`#blue-500`) dengan teks putih dan border biru
6. Tombol `outline`: Border teal dengan teks teal dan latar belakang putih
7. Tombol `ghost`: Latar belakang putih dengan teks abu-abu dan border abu-abu

## Panduan Penggunaan Tombol

Berikut adalah panduan penggunaan varian tombol yang tepat:

- `primary`: Untuk aksi utama (submit, simpan, konfirmasi)
- `secondary`: Untuk aksi sekunder (filter, sortir, tampilkan)
- `accent`: Untuk aksi yang perlu ditonjolkan (tambah, buat baru)
- `danger`: Untuk aksi berbahaya (hapus, batalkan)
- `info`: Untuk aksi informasi (detail, lihat)
- `outline`: Untuk aksi alternatif atau opsional
- `ghost`: Untuk aksi yang tidak perlu ditonjolkan
