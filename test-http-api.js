// Test HTTP API endpoints
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testGetSettings() {
  try {
    console.log("🔍 Testing GET /api/settings...");

    const response = await fetch(`${BASE_URL}/api/settings`);
    const data = await response.json();

    console.log("Response status:", response.status);

    if (response.ok && data.success) {
      console.log("✅ GET /api/settings successful");
      console.log(
        `📊 Found ${Object.keys(data.settings || {}).length} settings`,
      );

      // Check specific settings
      const settings = data.settings;
      console.log("\n📋 Key settings:");
      console.log(`- Site Name: ${settings["site.name"]?.value}`);
      console.log(`- Site Description: ${settings["site.description"]?.value}`);
      console.log(`- Logo: ${settings["site.logo"]?.value}`);
      console.log(`- Favicon: ${settings["site.favicon"]?.value}`);

      return data;
    } else {
      console.log("❌ GET /api/settings failed");
      console.log("Response:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error testing GET API:", error.message);
    return null;
  }
}

async function testPostSettings() {
  try {
    console.log("\n📝 Testing POST /api/settings...");

    const testData = {
      key: "test.http.setting",
      value: "HTTP test value",
      type: "STRING",
      category: "TEST",
      label: "HTTP Test Setting",
      description: "A test setting via HTTP",
      isPublic: true,
    };

    const response = await fetch(`${BASE_URL}/api/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log("Response status:", response.status);

    if (response.ok && data.success) {
      console.log("✅ POST /api/settings successful");
      console.log("📝 Setting saved:", data.data);
      return data;
    } else {
      console.log("❌ POST /api/settings failed");
      console.log("Response:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error testing POST API:", error.message);
    return null;
  }
}

async function testUploadAPI() {
  try {
    console.log("\n📤 Testing upload API...");

    // Create a simple test file buffer
    const testFileContent = Buffer.from("test image content");
    const formData = new FormData();

    // Create a blob from buffer
    const blob = new Blob([testFileContent], { type: "image/png" });
    formData.append("file", blob, "test.png");

    const response = await fetch(`${BASE_URL}/api/upload/local`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("Response status:", response.status);

    if (response.ok && data.success) {
      console.log("✅ Upload API successful");
      console.log("📤 File uploaded:", data.fileUrl);
      return data;
    } else {
      console.log("❌ Upload API failed");
      console.log("Response:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error testing upload API:", error.message);
    return null;
  }
}

async function checkServerStatus() {
  try {
    console.log("🔍 Checking server status...");

    const response = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      timeout: 5000,
    });

    if (response.ok) {
      console.log("✅ Server is running");
      return true;
    } else {
      console.log("❌ Server responded with error:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Server is not running or not accessible");
    console.log("Error:", error.message);
    return false;
  }
}

async function runHTTPTests() {
  console.log("🧪 Testing HTTP API Endpoints...\n");

  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log(
      "\n⚠️  Server is not running. Please start the development server with:",
    );
    console.log("   npm run dev");
    console.log("\nThen run this test again.");
    return;
  }

  await testGetSettings();
  await testPostSettings();
  await testUploadAPI();

  console.log("\n🏁 HTTP API tests completed!");
}

runHTTPTests();
