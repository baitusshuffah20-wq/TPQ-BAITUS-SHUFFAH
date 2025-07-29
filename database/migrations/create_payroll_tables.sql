-- =====================================================
-- SISTEM PENGGAJIAN TPQ BAITUS SHUFFAH
-- =====================================================

-- Tabel untuk pengaturan gaji per posisi/role
CREATE TABLE salary_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    position VARCHAR(50) NOT NULL, -- 'MUSYRIF', 'ADMIN', 'CLEANING', etc
    salary_type ENUM('FIXED', 'PER_SESSION', 'HOURLY') NOT NULL DEFAULT 'PER_SESSION',
    base_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- Gaji pokok atau tarif per sesi
    overtime_rate DECIMAL(5,2) DEFAULT 0, -- Rate lembur (multiplier)
    allowances JSON, -- Tunjangan tambahan dalam format JSON
    deductions JSON, -- Potongan tetap dalam format JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    
    INDEX idx_position (position),
    INDEX idx_active (is_active)
);

-- Tabel untuk data payroll bulanan
CREATE TABLE payroll (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL, -- Reference ke users table
    employee_name VARCHAR(100) NOT NULL,
    employee_position VARCHAR(50) NOT NULL,
    period_month INT NOT NULL, -- 1-12
    period_year INT NOT NULL,
    
    -- Perhitungan kehadiran
    total_sessions INT DEFAULT 0, -- Total jadwal yang harus dihadiri
    attended_sessions INT DEFAULT 0, -- Sesi yang dihadiri
    absent_sessions INT DEFAULT 0, -- Sesi yang tidak dihadiri
    late_sessions INT DEFAULT 0, -- Sesi yang terlambat
    overtime_hours DECIMAL(5,2) DEFAULT 0, -- Jam lembur
    
    -- Perhitungan gaji
    base_salary DECIMAL(10,2) NOT NULL DEFAULT 0, -- Gaji pokok
    session_rate DECIMAL(10,2) DEFAULT 0, -- Tarif per sesi
    attendance_bonus DECIMAL(10,2) DEFAULT 0, -- Bonus kehadiran
    overtime_pay DECIMAL(10,2) DEFAULT 0, -- Bayaran lembur
    allowances DECIMAL(10,2) DEFAULT 0, -- Total tunjangan
    deductions DECIMAL(10,2) DEFAULT 0, -- Total potongan
    gross_salary DECIMAL(10,2) NOT NULL DEFAULT 0, -- Gaji kotor
    net_salary DECIMAL(10,2) NOT NULL DEFAULT 0, -- Gaji bersih
    
    -- Status dan metadata
    status ENUM('DRAFT', 'APPROVED', 'PAID', 'CANCELLED') DEFAULT 'DRAFT',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    approved_by VARCHAR(36),
    paid_by VARCHAR(36),
    
    -- Catatan
    notes TEXT,
    calculation_details JSON, -- Detail perhitungan dalam format JSON
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_employee_period (employee_id, period_month, period_year),
    INDEX idx_employee (employee_id),
    INDEX idx_period (period_year, period_month),
    INDEX idx_status (status),
    INDEX idx_generated_at (generated_at)
);

-- Tabel untuk riwayat pembayaran gaji
CREATE TABLE salary_payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payroll_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    
    -- Detail pembayaran
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'TRANSFER', 'CHECK') DEFAULT 'CASH',
    payment_date DATE NOT NULL,
    reference_number VARCHAR(50), -- No referensi transfer/cek
    
    -- Integrasi keuangan
    finance_transaction_id VARCHAR(36), -- Reference ke tabel keuangan
    is_recorded_in_finance BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    paid_by VARCHAR(36) NOT NULL, -- User yang melakukan pembayaran
    notes TEXT,
    receipt_path VARCHAR(255), -- Path ke file bukti pembayaran
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE,
    INDEX idx_payroll (payroll_id),
    INDEX idx_employee (employee_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_finance_integration (is_recorded_in_finance)
);

-- Tabel untuk bonus dan potongan khusus
CREATE TABLE salary_adjustments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payroll_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    
    type ENUM('BONUS', 'DEDUCTION') NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'PERFORMANCE', 'TRANSPORT', 'FINE', etc
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    is_recurring BOOLEAN DEFAULT FALSE, -- Apakah berulang setiap bulan
    applied_by VARCHAR(36) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE,
    INDEX idx_payroll (payroll_id),
    INDEX idx_employee (employee_id),
    INDEX idx_type (type),
    INDEX idx_category (category)
);

