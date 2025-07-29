-- Menambahkan kolom confirmerId ke tabel donations jika belum ada
ALTER TABLE donations ADD COLUMN IF NOT EXISTS confirmerId VARCHAR(255) NULL;

-- Menambahkan foreign key constraint jika belum ada
ALTER TABLE donations ADD CONSTRAINT IF NOT EXISTS donations_confirmerId_fkey FOREIGN KEY (confirmerId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;