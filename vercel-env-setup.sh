#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set up environment variables for Vercel deployment

echo "🚀 Setting up Vercel Environment Variables for TPQ Baitus Shuffah"
echo "=================================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Setting up environment variables..."

# Database Configuration
vercel env add DATABASE_URL production
echo "Enter Aiven DATABASE_URL:"
echo "mysql://avnadmin:YOUR_AIVEN_PASSWORD@mysql-175b5c3d-baitusshuffah20-3624.b.aivencloud.com:28375/defaultdb?ssl-mode=REQUIRED"

# NextAuth Configuration
vercel env add NEXTAUTH_URL production
echo "Enter your Vercel app URL (e.g., https://your-app.vercel.app):"

vercel env add NEXTAUTH_SECRET production
echo "Enter NextAuth secret (use a strong random string):"

# Application Configuration
vercel env add NEXT_PUBLIC_APP_URL production
echo "Enter your public app URL (same as NEXTAUTH_URL):"

vercel env add NEXT_PUBLIC_APP_NAME production
echo "Enter app name (TPQ Baitus Shuffah):"

# Security
vercel env add JWT_SECRET production
echo "Enter JWT secret (use a strong random string):"

vercel env add ENCRYPTION_KEY production
echo "Enter encryption key (use a strong random string):"

# Environment
vercel env add NODE_ENV production
echo "Enter NODE_ENV (production):"

echo "✅ Environment variables setup complete!"
echo "🔄 Triggering redeploy..."

# Trigger redeploy
vercel --prod

echo "🎉 Deployment triggered! Check Vercel dashboard for status."
echo "📊 Monitor deployment at: https://vercel.com/dashboard"
