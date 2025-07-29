// Simple test to check if server is running and test SPP bulk generate
const testData = {
  sppSettingId: "cmdipj2gn00006u4g4dcghrvy", // From debug output
  santriIds: ["11c929f4-0473-44f5-bd61-1a0be9390409"], // From debug output
  months: [
    {
      month: 12,
      year: 2024,
      dueDate: "2024-12-10",
    },
  ],
};

console.log("🧪 Testing SPP Bulk Generate with known data...");
console.log("📝 Test data:", JSON.stringify(testData, null, 2));

// Test using Node.js built-in fetch (Node 18+)
fetch("http://localhost:3000/api/spp/bulk-generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => {
    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries()),
    );
    return response.text();
  })
  .then((responseText) => {
    console.log("📄 Raw response:", responseText);

    try {
      const responseData = JSON.parse(responseText);
      console.log("📋 Parsed response:", JSON.stringify(responseData, null, 2));

      if (responseData.success) {
        console.log(
          "✅ Test successful! Created",
          responseData.count,
          "SPP records",
        );
      } else {
        console.log("❌ Test failed:", responseData.message);
      }
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e.message);
    }
  })
  .catch((error) => {
    console.error("❌ Request failed:", error.message);
  });
