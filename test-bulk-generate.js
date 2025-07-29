import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBulkGenerate() {
  try {
    console.log("🧪 Testing SPP Bulk Generate API...\n");

    // Get test data
    const firstSantri = await prisma.santri.findFirst({
      select: { id: true, name: true, nis: true },
    });

    const activeSetting = await prisma.sPPSetting.findFirst({
      where: { isActive: true },
      select: { id: true, name: true, amount: true },
    });

    if (!firstSantri || !activeSetting) {
      console.log("❌ Missing test data");
      return;
    }

    console.log("📋 Test data:");
    console.log("Santri:", firstSantri);
    console.log("SPP Setting:", activeSetting);
    console.log("");

    // Test data for bulk generate
    const testData = {
      sppSettingId: activeSetting.id,
      santriIds: [firstSantri.id],
      months: [
        {
          month: 12,
          year: 2024,
          dueDate: "2024-12-10",
        },
      ],
    };

    console.log("📝 Sending test data:", JSON.stringify(testData, null, 2));

    // Make API call
    const response = await fetch(
      "http://localhost:3000/api/spp/bulk-generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      },
    );

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    let responseData;
    try {
      responseData = await response.json();
      console.log("📋 Response data:", JSON.stringify(responseData, null, 2));
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON response:", jsonError);
      const textResponse = await response.text();
      console.log("📄 Raw response:", textResponse);
    }

    if (response.ok && responseData?.success) {
      console.log("✅ Bulk generate test successful!");
      console.log(`📊 Created ${responseData.count} SPP records`);
    } else {
      console.log("❌ Bulk generate test failed");
      console.log("Error:", responseData?.message || "Unknown error");
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000/api/santri");
    if (response.ok) {
      console.log("✅ Server is running, proceeding with test...\n");
      await testBulkGenerate();
    } else {
      console.log("❌ Server responded with error:", response.status);
    }
  } catch (error) {
    console.log(
      "❌ Server is not running. Please start the development server first.",
    );
    console.log("Run: npm run dev");
  }
}

checkServer();
