# Deployment Guide - TPQ Baitus Shuffah

## Vercel Deployment

### 1. Environment Variables Setup

Login ke Vercel Dashboard dan tambahkan environment variables berikut:

#### Database Configuration
```
DATABASE_URL = mysql://username:password@hostname:port/database?sslaccept=strict
```

**Note**: Replace with your actual database credentials from your cloud provider.

#### Authentication
```
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = your-secret-key-here-minimum-32-characters
```

#### Application Settings
```
NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME = TPQ Baitus Shuffah
```

#### Optional Settings
```
NEXT_TELEMETRY_DISABLED = 1
NODE_ENV = production
```

### 2. Database Setup

#### Option A: Aiven MySQL (Recommended)
1. Create account at https://aiven.io
2. Create MySQL service
3. Copy connection details
4. Update DATABASE_URL in Vercel

#### Option B: Railway MySQL (Alternative)
1. Go to https://railway.app
2. Create new project → Deploy MySQL
3. Copy connection string
4. Update DATABASE_URL in Vercel

#### Option C: PlanetScale (Alternative)
1. Go to https://planetscale.com
2. Create new database
3. Copy connection string
4. Update DATABASE_URL in Vercel

### 3. Deployment Steps

1. **Push to GitHub** (already done)
2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Import project from GitHub
   - Select TPQ-BAITUS-SHUFFAH repository
3. **Configure Environment Variables** (see above)
4. **Deploy**

### 4. Post-Deployment

After successful deployment:
1. Run database migrations (Prisma will handle this automatically)
2. Test the application
3. Setup custom domain (optional)

### 5. Troubleshooting

#### Build Errors
- Check environment variables are set correctly
- Ensure DATABASE_URL is accessible from Vercel
- Check build logs for specific errors

#### Database Connection Issues
- Verify database service is running
- Check firewall/IP whitelist settings
- Test connection string locally first

#### SSL/TLS Issues
- Try different SSL parameters: `?sslaccept=strict` or `?ssl-mode=REQUIRED`
- For development, you can use `?sslaccept=false` (not recommended for production)

### 6. Alternative Database Providers

If your current provider doesn't work, try these alternatives:

1. **Railway** (Recommended)
   - Free tier available
   - Easy setup
   - Good performance

2. **PlanetScale**
   - Serverless MySQL
   - Free tier
   - Excellent for production

3. **Supabase**
   - PostgreSQL (requires schema changes)
   - Free tier
   - Built-in auth

4. **MongoDB Atlas**
   - NoSQL option
   - Requires schema conversion
   - Free tier available
