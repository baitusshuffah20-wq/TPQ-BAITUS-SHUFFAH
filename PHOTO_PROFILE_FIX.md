# Perbaikan Foto Profil User

## Masalah

Foto profil user pada halaman daftar santri semuanya menampilkan warna teal (background teal dengan inisial nama) tanpa memeriksa apakah user memiliki foto atau tidak.

## Perbaikan yang Dilakukan

### 1. Halaman Admin Santri (`src/app/dashboard/admin/santri/page.tsx`)

- **Baris 608-622**: Menambahkan kondisi untuk memeriksa apakah santri memiliki foto
- Jika ada foto (`s.photo`), tampilkan gambar
- Jika tidak ada foto, tampilkan inisial dengan background teal

### 2. Halaman Wali Santri (`src/app/dashboard/wali/santri/page.tsx`)

- **Baris 224-240**: Menambahkan kondisi untuk memeriksa foto anak
- Menggunakan `selectedChildData.photo` untuk menampilkan foto atau inisial

### 3. Halaman Musyrif Santri (`src/app/dashboard/musyrif/santri/page.tsx`)

- **Baris 247-263**: Menambahkan kondisi untuk memeriksa foto santri
- **Baris 29-79**: Menambahkan field `photo: null` ke mock data santri

### 4. Halaman Hafalan Musyrif (`src/app/dashboard/musyrif/hafalan/page.tsx`)

- **Interface**: Menambahkan field `santriPhoto?: string` ke `HafalanSubmission`
- **Mock Data**: Menambahkan `santriPhoto: null` ke semua data mock
- **Card Display**: Memperbaiki tampilan foto di card hafalan (baris 678-691)
- **Modal Detail**: Memperbaiki tampilan foto di modal review (baris 978-991)
- **API Processing**: Menambahkan `santriPhoto` ke data processing dari API

### 5. Komponen Reusable

Dibuat dua komponen baru untuk konsistensi:

#### `src/components/ui/SantriAvatar.tsx`

- Komponen khusus untuk avatar santri
- Props: `name`, `photo`, `size`, `className`
- Ukuran: sm, md, lg, xl

#### `src/components/ui/UserAvatar.tsx`

- Komponen umum untuk avatar user
- Props: `name`, `photo`, `size`, `className`, `bgColor`, `textColor`
- Ukuran: xs, sm, md, lg, xl, 2xl
- Dapat dikustomisasi warna background dan text

## Pola yang Digunakan

```tsx
<div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
  {user.photo ? (
    <img
      src={user.photo}
      alt={user.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-teal-600 font-medium">
      {user.name.charAt(0).toUpperCase()}
    </span>
  )}
</div>
```

## Hasil

- Foto profil sekarang akan menampilkan gambar jika tersedia
- Jika tidak ada foto, akan menampilkan inisial dengan background teal
- Konsistensi tampilan di seluruh aplikasi
- Komponen reusable untuk penggunaan di masa depan

## Rekomendasi Selanjutnya

1. Gunakan komponen `UserAvatar` atau `SantriAvatar` untuk mengganti implementasi manual
2. Implementasikan upload foto untuk santri yang belum memiliki foto
3. Tambahkan fallback image jika foto gagal dimuat
4. Pertimbangkan lazy loading untuk foto profil
