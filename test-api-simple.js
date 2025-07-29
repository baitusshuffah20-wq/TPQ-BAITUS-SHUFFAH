// Simple test to check if API is working
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log("🔍 Testing SPP Records Database Query...\n");

    // Test direct database query
    const sppRecords = await prisma.sPPRecord.findMany({
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
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { santri: { name: "asc" } },
      ],
      take: 10,
    });

    console.log(`✅ Found ${sppRecords.length} SPP records in database`);

    if (sppRecords.length > 0) {
      console.log("\n📋 Sample records:");
      sppRecords.forEach((record, index) => {
        console.log(
          `${index + 1}. ${record.santri.name} - ${getMonthName(record.month)} ${record.year} - ${record.status} - Rp ${record.amount.toLocaleString()}`,
        );
      });
    }

    // Test summary calculation
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

    console.log("\n📊 Summary:");
    console.log(`- Total Records: ${summary._count._all}`);
    console.log(
      `- Total Amount: Rp ${(summary._sum.amount || 0).toLocaleString()}`,
    );
    console.log(
      `- Total Paid: Rp ${(summary._sum.paidAmount || 0).toLocaleString()}`,
    );

    // Test status counts
    const statusCounts = await Promise.all([
      prisma.sPPRecord.count({ where: { status: "PENDING" } }),
      prisma.sPPRecord.count({ where: { status: "PAID" } }),
      prisma.sPPRecord.count({ where: { status: "OVERDUE" } }),
      prisma.sPPRecord.count({ where: { status: "PARTIAL" } }),
    ]);

    console.log("\n📈 Status Counts:");
    console.log(`- Pending: ${statusCounts[0]}`);
    console.log(`- Paid: ${statusCounts[1]}`);
    console.log(`- Overdue: ${statusCounts[2]}`);
    console.log(`- Partial: ${statusCounts[3]}`);

    console.log("\n✅ Database query test completed successfully!");
    console.log(
      "💡 The data exists in database. The issue might be with the frontend or API endpoint.",
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function getMonthName(month) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1];
}

testAPI();
