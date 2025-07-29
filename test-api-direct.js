// Test API endpoints directly
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testSPPRecordsAPI() {
  try {
    console.log("Testing SPP Records API logic...");

    // Simulate the API logic
    const limit = 10;
    const page = 1;
    const skip = (page - 1) * limit;
    const where = {};

    const [sppRecords, total] = await Promise.all([
      prisma.sPPRecord.findMany({
        where,
        include: {
          santri: {
            select: {
              id: true,
              nis: true,
              name: true,
              halaqah: {
                select: {
                  id: true,
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
          transaction: {
            select: {
              id: true,
              amount: true,
              date: true,
              account: {
                select: {
                  name: true,
                  accountType: true,
                },
              },
            },
          },
        },
        orderBy: [
          { year: "desc" },
          { month: "desc" },
          { santri: { name: "asc" } },
        ],
        skip,
        take: limit,
      }),
      prisma.sPPRecord.count({ where }),
    ]);

    console.log(`Found ${sppRecords.length} SPP records out of ${total} total`);
    console.log(
      "Sample records:",
      JSON.stringify(sppRecords.slice(0, 2), null, 2),
    );

    // Calculate summary
    const summary = await prisma.sPPRecord.aggregate({
      where,
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

    const statusCounts = await Promise.all([
      prisma.sPPRecord.count({ where: { ...where, status: "PENDING" } }),
      prisma.sPPRecord.count({ where: { ...where, status: "PAID" } }),
      prisma.sPPRecord.count({ where: { ...where, status: "OVERDUE" } }),
      prisma.sPPRecord.count({ where: { ...where, status: "PARTIAL" } }),
    ]);

    const result = {
      success: true,
      sppRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalPaid: summary._sum.paidAmount || 0,
        totalDiscount: summary._sum.discount || 0,
        totalFine: summary._sum.fine || 0,
        totalRecords: summary._count._all || 0,
        statusCounts: {
          pending: statusCounts[0],
          paid: statusCounts[1],
          overdue: statusCounts[2],
          partial: statusCounts[3],
        },
      },
    };

    console.log("API Result Summary:", {
      success: result.success,
      recordsCount: result.sppRecords.length,
      totalRecords: result.summary.totalRecords,
      totalAmount: result.summary.totalAmount,
      statusCounts: result.summary.statusCounts,
    });

    return result;
  } catch (error) {
    console.error("Error in SPP Records API test:", error);
    return {
      success: false,
      message: "Gagal mengambil data SPP",
      error: error.message,
    };
  }
}

async function testSPPSettingsAPI() {
  try {
    console.log("\nTesting SPP Settings API logic...");

    const where = {};
    const sppSettings = await prisma.sPPSetting.findMany({
      where,
      include: {
        _count: {
          select: {
            sppRecords: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = {
      success: true,
      sppSettings,
      total: sppSettings.length,
    };

    console.log("Settings API Result:", {
      success: result.success,
      settingsCount: result.sppSettings.length,
      settings: result.sppSettings.map((s) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
      })),
    });

    return result;
  } catch (error) {
    console.error("Error in SPP Settings API test:", error);
    return {
      success: false,
      message: "Gagal mengambil pengaturan SPP",
      error: error.message,
    };
  }
}

// Run tests
async function runTests() {
  console.log("=== Testing SPP API Logic ===\n");

  const settingsResult = await testSPPSettingsAPI();
  const recordsResult = await testSPPRecordsAPI();

  console.log("\n=== Test Results Summary ===");
  console.log(
    "Settings API:",
    settingsResult.success ? "✅ SUCCESS" : "❌ FAILED",
  );
  console.log(
    "Records API:",
    recordsResult.success ? "✅ SUCCESS" : "❌ FAILED",
  );

  if (!settingsResult.success) {
    console.log("Settings Error:", settingsResult.error);
  }

  if (!recordsResult.success) {
    console.log("Records Error:", recordsResult.error);
  }

  await prisma.$disconnect();
}

runTests();
