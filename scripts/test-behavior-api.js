// Test script for Behavior Criteria API
const API_BASE = "http://localhost:3000/api/behavior-criteria";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(colors[color] + message + colors.reset);
}

// Test data
const testCriteria = {
  name: "Test Kejujuran",
  nameArabic: "اختبار الصدق",
  description: "Kriteria test untuk menguji sistem",
  category: "AKHLAQ",
  type: "POSITIVE",
  severity: "LOW",
  points: 5,
  isActive: true,
  ageGroup: "5+",
  examples: ["Mengakui kesalahan dengan jujur", "Tidak berbohong kepada guru"],
  rewards: ["Pujian di depan kelas", "Sticker bintang"],
  islamicReference: {
    hadith: "عليكم بالصدق فإن الصدق يهدي إلى البر",
    explanation:
      "Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan",
  },
};

async function testAPI() {
  log("🧪 Testing Behavior Criteria API...", "cyan");
  log("=====================================", "cyan");
  console.log();

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  try {
    // Test 1: GET all criteria
    testResults.total++;
    log("1️⃣ Testing GET /api/behavior-criteria", "blue");
    try {
      const getResponse = await fetch(API_BASE);
      const getData = await getResponse.json();

      if (getResponse.status === 200 && getData.success) {
        log(`✅ Status: ${getResponse.status}`, "green");
        log(`✅ Found ${getData.data?.length || 0} criteria`, "green");
        log(
          `✅ Pagination: Page ${getData.pagination?.page}/${getData.pagination?.totalPages}`,
          "green",
        );
        testResults.passed++;
      } else {
        log(`❌ Status: ${getResponse.status}`, "red");
        log(`❌ Response: ${JSON.stringify(getData, null, 2)}`, "red");
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ GET test failed: ${error.message}`, "red");
      testResults.failed++;
    }
    console.log();

    // Test 2: POST new criteria
    console.log("2️⃣ Testing POST /api/behavior-criteria");
    const postResponse = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCriteria),
    });
    const postData = await postResponse.json();
    console.log("Status:", postResponse.status);
    console.log("Response:", JSON.stringify(postData, null, 2));

    if (postData.success) {
      const createdId = postData.data.id;
      console.log("✅ POST test completed - Created ID:", createdId);

      // Test 3: GET single criteria
      console.log("\n3️⃣ Testing GET /api/behavior-criteria/" + createdId);
      const getSingleResponse = await fetch(`${API_BASE}/${createdId}`);
      const getSingleData = await getSingleResponse.json();
      console.log("Status:", getSingleResponse.status);
      console.log("Response:", JSON.stringify(getSingleData, null, 2));
      console.log("✅ GET single test completed\n");

      // Test 4: PUT update criteria
      console.log("4️⃣ Testing PUT /api/behavior-criteria");
      const updateData = {
        id: createdId,
        name: "Test Kejujuran (Updated)",
        points: 10,
      };
      const putResponse = await fetch(API_BASE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      const putData = await putResponse.json();
      console.log("Status:", putResponse.status);
      console.log("Response:", JSON.stringify(putData, null, 2));
      console.log("✅ PUT test completed\n");

      // Test 5: DELETE criteria
      console.log("5️⃣ Testing DELETE /api/behavior-criteria");
      const deleteResponse = await fetch(`${API_BASE}?id=${createdId}`, {
        method: "DELETE",
      });
      const deleteData = await deleteResponse.json();
      console.log("Status:", deleteResponse.status);
      console.log("Response:", JSON.stringify(deleteData, null, 2));
      console.log("✅ DELETE test completed\n");
    } else {
      console.log("❌ POST test failed, skipping other tests");
    }

    console.log("🎉 All API tests completed!");
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

// Run tests if this script is executed directly
if (typeof window === "undefined") {
  // Node.js environment
  const fetch = require("node-fetch");
  testAPI();
} else {
  // Browser environment
  window.testBehaviorAPI = testAPI;
  console.log("Use testBehaviorAPI() to run tests in browser console");
}
