// Comprehensive test for Behavior Criteria Management System
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tpq_baitus_shuffahh",
  port: parseInt(process.env.DB_PORT || "3306"),
};

// API Base URL
const API_BASE = 'http://localhost:3000/api/behavior-criteria';

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

// Test data samples
const testCriteria = [
  {
    name: "Jujur",
    nameArabic: "الصدق",
    description: "Berkata dan bertindak dengan jujur dalam segala situasi",
    category: "AKHLAQ",
    type: "POSITIVE",
    severity: "LOW",
    points: 5,
    isActive: true,
    ageGroup: "5+",
    examples: [
      "Mengakui kesalahan dengan jujur",
      "Tidak berbohong kepada guru atau teman",
      "Mengembalikan barang yang bukan miliknya"
    ],
    rewards: [
      "Pujian di depan kelas",
      "Sticker bintang",
      "Sertifikat kejujuran"
    ],
    islamicReference: {
      hadith: "عليكم بالصدق فإن الصدق يهدي إلى البر",
      explanation: "Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan"
    }
  },
  {
    name: "Terlambat",
    nameArabic: "التأخير",
    description: "Datang terlambat ke TPQ tanpa alasan yang jelas",
    category: "DISCIPLINE",
    type: "NEGATIVE",
    severity: "LOW",
    points: -2,
    isActive: true,
    ageGroup: "5+",
    examples: [
      "Datang lebih dari 15 menit setelah waktu mulai",
      "Tidak memberitahu alasan keterlambatan"
    ],
    consequences: [
      "Teguran lisan",
      "Membersihkan kelas",
      "Surat peringatan untuk orang tua"
    ]
  }
];

