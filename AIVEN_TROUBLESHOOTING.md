# Aiven Database Troubleshooting Guide

## 🔍 Common Errors and Solutions

### Error: Authentication failed (P1000)

**Error Message:**
```
Authentication failed against database server at mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com, the provided database credentials for avnadmin are not valid.
```

**Cause:** Password expired or incorrect

**Solutions:**

#### Option 1: Get Current Password
1. Login to [Aiven Console](https://console.aiven.io/)
2. Select service: **mysql-175b5c3d-baitusshuffah20-3624**
3. Click **"Overview"** tab
4. Click **"CLICK_TO:REVEAL_PASSWORD"** in Service URI
5. Copy the revealed password

#### Option 2: Reset Password
1. Login to [Aiven Console](https://console.aiven.io/)
2. Select your MySQL service
3. Click **"Users"** tab
4. Select user **"avnadmin"**
5. Click **"Reset Password"**
6. Copy the new password

#### Option 3: Create New User
1. Go to **"Users"** tab in Aiven console
2. Click **"Add User"**
3. Create new user with admin privileges
4. Use new credentials

### Error: Can't reach database server (P1001)

**Error Message:**
```
Can't reach database server at mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com
```

**Possible Causes:**
- Internet connection issues
- Aiven service is down
- Firewall blocking connection
- Wrong host/port

**Solutions:**
1. Check internet connection
2. Verify Aiven service status in console
3. Check firewall settings
4. Verify host and port in connection string

### Error: SSL connection required

**Error Message:**
```
SSL connection is required
```

**Solution:**
Ensure connection string includes `?ssl-mode=REQUIRED`:
```
mysql://avnadmin:password@host:28375/defaultdb?ssl-mode=REQUIRED
```

## 🔧 Testing Tools

### 1. Test Database Connection
```bash
node test-database-connection.js
```

### 2. Manual Connection Test
```bash
# Using MySQL CLI (if installed)
mysql -h mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com -P 28375 -u avnadmin -p defaultdb --ssl-mode=REQUIRED
```

### 3. Prisma Connection Test
```bash
npx prisma db pull
```

## 📋 Connection String Format

**Correct Format:**
```
mysql://username:password@host:port/database?ssl-mode=REQUIRED
```

**Your Aiven Details:**
- **Host:** mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com
- **Port:** 28375
- **User:** avnadmin
- **Database:** defaultdb
- **SSL:** Required

**Example:**
```
mysql://avnadmin:your_password_here@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED
```

## 🔄 Update Process

### Local Development
1. Get new password from Aiven console
2. Update `.env` file:
   ```env
   DATABASE_URL="mysql://avnadmin:NEW_PASSWORD@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"
   ```
3. Restart development server: `npm run dev`

### Vercel Production
1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **TPQ-BAITUS-SHUFFAH**
3. Go to **Settings** → **Environment Variables**
4. Update `DATABASE_URL` with new password
5. Redeploy application

### Environment Variables Checklist
- [ ] `DATABASE_URL` updated with correct password
- [ ] SSL mode included: `?ssl-mode=REQUIRED`
- [ ] Host and port correct
- [ ] Database name is `defaultdb`
- [ ] User is `avnadmin`

## 🆘 Emergency Recovery

If you lose access completely:

### 1. Check Aiven Service Status
- Login to Aiven console
- Verify service is running
- Check for maintenance notifications

### 2. Contact Aiven Support
- Available 24/7 for paid plans
- Use support chat in Aiven console
- Provide service details: mysql-175b5c3d-baitusshuffah20-3624

### 3. Backup Options
- Aiven automatically backs up data
- Point-in-time recovery available
- Download backups from console

## 📞 Support Resources

- **Aiven Documentation:** https://docs.aiven.io/
- **Aiven Support:** Available in console chat
- **Community Forum:** https://aiven.io/community
- **Status Page:** https://status.aiven.io/

## 🔍 Monitoring

### Regular Checks
- Monitor connection in Aiven console
- Set up alerts for service issues
- Check performance metrics
- Review backup status

### Performance Optimization
- Monitor slow queries
- Check connection pool usage
- Review database size
- Optimize indexes if needed
