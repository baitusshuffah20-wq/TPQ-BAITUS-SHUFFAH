# Setup Database Aiven untuk TPQ Baitus Shuffah

## 🎯 Konfigurasi Database Aiven

Berdasarkan informasi database Aiven Anda:

- **Host**: mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com
- **Port**: 28375
- **User**: avnadmin
- **Database**: defaultdb
- **SSL Mode**: REQUIRED

## 🚀 Langkah Setup

### 1. Update File .env

File `.env` sudah dikonfigurasi dengan template Aiven. Anda hanya perlu:

1. **Ganti `YOUR_PASSWORD`** dengan password sebenarnya dari Aiven dashboard
2. **Simpan file**

```env
# Database Configuration - Aiven MySQL
DATABASE_URL="mysql://avnadmin:YOUR_ACTUAL_PASSWORD@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Push Schema ke Database

```bash
npm run db:push
```

### 4. Jalankan Database Seeding

```bash
npm run db:seed
```

### 5. Verifikasi dengan Prisma Studio

```bash
npm run db:studio
```

## 🔧 Script Setup Otomatis

Saya akan membuat script setup otomatis untuk Aiven:

```bash
npm run setup:aiven
```

## ✅ Keuntungan Aiven

1. **Enterprise-grade**: Database production-ready
2. **Multi-cloud**: Support AWS, GCP, Azure
3. **Auto-backup**: Backup otomatis dan point-in-time recovery
4. **Monitoring**: Dashboard monitoring lengkap
5. **Security**: SSL/TLS encryption, VPC peering
6. **Scaling**: Easy vertical dan horizontal scaling
7. **Compliance**: SOC 2, ISO 27001, GDPR compliant

## 🔐 Security Features

- **SSL/TLS Encryption**: Semua koneksi terenkripsi
- **IP Whitelisting**: Kontrol akses berdasarkan IP
- **User Management**: Role-based access control
- **Audit Logs**: Log semua aktivitas database

## 📊 Monitoring & Maintenance

### Dashboard Aiven
- **Performance Metrics**: CPU, Memory, Disk usage
- **Query Analytics**: Slow query detection
- **Connection Monitoring**: Active connections tracking
- **Backup Status**: Backup schedule dan status

### Alerts
- Setup alerts untuk:
  - High CPU usage
  - Low disk space
  - Connection limits
  - Backup failures

## 🌍 Deployment ke Vercel

### Environment Variables untuk Vercel

```bash
# Production
DATABASE_URL="mysql://avnadmin:password@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"

# Development (bisa buat database terpisah)
DATABASE_URL="mysql://avnadmin:password@mysql-dev-host.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"
```

### Setup di Vercel Dashboard

1. Masuk ke Vercel project dashboard
2. Klik "Settings" → "Environment Variables"
3. Tambahkan `DATABASE_URL` dengan value dari Aiven
4. Deploy ulang aplikasi

## 🔄 Migration dari Database Lain

Jika migrasi dari database lain:

1. **Export data** dari database lama
2. **Setup Aiven** seperti langkah di atas
3. **Import data** ke Aiven
4. **Update connection string**
5. **Test aplikasi**

## 📋 Troubleshooting

### Error: "Can't reach database server"
- ✅ Pastikan password benar
- ✅ Cek IP whitelist di Aiven dashboard
- ✅ Pastikan SSL mode REQUIRED

### Error: "SSL connection required"
- ✅ Pastikan ada `?ssl-mode=REQUIRED` di connection string
- ✅ Aiven selalu memerlukan SSL

### Error: "Access denied"
- ✅ Cek username dan password
- ✅ Pastikan user memiliki permission ke database

### Error: "Too many connections"
- ✅ Cek connection pool settings
- ✅ Monitor active connections di dashboard

## 🎯 Best Practices

### Connection Pooling
```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Environment-specific Databases
- **Production**: Database utama
- **Staging**: Database terpisah untuk testing
- **Development**: Local database atau database dev

### Backup Strategy
- **Automated backups**: Enabled di Aiven
- **Manual backups**: Sebelum deployment besar
- **Point-in-time recovery**: Available di Aiven

## 📞 Support

- **Aiven Support**: Available 24/7 untuk paid plans
- **Documentation**: [Aiven Docs](https://docs.aiven.io/)
- **Community**: [Aiven Community](https://aiven.io/community)

## 🔑 Login Credentials Setelah Seeding

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@tpqbaitusshuffah.com | admin123 |
| **Musyrif** | ustadz.abdullah@rumahtahfidz.com | musyrif123 |
| **Wali** | bapak.ahmad@gmail.com | wali123 |
