# Implementasi Halaqah Materials

Dokumen ini menjelaskan implementasi tabel `halaqah_materials` dan `halaqah_progress` untuk mendukung fitur materi halaqah.

## Perubahan yang Dilakukan

### 1. Penambahan Kolom `type` pada Tabel `halaqah`

Kolom `type` telah ditambahkan ke tabel `halaqah` dengan nilai default 'QURAN'. Kolom ini digunakan untuk membedakan jenis halaqah:

- 'QURAN' untuk halaqah Al-Quran
- 'TAHSIN' untuk halaqah tahsin
- 'AKHLAK' untuk halaqah pendidikan akhlak

### 2. Pembuatan Tabel `halaqah_materials`

Tabel `halaqah_materials` telah dibuat dengan struktur berikut:

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

### 3. Pembuatan Tabel `halaqah_progress`

Tabel `halaqah_progress` telah dibuat untuk melacak kemajuan santri dalam mempelajari materi halaqah:

```sql
CREATE TABLE halaqah_progress (
  id VARCHAR(191) NOT NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'NOT_STARTED',
  notes VARCHAR(191) NULL,
  grade INT NULL,
  startDate DATETIME(3) NULL,
  completedAt DATETIME(3) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  santriId VARCHAR(191) NOT NULL,
  materialId VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX halaqah_progress_santriId_materialId_key(santriId, materialId),
  INDEX halaqah_progress_santriId_fkey(santriId),
  INDEX halaqah_progress_materialId_fkey(materialId),
  CONSTRAINT halaqah_progress_santriId_fkey FOREIGN KEY (santriId) REFERENCES santri(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT halaqah_progress_materialId_fkey FOREIGN KEY (materialId) REFERENCES halaqah_materials(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 4. Pembaruan Skema Prisma

Skema Prisma telah diperbarui untuk mencerminkan perubahan database:

- Menambahkan kolom `type` pada model `Halaqah`
- Menambahkan model `HalaqahMaterial`
- Menambahkan model `HalaqahProgress`
- Menambahkan relasi antara model-model tersebut

### 5. Perbaikan API Endpoint

File: `src/app/api/halaqah/route.ts`

- Menambahkan pengecekan keberadaan tabel `halaqah_materials`
- Membangun objek `include` secara dinamis berdasarkan keberadaan tabel
- Menangani kasus di mana tabel `halaqah_materials` tidak ada

## Cara Menggunakan

### Menambahkan Materi Halaqah

Untuk menambahkan materi halaqah, Anda dapat menggunakan API endpoint `/api/halaqah/materials` (perlu diimplementasikan):

```javascript
const response = await fetch("/api/halaqah/materials", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Judul Materi",
    description: "Deskripsi Materi",
    content: "Konten Materi",
    halaqahId: "ID_HALAQAH",
    order: 1,
  }),
});
```

### Melacak Kemajuan Santri

Untuk melacak kemajuan santri dalam mempelajari materi, Anda dapat menggunakan API endpoint `/api/halaqah/progress` (perlu diimplementasikan):

```javascript
const response = await fetch("/api/halaqah/progress", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    santriId: "ID_SANTRI",
    materialId: "ID_MATERI",
    status: "COMPLETED",
    grade: 90,
    notes: "Catatan kemajuan",
  }),
});
```

## Langkah Selanjutnya

1. Implementasikan API endpoint untuk mengelola materi halaqah
2. Implementasikan API endpoint untuk mengelola kemajuan santri
3. Buat UI untuk mengelola materi halaqah
4. Buat UI untuk melihat dan mengelola kemajuan santri

## Troubleshooting

Jika mengalami masalah:

1. Pastikan tabel `halaqah_materials` dan `halaqah_progress` sudah ada di database
2. Pastikan skema Prisma sudah diperbarui dan Prisma client sudah di-generate ulang
3. Periksa log error di konsol browser
4. Gunakan halaman `/test-db` untuk menguji koneksi database dan API halaqah
