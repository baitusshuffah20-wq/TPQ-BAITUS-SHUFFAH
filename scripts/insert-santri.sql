-- Insert sample santri data
USE db_tpq;

-- First, let's check if we have any users with WALI role
-- If not, we'll create some sample wali users

INSERT IGNORE INTO users (id, email, name, phone, role, password, isActive, createdAt, updatedAt) VALUES
('wali-001', 'wali1@tpq.com', 'Ahmad Fauzi', '081234567890', 'WALI', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
('wali-002', 'wali2@tpq.com', 'Siti Aminah', '081234567891', 'WALI', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW()),
('wali-003', 'wali3@tpq.com', 'Muhammad Yusuf', '081234567892', 'WALI', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW(), NOW());

-- Create sample halaqah if they don't exist
INSERT IGNORE INTO halaqah (id, name, level, capacity, currentStudents, schedule, status, createdAt, updatedAt) VALUES
('halaqah-001', 'Halaqah Al-Fatihah', 'Pemula', 15, 0, 'Senin, Rabu, Jumat 16:00-17:30', 'ACTIVE', NOW(), NOW()),
('halaqah-002', 'Halaqah Al-Baqarah', 'Menengah', 12, 0, 'Selasa, Kamis, Sabtu 16:00-17:30', 'ACTIVE', NOW(), NOW()),
('halaqah-003', 'Halaqah An-Nisa', 'Lanjutan', 10, 0, 'Senin, Rabu, Jumat 19:00-20:30', 'ACTIVE', NOW(), NOW());

-- Insert sample santri data
INSERT IGNORE INTO santri (id, nis, name, birthDate, birthPlace, gender, address, phone, email, status, enrollmentDate, waliId, halaqahId, createdAt, updatedAt) VALUES
('santri-001', 'TPQ001', 'Muhammad Rizki Pratama', '2010-05-15', 'Jakarta', 'MALE', 'Jl. Masjid No. 123, Jakarta Selatan', '081234567893', 'rizki@tpq.com', 'ACTIVE', '2023-01-15', 'wali-001', 'halaqah-001', NOW(), NOW()),
('santri-002', 'TPQ002', 'Fatimah Zahra', '2011-03-20', 'Bandung', 'FEMALE', 'Jl. Pondok Pesantren No. 456, Bandung', '081234567894', 'fatimah@tpq.com', 'ACTIVE', '2023-02-01', 'wali-002', 'halaqah-002', NOW(), NOW()),
('santri-003', 'TPQ003', 'Ahmad Firdaus', '2009-08-10', 'Surabaya', 'MALE', 'Jl. Al-Quran No. 789, Surabaya', '081234567895', 'firdaus@tpq.com', 'ACTIVE', '2022-09-01', 'wali-003', 'halaqah-001', NOW(), NOW()),
('santri-004', 'TPQ004', 'Aisyah Nur Hidayah', '2012-01-25', 'Yogyakarta', 'FEMALE', 'Jl. Sunnah No. 321, Yogyakarta', '081234567896', 'aisyah@tpq.com', 'ACTIVE', '2023-03-15', 'wali-001', 'halaqah-002', NOW(), NOW()),
('santri-005', 'TPQ005', 'Umar bin Khattab', '2010-11-30', 'Medan', 'MALE', 'Jl. Sahabat No. 654, Medan', '081234567897', 'umar@tpq.com', 'ACTIVE', '2023-01-20', 'wali-002', 'halaqah-003', NOW(), NOW());

-- Check the results
SELECT COUNT(*) as total_santri FROM santri;
SELECT * FROM santri LIMIT 5;
