// Test database connection for Behavior Criteria system
const mysql = require('mysql2/promise');

// Database configuration (same as API)
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tpq_baitus_shuffahh",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testDatabaseConnection() {
  log('🔍 Testing Database Connection for Behavior Criteria System', 'cyan');
  log('==========================================================', 'cyan');
  console.log();

  let connection;
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  try {
    // Test 1: Basic connection
    testResults.total++;
    log('1️⃣ Testing MySQL connection...', 'blue');
    log(`   Host: ${dbConfig.host}:${dbConfig.port}`, 'yellow');
    log(`   User: ${dbConfig.user}`, 'yellow');
    log(`   Database: ${dbConfig.database}`, 'yellow');

    try {
      connection = await mysql.createConnection(dbConfig);
      log('✅ MySQL connection successful', 'green');
      testResults.passed++;
    } catch (error) {
      log(`❌ MySQL connection failed: ${error.message}`, 'red');
      log('   Please check:', 'yellow');
      log('   - XAMPP MySQL service is running', 'yellow');
      log('   - Database credentials are correct', 'yellow');
      log('   - Port 3306 is not blocked', 'yellow');
      testResults.failed++;
      return;
    }

    // Test 2: Database exists
    testResults.total++;
    log('\n2️⃣ Checking if database exists...', 'blue');
    try {
      const [databases] = await connection.execute(
        "SHOW DATABASES LIKE 'tpq_baitus_shuffahh'"
      );
      if ((databases as any[]).length > 0) {
        log('✅ Database tpq_baitus_shuffahh exists', 'green');
        testResults.passed++;
      } else {
        log('❌ Database tpq_baitus_shuffahh does not exist', 'red');
        log('   Run: CREATE DATABASE tpq_baitus_shuffahh;', 'yellow');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Error checking database: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 3: Check behavior_criteria table
    testResults.total++;
    log('\n3️⃣ Checking behavior_criteria table...', 'blue');
    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'behavior_criteria'"
      );
      if ((tables as any[]).length > 0) {
        log('✅ Table behavior_criteria exists', 'green');
        testResults.passed++;

        // Check table structure
        const [columns] = await connection.execute(
          "DESCRIBE behavior_criteria"
        );
        log(`   Table has ${(columns as any[]).length} columns`, 'green');
        
        // Check sample data
        const [rows] = await connection.execute(
          "SELECT COUNT(*) as count FROM behavior_criteria"
        );
        const count = (rows as any[])[0].count;
        log(`   Table contains ${count} records`, count > 0 ? 'green' : 'yellow');
        
      } else {
        log('❌ Table behavior_criteria does not exist', 'red');
        log('   Run migration: scripts\\setup-behavior-tables.bat', 'yellow');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Error checking table: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 4: Check other behavior tables
    testResults.total++;
    log('\n4️⃣ Checking other behavior tables...', 'blue');
    try {
      const behaviorTables = ['behavior_records', 'character_goals', 'behavior_alerts'];
      let existingTables = 0;
      
      for (const tableName of behaviorTables) {
        const [tables] = await connection.execute(
          `SHOW TABLES LIKE '${tableName}'`
        );
        if ((tables as any[]).length > 0) {
          existingTables++;
          log(`   ✅ ${tableName} exists`, 'green');
        } else {
          log(`   ❌ ${tableName} missing`, 'red');
        }
      }
      
      if (existingTables === behaviorTables.length) {
        log('✅ All behavior tables exist', 'green');
        testResults.passed++;
      } else {
        log(`❌ ${behaviorTables.length - existingTables} behavior tables missing`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Error checking behavior tables: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 5: Test basic query
    testResults.total++;
    log('\n5️⃣ Testing basic query...', 'blue');
    try {
      const [rows] = await connection.execute(
        "SELECT id, name, category, type FROM behavior_criteria LIMIT 3"
      );
      log(`✅ Query successful, returned ${(rows as any[]).length} rows`, 'green');
      
      if ((rows as any[]).length > 0) {
        log('   Sample data:', 'yellow');
        (rows as any[]).forEach((row, index) => {
          log(`   ${index + 1}. ${row.name} (${row.category}/${row.type})`, 'yellow');
        });
      }
      testResults.passed++;
    } catch (error) {
      log(`❌ Query failed: ${error.message}`, 'red');
      testResults.failed++;
    }

  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'red');
    testResults.failed++;
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  // Summary
  console.log();
  log('📊 Test Results Summary', 'cyan');
  log('=====================', 'cyan');
  log(`✅ Passed: ${testResults.passed}/${testResults.total}`, testResults.passed === testResults.total ? 'green' : 'yellow');
  log(`❌ Failed: ${testResults.failed}/${testResults.total}`, testResults.failed === 0 ? 'green' : 'red');
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Database is ready for Behavior Criteria system.', 'green');
    log('You can now start the Next.js server and test the API endpoints.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above before proceeding.', 'yellow');
    log('Common solutions:', 'yellow');
    log('1. Run: scripts\\setup-behavior-tables.bat', 'yellow');
    log('2. Check XAMPP MySQL service', 'yellow');
    log('3. Verify database credentials', 'yellow');
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
