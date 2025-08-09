# Setup Database PlanetScale untuk TPQ Baitus Shuffah

## Langkah 1: Buat Akun PlanetScale

1. Kunjungi [PlanetScale](https://planetscale.com)
2. Daftar akun baru atau login jika sudah punya akun
3. Buat database baru dengan nama `tpq-baitus-shuffah`

## Langkah 2: Buat Branch Database

1. Di dashboard PlanetScale, pilih database yang baru dibuat
2. Buat branch baru bernama `main` (jika belum ada)
3. Buat branch development bernama `dev` untuk testing

## Langkah 3: Dapatkan Connection String

1. Di dashboard database, klik tab "Connect"
2. Pilih "Prisma" sebagai framework
3. Pilih branch yang ingin digunakan (main untuk production, dev untuk development)
4. Copy connection string yang diberikan

Format connection string PlanetScale:
```
mysql://username:password@host.connect.psdb.cloud/database_name?sslaccept=strict
```

## Langkah 4: Update File .env

Ganti konfigurasi database di file `.env` dengan connection string dari PlanetScale:

```env
# Database Configuration - PlanetScale MySQL
DATABASE_URL="mysql://username:password@host.connect.psdb.cloud/database_name?sslaccept=strict"

# PlanetScale Configuration
PLANETSCALE_DATABASE_URL="mysql://username:password@host.connect.psdb.cloud/database_name?sslaccept=strict"
PLANETSCALE_HOST="host.connect.psdb.cloud"
PLANETSCALE_USERNAME="username"
PLANETSCALE_PASSWORD="password"
PLANETSCALE_DATABASE="database_name"
```

**Catatan:** Ganti `username`, `password`, `host`, dan `database_name` dengan nilai sebenarnya dari PlanetScale.

## Langkah 5: Update Schema Prisma

Schema sudah diupdate dengan konfigurasi PlanetScale:

```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
```

`relationMode = "prisma"` diperlukan karena PlanetScale tidak mendukung foreign key constraints.

## Langkah 6: Generate dan Push Schema

Jalankan perintah berikut secara berurutan:

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Jalankan seeding
npm run db:seed
```

## Langkah 7: Verifikasi Koneksi

Setelah setup selesai, verifikasi koneksi dengan:

```bash
# Buka Prisma Studio
npm run db:studio
```

## Keuntungan PlanetScale

1. **Serverless**: Tidak perlu mengelola server database
2. **Branching**: Seperti Git untuk database
3. **Auto-scaling**: Otomatis menyesuaikan dengan traffic
4. **Backup otomatis**: Data aman dengan backup berkala
5. **Global edge**: Performa cepat di seluruh dunia
6. **Free tier**: Gratis untuk development dan small projects

## Troubleshooting

### Error: Can't reach database server
- Pastikan connection string benar
- Periksa apakah database branch aktif
- Coba regenerate password di PlanetScale dashboard

### Error: Foreign key constraint
- Pastikan `relationMode = "prisma"` ada di schema.prisma
- Jalankan `npm run db:generate` setelah mengubah schema

### Error: SSL connection
- Pastikan parameter `?sslaccept=strict` ada di connection string
- PlanetScale memerlukan SSL connection

## Migrasi dari Database Lain

Jika migrasi dari database lain:

1. Export data dari database lama
2. Setup PlanetScale seperti langkah di atas
3. Import data ke PlanetScale
4. Update connection string
5. Test aplikasi

## Production Deployment

Untuk production:

1. Gunakan branch `main` di PlanetScale
2. Set environment variables di platform deployment (Vercel, Netlify, dll)
3. Pastikan connection string production aman
4. Monitor performa di PlanetScale dashboard

## Monitoring dan Maintenance

1. **Dashboard PlanetScale**: Monitor query performance dan usage
2. **Insights**: Lihat slow queries dan optimization suggestions
3. **Branching**: Gunakan branch untuk testing schema changes
4. **Backup**: PlanetScale otomatis backup, tapi bisa manual backup juga

## Contoh Environment Variables untuk Deployment

```env
# Production
DATABASE_URL="mysql://prod_user:prod_pass@prod-host.connect.psdb.cloud/tpq_production?sslaccept=strict"

# Development
DATABASE_URL="mysql://dev_user:dev_pass@dev-host.connect.psdb.cloud/tpq_development?sslaccept=strict"
```

## Support dan Dokumentasi

- [PlanetScale Documentation](https://planetscale.com/docs)
- [Prisma with PlanetScale](https://www.prisma.io/docs/guides/database/planetscale)
- [PlanetScale Community](https://github.com/planetscale/discussion)
