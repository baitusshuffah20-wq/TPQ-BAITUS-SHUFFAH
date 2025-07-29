const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
  port: 3306,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

async function setupBehaviorTables() {
  let connection;
  try {
    console.log("🔌 Connecting to database...");
    console.log("📋 Config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection successful");

    console.log("🔧 Creating behavior_criteria table...");
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ behavior_criteria table created");

    console.log("🔧 Creating behavior_records table...");
    await connection.execute(`
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
        parent_notified BOOLEAN DEFAULT FALSE,
        parent_notification_date TIMESTAMP NULL,
        follow_up_notes TEXT,
        resolution_notes TEXT,
        resolved_at TIMESTAMP NULL,
        resolved_by VARCHAR(36),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_santri (santri_id),
        INDEX idx_halaqah (halaqah_id),
        INDEX idx_criteria (criteria_id),
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_category_type (category, type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ behavior_records table created");

    console.log("🔧 Creating character_goals table...");
    await connection.execute(`
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
        progress INT DEFAULT 0,
        milestones JSON,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        parent_involved BOOLEAN DEFAULT FALSE,
        musyrif_notes TEXT,
        parent_feedback TEXT,
        completion_date TIMESTAMP NULL,
        INDEX idx_santri (santri_id),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_target_date (target_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ character_goals table created");

    console.log("🔧 Creating behavior_alerts table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS behavior_alerts (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        santri_id VARCHAR(36) NOT NULL,
        alert_type ENUM('NEGATIVE_PATTERN', 'IMPROVEMENT_NEEDED', 'POSITIVE_STREAK', 'GOAL_ACHIEVED') NOT NULL,
        severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        trigger_data JSON,
        status ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged_at TIMESTAMP NULL,
        acknowledged_by VARCHAR(36),
        resolved_at TIMESTAMP NULL,
        resolved_by VARCHAR(36),
        resolution_notes TEXT,
        INDEX idx_santri (santri_id),
        INDEX idx_type (alert_type),
        INDEX idx_severity (severity),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ behavior_alerts table created");

    // Verify tables were created
    console.log("🔍 Verifying tables...");
    const [tables] = await connection.execute("SHOW TABLES LIKE 'behavior_%'");
    console.log("📊 Behavior tables found:", tables);

    console.log("🎉 All behavior tables created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error setting up behavior tables:", error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the setup
setupBehaviorTables()
  .then((success) => {
    if (success) {
      console.log("\n✅ Setup completed successfully!");
      process.exit(0);
    } else {
      console.log("\n❌ Setup failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
