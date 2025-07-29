import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test SPP Settings
    console.log("\nTesting SPP Settings...");
    const sppSettings = await prisma.sPPSetting.findMany();
    console.log(`Found ${sppSettings.length} SPP settings:`, sppSettings);

    // Test SPP Records
    console.log("\nTesting SPP Records...");
    const sppRecords = await prisma.sPPRecord.findMany({
      include: {
        santri: {
          select: {
            id: true,
            name: true,
          },
        },
        sppSetting: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
    });
    console.log(
      `Found ${sppRecords.length} SPP records:`,
      JSON.stringify(sppRecords, null, 2),
    );

    // Test summary calculation
    console.log("\nTesting summary calculation...");
    const summary = await prisma.sPPRecord.aggregate({
      _sum: {
        amount: true,
        paidAmount: true,
        discount: true,
        fine: true,
      },
      _count: {
        _all: true,
      },
    });
    console.log("Summary:", summary);
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
