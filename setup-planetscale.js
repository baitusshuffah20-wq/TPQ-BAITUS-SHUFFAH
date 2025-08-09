#!/usr/bin/env node

/**
 * Setup script untuk PlanetScale Database
 * Script ini akan membantu setup database dan seeding untuk TPQ Baitus Shuffah
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue');
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    log(`✅ ${description} berhasil!`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${description} gagal!`, 'red');
    log(`Error details: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvFile() {
  const envPath = '.env';
  if (!fs.existsSync(envPath)) {
    log('❌ File .env tidak ditemukan!', 'red');
    log('Silakan buat file .env terlebih dahulu dengan connection string PlanetScale.', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('DATABASE_URL') || !envContent.includes('planetscale') && !envContent.includes('psdb.cloud')) {
    log('⚠️  File .env belum dikonfigurasi untuk PlanetScale!', 'yellow');
    log('Pastikan DATABASE_URL mengarah ke PlanetScale connection string.', 'yellow');
    return false;
  }

  log('✅ File .env sudah dikonfigurasi untuk PlanetScale', 'green');
  return true;
}

function checkPrismaSchema() {
  const schemaPath = 'prisma/schema.prisma';
  if (!fs.existsSync(schemaPath)) {
    log('❌ File prisma/schema.prisma tidak ditemukan!', 'red');
    return false;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (!schemaContent.includes('relationMode = "prisma"')) {
    log('⚠️  Schema Prisma belum dikonfigurasi untuk PlanetScale!', 'yellow');
    log('Menambahkan relationMode = "prisma" ke schema...', 'blue');
    
    const updatedSchema = schemaContent.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}`
    );
    
    fs.writeFileSync(schemaPath, updatedSchema);
    log('✅ Schema Prisma berhasil diupdate untuk PlanetScale', 'green');
  } else {
    log('✅ Schema Prisma sudah dikonfigurasi untuk PlanetScale', 'green');
  }
  
  return true;
}

async function main() {
  log('🚀 Setup PlanetScale Database untuk TPQ Baitus Shuffah', 'cyan');
  log('=' * 60, 'cyan');

  // Step 1: Check environment file
  log('\n📋 Step 1: Memeriksa konfigurasi environment...', 'magenta');
  if (!checkEnvFile()) {
    log('\n📖 Silakan ikuti panduan di PLANETSCALE_SETUP.md untuk setup connection string.', 'yellow');
    process.exit(1);
  }

  // Step 2: Check Prisma schema
  log('\n📋 Step 2: Memeriksa konfigurasi Prisma schema...', 'magenta');
  if (!checkPrismaSchema()) {
    process.exit(1);
  }

  // Step 3: Generate Prisma client
  log('\n📋 Step 3: Generate Prisma client...', 'magenta');
  if (!execCommand('npm run db:generate', 'Generate Prisma client')) {
    process.exit(1);
  }

  // Step 4: Push schema to database
  log('\n📋 Step 4: Push schema ke database PlanetScale...', 'magenta');
  if (!execCommand('npm run db:push', 'Push schema ke database')) {
    log('\n💡 Tips troubleshooting:', 'yellow');
    log('- Pastikan connection string PlanetScale benar', 'yellow');
    log('- Periksa apakah database branch aktif di PlanetScale dashboard', 'yellow');
    log('- Coba regenerate password di PlanetScale', 'yellow');
    process.exit(1);
  }

  // Step 5: Run seeding
  log('\n📋 Step 5: Menjalankan database seeding...', 'magenta');
  if (!execCommand('npm run db:seed', 'Database seeding')) {
    log('\n💡 Jika seeding gagal, coba jalankan manual:', 'yellow');
    log('npm run db:seed', 'yellow');
    process.exit(1);
  }

  // Success message
  log('\n🎉 Setup PlanetScale berhasil!', 'green');
  log('=' * 60, 'green');
  log('\n📊 Database telah siap dengan data sample:', 'cyan');
  log('👨‍💼 Admin: admin@tpqbaitusshuffah.com / admin123', 'cyan');
  log('👨‍🏫 Musyrif: ustadz.abdullah@rumahtahfidz.com / musyrif123', 'cyan');
  log('👨‍👩‍👧‍👦 Wali: bapak.ahmad@gmail.com / wali123', 'cyan');
  
  log('\n🔧 Untuk membuka Prisma Studio:', 'blue');
  log('npm run db:studio', 'blue');
  
  log('\n📖 Dokumentasi lengkap ada di PLANETSCALE_SETUP.md', 'yellow');
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled rejection: ${error.message}`, 'red');
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
