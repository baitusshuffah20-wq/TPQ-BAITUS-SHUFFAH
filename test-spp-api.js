// Test script untuk mengecek API SPP
const fetch = require("node-fetch");

async function testSPPAPI() {
  try {
    console.log("Testing SPP Settings API...");
    const settingsResponse = await fetch(
      "http://localhost:3000/api/spp/settings",
    );
    const settingsData = await settingsResponse.json();
    console.log("Settings Response:", JSON.stringify(settingsData, null, 2));

    console.log("\nTesting SPP Records API...");
    const recordsResponse = await fetch(
      "http://localhost:3000/api/spp/records?limit=10",
    );
    const recordsData = await recordsResponse.json();
    console.log("Records Response:", JSON.stringify(recordsData, null, 2));
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testSPPAPI();
