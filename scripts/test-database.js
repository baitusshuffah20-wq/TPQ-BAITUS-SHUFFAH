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

async function testDatabaseConnection() {
  let connection;
  try {
    console.log("🔌 Testing database connection...");
    console.log("📋 Config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection successful");

    // Test basic query
    const [result] = await connection.execute("SELECT 1 as test");
    console.log("✅ Basic query successful:", result);

    // Check available tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("📋 Available tables:", tables);

    // Check if halaqah table exists
    const tableNames = tables.map((row) => Object.values(row)[0]);
    const hasHalaqahTable = tableNames.includes("halaqah");

    console.log("🔍 Halaqah table exists:", hasHalaqahTable);

    if (hasHalaqahTable) {
      // Check halaqah table structure
      const [structure] = await connection.execute("DESCRIBE halaqah");
      console.log("📋 Halaqah table structure:", structure);

      // Check for sample data
      const [data] = await connection.execute(
        "SELECT COUNT(*) as count FROM halaqah",
      );
      console.log("📊 Halaqah count:", data[0]);
    }

    return {
      success: true,
      connection: "OK",
      tables: tableNames,
      hasHalaqahTable: hasHalaqahTable,
    };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return {
      success: false,
      error: error.message,
      config: dbConfig,
    };
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the test
testDatabaseConnection()
  .then((result) => {
    console.log("\n🎯 Final Result:", result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
