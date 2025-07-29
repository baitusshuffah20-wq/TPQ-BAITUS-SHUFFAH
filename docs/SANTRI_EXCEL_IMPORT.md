# Fitur Import Data Santri dari Excel

## Deskripsi

Fitur ini memungkinkan admin untuk mengimport data santri secara massal menggunakan file Excel (.xlsx, .xls). Fitur ini dilengkapi dengan validasi data, preview sebelum import, dan penanganan error yang komprehensif.

## Cara Penggunaan

### 1. Akses Fitur Import

- Buka halaman **Dashboard > Admin > Santri**
- Klik tombol **"Import Excel"** di bagian atas halaman

### 2. Download Template

- Klik tombol **"Download Template Excel"** untuk mendapatkan template yang sesuai
- Template berisi contoh data dan format yang benar
- Template juga dilengkapi dengan sheet petunjuk penggunaan

### 3. Isi Data di Excel

- Buka template yang telah didownload
- Hapus baris contoh dan isi dengan data santri yang sebenarnya
- Pastikan mengikuti format yang telah ditentukan

### 4. Upload File Excel

- Klik **"Pilih File Excel"** dan pilih file yang telah diisi
- Sistem akan otomatis memvalidasi data dan menampilkan preview
- Periksa hasil validasi dan perbaiki error jika ada

### 5. Import Data

- Jika tidak ada error, klik **"Import Data"**
- Tunggu proses import selesai
- Sistem akan menampilkan hasil import (berhasil/gagal/dilewati)

## Format Data Excel

### Kolom Wajib

| Kolom            | Format                  | Contoh       | Keterangan                             |
| ---------------- | ----------------------- | ------------ | -------------------------------------- |
| NIS              | String (min 3 karakter) | STR001       | Nomor Induk Santri (harus unik)        |
| Nama Lengkap     | String (min 2 karakter) | Ahmad Fauzi  | Nama lengkap santri                    |
| Tanggal Lahir    | YYYY-MM-DD              | 2010-01-15   | Format tanggal ISO                     |
| Jenis Kelamin    | MALE/FEMALE             | MALE         | Hanya MALE atau FEMALE                 |
| Nama Orang Tua   | String (min 2 karakter) | Budi Santoso | Nama orang tua/wali                    |
| No. HP Orang Tua | String                  | 081234567890 | Format: 08xxxxxxxxxx atau +62xxxxxxxxx |

### Kolom Opsional

| Kolom           | Format          | Contoh             | Keterangan             |
| --------------- | --------------- | ------------------ | ---------------------- |
| Tempat Lahir    | String          | Jakarta            | Tempat lahir santri    |
| Alamat          | String          | Jl. Masjid No. 123 | Alamat lengkap         |
| Email Orang Tua | Email           | budi@email.com     | Email valid (opsional) |
| Tanggal Masuk   | YYYY-MM-DD      | 2024-01-15         | Default: hari ini      |
| Status          | ACTIVE/INACTIVE | ACTIVE             | Default: ACTIVE        |
| Catatan         | String          | Santri baru        | Catatan tambahan       |

## Validasi Data

### Validasi Otomatis

- **NIS**: Harus unik, minimal 3 karakter, tidak boleh duplikasi dalam file
- **Nama**: Minimal 2 karakter
- **Tanggal Lahir**: Format YYYY-MM-DD, umur wajar (3-25 tahun)
- **Jenis Kelamin**: Hanya MALE atau FEMALE
- **Nomor HP**: Format Indonesia yang valid
- **Email**: Format email yang valid (jika diisi)
- **Jumlah Data**: Maksimal 1000 data per upload

### Error Handling

- Sistem akan menampilkan semua error validasi sebelum import
- Data dengan error akan dilewati, data valid tetap diimport
- Duplikasi NIS dengan database akan dilewati
- Progress upload ditampilkan secara real-time

## Fitur Tambahan

### Preview Data

- Menampilkan preview 10 data pertama sebelum import
- Menampilkan statistik: total data, data valid, dan error
- Menampilkan daftar error validasi yang detail

### Progress Tracking

- Progress bar visual saat upload
- Status update real-time
- Notifikasi hasil import yang detail

### Template Excel Advanced

- Sheet utama dengan contoh data
- Sheet petunjuk penggunaan yang lengkap
- Sheet referensi validasi
- Data validation untuk dropdown (Jenis Kelamin, Status)
- Column width yang optimal

## Troubleshooting

### Error Umum

1. **"Format file tidak didukung"**
   - Pastikan file berformat .xlsx atau .xls
   - Jangan gunakan format .csv atau .txt

2. **"NIS sudah ada"**
   - NIS harus unik di seluruh database
   - Periksa data existing atau gunakan NIS yang berbeda

3. **"Format tanggal tidak valid"**
   - Gunakan format YYYY-MM-DD (contoh: 2010-01-15)
   - Jangan gunakan format DD/MM/YYYY atau MM/DD/YYYY

4. **"Format nomor HP tidak valid"**
   - Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxx
   - Jangan gunakan spasi, tanda kurung, atau tanda hubung

5. **"File Excel kosong"**
   - Pastikan ada data di sheet pertama
   - Jangan hapus header kolom

### Tips Penggunaan

- Selalu download template terbaru sebelum mengisi data
- Periksa data di preview sebelum import
- Backup data existing sebelum import besar
- Import data dalam batch kecil (< 500 data) untuk performa optimal
- Pastikan koneksi internet stabil saat upload

## Technical Details

### API Endpoints

- `GET /api/santri/template` - Download template Excel
- `POST /api/santri/import` - Import data santri
- `GET /api/santri/import` - Get template structure info

### Dependencies

- `xlsx` - Library untuk membaca/menulis file Excel
- `react-hot-toast` - Notifikasi user
- `uuid` - Generate ID unik

### Database Impact

- Insert data ke tabel `santri`
- Auto-create `users` dengan role `WALI` jika belum ada
- Update `updatedAt` timestamp
- Maintain referential integrity

### Performance

- Batch processing untuk data besar
- Transaction rollback jika ada error critical
- Memory efficient Excel processing
- Progress tracking untuk UX yang baik
