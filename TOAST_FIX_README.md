# Perbaikan Error Toast

Dokumen ini menjelaskan perbaikan yang telah dilakukan untuk mengatasi error `TypeError: react_hot_toast__WEBPACK_IMPORTED_MODULE_9__.toast.info is not a function` pada halaman halaqah.

## Masalah yang Ditemukan

Error terjadi karena library react-hot-toast tidak memiliki fungsi `toast.info()`. Library ini memiliki fungsi-fungsi berikut:

- `toast()` - Toast dasar
- `toast.success()` - Toast sukses
- `toast.error()` - Toast error
- `toast.loading()` - Toast loading
- `toast.custom()` - Toast kustom
- `toast.dismiss()` - Menutup toast

Namun, tidak ada fungsi `toast.info()` yang digunakan dalam kode.

## Perubahan yang Dilakukan

File-file yang diperbarui:

- `src/app/dashboard/admin/halaqah/quran/page.tsx`
- `src/app/dashboard/admin/halaqah/tahsin/page.tsx`
- `src/app/dashboard/admin/halaqah/akhlak/page.tsx`

Perubahan:

- Mengganti `toast.info()` dengan `toast()` biasa dengan opsi tambahan
- Menambahkan ikon dan durasi untuk memberikan tampilan yang mirip dengan toast info

```javascript
// Sebelum
toast.info(
  "Menggunakan data halaqah sederhana karena ada masalah dengan data lengkap",
);
toast.info("Belum ada data halaqah tahsin. Silakan tambahkan halaqah baru.");

// Sesudah
toast(
  "Menggunakan data halaqah sederhana karena ada masalah dengan data lengkap",
  {
    icon: "ℹ️",
    duration: 4000,
  },
);

toast("Belum ada data halaqah tahsin. Silakan tambahkan halaqah baru.", {
  icon: "ℹ️",
  duration: 4000,
});
```

## Cara Menggunakan Toast

Berikut adalah cara yang benar untuk menggunakan toast dari library react-hot-toast:

```javascript
// Toast dasar
toast("Ini adalah pesan toast");

// Toast dengan ikon dan durasi
toast("Ini adalah pesan toast", {
  icon: "👍",
  duration: 4000,
});

// Toast sukses
toast.success("Operasi berhasil");

// Toast error
toast.error("Terjadi kesalahan");

// Toast loading
const toastId = toast.loading("Sedang memuat...");
// Kemudian, setelah selesai:
toast.dismiss(toastId);
```

## Referensi

- [Dokumentasi react-hot-toast](https://react-hot-toast.com/docs)
- [GitHub react-hot-toast](https://github.com/timolins/react-hot-toast)
