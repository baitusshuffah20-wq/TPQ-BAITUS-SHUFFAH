import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testSPPRecords() {
  try {
    console.log("🔍 Testing SPP Records API and Database Connection...\n");

    // Test database connection
    console.log("1. Testing database connection...");
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      return;
    }

    // Check SPP records in database
    console.log("\n2. Checking SPP records in database...");
    const sppRecordsCount = await prisma.sPPRecord.count();
    console.log(`📊 Total SPP records in database: ${sppRecordsCount}`);

    if (sppRecordsCount > 0) {
      const sampleRecords = await prisma.sPPRecord.findMany({
        take: 3,
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
              halaqah: {
                select: {
                  name: true,
                  level: true,
                },
              },
            },
          },
          sppSetting: {
            select: {
              id: true,
              name: true,
              amount: true,
              level: true,
            },
          },
        },
      });
      console.log(
        "📋 Sample SPP records:",
        JSON.stringify(sampleRecords, null, 2),
      );
    } else {
      console.log("⚠️ No SPP records found in database");
    }

    // Test API endpoint
    console.log("\n3. Testing SPP records API endpoint...");
    try {
      const response = await fetch("http://localhost:3000/api/spp/records");
      console.log("📡 API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ API call successful");
        console.log("📊 API Response summary:", {
          success: data.success,
          recordsCount: data.sppRecords?.length || 0,
          totalRecords: data.summary?.totalRecords || 0,
          totalAmount: data.summary?.totalAmount || 0,
          statusCounts: data.summary?.statusCounts || {},
        });
      } else {
        console.error("❌ API call failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (apiError) {
      console.error("❌ API call error:", apiError.message);
    }

    // Check if we need to generate test data
    if (sppRecordsCount === 0) {
      console.log(
        "\n4. No SPP records found. Checking if we can generate test data...",
      );

      const santriCount = await prisma.santri.count();
      const sppSettingsCount = await prisma.sPPSetting.count({
        where: { isActive: true },
      });

      console.log(`📊 Available santri: ${santriCount}`);
      console.log(`📊 Available SPP settings: ${sppSettingsCount}`);

      if (santriCount > 0 && sppSettingsCount > 0) {
        console.log("✅ Data is available for generating SPP records");
        console.log(
          '💡 You can use the "Generate SPP Massal" feature in the web interface',
        );
      } else {
        console.log("❌ Missing required data:");
        if (santriCount === 0) console.log("  - No santri found");
        if (sppSettingsCount === 0)
          console.log("  - No active SPP settings found");
      }
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSPPRecords();
