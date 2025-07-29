# Migrasi Tabel Halaqah

Untuk mengatasi masalah "Gagal memuat data halaqah" pada modul halaqah di dashboard admin, perlu dilakukan migrasi database untuk menambahkan kolom `type` pada tabel `halaqah`.

## Cara Otomatis

Jalankan script berikut untuk menerapkan migrasi secara otomatis:

```bash
node scripts/apply-halaqah-migration.js
```

## Cara Manual

Jika cara otomatis gagal, Anda dapat menerapkan migrasi secara manual:

1. Buka phpMyAdmin atau MySQL client lainnya
2. Pilih database `tpq_baitus_shuffah`
3. Jalankan SQL berikut:

```sql
ALTER TABLE halaqah ADD COLUMN type VARCHAR(191) NOT NULL DEFAULT 'QURAN';
```

Pastikan kolom `type` belum ada sebelum menjalankan perintah di atas.

## Verifikasi

Setelah migrasi berhasil, Anda dapat memverifikasi dengan:

1. Buka phpMyAdmin
2. Pilih database `tpq_baitus_shuffah`
3. Pilih tabel `halaqah`
4. Pastikan kolom `type` sudah ada

## Perubahan Kode

Beberapa file telah diperbarui untuk menangani kasus di mana kolom `type` belum ada:

1. `src/app/api/halaqah/route.ts` - Menangani kasus di mana kolom `type` belum ada
2. `src/app/dashboard/admin/halaqah/page.tsx` - Pesan error yang lebih informatif
3. `src/app/dashboard/admin/halaqah/tahsin/page.tsx` - Pesan error yang lebih informatif
4. `src/app/dashboard/admin/halaqah/quran/page.tsx` - Pesan error yang lebih informatif
5. `src/app/dashboard/admin/halaqah/akhlak/page.tsx` - Pesan error yang lebih informatif

## Troubleshooting

Jika masih mengalami masalah setelah migrasi:

1. Periksa log error di konsol browser
2. Pastikan API endpoint `/api/halaqah` berjalan dengan benar
3. Pastikan tabel `halaqah` memiliki data
4. Coba tambahkan halaqah baru melalui UI
