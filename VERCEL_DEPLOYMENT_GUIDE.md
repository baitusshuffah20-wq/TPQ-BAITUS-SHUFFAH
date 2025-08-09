# Panduan Deploy ke Vercel dengan Database Aiven

## 🚀 Langkah Deploy ke Vercel

### 1. Update Environment Variables di Vercel Dashboard

1. **Login ke Vercel**: [vercel.com](https://vercel.com)
2. **Pilih Project**: TPQ-BAITUS-SHUFFAH
3. **Masuk ke Settings**: Klik tab "Settings"
4. **Environment Variables**: Klik "Environment Variables" di sidebar

### 2. Tambahkan/Update Environment Variables

Tambahkan environment variables berikut:

```env
# Database Configuration - Aiven MySQL
DATABASE_URL=mysql://avnadmin:YOUR_AIVEN_PASSWORD@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED

# Next.js Configuration
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
NEXTAUTH_SECRET=tpq-baitus-shuffah-secret-key-2024-production

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
NEXT_PUBLIC_APP_NAME=TPQ Baitus Shuffah

# Security
JWT_SECRET=tpq-jwt-secret-key-2024-production
ENCRYPTION_KEY=tpq-encryption-key-2024-production

# Environment
NODE_ENV=production
```

### 3. Set Environment untuk Semua Environments

Pastikan environment variables di-set untuk:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 4. Trigger Redeploy

Setelah update environment variables:
1. **Klik "Deployments"** tab
2. **Pilih deployment terakhir**
3. **Klik "Redeploy"** atau push commit baru

## 🔧 Troubleshooting

### Error: Can't reach database server

**Penyebab**: Environment variables masih menggunakan Railway URL

**Solusi**:
1. Pastikan `DATABASE_URL` sudah diupdate ke Aiven
2. Pastikan tidak ada environment variables Railway yang tersisa
3. Redeploy setelah update

### Error: Authentication failed

**Penyebab**: Password Aiven salah atau expired

**Solusi**:
1. Cek password di Aiven dashboard
2. Regenerate password jika perlu
3. Update `DATABASE_URL` dengan password baru

### Error: SSL connection required

**Penyebab**: Missing SSL parameter

**Solusi**:
Pastikan `DATABASE_URL` mengandung `?ssl-mode=REQUIRED`

## 📋 Checklist Deploy

- [ ] Environment variables updated di Vercel
- [ ] `DATABASE_URL` mengarah ke Aiven
- [ ] `NEXTAUTH_URL` sesuai dengan domain Vercel
- [ ] `NEXTAUTH_SECRET` menggunakan production secret
- [ ] Semua environments (Production/Preview/Development) ter-set
- [ ] Redeploy triggered
- [ ] Database connection test berhasil

## 🔗 URLs Penting

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Aiven Console**: https://console.aiven.io/
- **GitHub Repository**: https://github.com/baitusshuffah20-wq/TPQ-BAITUS-SHUFFAH

## 📞 Support

Jika masih ada masalah:
1. Cek Vercel deployment logs
2. Cek Aiven service status
3. Verify environment variables
4. Test database connection locally

## 🎯 Expected Result

Setelah deploy berhasil:
- ✅ Aplikasi dapat diakses di Vercel URL
- ✅ Database connection ke Aiven berhasil
- ✅ Login system berfungsi
- ✅ Program management accessible
- ✅ All features working properly
