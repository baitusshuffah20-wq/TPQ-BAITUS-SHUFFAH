# 💰 Sistem Penggajian TPQ Baitus Shuffah

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Fitur Utama](#fitur-utama)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Cara Penggunaan](#cara-penggunaan)
6. [Perhitungan Gaji](#perhitungan-gaji)
7. [Integrasi Keuangan](#integrasi-keuangan)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

Sistem Penggajian TPQ Baitus Shuffah adalah sistem manajemen gaji yang terintegrasi dengan sistem absensi dan keuangan. Sistem ini mendukung perhitungan gaji otomatis berdasarkan kehadiran untuk musyrif dan gaji tetap untuk staff admin.

### Teknologi yang Digunakan:

- **Backend**: Next.js API Routes + MySQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: MySQL dengan relasi optimal
- **UI Components**: Custom components dengan Shadcn/ui

## ✨ Fitur Utama

### 1. **Pengaturan Gaji Fleksibel**

- Konfigurasi gaji per posisi (MUSYRIF, ADMIN, STAFF, dll)
- Tipe gaji: Tetap, Per Sesi, atau Per Jam
- Pengaturan tunjangan dan potongan
- Rate lembur yang dapat dikustomisasi

### 2. **Generate Payroll Otomatis**

- Perhitungan berdasarkan data absensi
- Pilih periode dan karyawan
- Validasi data sebelum generate
- Bulk processing untuk efisiensi

### 3. **Workflow Approval**

- Status: DRAFT → APPROVED → PAID
- Approval oleh admin sebelum pembayaran
- Audit trail lengkap

### 4. **Pembayaran Terintegrasi**

- Multiple payment methods (Cash, Transfer, Cek)
- Otomatis catat ke modul keuangan
- Generate slip gaji

### 5. **Laporan & Analytics**

- Dashboard statistik real-time
- Export ke Excel
- Laporan per periode
- Analisis kehadiran vs gaji

## 🗄️ Database Schema

### Tabel Utama:

#### `salary_settings`

```sql
- id (VARCHAR(36) PRIMARY KEY)
- position (VARCHAR(50)) -- MUSYRIF, ADMIN, etc
- salary_type (ENUM) -- FIXED, PER_SESSION, HOURLY
- base_amount (DECIMAL(10,2)) -- Gaji pokok/tarif
- overtime_rate (DECIMAL(5,2)) -- Rate lembur
- allowances (JSON) -- Tunjangan
- deductions (JSON) -- Potongan
- is_active (BOOLEAN)
```

#### `payroll`

```sql
- id (VARCHAR(36) PRIMARY KEY)
- employee_id (VARCHAR(36))
- employee_name (VARCHAR(100))
- employee_position (VARCHAR(50))
- period_month, period_year (INT)
- total_sessions, attended_sessions (INT)
- base_salary, gross_salary, net_salary (DECIMAL(10,2))
- status (ENUM) -- DRAFT, APPROVED, PAID, CANCELLED
- calculation_details (JSON)
```

#### `salary_payments`

```sql
- id (VARCHAR(36) PRIMARY KEY)
- payroll_id (VARCHAR(36))
- amount (DECIMAL(10,2))
- payment_method (ENUM) -- CASH, TRANSFER, CHECK
- payment_date (DATE)
- finance_transaction_id (VARCHAR(36))
```

## 🔌 API Endpoints

### Salary Settings

```
GET    /api/salary-settings          # Ambil pengaturan gaji
POST   /api/salary-settings          # Tambah pengaturan baru
PUT    /api/salary-settings          # Update pengaturan
DELETE /api/salary-settings?id=xxx   # Hapus pengaturan
```

### Payroll Management

```
GET    /api/payroll                  # Ambil data payroll
PUT    /api/payroll                  # Approve/reject payroll
DELETE /api/payroll?id=xxx           # Hapus payroll draft
POST   /api/payroll/generate         # Generate payroll otomatis
POST   /api/payroll/pay              # Bayar gaji + integrasi keuangan
```

### Payment History

```
GET    /api/payroll/pay              # Riwayat pembayaran gaji
```

## 📖 Cara Penggunaan

### 1. **Setup Awal**

#### a. Konfigurasi Pengaturan Gaji

1. Buka halaman **Sistem Penggajian**
2. Klik **"Pengaturan Gaji"**
3. Tambah pengaturan untuk setiap posisi:
   - **MUSYRIF**: Tipe "Per Sesi", tarif Rp 25.000/sesi
   - **ADMIN**: Tipe "Tetap", gaji Rp 2.500.000/bulan
   - **STAFF**: Sesuai kebutuhan

#### b. Set Tunjangan & Potongan

```json
// Contoh untuk MUSYRIF
{
  "allowances": {
    "transport": 5000,
    "meal": 10000
  },
  "deductions": {
    "late_penalty": 2500
  }
}
```

### 2. **Generate Payroll Bulanan**

#### a. Pilih Periode

1. Klik **"Generate Payroll"**
2. Pilih bulan dan tahun
3. Pilih karyawan (individual atau semua)

#### b. Review & Generate

1. Sistem akan hitung otomatis berdasarkan absensi
2. Preview hasil perhitungan
3. Klik **"Generate Payroll"**

### 3. **Approval Process**

#### a. Review Payroll Draft

1. Lihat daftar payroll dengan status **DRAFT**
2. Klik ikon **mata** untuk detail perhitungan
3. Verifikasi kehadiran dan nominal

#### b. Approve Payroll

1. Klik ikon **centang** untuk approve
2. Status berubah menjadi **APPROVED**
3. Payroll siap untuk dibayar

### 4. **Pembayaran Gaji**

#### a. Proses Pembayaran

1. Klik ikon **kartu kredit** pada payroll APPROVED
2. Pilih metode pembayaran
3. Input tanggal dan referensi
4. Klik **"Bayar Gaji"**

#### b. Otomatis ke Keuangan

- Sistem otomatis catat transaksi ke modul keuangan
- Kategori: SALARY (Pengeluaran)
- Status payroll berubah ke **PAID**

## 🧮 Perhitungan Gaji

### Untuk MUSYRIF (Per Sesi):

```
Gaji Pokok = Sesi Hadir × Tarif per Sesi
Bonus Kehadiran = (Kehadiran ≥ 90%) ? Tarif × 2 : 0
Denda Terlambat = Jumlah Terlambat × Denda per Keterlambatan
Tunjangan = Transport + Makan + dll
Potongan = Denda + Potongan Lain

Gaji Kotor = Gaji Pokok + Bonus + Tunjangan
Gaji Bersih = Gaji Kotor - Potongan
```

### Untuk ADMIN/STAFF (Tetap):

```
Gaji Pokok = Nominal Tetap per Bulan
Bonus Kehadiran = (Kehadiran ≥ 95%) ? Gaji × 5% : 0
Tunjangan = Transport + Komunikasi + dll
Potongan = BPJS + Pajak + dll

Gaji Kotor = Gaji Pokok + Bonus + Tunjangan
Gaji Bersih = Gaji Kotor - Potongan
```

## 💳 Integrasi Keuangan

### Otomatis Catat Transaksi

Saat gaji dibayar, sistem otomatis:

1. **Buat record di `finance_transactions`**:

```json
{
  "type": "EXPENSE",
  "category": "SALARY",
  "description": "Pembayaran gaji [Nama] - [Periode]",
  "amount": [Gaji Bersih],
  "reference": "SALARY-[PayrollID]",
  "metadata": {
    "payroll_id": "...",
    "employee_details": "...",
    "salary_breakdown": "..."
  }
}
```

2. **Update status payroll** ke PAID
3. **Link transaksi** dengan payment record

### Manfaat Integrasi:

- **Konsistensi data** antara payroll dan keuangan
- **Audit trail** lengkap untuk semua pembayaran
- **Laporan keuangan** otomatis include gaji
- **Reconciliation** mudah dengan bank statement

## 🔍 Troubleshooting

### Error: "Pengaturan gaji tidak ditemukan"

**Solusi**: Pastikan sudah ada pengaturan gaji untuk posisi karyawan tersebut di menu Pengaturan Gaji.

### Error: "Payroll sudah ada untuk periode ini"

**Solusi**: Sistem mencegah duplikasi. Hapus payroll lama atau edit yang sudah ada.

### Error: "Payroll harus disetujui terlebih dahulu"

**Solusi**: Approve payroll dengan status DRAFT sebelum melakukan pembayaran.

### Data kehadiran tidak akurat

**Solusi**:

1. Periksa data absensi di modul Absensi
2. Pastikan halaqah sudah di-assign ke musyrif yang benar
3. Regenerate payroll setelah data absensi diperbaiki

### Perhitungan gaji salah

**Solusi**:

1. Periksa pengaturan gaji (tarif, tunjangan, potongan)
2. Lihat detail perhitungan di `calculation_details`
3. Update pengaturan jika diperlukan dan regenerate

## 📊 Best Practices

### 1. **Workflow Bulanan**

- **Minggu 1**: Pastikan absensi bulan lalu sudah lengkap
- **Minggu 2**: Generate dan review payroll
- **Minggu 3**: Approve payroll yang sudah diverifikasi
- **Minggu 4**: Proses pembayaran gaji

### 2. **Data Integrity**

- Selalu backup database sebelum generate payroll massal
- Verifikasi data absensi sebelum generate
- Double-check pengaturan gaji secara berkala

### 3. **Security**

- Hanya admin yang bisa approve dan bayar gaji
- Log semua aktivitas payroll
- Regular audit untuk detect anomali

### 4. **Performance**

- Generate payroll di luar jam kerja untuk data besar
- Use pagination untuk display payroll history
- Archive old payroll data secara berkala

## 🚀 Future Enhancements

### Planned Features:

- [ ] **Slip Gaji Digital** dengan QR code
- [ ] **Email Notification** saat gaji dibayar
- [ ] **Mobile App** untuk cek slip gaji
- [ ] **Integration** dengan bank untuk auto transfer
- [ ] **Advanced Analytics** dengan charts
- [ ] **Bulk Payment** processing
- [ ] **Tax Calculation** otomatis
- [ ] **Employee Self-Service** portal

---

**Sistem Penggajian TPQ Baitus Shuffah** - Mengelola gaji dengan mudah, akurat, dan terintegrasi! 💰✨
