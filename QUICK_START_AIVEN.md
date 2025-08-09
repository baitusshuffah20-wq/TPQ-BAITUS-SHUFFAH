# Quick Start: Setup Aiven untuk TPQ Baitus Shuffah

## 🚀 Langkah Cepat (3 Menit)

Database Aiven Anda sudah siap! Tinggal setup aplikasi:

### 1. Dapatkan Password Aiven
1. Login ke [console.aiven.io](https://console.aiven.io/)
2. Pilih service MySQL: **mysql-175b5c3d-baitusshuffah20-3624**
3. Di tab "Overview", klik **"CLICK_TO:REVEAL_PASSWORD"**
4. **Copy password** yang muncul

### 2. Update File .env
File `.env` sudah dikonfigurasi dengan template Aiven. Anda hanya perlu:

1. **Ganti `YOUR_PASSWORD`** dengan password dari step 1
2. **Simpan file**

```env
DATABASE_URL="mysql://avnadmin:PASTE_PASSWORD_HERE@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"
```

### 3. Jalankan Setup Otomatis
```bash
npm run setup:aiven
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

## 📊 Database Info Anda

- **Host**: mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com
- **Port**: 28375
- **User**: avnadmin
- **Database**: defaultdb
- **SSL**: Required

---

## ❗ Troubleshooting

### Error: "Can't reach database server"
- ✅ Pastikan password benar (copy dari Aiven dashboard)
- ✅ Periksa IP whitelist di Aiven console
- ✅ Pastikan service MySQL aktif

### Error: "Access denied"
- ✅ Double-check username dan password
- ✅ Pastikan user `avnadmin` memiliki permission

### Error: "SSL connection required"
- ✅ Pastikan ada `?ssl-mode=REQUIRED` di connection string
- ✅ Aiven selalu memerlukan SSL

### Error: "Too many connections"
- ✅ Tutup koneksi yang tidak terpakai
- ✅ Monitor active connections di Aiven dashboard

---

## 🌟 Keuntungan Aiven

1. **Enterprise-grade**: Production-ready database
2. **Auto-backup**: Backup otomatis setiap hari
3. **Monitoring**: Dashboard monitoring real-time
4. **Security**: SSL/TLS encryption, compliance
5. **Scaling**: Easy vertical/horizontal scaling
6. **Multi-cloud**: Support AWS, GCP, Azure
7. **24/7 Support**: Professional support available

---

## 🔧 Monitoring Database

### Aiven Dashboard
- **Performance**: CPU, Memory, Disk usage
- **Connections**: Active connections monitoring
- **Queries**: Slow query analysis
- **Backups**: Backup status dan schedule

### Akses Dashboard
1. Login ke [console.aiven.io](https://console.aiven.io/)
2. Pilih service MySQL Anda
3. Explore tabs: Overview, Metrics, Logs, Backups

---

## 🚀 Deploy ke Vercel

### Environment Variables
Di Vercel dashboard, tambahkan:

```env
DATABASE_URL="mysql://avnadmin:YOUR_PASSWORD@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"
```

### Steps
1. Masuk ke Vercel project dashboard
2. Settings → Environment Variables
3. Add `DATABASE_URL` dengan value dari Aiven
4. Deploy ulang aplikasi

---

## 🔐 Security Best Practices

1. **Password**: Gunakan password yang kuat
2. **IP Whitelist**: Batasi akses berdasarkan IP
3. **SSL**: Selalu gunakan SSL (sudah default di Aiven)
4. **Monitoring**: Monitor aktivitas database secara berkala
5. **Backup**: Pastikan backup berjalan dengan baik

---

## 📚 Dokumentasi Lengkap

Untuk panduan detail, lihat: `AIVEN_SETUP.md`

---

## 🆘 Butuh Bantuan?

1. Cek [Aiven Documentation](https://docs.aiven.io/)
2. Contact [Aiven Support](https://aiven.io/support)
3. Buka issue di repository ini

---

## 🎯 Next Steps

Setelah database setup:

1. **Test aplikasi**: `npm run dev`
2. **Monitor performance**: Aiven dashboard
3. **Setup backup alerts**: Di Aiven console
4. **Configure production**: Environment variables
5. **Deploy**: Ke Vercel atau platform lain
