# Setup Vercel Environment Variables

## Required Environment Variables for Vercel Deployment

### 1. Database Configuration
```bash
DATABASE_URL=mysql://username:password@host:port/database
```

### 2. Next.js Configuration
```bash
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
NEXTAUTH_SECRET=tpq-baitus-shuffah-secret-key-2024
```

### 3. Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
NEXT_PUBLIC_APP_NAME=TPQ Baitus Shuffah
```

### 4. Security
```bash
JWT_SECRET=tpq-jwt-secret-key-2024
ENCRYPTION_KEY=tpq-encryption-key-2024
```

### 5. Environment
```bash
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
```

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Go to Settings > Environment Variables
3. Add each variable above with their values
4. Make sure to select "Production", "Preview", and "Development" environments

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add DATABASE_URL
# Enter the database URL when prompted

vercel env add NEXTAUTH_SECRET
# Enter the secret when prompted

# Continue for all variables...
```

### Method 3: Using .env file (for reference only)
Create a `.env.production` file with all variables above, then use Vercel CLI to import:
```bash
vercel env pull .env.production
```

## Important Notes

1. **Never commit sensitive environment variables to Git**
2. **DATABASE_URL contains sensitive credentials - handle with care**
3. **Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL with your actual Vercel app URL**
4. **All environment variables must be set before deployment**

## Verification

After setting environment variables, you can verify them:
```bash
vercel env ls
```

This will list all environment variables for your project.
