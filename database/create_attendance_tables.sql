-- Create musyrif_attendance table
CREATE TABLE IF NOT EXISTS `musyrif_attendance` (
  `id` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL COMMENT 'PRESENT, ABSENT, LATE',
  `checkInTime` datetime(3) DEFAULT NULL,
  `checkOutTime` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `sessionType` varchar(191) NOT NULL DEFAULT 'REGULAR' COMMENT 'REGULAR, EXTRA, MAKEUP',
  `qrCodeUsed` varchar(191) DEFAULT NULL COMMENT 'QR code that was scanned',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `musyrifId` varchar(191) NOT NULL,
  `halaqahId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `musyrif_attendance_musyrifId_halaqahId_date_key` (`musyrifId`,`halaqahId`,`date`),
  KEY `musyrif_attendance_halaqahId_idx` (`halaqahId`),
  KEY `musyrif_attendance_musyrifId_idx` (`musyrifId`),
  CONSTRAINT `musyrif_attendance_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `musyrif_attendance_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create qr_code_sessions table
CREATE TABLE IF NOT EXISTS `qr_code_sessions` (
  `id` varchar(191) NOT NULL,
  `halaqahId` varchar(191) NOT NULL,
  `sessionDate` datetime(3) NOT NULL,
  `sessionType` varchar(191) NOT NULL DEFAULT 'REGULAR',
  `qrCode` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `expiresAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) NOT NULL,
  `usageCount` int NOT NULL DEFAULT 0,
  `maxUsage` int NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code_sessions_qrCode_key` (`qrCode`),
  KEY `qr_code_sessions_halaqahId_idx` (`halaqahId`),
  KEY `qr_code_sessions_qrCode_idx` (`qrCode`),
  CONSTRAINT `qr_code_sessions_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample salary settings for MUSYRIF if not exists
