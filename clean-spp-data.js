import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanSPPData() {
  try {
    console.log("🧹 Cleaning SPP data for testing...\n");

    // Get current SPP records count
    const currentCount = await prisma.sPPRecord.count();
    console.log(`📊 Current SPP records: ${currentCount}`);

    if (currentCount > 0) {
      // Delete all SPP records
      const deleteResult = await prisma.sPPRecord.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.count} SPP records`);
    } else {
      console.log("✅ No SPP records to delete");
    }

    // Verify deletion
    const finalCount = await prisma.sPPRecord.count();
    console.log(`📊 Final SPP records count: ${finalCount}`);

    if (finalCount === 0) {
      console.log("✅ SPP data cleaned successfully!");
      console.log("🧪 Ready for testing bulk generate");
    } else {
      console.log("⚠️ Some SPP records still remain");
    }
  } catch (error) {
    console.error("❌ Error cleaning SPP data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSPPData();
