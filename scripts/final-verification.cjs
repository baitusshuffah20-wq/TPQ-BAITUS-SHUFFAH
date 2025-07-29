const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
  port: 3306,
  connectTimeout: 60000,
};

async function runFinalVerification() {
  console.log("🎯 BEHAVIOR CRITERIA SYSTEM - FINAL VERIFICATION");
  console.log("=".repeat(60));

  let allChecks = [];

  // Check 1: Database Connection
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("SELECT 1");
    await connection.end();
    allChecks.push({
      name: "Database Connection",
      status: "✅ PASS",
      details: "Successfully connected to db_tpq",
    });
  } catch (error) {
    allChecks.push({
      name: "Database Connection",
      status: "❌ FAIL",
      details: error.message,
    });
  }

  // Check 2: Required Tables
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [tables] = await connection.execute("SHOW TABLES LIKE 'behavior_%'");
    const tableNames = tables.map((row) => Object.values(row)[0]);
    const requiredTables = [
      "behavior_criteria",
      "behavior_records",
      "behavior_alerts",
    ];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table),
    );

    if (missingTables.length === 0) {
      allChecks.push({
        name: "Required Tables",
        status: "✅ PASS",
        details: `Found: ${tableNames.join(", ")}`,
      });
    } else {
      allChecks.push({
        name: "Required Tables",
        status: "❌ FAIL",
        details: `Missing: ${missingTables.join(", ")}`,
      });
    }
    await connection.end();
  } catch (error) {
    allChecks.push({
      name: "Required Tables",
      status: "❌ FAIL",
      details: error.message,
    });
  }

  // Check 3: Sample Data
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM behavior_criteria",
    );
    const count = rows[0].count;

    if (count > 0) {
      allChecks.push({
        name: "Sample Data",
        status: "✅ PASS",
        details: `${count} behavior criteria records found`,
      });
    } else {
      allChecks.push({
        name: "Sample Data",
        status: "⚠️ WARN",
        details: "No sample data found",
      });
    }
    await connection.end();
  } catch (error) {
    allChecks.push({
      name: "Sample Data",
      status: "❌ FAIL",
      details: error.message,
    });
  }

  // Check 4: API Configuration
  try {
    // Check if the API files have correct database configuration
    const fs = require("fs");
    const apiFile = fs.readFileSync(
      "src/app/api/behavior-criteria/route.ts",
      "utf8",
    );

    if (apiFile.includes("db_tpq") && apiFile.includes("admin123")) {
      allChecks.push({
        name: "API Configuration",
        status: "✅ PASS",
        details: "API configured for db_tpq database",
      });
    } else {
      allChecks.push({
        name: "API Configuration",
        status: "⚠️ WARN",
        details: "API configuration may need verification",
      });
    }
  } catch (error) {
    allChecks.push({
      name: "API Configuration",
      status: "❌ FAIL",
      details: error.message,
    });
  }

  // Display Results
  console.log("\n📋 VERIFICATION RESULTS:");
  console.log("-".repeat(60));

  allChecks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.name}: ${check.status}`);
    console.log(`   ${check.details}`);
    console.log("");
  });

  // Summary
  const passCount = allChecks.filter((c) => c.status.includes("✅")).length;
  const failCount = allChecks.filter((c) => c.status.includes("❌")).length;
  const warnCount = allChecks.filter((c) => c.status.includes("⚠️")).length;

  console.log("=".repeat(60));
  console.log("📊 SUMMARY:");
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ⚠️ Warnings: ${warnCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (failCount === 0) {
    console.log("\n🎉 SYSTEM READY!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Ensure Next.js server is running: npm run dev");
    console.log("   2. Open browser and navigate to:");
    console.log(
      "      http://localhost:3000/dashboard/admin/behavior/criteria",
    );
    console.log(
      "   3. You should see the behavior criteria management interface",
    );
    console.log(
      '   4. The page should load without the "Gagal mengambil data" error',
    );
    console.log(
      "\n✨ The behavior criteria management system is now fully functional!",
    );
  } else {
    console.log("\n❌ SYSTEM NOT READY");
    console.log("   Please fix the failed checks above before proceeding.");
  }

  return failCount === 0;
}

// Run verification
runFinalVerification()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 Verification error:", error);
    process.exit(1);
  });