INSERT IGNORE INTO `salary_settings` (
  `id`, `position`, `salary_type`, `base_amount`, `overtime_rate`, 
  `allowances`, `deductions`, `is_active`, `created_at`, `updated_at`
) VALUES (
  'musyrif_salary_001', 
  'MUSYRIF', 
  'PER_SESSION', 
  50000.00, 
  1.5, 
  '{"transport": 10000, "meal": 15000}', 
  '{"tax": 0, "insurance": 0}', 
  1, 
  NOW(), 
  NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_musyrif_attendance_date` ON `musyrif_attendance` (`date`);
CREATE INDEX IF NOT EXISTS `idx_musyrif_attendance_status` ON `musyrif_attendance` (`status`);
CREATE INDEX IF NOT EXISTS `idx_qr_sessions_active` ON `qr_code_sessions` (`isActive`, `expiresAt`);
CREATE INDEX IF NOT EXISTS `idx_qr_sessions_date` ON `qr_code_sessions` (`sessionDate`);

-- Create view for attendance summary
CREATE OR REPLACE VIEW `v_musyrif_attendance_summary` AS
SELECT 
  ma.musyrifId,
  u.name as musyrif_name,
  h.id as halaqah_id,
  h.name as halaqah_name,
  YEAR(ma.date) as year,
  MONTH(ma.date) as month,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN ma.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) as attended_sessions,
  SUM(CASE WHEN ma.status = 'ABSENT' THEN 1 ELSE 0 END) as absent_sessions,
  SUM(CASE WHEN ma.status = 'LATE' THEN 1 ELSE 0 END) as late_sessions,
  ROUND(
    (SUM(CASE WHEN ma.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
    2
  ) as attendance_rate
FROM `musyrif_attendance` ma
JOIN `users` u ON ma.musyrifId = u.id
JOIN `halaqah` h ON ma.halaqahId = h.id
GROUP BY ma.musyrifId, h.id, YEAR(ma.date), MONTH(ma.date);

-- Create trigger to auto-update payroll when attendance is inserted/updated
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `tr_musyrif_attendance_after_insert`
AFTER INSERT ON `musyrif_attendance`
FOR EACH ROW
BEGIN
  DECLARE session_rate DECIMAL(10,2) DEFAULT 50000;
  DECLARE attendance_bonus DECIMAL(10,2) DEFAULT 0;
  DECLARE total_sessions INT DEFAULT 0;
  DECLARE attended_sessions INT DEFAULT 0;
  DECLARE absent_sessions INT DEFAULT 0;
  DECLARE late_sessions INT DEFAULT 0;
  DECLARE base_salary DECIMAL(10,2) DEFAULT 0;
  DECLARE gross_salary DECIMAL(10,2) DEFAULT 0;
  DECLARE net_salary DECIMAL(10,2) DEFAULT 0;
  DECLARE attendance_rate DECIMAL(5,2) DEFAULT 0;
  
  -- Get salary settings
  SELECT base_amount INTO session_rate 
  FROM salary_settings 
  WHERE position = 'MUSYRIF' AND is_active = 1 
  LIMIT 1;
  
  -- Calculate monthly stats
  SELECT 
    COUNT(*),
    SUM(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END),
    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END),
    SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END)
  INTO total_sessions, attended_sessions, absent_sessions, late_sessions
  FROM musyrif_attendance 
  WHERE musyrifId = NEW.musyrifId 
    AND halaqahId = NEW.halaqahId
    AND YEAR(date) = YEAR(NEW.date) 
    AND MONTH(date) = MONTH(NEW.date);
  
  -- Calculate salary
  SET base_salary = attended_sessions * session_rate;
  SET attendance_rate = CASE WHEN total_sessions > 0 THEN (attended_sessions / total_sessions) * 100 ELSE 0 END;
  SET attendance_bonus = CASE WHEN attendance_rate >= 90 THEN 100000 ELSE 0 END;
  SET gross_salary = base_salary + attendance_bonus;
  SET net_salary = gross_salary;
  
  -- Insert or update payroll
  INSERT INTO payroll (
    employee_id, period_month, period_year, total_sessions, attended_sessions,
    absent_sessions, late_sessions, base_salary, session_rate, attendance_bonus,
    overtime_pay, allowances, deductions, gross_salary, net_salary, status,
    generated_at, created_at, updated_at
  ) VALUES (
    NEW.musyrifId, MONTH(NEW.date), YEAR(NEW.date), total_sessions, attended_sessions,
    absent_sessions, late_sessions, base_salary, session_rate, attendance_bonus,
    0, 0, 0, gross_salary, net_salary, 'DRAFT',
    NOW(), NOW(), NOW()
  ) ON DUPLICATE KEY UPDATE
    total_sessions = VALUES(total_sessions),
    attended_sessions = VALUES(attended_sessions),
    absent_sessions = VALUES(absent_sessions),
    late_sessions = VALUES(late_sessions),
    base_salary = VALUES(base_salary),
    attendance_bonus = VALUES(attendance_bonus),
    gross_salary = VALUES(gross_salary),
    net_salary = VALUES(net_salary),
    updated_at = NOW();
END$$

DELIMITER ;

-- Create function to generate unique QR codes
DELIMITER $$

CREATE FUNCTION IF NOT EXISTS `generate_qr_code`(
  p_halaqah_id VARCHAR(191),
  p_session_date DATE,
  p_session_type VARCHAR(50)
) RETURNS VARCHAR(191)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE qr_code VARCHAR(191);
  DECLARE qr_data TEXT;
  
  SET qr_data = CONCAT(
    '{"halaqahId":"', p_halaqah_id, '",',
    '"sessionDate":"', p_session_date, '",',
    '"sessionType":"', p_session_type, '",',
    '"timestamp":', UNIX_TIMESTAMP(NOW()), '}'
  );
  
  SET qr_code = SUBSTRING(SHA2(qr_data, 256), 1, 16);
  
  RETURN qr_code;
END$$

DELIMITER ;
