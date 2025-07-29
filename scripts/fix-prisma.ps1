# PowerShell script to fix Prisma issues on Windows
# Author: PureCode AI
# Date: 2024

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to display colored text
function Write-ColoredText {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Text,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Text -ForegroundColor $ForegroundColor
}

# Display header
Write-ColoredText "===== Prisma Fix Script for Windows =====" -ForegroundColor Cyan
Write-ColoredText "This script will fix common Prisma issues on Windows systems" -ForegroundColor Cyan
Write-ColoredText "----------------------------------------" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-ColoredText "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-ColoredText "Error: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-ColoredText "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-ColoredText "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-ColoredText "Error: npm is not installed or not in PATH!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-ColoredText ".env file found" -ForegroundColor Green
} else {
    Write-ColoredText "Warning: .env file not found!" -ForegroundColor Yellow
    
    # Check if .env.example exists
    if (Test-Path ".env.example") {
        Write-ColoredText "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-ColoredText ".env file created. Please update it with your database credentials." -ForegroundColor Green
    } else {
        Write-ColoredText "Error: .env.example file not found!" -ForegroundColor Red
        exit 1
    }
}

# Clean Prisma cache
Write-ColoredText "`nCleaning Prisma cache..." -ForegroundColor Cyan

$cachePaths = @(
    "node_modules\.prisma",
    "node_modules\@prisma\client",
    ".next\cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Write-ColoredText "Removing $path..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        } catch {
            Write-ColoredText "Warning: Could not remove $path. It may be in use." -ForegroundColor Yellow
        }
    }
}

Write-ColoredText "Prisma cache cleaned" -ForegroundColor Green

# Reinstall Prisma dependencies
Write-ColoredText "`nReinstalling Prisma dependencies..." -ForegroundColor Cyan

# Uninstall Prisma dependencies
Write-ColoredText "Uninstalling @prisma/client and prisma..." -ForegroundColor Yellow
npm uninstall @prisma/client prisma

# Install Prisma dependencies
Write-ColoredText "Installing @prisma/client..." -ForegroundColor Yellow
npm install @prisma/client

Write-ColoredText "Installing prisma as dev dependency..." -ForegroundColor Yellow
npm install prisma --save-dev

Write-ColoredText "Prisma dependencies reinstalled" -ForegroundColor Green

# Generate Prisma client
Write-ColoredText "`nGenerating Prisma client..." -ForegroundColor Cyan
try {
    npx prisma generate
    Write-ColoredText "Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-ColoredText "Error generating Prisma client: $_" -ForegroundColor Red
    exit 1
}

# Test database connection
Write-ColoredText "`nTesting database connection..." -ForegroundColor Cyan
Write-ColoredText "Creating test script..." -ForegroundColor Yellow

$testFile = "prisma\test-connection.js"
$testCode = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Get database info
    const result = await prisma.$queryRaw\`SELECT VERSION() as version\`;
    console.log('Database version:', result[0].version);
    
    // Get table count
    const tables = await prisma.$queryRaw\`SHOW TABLES\`;
    console.log('Tables found:', tables.length);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
"@

# Create directory if it doesn't exist
if (-not (Test-Path "prisma")) {
    New-Item -ItemType Directory -Path "prisma" | Out-Null
}

# Write test file
Set-Content -Path $testFile -Value $testCode

# Run test file
try {
    Write-ColoredText "Running database connection test..." -ForegroundColor Yellow
    node $testFile
    Write-ColoredText "Database connection test successful" -ForegroundColor Green
} catch {
    Write-ColoredText "Database connection test failed: $_" -ForegroundColor Red
    Write-ColoredText "Please check your .env file and make sure your database is running" -ForegroundColor Yellow
}

# Clean up test file
if (Test-Path $testFile) {
    Remove-Item -Path $testFile -Force
}

# Ask if user wants to push schema to database
Write-ColoredText "`nDo you want to push the schema to the database? This will update your database schema. (y/n)" -ForegroundColor Yellow
$answer = Read-Host

if ($answer -eq "y") {
    Write-ColoredText "Pushing schema to database..." -ForegroundColor Cyan
    try {
        npx prisma db push
        Write-ColoredText "Schema pushed to database successfully" -ForegroundColor Green
    } catch {
        Write-ColoredText "Error pushing schema to database: $_" -ForegroundColor Red
    }
} else {
    Write-ColoredText "Schema push cancelled" -ForegroundColor Yellow
}

# Final message
Write-ColoredText "`n===== Prisma Fix Script Completed =====" -ForegroundColor Cyan
Write-ColoredText "If you still have issues, please check your database connection and .env file" -ForegroundColor Cyan