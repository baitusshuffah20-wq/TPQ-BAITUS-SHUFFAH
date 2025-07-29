# Perbaikan API Halaqah

Dokumen ini menjelaskan perbaikan yang telah dilakukan untuk mengatasi masalah "API returned error: {}" pada modul halaqah di dashboard admin.

## Masalah yang Ditemukan

Setelah melakukan analisis, kami menemukan beberapa masalah:

1. **Tabel `halaqah_materials` tidak ada di database**
   - API mencoba mengakses relasi `materials` pada model `halaqah`
   - Relasi ini membutuhkan tabel `halaqah_materials` yang belum ada di database

2. **Penanganan null/undefined yang tidak aman**
   - Beberapa properti seperti `h.musyrif.name` dan `h.level` diakses tanpa pengecekan null/undefined
   - Ini dapat menyebabkan error JavaScript saat properti tersebut tidak ada

## Perubahan yang Dilakukan

### 1. Perbaikan API Endpoint

File: `src/app/api/halaqah/route.ts`

- Menambahkan pengecekan keberadaan tabel `halaqah_materials`
- Membangun objek `include` secara dinamis berdasarkan keberadaan tabel
- Menangani kasus di mana tabel `halaqah_materials` tidak ada

```typescript
// Check if materials relation exists
let includeMaterials = false;
try {
  // Try to access the materials relation
  await prisma.$queryRaw`SHOW TABLES LIKE 'halaqah_materials'`;
  includeMaterials = true;
  console.log("halaqah_materials table exists, including in query");
} catch (error) {
  console.warn("halaqah_materials table does not exist, skipping in query");
  includeMaterials = false;
}

// Build include object dynamically
const includeObj: any = {
  // ... other includes
};

// Add materials if the table exists
if (includeMaterials) {
  includeObj.materials = {
    // ... materials include
  };
}
```

### 2. Perbaikan Halaman Frontend

File-file yang diperbarui:

- `src/app/dashboard/admin/halaqah/page.tsx`
- `src/app/dashboard/admin/halaqah/quran/page.tsx`
- `src/app/dashboard/admin/halaqah/tahsin/page.tsx`
- `src/app/dashboard/admin/halaqah/akhlak/page.tsx`

Perubahan:

- Menambahkan penanganan error dalam fungsi filter
- Menambahkan pengecekan null/undefined untuk properti yang diakses
- Menangani kasus di mana properti seperti `h.musyrif.name` dan `h.level` tidak ada

```typescript
const filteredHalaqah = halaqah.filter((h) => {
  try {
    // Handle search with null checks
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.musyrif &&
        h.musyrif.name &&
        h.musyrif.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.level && h.level.toLowerCase().includes(searchTerm.toLowerCase()));

    // ... other filters

    return matchesSearch && matchesLevel && matchesMusyrif;
  } catch (error) {
    console.error("Error filtering halaqah:", error, h);
    return false;
  }
});
```

## Langkah Selanjutnya

Untuk menyelesaikan implementasi halaqah_materials, Anda perlu:

1. Membuat tabel `halaqah_materials` dengan struktur yang benar
2. Memperbarui skema Prisma untuk mencerminkan tabel baru
3. Menghasilkan ulang Prisma client

Berikut adalah contoh SQL untuk membuat tabel `halaqah_materials`:

```sql
CREATE TABLE halaqah_materials (
  id VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  description VARCHAR(191) NULL,
  content TEXT NULL,
  fileUrl VARCHAR(191) NULL,
  material_order INT NOT NULL DEFAULT 0,
  status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  halaqahId VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  INDEX halaqah_materials_halaqahId_fkey(halaqahId),
  CONSTRAINT halaqah_materials_halaqahId_fkey FOREIGN KEY (halaqahId) REFERENCES halaqah(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

## Troubleshooting

Jika masih mengalami masalah:

1. Buka halaman `/test-db` untuk menguji koneksi database dan API halaqah
2. Periksa log error di konsol browser
3. Pastikan tabel `halaqah` memiliki data dengan tipe yang sesuai (QURAN, TAHSIN, AKHLAK)
4. Jika perlu, tambahkan data halaqah baru melalui UI
