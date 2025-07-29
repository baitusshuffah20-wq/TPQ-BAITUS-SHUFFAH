-- =====================================================
-- BEHAVIOR TRACKING SYSTEM FOR TPQ BAITUS SHUFFAH
-- =====================================================

-- Tabel untuk kriteria perilaku
CREATE TABLE IF NOT EXISTS behavior_criteria (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    description TEXT,
    category ENUM('AKHLAQ', 'IBADAH', 'ACADEMIC', 'SOCIAL', 'DISCIPLINE', 'LEADERSHIP') NOT NULL,
    type ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
    points INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    age_group VARCHAR(20) DEFAULT '5+',
    examples JSON,
    consequences JSON,
    rewards JSON,
    islamic_reference JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);

-- Tabel untuk record perilaku santri
CREATE TABLE IF NOT EXISTS behavior_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    santri_id VARCHAR(36) NOT NULL,
    halaqah_id VARCHAR(36),
    criteria_id VARCHAR(36),
    category ENUM('AKHLAQ', 'IBADAH', 'ACADEMIC', 'SOCIAL', 'DISCIPLINE', 'LEADERSHIP') NOT NULL,
    type ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
    points INT NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    time TIME,
    description TEXT,
    context TEXT,
    witnesses JSON,
    location VARCHAR(100),
    status ENUM('ACTIVE', 'RESOLVED', 'FOLLOW_UP', 'ESCALATED') DEFAULT 'ACTIVE',
    recorded_by VARCHAR(36) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notified_at TIMESTAMP NULL,
    resolution JSON,
    attachments JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (halaqah_id) REFERENCES halaqah(id) ON DELETE SET NULL,
    FOREIGN KEY (criteria_id) REFERENCES behavior_criteria(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_santri (santri_id),
    INDEX idx_halaqah (halaqah_id),
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_recorded_by (recorded_by)
);

-- Tabel untuk goals pengembangan karakter
CREATE TABLE IF NOT EXISTS character_goals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    santri_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('AKHLAQ', 'IBADAH', 'ACADEMIC', 'SOCIAL', 'DISCIPLINE', 'LEADERSHIP') NOT NULL,
    target_behaviors JSON,
    target_date DATE,
    start_date DATE NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED') DEFAULT 'ACTIVE',
    progress INT DEFAULT 0, -- 0-100
    milestones JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parent_involved BOOLEAN DEFAULT FALSE,
    musyrif_notes TEXT,
    parent_feedback TEXT,
    
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_santri (santri_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_target_date (target_date)
);

-- Tabel untuk alerts perilaku
CREATE TABLE IF NOT EXISTS behavior_alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    santri_id VARCHAR(36) NOT NULL,
    alert_type ENUM('PATTERN', 'SEVERITY', 'FREQUENCY', 'GOAL_RISK', 'IMPROVEMENT') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    trigger_criteria JSON,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    action_required BOOLEAN DEFAULT FALSE,
    assigned_to JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolution TEXT,
    metadata JSON,
    
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    
    INDEX idx_santri (santri_id),
    INDEX idx_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_read (is_read),
    INDEX idx_resolved (is_resolved)
);

-- Insert sample behavior criteria
INSERT INTO behavior_criteria (id, name, name_arabic, description, category, type, severity, points, examples, rewards, islamic_reference) VALUES
-- AKHLAQ - Positive
('akhlaq_honest', 'Jujur', 'الصدق', 'Berkata dan bertindak dengan jujur', 'AKHLAQ', 'POSITIVE', 'LOW', 5, 
 JSON_ARRAY('Mengakui kesalahan dengan jujur', 'Tidak berbohong kepada guru atau teman', 'Mengembalikan barang yang bukan miliknya'),
 JSON_ARRAY('Pujian di depan kelas', 'Sticker bintang', 'Sertifikat kejujuran'),
 JSON_OBJECT('hadith', 'عليكم بالصدق فإن الصدق يهدي إلى البر', 'explanation', 'Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan')),

