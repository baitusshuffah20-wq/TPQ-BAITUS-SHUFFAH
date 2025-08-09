# Quick Start: Setup PlanetScale untuk TPQ Baitus Shuffah

## 🚀 Langkah Cepat (5 Menit)

### 1. Buat Database PlanetScale
1. Kunjungi [planetscale.com](https://planetscale.com) dan daftar/login
2. Klik "Create database"
3. Nama database: `tpq-baitus-shuffah`
4. Region: pilih yang terdekat (Singapore untuk Indonesia)
5. Klik "Create database"

### 2. Dapatkan Connection String
1. Di dashboard database, klik tab **"Connect"**
2. Pilih **"Prisma"** sebagai framework
3. Pilih branch **"main"**
4. **Copy** connection string yang muncul

### 3. Update File .env
```bash
# Backup file .env lama
cp .env .env.backup

# Copy template PlanetScale
cp .env.planetscale.example .env
```

Kemudian edit file `.env` dan ganti `DATABASE_URL` dengan connection string dari PlanetScale:

```env
DATABASE_URL="mysql://your_username:your_password@your_host.connect.psdb.cloud/your_database?sslaccept=strict"
```

### 4. Jalankan Setup Otomatis
```bash
npm run setup:planetscale
```

**SELESAI!** 🎉

---

## 📋 Manual Setup (Jika Otomatis Gagal)

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Push Schema ke Database
```bash
npm run db:push
```

### 3. Jalankan Seeding
```bash
npm run db:seed
```

### 4. Buka Prisma Studio (Optional)
```bash
npm run db:studio
```

---

## 🔑 Login Credentials Setelah Seeding

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@tpqbaitusshuffah.com | admin123 |
| **Musyrif** | ustadz.abdullah@rumahtahfidz.com | musyrif123 |
| **Wali** | bapak.ahmad@gmail.com | wali123 |

---

## ❗ Troubleshooting

### Error: "Can't reach database server"
- ✅ Pastikan connection string benar
- ✅ Periksa database aktif di PlanetScale dashboard
- ✅ Coba regenerate password di PlanetScale

### Error: "Foreign key constraint"
- ✅ Pastikan `relationMode = "prisma"` ada di schema.prisma
- ✅ Jalankan `npm run db:generate` lagi

### Error: "SSL connection required"
- ✅ Pastikan ada `?sslaccept=strict` di connection string

---

## 🌟 Tips PlanetScale

1. **Branching**: Gunakan branch `dev` untuk development
2. **Monitoring**: Cek dashboard untuk query performance
3. **Backup**: PlanetScale otomatis backup setiap hari
4. **Scaling**: Database otomatis scale sesuai traffic

---

## 📚 Dokumentasi Lengkap

Untuk panduan detail, lihat: `PLANETSCALE_SETUP.md`

---

## 🆘 Butuh Bantuan?

1. Cek [PlanetScale Docs](https://planetscale.com/docs)
2. Cek [Prisma + PlanetScale Guide](https://www.prisma.io/docs/guides/database/planetscale)
3. Buka issue di repository ini
