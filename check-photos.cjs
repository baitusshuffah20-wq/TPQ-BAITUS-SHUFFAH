const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkPhotos() {
  console.log("🔍 Checking photo data in database...");

  try {
    // Check santri photos
    const santri = await prisma.santri.findMany({
      select: { id: true, name: true, photo: true },
      take: 5,
    });
    console.log("📸 Santri photos:", santri);

    // Check user avatars
    const users = await prisma.user.findMany({
      select: { id: true, name: true, avatar: true },
      take: 5,
    });
    console.log("👤 User avatars:", users);

    // Check musyrif photos
    const musyrif = await prisma.musyrif.findMany({
      select: { id: true, name: true, photo: true },
      take: 5,
    });
    console.log("👨‍🏫 Musyrif photos:", musyrif);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotos();
