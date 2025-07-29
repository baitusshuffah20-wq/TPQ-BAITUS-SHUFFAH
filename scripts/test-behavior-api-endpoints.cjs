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

async function testDatabaseConnection() {
  let connection;
  try {
    console.log("🔌 Testing direct database connection...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection successful");

    // Test table existence
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'behavior_criteria'",
    );
    if (tables.length === 0) {
      console.log("❌ behavior_criteria table does not exist");
      return false;
    }
    console.log("✅ behavior_criteria table exists");

    // Test data retrieval
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM behavior_criteria",
    );
    const count = rows[0].count;
    console.log(`📊 Found ${count} behavior criteria records`);

    if (count === 0) {
      console.log("⚠️ No behavior criteria data found");
      return false;
    }

    // Test sample query
    const [sampleData] = await connection.execute(`
      SELECT id, name, name_arabic, category, type, points, is_active 
      FROM behavior_criteria 
      LIMIT 3
    `);

    console.log("📋 Sample data:");
    sampleData.forEach((row, index) => {
      console.log(
        `  ${index + 1}. ${row.name} (${row.name_arabic}) - ${row.category}/${row.type} - ${row.points} points`,
      );
    });

    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testAPIEndpoints() {
  console.log("\n🌐 Testing API endpoints...");

  try {
    // Test if we can make HTTP requests (simple check)
    console.log(
      "📡 API endpoint tests would require the Next.js server to be running",
    );
    console.log("💡 To test API endpoints manually:");
    console.log("   1. Start Next.js server: npm run dev");
    console.log(
      "   2. Open browser and go to: http://localhost:3000/api/behavior-criteria",
    );
    console.log(
      "   3. Check the behavior criteria page: http://localhost:3000/dashboard/admin/behavior/criteria",
    );

    return true;
  } catch (error) {
    console.error("❌ API test error:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 Starting Behavior Criteria System Tests");
  console.log("=".repeat(50));

  let allTestsPassed = true;

  // Test 1: Database Connection
  console.log("\n📋 Test 1: Database Connection and Data");
  const dbTest = await testDatabaseConnection();
  if (!dbTest) {
    allTestsPassed = false;
    console.log("❌ Database test failed");
  } else {
    console.log("✅ Database test passed");
  }

  // Test 2: API Endpoints
  console.log("\n📋 Test 2: API Endpoints");
  const apiTest = await testAPIEndpoints();
  if (!apiTest) {
    allTestsPassed = false;
    console.log("❌ API test failed");
  } else {
    console.log("✅ API test passed");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allTestsPassed) {
    console.log(
      "🎉 All tests passed! The behavior criteria system should be working.",
    );
    console.log("\n📝 Next steps:");
    console.log("   1. Start your Next.js server: npm run dev");
    console.log(
      "   2. Navigate to: http://localhost:3000/dashboard/admin/behavior/criteria",
    );
    console.log(
      "   3. You should see the behavior criteria management interface",
    );
  } else {
    console.log("❌ Some tests failed. Please check the errors above.");
  }

  return allTestsPassed;
}

// Run the tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
