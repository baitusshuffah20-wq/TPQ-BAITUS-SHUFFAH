# Dokumentasi Tingkat Tinggi: Perbaikan Visibilitas Tombol

## Ringkasan

Dokumen ini merangkum perubahan kode yang difokuskan pada peningkatan visibilitas dan aksesibilitas tombol di aplikasi. Perubahan ini berorientasi pada penyelesaian masalah tombol yang tampak kurang jelas karena aspek visual seperti kontras warna, ketebalan border, dan efek bayangan yang tidak cukup kuat.

## Masalah Utama yang Diatasi

- Kontras warna tombol dengan latar belakang dan teks rendah.
- Border tombol tipis atau tidak ada sehingga batas tombol tidak terlihat jelas.
- Efek bayangan (shadow) yang kurang tegas, membuat tombol menyatu dengan latar belakang.
- Pemilihan warna tombol utama (seperti terlalu terang) yang menyebabkan kesulitan dalam pembacaan.

## Perbaikan Utama yang Diimplementasikan

1. **Revisi Varian Warna pada Komponen Button**
   - Warna-warna tombol (primary, secondary, accent, danger, info, outline, ghost) diganti ke warna lebih gelap/tegas untuk memastikan kontras yang baik dengan teks tombol.
   - Semua varian kini menggunakan border dan shadow default yang lebih terlihat.
   - Outline dan ghost ditingkatkan ketebalan bordernya agar tetap jelas pada latar terang.

2. **Penambahan CSS Global**
   - Override CSS pada elemen `<button>` dengan border lebih tebal dan shadow ringan untuk menambah kejelasan bentuk tombol.
   - Aturan khusus untuk tombol warna terang seperti putih, supaya tetap terlihat pada berbagai latar belakang aplikasi.
   - Penyesuaian styling pada tombol dengan warna custom tertentu agar tetap konsisten dan sesuai standar visibilitas.
3. **Perbaikan Khusus Halaman Admin**
   - Tombol di admin diberi border tebal dan shadow lebih tegas untuk membedakannya dengan elemen lain.
   - Warna border dan teks diperkuat mengikuti tema warna aplikasi.

4. **Perbaikan Khusus Halaman Santri**
   - Tombol yang semula varian `outline` diubah ke varian dengan dasar warna lebih kuat (misal: info, primary) agar lebih kontras.
   - Penambahan shadow menambah efek “angkat” pada tombol untuk menarik perhatian pengguna.

## Dampak Perubahan

- Visibilitas tombol meningkat signifikan di seluruh aplikasi, baik untuk versi desktop maupun mobile.
- Konsistensi visual tombol lebih terjaga sehingga pengalaman pengguna menjadi lebih baik.
- Tombol lebih mudah diidentifikasi, dibedakan, dan digunakan bahkan oleh pengguna dengan kebutuhan aksesibilitas khusus.

## Rekomendasi Lanjutan

- Lakukan pengujian aksesibilitas (misal dengan alat seperti Lighthouse/Wave) untuk memastikan standar kontras minimal tercapai.
- Pastikan keputusan penggunaan varian tombol terdokumentasi jelas untuk pengembangan berikutnya.
- Tingkatkan feedback visual pada interaksi (hover, focus, active) serta pertimbangkan efek tambahan seperti ripple untuk pengalaman pengguna yang lebih menarik.

---

**Kesimpulan:**  
Perubahan kode ini adalah langkah strategis untuk meningkatkan kegunaan antarmuka dengan mengutamakan visibilitas, konsistensi, dan aksesibilitas tombol, memastikan aplikasi mudah digunakan oleh semua kalangan pengguna.