-- Insert default salary settings
INSERT INTO salary_settings (position, salary_type, base_amount, allowances, deductions) VALUES
('MUSYRIF', 'PER_SESSION', 25000.00, 
 JSON_OBJECT('transport', 5000, 'meal', 10000), 
 JSON_OBJECT('late_penalty', 2500)),
 
('ADMIN', 'FIXED', 2500000.00, 
 JSON_OBJECT('transport', 200000, 'meal', 300000, 'communication', 100000), 
 JSON_OBJECT('bpjs', 125000, 'tax', 50000)),
 
('CLEANING', 'FIXED', 1500000.00, 
 JSON_OBJECT('transport', 150000, 'meal', 200000), 
 JSON_OBJECT('bpjs', 75000)),
 
('SECURITY', 'FIXED', 1800000.00, 
 JSON_OBJECT('transport', 150000, 'meal', 250000, 'night_shift', 100000), 
 JSON_OBJECT('bpjs', 90000));

-- =====================================================
-- VIEWS UNTUK REPORTING
-- =====================================================

-- View untuk laporan gaji bulanan
CREATE VIEW payroll_summary AS
SELECT 
    p.*,
    u.name as employee_full_name,
    u.email as employee_email,
    u.phone as employee_phone,
    ss.salary_type,
    ss.base_amount as setting_base_amount,
    CASE 
        WHEN p.status = 'PAID' THEN 'Sudah Dibayar'
        WHEN p.status = 'APPROVED' THEN 'Disetujui'
        WHEN p.status = 'DRAFT' THEN 'Draft'
        ELSE 'Dibatalkan'
    END as status_text,
    CONCAT(p.period_month, '/', p.period_year) as period_display,
    (p.attended_sessions / NULLIF(p.total_sessions, 0) * 100) as attendance_percentage
FROM payroll p
LEFT JOIN users u ON p.employee_id = u.id
LEFT JOIN salary_settings ss ON p.employee_position = ss.position AND ss.is_active = TRUE;

-- View untuk statistik kehadiran karyawan
CREATE VIEW employee_attendance_stats AS
SELECT 
    p.employee_id,
    p.employee_name,
    p.employee_position,
    p.period_year,
    SUM(p.total_sessions) as total_sessions_year,
    SUM(p.attended_sessions) as attended_sessions_year,
    SUM(p.absent_sessions) as absent_sessions_year,
    SUM(p.late_sessions) as late_sessions_year,
    AVG(p.attended_sessions / NULLIF(p.total_sessions, 0) * 100) as avg_attendance_percentage,
    SUM(p.gross_salary) as total_gross_salary_year,
    SUM(p.net_salary) as total_net_salary_year
FROM payroll p
WHERE p.status != 'CANCELLED'
GROUP BY p.employee_id, p.employee_name, p.employee_position, p.period_year;

-- =====================================================
-- TRIGGERS UNTUK AUDIT DAN VALIDASI
-- =====================================================

DELIMITER //

-- Trigger untuk update timestamp
CREATE TRIGGER payroll_updated_at 
    BEFORE UPDATE ON payroll 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger untuk validasi periode payroll
CREATE TRIGGER validate_payroll_period 
    BEFORE INSERT ON payroll 
    FOR EACH ROW 
BEGIN
    IF NEW.period_month < 1 OR NEW.period_month > 12 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Period month must be between 1 and 12';
    END IF;
    
    IF NEW.period_year < 2020 OR NEW.period_year > YEAR(CURDATE()) + 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid period year';
    END IF;
END//

DELIMITER ;

-- =====================================================
-- INDEXES UNTUK PERFORMANCE
-- =====================================================

-- Composite indexes untuk query yang sering digunakan
CREATE INDEX idx_payroll_employee_period_status ON payroll(employee_id, period_year, period_month, status);
CREATE INDEX idx_salary_payments_date_method ON salary_payments(payment_date, payment_method);
CREATE INDEX idx_salary_adjustments_employee_type ON salary_adjustments(employee_id, type, is_recurring);
