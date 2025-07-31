# 📚 **PANDUAN DEPLOYMENT APLIKASI TPQ BAITUS SHUFFAH KE CPANEL**

## 🎯 **OVERVIEW**

Panduan ini menjelaskan langkah-langkah untuk deploy aplikasi Next.js TPQ Baitus Shuffah ke web hosting melalui cPanel.

## 📋 **PERSYARATAN**

### **Hosting Requirements:**
- **Node.js**: Versi 18.x atau lebih tinggi
- **MySQL Database**: Versi 8.0 atau lebih tinggi
- **Storage**: Minimal 1GB untuk aplikasi dan database
- **Memory**: Minimal 512MB RAM
- **SSL Certificate**: Untuk keamanan (recommended)

### **cPanel Features Required:**
- File Manager
- MySQL Databases
- Node.js App
- SSL/TLS
- Cron Jobs (optional untuk scheduled tasks)

## 🚀 **LANGKAH-LANGKAH DEPLOYMENT**

### **1. PERSIAPAN PROJECT**

#### **A. Build Production**
```bash
# Di local development
npm run build
npm run start  # Test production build
```

#### **B. Environment Variables**
Buat file `.env.production`:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Email (SMTP)
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-email-password"

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-webhook-token"

# Upload paths
UPLOAD_DIR="/home/username/public_html/uploads"
```

### **2. SETUP DATABASE DI CPANEL**

#### **A. Buat Database MySQL**
1. Login ke cPanel
2. Klik **MySQL Databases**
3. Buat database baru: `username_tpq_db`
4. Buat user database: `username_tpq_user`
5. Assign user ke database dengan **ALL PRIVILEGES**

#### **B. Import Database Schema**
1. Klik **phpMyAdmin**
2. Pilih database yang baru dibuat
3. Import file `prisma/schema.sql` (generate dulu dengan `npx prisma db push`)
4. Atau jalankan Prisma migrations:
```bash
npx prisma migrate deploy
```

### **3. UPLOAD FILES KE CPANEL**

#### **A. Compress Project**
```bash
# Exclude node_modules dan .next
tar -czf tpq-app.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .
```

#### **B. Upload via File Manager**
1. Login cPanel → **File Manager**
2. Navigate ke `public_html` atau subdomain folder
3. Upload `tpq-app.tar.gz`
4. Extract files
5. Set permissions: folders `755`, files `644`

### **4. SETUP NODE.JS APPLICATION**

#### **A. Create Node.js App**
1. cPanel → **Node.js App**
2. Klik **Create Application**
3. **Node.js Version**: 18.x atau terbaru
4. **Application Mode**: Production
5. **Application Root**: `/public_html` (atau subdomain path)
6. **Application URL**: domain atau subdomain
7. **Application Startup File**: `server.js`

#### **B. Install Dependencies**
```bash
# Di terminal cPanel atau SSH
cd /home/username/public_html
npm install --production
```

#### **C. Build Application**
```bash
npm run build
```

### **5. KONFIGURASI SERVER**

#### **A. Buat server.js**
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

#### **B. Update package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "next build"
  }
}
```

### **6. KONFIGURASI ENVIRONMENT**

#### **A. Set Environment Variables**
Di Node.js App settings, tambahkan:
- `NODE_ENV=production`
- `DATABASE_URL=mysql://...`
- `NEXTAUTH_URL=https://yourdomain.com`
- Dan semua env vars lainnya

#### **B. File Permissions**
```bash
chmod 755 public_html/
chmod 644 public_html/.env.production
chmod 755 public_html/uploads/
```

### **7. SSL CERTIFICATE**

#### **A. Install SSL**
1. cPanel → **SSL/TLS**
2. **Let's Encrypt** (gratis) atau upload custom certificate
3. Enable **Force HTTPS Redirect**

### **8. FINAL TESTING**

#### **A. Start Application**
1. Node.js App → **Start App**
2. Check application logs untuk errors
3. Test semua fitur utama

#### **B. Performance Optimization**
```bash
# Enable gzip compression di .htaccess
echo "
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
" > .htaccess
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Database Connection Error**
- Periksa DATABASE_URL format
- Pastikan user database memiliki privileges
- Check MySQL service status

#### **2. File Upload Issues**
```bash
# Set proper permissions
chmod 755 uploads/
chown username:username uploads/
```

#### **3. Memory Limit**
Di `.htaccess`:
```apache
php_value memory_limit 512M
php_value max_execution_time 300
```

#### **4. Node.js Version Issues**
- Pastikan menggunakan Node.js 18.x+
- Update package.json engines:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 📊 **MONITORING & MAINTENANCE**

### **A. Setup Cron Jobs**
```bash
# Backup database harian
0 2 * * * mysqldump -u username -p database_name > backup_$(date +\%Y\%m\%d).sql

# Clear logs mingguan  
0 0 * * 0 find /home/username/logs -name "*.log" -mtime +7 -delete
```

### **B. Log Monitoring**
- Check Node.js App logs regularly
- Monitor MySQL slow query log
- Setup error notifications

## 🎉 **SELESAI!**

Aplikasi TPQ Baitus Shuffah sekarang sudah live di hosting cPanel Anda!

**URL Akses:**
- **Frontend**: https://yourdomain.com
- **Admin Dashboard**: https://yourdomain.com/dashboard/admin
- **API**: https://yourdomain.com/api

**Default Admin Login:**
- Email: admin@tpq.com
- Password: (sesuai yang di-seed)

---

**📞 Support:**
Jika mengalami kendala, hubungi tim teknis atau buat issue di repository GitHub.
