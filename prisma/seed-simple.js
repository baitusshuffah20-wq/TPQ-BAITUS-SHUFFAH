import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting simple database seeding...");

  try {
    // Create Admin User
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@rumahtahfidz.com" },
      update: {},
      create: {
        email: "admin@rumahtahfidz.com",
        name: "Administrator",
        phone: "081234567890",
        role: "ADMIN",
        password: adminPassword,
        isActive: true,
      },
    });

    console.log("✅ Admin user created:", admin.email);

    // Create Musyrif Users
    const musyrifPassword = await bcrypt.hash("musyrif123", 10);
    const musyrif1 = await prisma.user.upsert({
      where: { email: "ustadz.abdullah@rumahtahfidz.com" },
      update: {},
      create: {
        email: "ustadz.abdullah@rumahtahfidz.com",
        name: "Ustadz Abdullah",
        phone: "081234567891",
        role: "MUSYRIF",
        password: musyrifPassword,
        isActive: true,
      },
    });

    const musyrif2 = await prisma.user.upsert({
      where: { email: "ustadz.ahmad@rumahtahfidz.com" },
      update: {},
      create: {
        email: "ustadz.ahmad@rumahtahfidz.com",
        name: "Ustadz Ahmad",
        phone: "081234567892",
        role: "MUSYRIF",
        password: musyrifPassword,
        isActive: true,
      },
    });

    console.log("✅ Musyrif users created");

    // Create Wali User
    const waliPassword = await bcrypt.hash("wali123", 10);
    const wali1 = await prisma.user.upsert({
      where: { email: "bapak.ahmad@gmail.com" },
      update: {},
      create: {
        email: "bapak.ahmad@gmail.com",
        name: "Bapak Ahmad",
        phone: "081234567893",
        role: "WALI",
        password: waliPassword,
        isActive: true,
      },
    });

    console.log("✅ Wali user created");

    // Create Musyrif Profiles
    const musyrif1Profile = await prisma.musyrif.upsert({
      where: { id: "musyrif1" },
      update: {},
      create: {
        id: "musyrif1",
        name: "Ustadz Abdullah",
        gender: "LAKI_LAKI",
        birthDate: new Date("1985-05-15"),
        birthPlace: "Jakarta",
        address: "Jl. Masjid No. 123, Jakarta",
        phone: "081234567891",
        email: "ustadz.abdullah@rumahtahfidz.com",
        specialization: "Tahfidz Al-Quran",
        status: "ACTIVE",
        userId: musyrif1.id,
      },
    });

    const musyrif2Profile = await prisma.musyrif.upsert({
      where: { id: "musyrif2" },
      update: {},
      create: {
        id: "musyrif2",
        name: "Ustadz Ahmad",
        gender: "LAKI_LAKI",
        birthDate: new Date("1988-08-20"),
        birthPlace: "Bandung",
        address: "Jl. Pesantren No. 456, Bandung",
        phone: "081234567892",
        email: "ustadz.ahmad@rumahtahfidz.com",
        specialization: "Tahsin Al-Quran",
        status: "ACTIVE",
        userId: musyrif2.id,
      },
    });

    console.log("✅ Musyrif profiles created");

    // Create Sample Halaqah
    const halaqah1 = await prisma.halaqah.upsert({
      where: { id: "halaqah1" },
      update: {},
      create: {
        id: "halaqah1",
        name: "Halaqah Pemula",
        description: "Halaqah untuk santri pemula",
        level: "Pemula",
        capacity: 15,
        status: "ACTIVE",
        musyrifId: musyrif1Profile.id,
      },
    });

    const halaqah2 = await prisma.halaqah.upsert({
      where: { id: "halaqah2" },
      update: {},
      create: {
        id: "halaqah2",
        name: "Halaqah Menengah",
        description: "Halaqah untuk santri menengah",
        level: "Menengah",
        capacity: 20,
        status: "ACTIVE",
        musyrifId: musyrif2Profile.id,
      },
    });

    console.log("✅ Sample halaqah created");

    // Create Sample Santri
    const santri1 = await prisma.santri.upsert({
      where: { nis: "2024001" },
      update: {},
      create: {
        nis: "2024001",
        name: "Muhammad Fauzi",
        birthDate: new Date("2010-03-15"),
        birthPlace: "Jakarta",
        gender: "LAKI_LAKI",
        address: "Jl. Santri No. 789, Jakarta",
        phone: "081234567894",
        email: "fauzi@gmail.com",
        status: "ACTIVE",
        waliId: wali1.id,
      },
    });

    console.log("✅ Sample santri created");

    // Create Sample News
    await prisma.news.upsert({
      where: { id: "news1" },
      update: {},
      create: {
        id: "news1",
        title: "Selamat Datang di TPQ Baitus Shuffah",
        excerpt: "Sistem informasi TPQ telah berhasil diimplementasikan",
        content:
          "Alhamdulillah, sistem informasi TPQ Baitus Shuffah telah berhasil diimplementasikan dan siap digunakan.",
        author: "Administrator",
        category: "PENGUMUMAN",
        status: "PUBLISHED",
        featured: true,
        publishedAt: new Date(),
      },
    });

    console.log("✅ Sample news created");

    console.log("🎉 Simple seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
