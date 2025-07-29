import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(path.dirname(__dirname), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const mobileAssetsDir = path.join(uploadsDir, 'mobile-assets');

console.log('Checking mobile assets directory structure...');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

if (!fs.existsSync(mobileAssetsDir)) {
  fs.mkdirSync(mobileAssetsDir, { recursive: true });
  console.log('Created mobile-assets directory');
}

const waliDir = path.join(mobileAssetsDir, 'wali');
const musyrifDir = path.join(mobileAssetsDir, 'musyrif');

if (!fs.existsSync(waliDir)) {
  fs.mkdirSync(waliDir, { recursive: true });
  console.log('Created wali directory');
}

if (!fs.existsSync(musyrifDir)) {
  fs.mkdirSync(musyrifDir, { recursive: true });
  console.log('Created musyrif directory');
}

// Check permissions
try {
  fs.accessSync(mobileAssetsDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('Mobile assets directory is readable and writable');
} catch (error) {
  console.error('Permission error:', error.message);
}

// List existing files
console.log('\nExisting files in wali directory:');
try {
  const waliFiles = fs.readdirSync(waliDir);
  waliFiles.forEach(file => {
    const filePath = path.join(waliDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file} (${stats.size} bytes)`);
  });
} catch (error) {
  console.error('Error reading wali directory:', error.message);
}

console.log('\nExisting files in musyrif directory:');
try {
  const musyrifFiles = fs.readdirSync(musyrifDir);
  musyrifFiles.forEach(file => {
    const filePath = path.join(musyrifDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file} (${stats.size} bytes)`);
  });
} catch (error) {
  console.error('Error reading musyrif directory:', error.message);
}

console.log('\nDirectory structure check completed.');