('akhlaq_respect', 'Menghormati Guru', 'احترام المعلم', 'Menunjukkan rasa hormat kepada guru dan ustadz', 'AKHLAQ', 'POSITIVE', 'LOW', 4,
 JSON_ARRAY('Mengucapkan salam ketika bertemu guru', 'Mendengarkan dengan baik saat guru mengajar', 'Tidak memotong pembicaraan guru'),
 JSON_ARRAY('Pujian', 'Hadiah kecil', 'Dipuji di depan orang tua'),
 JSON_OBJECT('hadith', 'ليس منا من لم يرحم صغيرنا ويوقر كبيرنا', 'explanation', 'Bukan termasuk golongan kami yang tidak menyayangi yang kecil dan tidak menghormati yang besar')),

('akhlaq_helping', 'Membantu Teman', 'مساعدة الأصدقاء', 'Membantu teman yang membutuhkan', 'AKHLAQ', 'POSITIVE', 'LOW', 4,
 JSON_ARRAY('Membantu teman yang kesulitan belajar', 'Berbagi alat tulis dengan teman', 'Membantu teman yang terjatuh'),
 JSON_ARRAY('Apresiasi guru', 'Badge helper', 'Cerita positif ke orang tua'),
 JSON_OBJECT('quranVerse', 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ', 'explanation', 'Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa')),

-- IBADAH - Positive
('ibadah_prayer', 'Rajin Shalat', 'المحافظة على الصلاة', 'Melaksanakan shalat dengan tertib dan khusyuk', 'IBADAH', 'POSITIVE', 'MEDIUM', 6,
 JSON_ARRAY('Shalat berjamaah di TPQ', 'Datang tepat waktu untuk shalat', 'Khusyuk dalam shalat'),
 JSON_ARRAY('Sertifikat rajin shalat', 'Hadiah Al-Quran kecil', 'Pujian khusus'),
 JSON_OBJECT('quranVerse', 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ', 'explanation', 'Dan dirikanlah shalat, tunaikanlah zakat')),

('ibadah_quran', 'Rajin Membaca Al-Quran', 'المواظبة على قراءة القرآن', 'Aktif dalam membaca dan menghafal Al-Quran', 'IBADAH', 'POSITIVE', 'MEDIUM', 5,
 JSON_ARRAY('Membaca Al-Quran dengan tartil', 'Menghafal ayat dengan baik', 'Membantu teman belajar Al-Quran'),
 JSON_ARRAY('Sertifikat hafalan', 'Hadiah mushaf', 'Apresiasi khusus'),
 JSON_OBJECT('hadith', 'خيركم من تعلم القرآن وعلمه', 'explanation', 'Sebaik-baik kalian adalah yang belajar Al-Quran dan mengajarkannya')),

-- ACADEMIC - Positive
('academic_active', 'Aktif Bertanya', 'النشاط في السؤال', 'Aktif bertanya dan berpartisipasi dalam pembelajaran', 'ACADEMIC', 'POSITIVE', 'LOW', 3,
 JSON_ARRAY('Bertanya hal yang tidak dipahami', 'Menjawab pertanyaan guru', 'Berpartisipasi dalam diskusi'),
 JSON_ARRAY('Pujian guru', 'Sticker pintar', 'Pencatatan positif'),
 JSON_OBJECT('hadith', 'العلم خزائن ومفاتيحها السؤال', 'explanation', 'Ilmu adalah perbendaharaan dan kuncinya adalah bertanya')),

-- DISCIPLINE - Negative
('discipline_late', 'Terlambat', 'التأخير', 'Datang terlambat ke TPQ atau kelas', 'DISCIPLINE', 'NEGATIVE', 'LOW', -2,
 JSON_ARRAY('Datang terlambat lebih dari 10 menit', 'Tidak memberitahu alasan keterlambatan', 'Sering terlambat tanpa alasan jelas'),
 JSON_ARRAY('Teguran lisan', 'Pencatatan keterlambatan', 'Pemberitahuan ke orang tua'),
 JSON_OBJECT('hadith', 'الوقت كالسيف إن لم تقطعه قطعك', 'explanation', 'Waktu seperti pedang, jika kamu tidak memanfaatkannya maka ia akan merugikanmu')),

('discipline_disrupt', 'Mengganggu Kelas', 'إزعاج الفصل', 'Mengganggu jalannya pembelajaran di kelas', 'DISCIPLINE', 'NEGATIVE', 'MEDIUM', -4,
 JSON_ARRAY('Berbicara saat guru menjelaskan', 'Mengganggu teman saat belajar', 'Membuat keributan di kelas'),
 JSON_ARRAY('Teguran keras', 'Duduk terpisah', 'Panggilan orang tua'),
 JSON_OBJECT('hadith', 'من كان يؤمن بالله واليوم الآخر فليقل خيرا أو ليصمت', 'explanation', 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam')),

-- SOCIAL - Negative
('social_fight', 'Berkelahi', 'الشجار', 'Berkelahi atau bertengkar dengan teman', 'SOCIAL', 'NEGATIVE', 'HIGH', -8,
 JSON_ARRAY('Memukul atau mendorong teman', 'Bertengkar secara fisik', 'Menggunakan kata-kata kasar'),
 JSON_ARRAY('Teguran keras', 'Mediasi konflik', 'Panggilan orang tua', 'Konseling'),
 JSON_OBJECT('hadith', 'المسلم من سلم المسلمون من لسانه ويده', 'explanation', 'Muslim adalah orang yang kaum muslimin selamat dari lisan dan tangannya'));

-- Insert sample behavior records (for testing)
INSERT INTO behavior_records (santri_id, category, type, severity, points, date, description, recorded_by) 
SELECT 
    s.id,
    'AKHLAQ',
    'POSITIVE',
    'LOW',
    5,
    CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY,
    'Menunjukkan sikap jujur dalam pembelajaran',
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
FROM santri s 
WHERE s.status = 'ACTIVE' 
LIMIT 10;

-- =====================================================
-- VIEWS UNTUK REPORTING
-- =====================================================

-- View untuk summary perilaku santri
CREATE VIEW behavior_summary AS
SELECT
    s.id as santri_id,
    s.name as santri_name,
    s.nis,
    h.name as halaqah_name,
    COUNT(br.id) as total_records,
    SUM(CASE WHEN br.type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
    SUM(CASE WHEN br.type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
    SUM(br.points) as total_points,
    AVG(br.points) as average_points,
    MAX(br.date) as last_record_date
FROM santri s
LEFT JOIN halaqah h ON s.halaqahId = h.id
LEFT JOIN behavior_records br ON s.id = br.santri_id
WHERE s.status = 'ACTIVE'
GROUP BY s.id, s.name, s.nis, h.name;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger untuk update timestamp
CREATE TRIGGER behavior_records_updated_at 
    BEFORE UPDATE ON behavior_records 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger untuk auto-create alert jika perilaku negatif berulang
CREATE TRIGGER behavior_alert_trigger 
    AFTER INSERT ON behavior_records 
    FOR EACH ROW 
BEGIN
    DECLARE negative_count INT DEFAULT 0;
    
    IF NEW.type = 'NEGATIVE' AND NEW.severity IN ('HIGH', 'CRITICAL') THEN
        -- Hitung perilaku negatif dalam 7 hari terakhir
        SELECT COUNT(*) INTO negative_count
        FROM behavior_records 
        WHERE santri_id = NEW.santri_id 
        AND type = 'NEGATIVE' 
        AND date >= DATE_SUB(NEW.date, INTERVAL 7 DAY);
        
        -- Buat alert jika lebih dari 3 perilaku negatif dalam seminggu
        IF negative_count >= 3 THEN
            INSERT INTO behavior_alerts (
                santri_id, alert_type, title, message, severity,
                trigger_criteria, action_required
            ) VALUES (
                NEW.santri_id,
                'FREQUENCY',
                'Perilaku Negatif Berulang',
                CONCAT('Santri menunjukkan ', negative_count, ' perilaku negatif dalam 7 hari terakhir'),
                'HIGH',
                JSON_OBJECT('type', 'negative_frequency', 'count', negative_count, 'days', 7),
                TRUE
            );
        END IF;
    END IF;
END//

DELIMITER ;
