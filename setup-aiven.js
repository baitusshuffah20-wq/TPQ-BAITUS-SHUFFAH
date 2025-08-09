#!/usr/bin/env node

/**
 * Setup script untuk Aiven Database
 * Script ini akan membantu setup database dan seeding untuk TPQ Baitus Shuffah
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

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
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if it's configured for Aiven
  if (!envContent.includes('aivencloud.com')) {
    log('⚠️  File .env belum dikonfigurasi untuk Aiven!', 'yellow');
    return false;
  }

  // Check if password is still placeholder
  if (envContent.includes('YOUR_PASSWORD')) {
    log('⚠️  Password Aiven belum diisi di file .env!', 'yellow');
    log('Silakan ganti YOUR_PASSWORD dengan password sebenarnya dari Aiven dashboard.', 'yellow');
    return false;
  }

  log('✅ File .env sudah dikonfigurasi untuk Aiven', 'green');
  return true;
}

function askForPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🔑 Masukkan password Aiven Anda: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

function updateEnvWithPassword(password) {
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace YOUR_PASSWORD with actual password
  envContent = envContent.replace(/YOUR_PASSWORD/g, password);
  
  fs.writeFileSync(envPath, envContent);
  log('✅ Password berhasil diupdate di file .env', 'green');
}

function testConnection() {
  try {
    log('\n🔍 Testing koneksi database...', 'blue');
    execSync('npx prisma db push --preview-feature --accept-data-loss', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log('✅ Koneksi database berhasil!', 'green');
    return true;
  } catch (error) {
    log('❌ Koneksi database gagal!', 'red');
    log('Periksa kembali password dan konfigurasi Aiven.', 'yellow');
    return false;
  }
}

async function main() {
  log('🚀 Setup Aiven Database untuk TPQ Baitus Shuffah', 'cyan');
  log('=' * 60, 'cyan');

  // Step 1: Check environment file
  log('\n📋 Step 1: Memeriksa konfigurasi environment...', 'magenta');
  
  if (!checkEnvFile()) {
    // Ask for password if not configured
    log('\n🔑 Setup password Aiven...', 'blue');
    const password = await askForPassword();
    
    if (!password) {
      log('❌ Password tidak boleh kosong!', 'red');
      process.exit(1);
    }
    
    updateEnvWithPassword(password);
  }

  // Step 2: Test connection
  log('\n📋 Step 2: Testing koneksi database...', 'magenta');
  if (!testConnection()) {
    log('\n💡 Tips troubleshooting:', 'yellow');
    log('- Pastikan password Aiven benar', 'yellow');
    log('- Periksa IP whitelist di Aiven dashboard', 'yellow');
    log('- Pastikan database service aktif', 'yellow');
    process.exit(1);
  }

  // Step 3: Generate Prisma client
  log('\n📋 Step 3: Generate Prisma client...', 'magenta');
  if (!execCommand('npm run db:generate', 'Generate Prisma client')) {
    process.exit(1);
  }

  // Step 4: Push schema to database
  log('\n📋 Step 4: Push schema ke database Aiven...', 'magenta');
  if (!execCommand('npm run db:push', 'Push schema ke database')) {
    log('\n💡 Tips troubleshooting:', 'yellow');
    log('- Pastikan koneksi database stabil', 'yellow');
    log('- Periksa permission user di Aiven', 'yellow');
    log('- Cek log error di Aiven dashboard', 'yellow');
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
  log('\n🎉 Setup Aiven berhasil!', 'green');
  log('=' * 60, 'green');
  log('\n📊 Database telah siap dengan data sample:', 'cyan');
  log('👨‍💼 Admin: admin@tpqbaitusshuffah.com / admin123', 'cyan');
  log('👨‍🏫 Musyrif: ustadz.abdullah@rumahtahfidz.com / musyrif123', 'cyan');
  log('👨‍👩‍👧‍👦 Wali: bapak.ahmad@gmail.com / wali123', 'cyan');
  
  log('\n🔧 Untuk membuka Prisma Studio:', 'blue');
  log('npm run db:studio', 'blue');
  
  log('\n📊 Monitor database di Aiven dashboard:', 'blue');
  log('https://console.aiven.io/', 'blue');
  
  log('\n📖 Dokumentasi lengkap ada di AIVEN_SETUP.md', 'yellow');
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
