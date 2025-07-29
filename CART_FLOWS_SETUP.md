# 🚀 Setup Guide - Cart Flows Transaksi TPQ Baitus Shuffah

## 📋 **Prerequisites**

Pastikan sistem Anda memiliki:

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, untuk caching)
- Git

## 🛠️ **Installation Steps**

### **1. Clone Repository**

```bash
git clone <repository-url>
cd tpq-baitus-shuffah
```

### **2. Install Dependencies**

#### **Web Application**

```bash
npm install
```

#### **Mobile Application**

```bash
cd mobile-app
npm install
cd ..
```

### **3. Environment Setup**

#### **Web App (.env.local)**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tpq_baitus_shuffah"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Payment Gateway
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"

# Xendit (Optional)
XENDIT_SECRET_KEY="your-xendit-secret-key"

# File Upload
UPLOAD_MAX_SIZE="5242880"  # 5MB
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,application/pdf"

# Email Service (Optional)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@tpqbaitusshuffah.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="TPQ Baitus Shuffah"
```

#### **Mobile App (.env)**

```env
API_BASE_URL="http://localhost:3000/api"
EXPO_PUBLIC_API_URL="http://localhost:3000/api"
```

### **4. Database Setup**

#### **Run Migrations**

```bash
npx prisma migrate deploy
npx prisma generate
```

#### **Seed Database (Optional)**

```bash
npx prisma db seed
```

### **5. Create Upload Directories**

```bash
mkdir -p public/uploads/payment-proofs
chmod 755 public/uploads
chmod 755 public/uploads/payment-proofs
```

### **6. Start Development Servers**

#### **Web Application**

```bash
npm run dev
```

#### **Mobile Application**

```bash
cd mobile-app
npm start
```

---

## 🧪 **Testing**

### **Run Tests**

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### **Test Coverage**

```bash
npm run test:coverage
```

---

## 🚀 **Production Deployment**

### **1. Build Applications**

#### **Web App**

```bash
npm run build
```

#### **Mobile App**

```bash
cd mobile-app
npm run build:android  # For Android
npm run build:ios      # For iOS
```

### **2. Environment Variables (Production)**

#### **Web App (.env.production)**

```env
# Database
DATABASE_URL="postgresql://username:password@prod-host:5432/tpq_baitus_shuffah"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# Payment Gateway
MIDTRANS_SERVER_KEY="your-production-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-production-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="true"

# File Upload
UPLOAD_MAX_SIZE="5242880"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,application/pdf"

# Email Service
SMTP_HOST="your-production-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-production-smtp-user"
SMTP_PASS="your-production-smtp-password"
SMTP_FROM="noreply@your-domain.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="TPQ Baitus Shuffah"
```

### **3. Server Configuration**

#### **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # File upload size limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads/ {
        alias /path/to/your/app/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **PM2 Configuration (ecosystem.config.js)**

```javascript
module.exports = {
  apps: [
    {
      name: "tpq-baitus-shuffah",
      script: "npm",
      args: "start",
      cwd: "/path/to/your/app",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/tpq-error.log",
      out_file: "/var/log/pm2/tpq-out.log",
      log_file: "/var/log/pm2/tpq-combined.log",
      time: true,
    },
  ],
};
```

### **4. Database Migration (Production)**

```bash
# Backup database first
pg_dump -h localhost -U username -d tpq_baitus_shuffah > backup.sql

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### **5. Start Production Server**

```bash
# Using PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Or using Docker
docker-compose up -d
```

---

## 🔧 **Configuration**

### **Payment Gateway Setup**

#### **Midtrans Configuration**

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Buat merchant account
3. Dapatkan Server Key dan Client Key
4. Set webhook URL: `https://your-domain.com/api/webhooks/midtrans`
5. Enable payment methods yang diinginkan

#### **Bank Account Setup**

Update bank account information di:

```typescript
// src/components/payment/UniversalCheckout.tsx
const bankAccounts = {
  MANUAL_BCA: {
    bank: "BCA",
    accountNumber: "YOUR_BCA_ACCOUNT",
    accountName: "YOUR_ACCOUNT_NAME",
  },
  MANUAL_MANDIRI: {
    bank: "Mandiri",
    accountNumber: "YOUR_MANDIRI_ACCOUNT",
    accountName: "YOUR_ACCOUNT_NAME",
  },
  // ... other banks
};
```

### **Email Configuration**

#### **SMTP Setup**

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="TPQ Baitus Shuffah <noreply@your-domain.com>"
```

#### **Email Templates**

Customize email templates di:

- `src/lib/email-templates/payment-confirmation.html`
- `src/lib/email-templates/payment-verification.html`

---

## 📱 **Mobile App Deployment**

### **Android**

```bash
cd mobile-app
npm run build:android
```

### **iOS**

```bash
cd mobile-app
npm run build:ios
```

### **App Store Configuration**

1. Update `app.json` dengan informasi aplikasi
2. Generate app icons dan splash screens
3. Configure push notifications
4. Submit ke Google Play Store / Apple App Store

---

## 🔍 **Monitoring & Maintenance**

### **Health Checks**

```bash
# Check application status
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/health/db

# Check payment gateway
curl https://your-domain.com/api/health/payment
```

### **Log Monitoring**

```bash
# Application logs
tail -f /var/log/pm2/tpq-combined.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

### **Backup Strategy**

```bash
# Daily database backup
0 2 * * * pg_dump -h localhost -U username -d tpq_baitus_shuffah > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly file backup
0 3 * * 0 tar -czf /backups/files-$(date +\%Y\%m\%d).tar.gz /path/to/app/public/uploads/

# Cleanup old backups (keep 30 days)
0 4 * * * find /backups -name "*.sql" -mtime +30 -delete
0 4 * * * find /backups -name "*.tar.gz" -mtime +30 -delete
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Payment Gateway Errors**

```bash
# Check Midtrans configuration
curl -X GET https://api.sandbox.midtrans.com/v2/ping \
  -H "Authorization: Basic $(echo -n 'YOUR_SERVER_KEY:' | base64)"
```

#### **File Upload Issues**

```bash
# Check upload directory permissions
ls -la public/uploads/
chmod 755 public/uploads/payment-proofs/
```

#### **Database Connection Issues**

```bash
# Test database connection
psql -h localhost -U username -d tpq_baitus_shuffah -c "SELECT 1;"
```

#### **Mobile App Issues**

```bash
# Clear Metro cache
cd mobile-app
npx react-native start --reset-cache

# Rebuild Android
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### **Performance Optimization**

#### **Database Optimization**

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);
CREATE INDEX idx_spp_records_santri_status ON spp_records(santri_id, status);
```

#### **Caching Setup (Redis)**

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis for sessions
# Add to .env.local
REDIS_URL="redis://localhost:6379"
```

---

## 📞 **Support**

Untuk bantuan teknis:

- 📧 Email: tech-support@tpqbaitusshuffah.com
- 📱 WhatsApp: +62 812-3456-7890
- 🌐 Documentation: https://docs.tpqbaitusshuffah.com

---

**✅ Setup selesai! Sistem cart flows transaksi siap digunakan.**
