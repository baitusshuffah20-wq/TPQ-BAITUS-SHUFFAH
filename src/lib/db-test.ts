import { prisma } from "@/lib/prisma";

async function testConnection() {
  try {
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;

    // Get database information
    const dbInfo = await prisma.$queryRaw`SELECT VERSION() as version`;

    // Get table counts
    const userCount = await prisma.user.count();
    const santriCount = await prisma.santri.count();
    const halaqahCount = await prisma.halaqah.count();
    const hafalanCount = await prisma.hafalan.count();

    console.log("Database connection successful!");
    console.log("Query result:", result);
    console.log("Database version:", dbInfo);
    console.log("User count:", userCount);
    console.log("Santri count:", santriCount);
    console.log("Halaqah count:", halaqahCount);
    console.log("Hafalan count:", hafalanCount);

    return {
      success: true,
      message: "Database connection successful!",
      dbInfo: {
        type: "MySQL",
        version: dbInfo[0].version,
        tables: {
          users: userCount,
          santri: santriCount,
          halaqah: halaqahCount,
          hafalan: hafalanCount,
        },
      },
    };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, message: "Database connection failed", error };
  } finally {
    await prisma.$disconnect();
  }
}

export { testConnection };
