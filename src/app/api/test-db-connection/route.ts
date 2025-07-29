import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "db_tpq",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

export async function GET(request: NextRequest) {
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

    // Check halaqah table structure if exists
    let halaqahStructure = null;
    try {
      const [structure] = await connection.execute("DESCRIBE halaqah");
      halaqahStructure = structure;
      console.log("📋 Halaqah table structure:", structure);
    } catch (error) {
      console.log("⚠️ Halaqah table does not exist or cannot be accessed");
    }

    // Check for sample data
    let sampleData = null;
    try {
      const [data] = await connection.execute(
        "SELECT COUNT(*) as count FROM halaqah",
      );
      sampleData = data;
      console.log("📊 Halaqah count:", data);
    } catch (error) {
      console.log("⚠️ Cannot count halaqah records");
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: "OK",
        tables: tables,
        halaqahStructure: halaqahStructure,
        sampleData: sampleData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
        config: {
          host: dbConfig.host,
          user: dbConfig.user,
          database: dbConfig.database,
          port: dbConfig.port,
        },
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}
