const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixDatetimeIssues() {
  console.log("🔧 Starting datetime issues fix...");

  try {
    // Fix santri table datetime issues
    console.log("📝 Fixing santri table datetime issues...");
    const santriResult = await prisma.$executeRaw`
      UPDATE santri 
      SET 
        updatedAt = NOW(),
        createdAt = CASE 
          WHEN createdAt = '0000-00-00 00:00:00' OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 
          THEN NOW() 
          ELSE createdAt 
        END,
        enrollmentDate = CASE 
          WHEN enrollmentDate = '0000-00-00' OR MONTH(enrollmentDate) = 0 OR DAY(enrollmentDate) = 0 
          THEN CURDATE() 
          ELSE enrollmentDate 
        END,
        birthDate = CASE 
          WHEN birthDate = '0000-00-00' OR MONTH(birthDate) = 0 OR DAY(birthDate) = 0 
          THEN '2000-01-01' 
          ELSE birthDate 
        END,
        graduationDate = CASE 
          WHEN graduationDate = '0000-00-00' 
          THEN NULL 
          ELSE graduationDate 
        END
      WHERE 
        updatedAt = '0000-00-00 00:00:00' OR 
        createdAt = '0000-00-00 00:00:00' OR
        enrollmentDate = '0000-00-00' OR
        birthDate = '0000-00-00' OR
        graduationDate = '0000-00-00' OR
        MONTH(updatedAt) = 0 OR 
        DAY(updatedAt) = 0 OR
        MONTH(createdAt) = 0 OR 
        DAY(createdAt) = 0 OR
        MONTH(enrollmentDate) = 0 OR 
        DAY(enrollmentDate) = 0 OR
        MONTH(birthDate) = 0 OR 
        DAY(birthDate) = 0
    `;
    console.log(`✅ Fixed ${santriResult} santri records`);

    // Fix hafalan table datetime issues
    console.log("📝 Fixing hafalan table datetime issues...");
    const hafalanResult = await prisma.$executeRaw`
      UPDATE hafalan 
      SET 
        updatedAt = NOW(),
        createdAt = CASE 
          WHEN createdAt = '0000-00-00 00:00:00' OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 
          THEN NOW() 
          ELSE createdAt 
        END,
        recordedAt = CASE 
          WHEN recordedAt = '0000-00-00 00:00:00' OR MONTH(recordedAt) = 0 OR DAY(recordedAt) = 0 
          THEN NOW() 
          ELSE recordedAt 
        END
      WHERE 
        updatedAt = '0000-00-00 00:00:00' OR 
        createdAt = '0000-00-00 00:00:00' OR
        recordedAt = '0000-00-00 00:00:00' OR
        MONTH(updatedAt) = 0 OR 
        DAY(updatedAt) = 0 OR
        MONTH(createdAt) = 0 OR 
        DAY(createdAt) = 0 OR
        MONTH(recordedAt) = 0 OR 
        DAY(recordedAt) = 0
    `;
    console.log(`✅ Fixed ${hafalanResult} hafalan records`);

    // Fix attendance table datetime issues
    console.log("📝 Fixing attendance table datetime issues...");
    const attendanceResult = await prisma.$executeRaw`
      UPDATE attendance 
      SET 
        updatedAt = NOW(),
        createdAt = CASE 
          WHEN createdAt = '0000-00-00 00:00:00' OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 
          THEN NOW() 
          ELSE createdAt 
        END,
        date = CASE 
          WHEN date = '0000-00-00' OR MONTH(date) = 0 OR DAY(date) = 0 
          THEN CURDATE() 
          ELSE date 
        END
      WHERE 
        updatedAt = '0000-00-00 00:00:00' OR 
        createdAt = '0000-00-00 00:00:00' OR
        date = '0000-00-00' OR
        MONTH(updatedAt) = 0 OR 
        DAY(updatedAt) = 0 OR
        MONTH(createdAt) = 0 OR 
        DAY(createdAt) = 0 OR
        MONTH(date) = 0 OR 
        DAY(date) = 0
    `;
    console.log(`✅ Fixed ${attendanceResult} attendance records`);

    // Fix users table datetime issues
    console.log("📝 Fixing users table datetime issues...");
    const usersResult = await prisma.$executeRaw`
      UPDATE users 
      SET 
        updatedAt = NOW(),
        createdAt = CASE 
          WHEN createdAt = '0000-00-00 00:00:00' OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 
          THEN NOW() 
          ELSE createdAt 
        END
      WHERE 
        updatedAt = '0000-00-00 00:00:00' OR 
        createdAt = '0000-00-00 00:00:00' OR
        MONTH(updatedAt) = 0 OR 
        DAY(updatedAt) = 0 OR
        MONTH(createdAt) = 0 OR 
        DAY(createdAt) = 0
    `;
    console.log(`✅ Fixed ${usersResult} users records`);

    // Fix halaqah table datetime issues
    console.log("📝 Fixing halaqah table datetime issues...");
    const halaqahResult = await prisma.$executeRaw`
      UPDATE halaqah 
      SET 
        updatedAt = NOW(),
        createdAt = CASE 
          WHEN createdAt = '0000-00-00 00:00:00' OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 
          THEN NOW() 
          ELSE createdAt 
        END
      WHERE 
        updatedAt = '0000-00-00 00:00:00' OR 
        createdAt = '0000-00-00 00:00:00' OR
        MONTH(updatedAt) = 0 OR 
        DAY(updatedAt) = 0 OR
        MONTH(createdAt) = 0 OR 
        DAY(createdAt) = 0
    `;
    console.log(`✅ Fixed ${halaqahResult} halaqah records`);

    console.log("🎉 All datetime issues have been fixed!");

    // Verify the fix by trying to fetch a santri
    console.log("🔍 Verifying fix by fetching santri data...");
    const santriList = await prisma.santri.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (santriList.length > 0) {
      console.log(
        "✅ Verification successful! Sample santri data:",
        santriList[0],
      );
    } else {
      console.log("ℹ️ No santri data found for verification");
    }
  } catch (error) {
    console.error("❌ Error fixing datetime issues:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatetimeIssues()
  .then(() => {
    console.log("✅ Datetime fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Datetime fix failed:", error);
    process.exit(1);
  });
