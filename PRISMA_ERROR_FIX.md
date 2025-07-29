# Mengatasi Error EPERM pada Prisma

## Masalah

Error yang terjadi:

```
EPERM: operation not permitted, rename '[path]\node_modules\.prisma\client\query_engine-windows.dll.node.tmp...' -> '[path]\node_modules\.prisma\client\query_engine-windows.dll.node'
```

Ini terjadi karena file Prisma sedang digunakan oleh proses lain dan tidak dapat diubah.

## Solusi

### 1. Tutup Semua Aplikasi yang Berjalan

- Hentikan semua instance aplikasi yang berjalan dengan menekan `Ctrl+C` di terminal
- Tutup semua terminal atau command prompt yang menjalankan aplikasi
- Tutup editor kode (VS Code) jika perlu

### 2. Bersihkan Cache Prisma

Jalankan perintah berikut secara berurutan:

```bash
# Hapus folder node_modules/.prisma
rmdir /s /q "node_modules\.prisma"

# Hapus folder node_modules/@prisma
rmdir /s /q "node_modules\@prisma"

# Instal ulang dependensi Prisma
npm install @prisma/client mysql2
```

### 3. Regenerasi Prisma Client

Setelah semua aplikasi ditutup dan cache dibersihkan, jalankan:

```bash
npx prisma generate
```

### 4. Jika Masih Bermasalah

Jika masih mengalami masalah, coba langkah-langkah berikut:

1. **Restart Komputer**
   - Terkadang restart komputer diperlukan untuk melepaskan file yang terkunci

2. **Jalankan sebagai Administrator**
   - Buka terminal/command prompt sebagai administrator
   - Jalankan perintah Prisma dari terminal tersebut

3. **Periksa Task Manager**
   - Buka Task Manager (Ctrl+Shift+Esc)
   - Cari proses yang mungkin menggunakan file Prisma (node.exe, npm, dll.)
   - Akhiri proses tersebut

### 5. Alternatif Solusi

Jika langkah-langkah di atas tidak berhasil, Anda dapat mencoba pendekatan alternatif:

1. **Gunakan Prisma Migrate**
   Alih-alih `prisma db push`, gunakan:

   ```bash
   npx prisma migrate dev --name init
   ```

2. **Gunakan Docker untuk MySQL**
   Jika Anda mengalami masalah dengan MySQL lokal, pertimbangkan untuk menggunakan Docker:
   ```bash
   docker run --name mysql-tpq -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=tpq_baitus_shuffah -p 3306:3306 -d mysql:8
   ```
   Kemudian ubah DATABASE_URL di .env:
   ```
   DATABASE_URL="mysql://root:password@localhost:3306/tpq_baitus_shuffah"
   ```
