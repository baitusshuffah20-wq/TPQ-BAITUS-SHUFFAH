import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugSPP() {
  try {
    console.log("🔍 Debugging SPP Generation Issue...\n");

    // Check if database connection works
    console.log("1. Testing database connection...");
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful\n");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      return;
    }

    // Check santri data
    console.log("2. Checking santri data...");
    const santriCount = await prisma.santri.count();
    console.log(`📊 Total santri: ${santriCount}`);

    if (santriCount > 0) {
      const sampleSantri = await prisma.santri.findMany({
        take: 3,
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
      });
      console.log("📋 Sample santri:", JSON.stringify(sampleSantri, null, 2));
    } else {
      console.log("⚠️ No santri found in database");
    }
    console.log("");

    // Check SPP settings
    console.log("3. Checking SPP settings...");
    const sppSettingsCount = await prisma.sPPSetting.count();
    console.log(`📊 Total SPP settings: ${sppSettingsCount}`);

    if (sppSettingsCount > 0) {
      const sppSettings = await prisma.sPPSetting.findMany({
        select: {
          id: true,
          name: true,
          amount: true,
          level: true,
          isActive: true,
          _count: {
            select: {
              sppRecords: true,
            },
          },
        },
      });
      console.log("📋 SPP settings:", JSON.stringify(sppSettings, null, 2));
    } else {
      console.log("⚠️ No SPP settings found in database");
    }
    console.log("");

    // Check existing SPP records
    console.log("4. Checking existing SPP records...");
    const sppRecordsCount = await prisma.sPPRecord.count();
    console.log(`📊 Total SPP records: ${sppRecordsCount}`);

    if (sppRecordsCount > 0) {
      const sampleRecords = await prisma.sPPRecord.findMany({
        take: 5,
        select: {
          id: true,
          month: true,
          year: true,
          amount: true,
          status: true,
          santri: {
            select: {
              name: true,
              nis: true,
            },
          },
          sppSetting: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log(
        "📋 Sample SPP records:",
        JSON.stringify(sampleRecords, null, 2),
      );
    } else {
      console.log("⚠️ No SPP records found in database");
    }
    console.log("");

    // Test bulk generate data structure
    console.log("5. Testing bulk generate data structure...");
    if (santriCount > 0 && sppSettingsCount > 0) {
      const firstSantri = await prisma.santri.findFirst({
        select: { id: true, name: true },
      });
      const firstSetting = await prisma.sPPSetting.findFirst({
        where: { isActive: true },
        select: { id: true, name: true, amount: true },
      });

      if (firstSantri && firstSetting) {
        const testData = {
          sppSettingId: firstSetting.id,
          santriIds: [firstSantri.id],
          months: [
            {
              month: 12,
              year: 2024,
              dueDate: "2024-12-10",
            },
          ],
        };
        console.log(
          "📝 Test bulk generate data:",
          JSON.stringify(testData, null, 2),
        );

        // Check for existing records that might conflict
        const existingRecord = await prisma.sPPRecord.findFirst({
          where: {
            santriId: firstSantri.id,
            sppSettingId: firstSetting.id,
            month: 12,
            year: 2024,
          },
        });

        if (existingRecord) {
          console.log("⚠️ Conflicting record found:", existingRecord.id);
        } else {
          console.log("✅ No conflicting records found");
        }
      }
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSPP();