async function testFullFunctionality() {
  log('🧪 COMPREHENSIVE BEHAVIOR CRITERIA SYSTEM TEST', 'cyan');
  log('================================================', 'cyan');
  console.log();

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  let connection;
  let createdIds = [];

  try {
    // Test 1: Database Connection
    testResults.total++;
    log('1️⃣ Testing Database Connection...', 'blue');
    try {
      connection = await mysql.createConnection(dbConfig);
      log('✅ Database connection successful', 'green');
      testResults.passed++;
    } catch (error) {
      log(`❌ Database connection failed: ${error.message}`, 'red');
      testResults.failed++;
      return;
    }

    // Test 2: Table Structure
    testResults.total++;
    log('\n2️⃣ Verifying Table Structure...', 'blue');
    try {
      const [columns] = await connection.execute("DESCRIBE behavior_criteria");
      const expectedColumns = ['id', 'name', 'name_arabic', 'description', 'category', 'type', 'severity', 'points', 'is_active', 'age_group', 'examples', 'consequences', 'rewards', 'islamic_reference', 'created_at', 'updated_at'];
      const actualColumns = (columns as any[]).map(col => col.Field);
      
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      if (missingColumns.length === 0) {
        log('✅ All required columns exist', 'green');
        testResults.passed++;
      } else {
        log(`❌ Missing columns: ${missingColumns.join(', ')}`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Table structure check failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 3: API GET (Empty state)
    testResults.total++;
    log('\n3️⃣ Testing API GET (Initial state)...', 'blue');
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      if (response.status === 200 && data.success) {
        log(`✅ API GET successful - Found ${data.data.length} existing criteria`, 'green');
        testResults.passed++;
      } else {
        log(`❌ API GET failed: ${data.message}`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ API GET failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 4: API POST (Create criteria)
    testResults.total++;
    log('\n4️⃣ Testing API POST (Create criteria)...', 'blue');
    try {
      for (let i = 0; i < testCriteria.length; i++) {
        const criteria = testCriteria[i];
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria)
        });
        
        const data = await response.json();
        
        if (response.status === 200 && data.success) {
          createdIds.push(data.data.id);
          log(`  ✅ Created: ${criteria.name} (ID: ${data.data.id})`, 'green');
        } else {
          log(`  ❌ Failed to create: ${criteria.name} - ${data.message}`, 'red');
        }
      }
      
      if (createdIds.length === testCriteria.length) {
        log('✅ All test criteria created successfully', 'green');
        testResults.passed++;
      } else {
        log(`❌ Only ${createdIds.length}/${testCriteria.length} criteria created`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ API POST failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 5: API GET (With data)
    testResults.total++;
    log('\n5️⃣ Testing API GET (With data)...', 'blue');
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      if (response.status === 200 && data.success && data.data.length >= createdIds.length) {
        log(`✅ API GET successful - Found ${data.data.length} criteria`, 'green');
        log(`  Pagination: Page ${data.pagination.page}/${data.pagination.totalPages}`, 'yellow');
        testResults.passed++;
      } else {
        log(`❌ API GET failed or insufficient data`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ API GET failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 6: API GET with filters
    testResults.total++;
    log('\n6️⃣ Testing API GET with filters...', 'blue');
    try {
      const filters = [
        { name: 'Category filter', param: 'category=AKHLAQ' },
        { name: 'Type filter', param: 'type=POSITIVE' },
        { name: 'Search filter', param: 'search=jujur' },
        { name: 'Status filter', param: 'isActive=true' }
      ];
      
      let filtersPassed = 0;
      for (const filter of filters) {
        const response = await fetch(`${API_BASE}?${filter.param}`);
        const data = await response.json();
        
        if (response.status === 200 && data.success) {
          log(`  ✅ ${filter.name}: ${data.data.length} results`, 'green');
          filtersPassed++;
        } else {
          log(`  ❌ ${filter.name} failed`, 'red');
        }
      }
      
      if (filtersPassed === filters.length) {
        log('✅ All filters working correctly', 'green');
        testResults.passed++;
      } else {
        log(`❌ Only ${filtersPassed}/${filters.length} filters working`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Filter testing failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 7: API GET by ID
    testResults.total++;
    log('\n7️⃣ Testing API GET by ID...', 'blue');
    try {
      if (createdIds.length > 0) {
        const response = await fetch(`${API_BASE}/${createdIds[0]}`);
        const data = await response.json();
        
        if (response.status === 200 && data.success) {
          log(`✅ GET by ID successful for: ${data.data.name}`, 'green');
          log(`  Usage stats: ${data.data.usage.total} total, ${data.data.usage.recent} recent`, 'yellow');
          testResults.passed++;
        } else {
          log(`❌ GET by ID failed: ${data.message}`, 'red');
          testResults.failed++;
        }
      } else {
        log('❌ No IDs available for testing', 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ GET by ID failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 8: API PUT (Update)
    testResults.total++;
    log('\n8️⃣ Testing API PUT (Update)...', 'blue');
    try {
      if (createdIds.length > 0) {
        const updateData = {
          id: createdIds[0],
          name: "Jujur (Updated)",
          points: 10
        };
        
        const response = await fetch(API_BASE, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (response.status === 200 && data.success) {
          log('✅ Update successful', 'green');
          testResults.passed++;
        } else {
          log(`❌ Update failed: ${data.message}`, 'red');
          testResults.failed++;
        }
      } else {
        log('❌ No IDs available for testing', 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Update failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Test 9: Database integrity
    testResults.total++;
    log('\n9️⃣ Testing Database Integrity...', 'blue');
    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM behavior_criteria WHERE JSON_VALID(examples) = 1"
      );
      const validJsonCount = (rows as any[])[0].count;
      
      const [totalRows] = await connection.execute(
        "SELECT COUNT(*) as count FROM behavior_criteria"
      );
      const totalCount = (totalRows as any[])[0].count;
      
      if (validJsonCount === totalCount) {
        log('✅ All JSON fields are valid', 'green');
        testResults.passed++;
      } else {
        log(`❌ ${totalCount - validJsonCount} records have invalid JSON`, 'red');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ Database integrity check failed: ${error.message}`, 'red');
      testResults.failed++;
    }

    // Cleanup: Delete test data
    log('\n🧹 Cleaning up test data...', 'yellow');
    for (const id of createdIds) {
      try {
        const response = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          log(`  ✅ Deleted: ${id}`, 'green');
        } else {
          log(`  ❌ Failed to delete: ${id}`, 'red');
        }
      } catch (error) {
        log(`  ❌ Error deleting ${id}: ${error.message}`, 'red');
      }
    }

  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'red');
    testResults.failed++;
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  // Final Results
  console.log();
  log('📊 FINAL TEST RESULTS', 'cyan');
  log('====================', 'cyan');
  log(`✅ Passed: ${testResults.passed}/${testResults.total}`, testResults.passed === testResults.total ? 'green' : 'yellow');
  log(`❌ Failed: ${testResults.failed}/${testResults.total}`, testResults.failed === 0 ? 'green' : 'red');
  
  const successRate = Math.round((testResults.passed / testResults.total) * 100);
  log(`📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  if (testResults.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! System is fully functional.', 'green');
    log('You can now use the Behavior Criteria Management System with confidence.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }
  
  console.log();
  log('🚀 Next Steps:', 'cyan');
  log('1. Open http://localhost:3000/dashboard/admin/behavior/criteria', 'yellow');
  log('2. Test the web interface manually', 'yellow');
  log('3. Create, edit, and delete criteria through the UI', 'yellow');
  log('4. Test search and filter functionality', 'yellow');
}

// Run the comprehensive test
testFullFunctionality().catch(console.error);
