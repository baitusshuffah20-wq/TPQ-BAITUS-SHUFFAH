// Test API settings
async function testSettingsAPI() {
  try {
    console.log("Testing GET /api/settings...");

    const response = await fetch("http://localhost:3000/api/settings");
    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("✅ GET /api/settings works!");
      console.log("Settings found:", Object.keys(data.settings || {}).length);
    } else {
      console.log("❌ GET /api/settings failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

// Test POST API
async function testPostAPI() {
  try {
    console.log("\nTesting POST /api/settings...");

    const testData = {
      key: "test.setting",
      value: "test value",
      type: "STRING",
      category: "TEST",
      label: "Test Setting",
      description: "A test setting",
      isPublic: true,
    };

    const response = await fetch("http://localhost:3000/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("✅ POST /api/settings works!");
    } else {
      console.log("❌ POST /api/settings failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error testing POST API:", error.message);
  }
}

// Run tests
async function runTests() {
  console.log("🧪 Testing Settings API...\n");

  await testSettingsAPI();
  await testPostAPI();

  console.log("\n🏁 Tests completed!");
}

runTests();
