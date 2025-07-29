-- Create site_setting table for key-value settings
CREATE TABLE IF NOT EXISTS `site_setting` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'STRING',
  `category` varchar(191) NOT NULL DEFAULT 'GENERAL',
  `label` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_setting_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `site_setting` (`id`, `key`, `value`, `type`, `category`, `label`, `description`, `isPublic`) VALUES
('cuid_site_name', 'site.name', 'TPQ Baitus Shuffah', 'STRING', 'SYSTEM', 'Nama Situs', 'Nama utama situs web', 1),
('cuid_site_desc', 'site.description', 'Lembaga Pendidikan Tahfidz Al-Quran', 'STRING', 'SYSTEM', 'Deskripsi Situs', 'Deskripsi singkat tentang situs', 1),
('cuid_site_timezone', 'site.timezone', 'Asia/Jakarta', 'STRING', 'SYSTEM', 'Zona Waktu', 'Zona waktu default situs', 1),
('cuid_site_language', 'site.language', 'id', 'STRING', 'SYSTEM', 'Bahasa', 'Bahasa default situs', 1),
('cuid_site_maintenance', 'site.maintenanceMode', 'false', 'BOOLEAN', 'SYSTEM', 'Mode Maintenance', 'Status mode pemeliharaan situs', 1),
('cuid_site_logo', 'site.logo', '/logo.png', 'STRING', 'SYSTEM', 'Logo Situs', 'Logo utama situs web', 1),
('cuid_site_favicon', 'site.favicon', '/favicon.ico', 'STRING', 'SYSTEM', 'Favicon', 'Ikon situs untuk browser tab', 1),

('cuid_about_vision', 'about.vision', 'Menjadi lembaga pendidikan tahfidz Al-Quran terkemuka yang melahirkan generasi Qurani berakhlak mulia.', 'STRING', 'ABOUT', 'Visi', 'Visi lembaga', 1),
('cuid_about_mission', 'about.mission', 'Menyelenggarakan pendidikan tahfidz Al-Quran berkualitas, membentuk karakter Islami, dan mengembangkan potensi santri secara komprehensif.', 'STRING', 'ABOUT', 'Misi', 'Misi lembaga', 1),
('cuid_about_history', 'about.history', 'TPQ Baitus Shuffah didirikan pada tahun 2009 oleh sekelompok alumni pesantren yang peduli terhadap pendidikan Al-Quran. Berawal dari 15 santri, kini telah berkembang menjadi lembaga pendidikan tahfidz terpercaya.', 'STRING', 'ABOUT', 'Sejarah', 'Sejarah singkat lembaga', 1),
('cuid_about_values', 'about.values', 'Keikhlasan, Kesungguhan, Kemandirian, Keteladanan, Keberkahan', 'STRING', 'ABOUT', 'Nilai-nilai', 'Nilai-nilai yang dianut lembaga', 1),
('cuid_about_achievements', 'about.achievements', 'Juara 1 MTQ Tingkat Provinsi 2022, Juara 2 Tahfidz Nasional 2023, 250+ Alumni Hafidz 30 Juz', 'STRING', 'ABOUT', 'Prestasi', 'Prestasi yang telah dicapai', 1),

('cuid_contact_address', 'contact.address', 'Jl. Islamic Center No. 123, Jakarta Pusat', 'STRING', 'CONTACT', 'Alamat', 'Alamat fisik lembaga', 1),
('cuid_contact_phone', 'contact.phone', '021-12345678', 'STRING', 'CONTACT', 'Telepon', 'Nomor telepon lembaga', 1),
('cuid_contact_email', 'contact.email', 'info@tpqbaitusshuffah.ac.id', 'STRING', 'CONTACT', 'Email', 'Alamat email kontak', 1),
('cuid_contact_whatsapp', 'contact.whatsapp', '081234567890', 'STRING', 'CONTACT', 'WhatsApp', 'Nomor WhatsApp untuk kontak', 1),
('cuid_contact_hours', 'contact.operationalHours', 'Senin-Jumat: 07:00-17:00, Sabtu: 07:00-15:00, Minggu: 08:00-12:00', 'STRING', 'CONTACT', 'Jam Operasional', 'Jam operasional lembaga', 1),

('cuid_integration_whatsapp_token', 'integration.whatsapp.token', '', 'STRING', 'INTEGRATION', 'WhatsApp Token', 'Token API WhatsApp', 0),
('cuid_integration_email_host', 'integration.email.host', 'smtp.gmail.com', 'STRING', 'INTEGRATION', 'SMTP Host', 'Host server SMTP', 0),
('cuid_integration_email_port', 'integration.email.port', '587', 'STRING', 'INTEGRATION', 'SMTP Port', 'Port server SMTP', 0),
('cuid_integration_email_username', 'integration.email.username', '', 'STRING', 'INTEGRATION', 'Email Username', 'Username untuk autentikasi SMTP', 0),
('cuid_integration_email_password', 'integration.email.password', '', 'STRING', 'INTEGRATION', 'Email Password', 'Password untuk autentikasi SMTP', 0),
('cuid_integration_payment_gateway', 'integration.payment.gateway', 'midtrans', 'STRING', 'INTEGRATION', 'Payment Gateway', 'Layanan payment gateway yang digunakan', 0)
ON DUPLICATE KEY UPDATE 
  `value` = VALUES(`value`),
  `type` = VALUES(`type`),
  `category` = VALUES(`category`),
  `label` = VALUES(`label`),
  `description` = VALUES(`description`),
  `isPublic` = VALUES(`isPublic`),
  `updatedAt` = CURRENT_TIMESTAMP(3);
