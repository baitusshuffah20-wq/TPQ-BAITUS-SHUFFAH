# Workaround untuk Kategori Donasi

Dokumen ini menjelaskan solusi sementara untuk menangani kategori donasi tanpa mengubah struktur database.

## Masalah

Kita ingin menyimpan informasi kategori donasi, tetapi tidak dapat menambahkan kolom `categoryId` ke tabel `Donation` karena keterbatasan dalam menjalankan migrasi Prisma.

## Solusi

Kita menggunakan field `type` yang sudah ada di tabel `Donation` untuk menyimpan informasi kategori dengan format:

```
categoryId:categoryName
```

Contoh: `general:Donasi Umum`

## Implementasi

1. Saat membuat donasi, kita menyimpan ID kategori dan nama kategori dalam field `type`:

```typescript
const donationCreateData = {
  // ...other fields
  type: `${categoryId}:${categoryName}`,
  // ...other fields
};
```

2. Saat menampilkan donasi, kita memisahkan informasi kategori:

```typescript
// Parsing category info from type field
const parseCategory = (typeField: string) => {
  if (typeField.includes(':')) {
    const [categoryId, categoryName] = typeField.split(':');
    return { categoryId, categoryName };
  }
  return { categoryId: typeField, categoryName: typeField };
};

const { categoryId, categoryName } = parseCategory(donation.type);
```

## Keuntungan

1. Tidak perlu mengubah struktur database
2. Kompatibel dengan kode yang sudah ada
3. Mudah diimplementasikan

## Kekurangan

1. Tidak optimal dari segi desain database
2. Tidak dapat membuat relasi langsung ke tabel kategori
3. Memerlukan parsing tambahan saat membaca data

## Rencana Jangka Panjang

Ketika memungkinkan untuk menjalankan migrasi database, kita akan:

1. Menambahkan kolom `categoryId` ke tabel `Donation`
2. Memigrasikan data dari format gabungan ke kolom terpisah
3. Memperbarui kode untuk menggunakan kolom baru

## Catatan Implementasi

Kode yang menggunakan solusi ini dapat ditemukan di:

- `src/app/api/payment/create/route.ts`
- `src/components/sections/DonationSection.tsx`