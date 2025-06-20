# Migrasi Manual Database

File SQL di direktori ini berisi perubahan skema database yang perlu diterapkan secara manual karena kendala dalam menjalankan `prisma migrate`.

## Cara Mengimpor File SQL

### Menggunakan phpMyAdmin

1. Buka phpMyAdmin (biasanya di http://localhost/phpmyadmin)
2. Pilih database yang digunakan oleh aplikasi
3. Klik tab "SQL" di bagian atas
4. Copy-paste isi file SQL atau gunakan fitur "Browse" untuk memilih file SQL
5. Klik tombol "Go" untuk mengeksekusi query

### Menggunakan MySQL CLI

```bash
mysql -u username -p database_name < path/to/sql_file.sql
```

Ganti `username` dengan nama pengguna MySQL Anda, `database_name` dengan nama database aplikasi, dan `path/to/sql_file.sql` dengan path ke file SQL.

## Daftar Migrasi Manual

1. `add_categoryId_to_donation.sql` - Menambahkan kolom `categoryId` ke tabel `Donation` untuk menyimpan referensi ke kategori donasi.

## Setelah Migrasi

Setelah menerapkan migrasi manual, pastikan untuk memperbarui model Prisma dengan menambahkan field yang sesuai di `schema.prisma`, lalu jalankan:

```bash
npx prisma generate
```

Jika tidak bisa menjalankan `prisma generate`, pastikan aplikasi tetap menggunakan field yang ada di database dan hindari menggunakan field yang belum ada di database.