# 📊 Panduan Template Excel Export TPQ Baitus Shuffah

## 🎯 Overview

Sistem export Excel TPQ Baitus Shuffah menggunakan template modern dengan styling yang konsisten dan profesional. Semua data dapat diekspor dalam format Excel (.xlsx) dengan formatting otomatis.

## 🎨 Fitur Template Excel

### ✨ **Styling Modern**

- **Header berwarna** dengan background biru dan teks putih
- **Alternating row colors** untuk kemudahan membaca
- **Border konsisten** di semua cell
- **Font yang readable** dengan ukuran yang tepat
- **Auto-width columns** sesuai konten

### 📋 **Format Data**

- **Tanggal**: Format Indonesia (dd/mm/yyyy)
- **Mata Uang**: Format Rupiah (Rp #,##0)
- **Angka**: Format dengan separator ribuan
- **Status**: Color-coded badges
  - 🟢 **Hijau**: Active, Paid, Approved
  - 🔴 **Merah**: Inactive, Unpaid, Rejected
  - 🟡 **Kuning**: Pending, Review, Process

### 📊 **Metadata**

- **Judul laporan** dengan styling besar
- **Subtitle** dengan informasi periode
- **Timestamp** export otomatis
- **Footer** dengan ringkasan data
- **Print-ready** dengan margin yang tepat

## 📁 Jenis Export yang Tersedia

### 1. 👥 **Data Santri**

```typescript
exportSantriData(data: SantriData[])
```

**Kolom yang diekspor:**

- NIS, Nama Lengkap, Jenis Kelamin
- Tempat & Tanggal Lahir
- Alamat, No. Telepon, Email
- Data Wali (Nama, Telepon)
- Halaqah & Level
- Status & Tanggal Masuk

### 2. 📚 **Data Halaqah**

```typescript
exportHalaqahData(data: HalaqahData[])
```

**Kolom yang diekspor:**

- Nama Halaqah, Level
- Data Musyrif (Nama, Telepon)
- Kapasitas (Saat Ini & Maksimal)
- Jadwal, Ruangan
- Status, Tanggal Dibuat

### 3. 📖 **Data Hafalan**

```typescript
exportHafalanData(data: HafalanData[])
```

**Kolom yang diekspor:**

- Data Santri (NIS, Nama)
- Halaqah
- Detail Hafalan (Surah, Ayat)
- Jenis, Nilai, Status
- Tanggal Setoran, Catatan

### 4. 📅 **Data Absensi**

```typescript
exportAbsensiData(data: AbsensiData[])
```

**Kolom yang diekspor:**

- Tanggal, Data Santri
- Halaqah, Status Kehadiran
- Waktu Masuk & Keluar
- Keterangan, Dicatat Oleh

### 5. 💰 **Data Pembayaran**

```typescript
exportPembayaranData(data: PembayaranData[])
```

**Kolom yang diekspor:**

- Tanggal, No. Invoice
- Data Santri (NIS, Nama)
- Jenis & Jumlah Pembayaran
- Metode, Status
- Tanggal Jatuh Tempo & Bayar
- Keterangan

**Footer khusus:**

- Total transaksi
- Total nominal dalam Rupiah

### 6. 📈 **Laporan Keuangan**

```typescript
exportLaporanKeuangan(data: KeuanganData[], periode: string)
```

**Kolom yang diekspor:**

- Tanggal, Keterangan, Kategori
- Pemasukan, Pengeluaran, Saldo
- Referensi, Catatan

**Footer khusus:**

- Total pemasukan & pengeluaran
- Saldo bersih

### 7. 🏆 **Data Prestasi**

```typescript
exportPrestasiData(data: PrestasiData[])
```

**Kolom yang diekspor:**

- Data Santri & Halaqah
- Jenis & Judul Prestasi
- Tingkat, Peringkat
- Tanggal, Penyelenggara
- Deskripsi

### 8. 📋 **Laporan Komprehensif**

```typescript
exportLaporanKomprehensif(data: AllData, periode: string)
```

**Multi-sheet Excel dengan:**

- **Sheet Ringkasan**: Statistik keseluruhan
- **Sheet Data**: Semua data dalam sheet terpisah
- **Analisis**: Grafik dan insight (future)

## 🛠️ Cara Penggunaan

### 1. **Import Template**

```typescript
import {
  exportSantriData,
  exportHalaqahData,
  exportPembayaranData,
} from "@/lib/excel-templates";
```

### 2. **Export Data**

```typescript
// Export data santri
const handleExportSantri = () => {
  exportSantriData(filteredSantri);
};

// Export dengan error handling
const handleExport = async () => {
  try {
    const { exportSantriData } = await import("@/lib/excel-templates");
    exportSantriData(data);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Gagal mengexport data");
  }
};
```

### 3. **Menggunakan Komponen Export**

```tsx
import ExportButton from '@/components/export/ExportButton';
import ExportModal from '@/components/export/ExportModal';

// Button untuk export spesifik
<ExportButton
  type="santri"
  data={santriData}
  periode="2024"
/>

// Modal untuk pilihan export
<ExportModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Export Data TPQ"
/>
```

## 🎨 Kustomisasi Template

### **Mengubah Warna**

```typescript
// Di file excel-export.ts
export const EXCEL_COLORS = {
  primary: "FF2563EB", // Ubah warna header
  success: "FF10B981", // Ubah warna status sukses
  // ... warna lainnya
};
```

### **Menambah Kolom**

```typescript
// Contoh menambah kolom di template santri
const columns: ExcelColumn[] = [
  // ... kolom existing
  {
    key: "customField",
    title: "Field Baru",
    width: 20,
    type: "text",
  },
];
```

### **Custom Footer**

```typescript
const options: ExcelExportOptions = {
  // ... options lainnya
  customFooter: `Custom footer dengan data: ${data.length}`,
};
```

## 📱 Responsive & Accessibility

- **Mobile-friendly**: Modal responsive di semua device
- **Keyboard navigation**: Support tab navigation
- **Loading states**: Indicator saat proses export
- **Error handling**: Pesan error yang jelas
- **Progress indicator**: Animasi loading

## 🔧 Troubleshooting

### **Error: Module not found 'xlsx'**

```bash
npm install xlsx @types/xlsx
```

### **Error: Cannot read property of undefined**

- Pastikan data tidak null/undefined
- Tambahkan null checking di template

### **File tidak ter-download**

- Check browser popup blocker
- Pastikan HTTPS jika di production
- Verify file permissions

### **Styling tidak muncul**

- Update library xlsx ke versi terbaru
- Check browser compatibility
- Verify Excel version support

## 🚀 Future Enhancements

- [ ] **Chart integration** dalam Excel
- [ ] **Conditional formatting** otomatis
- [ ] **Template customization** via UI
- [ ] **Batch export** multiple files
- [ ] **Email integration** kirim langsung
- [ ] **Cloud storage** integration
- [ ] **Print optimization** layout

## 📞 Support

Jika ada masalah dengan export Excel:

1. Check console untuk error messages
2. Verify data format sesuai interface
3. Test dengan data sample kecil
4. Contact developer untuk assistance

---

**Template Excel TPQ Baitus Shuffah** - Modern, Professional, User-Friendly 🎉
