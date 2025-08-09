import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete database seeding...");

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
    console.log("📧 Login Email: admin@rumahtahfidz.com");
    console.log("🔑 Login Password: admin123");

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
    const wali = await prisma.user.upsert({
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
    const musyrif1Profile = await prisma.musyrif.create({
      data: {
        name: "Ustadz Abdullah",
        gender: "MALE",
        birthDate: new Date("1985-05-15"),
        birthPlace: "Jakarta",
        address: "Jl. Masjid No. 123, Jakarta Selatan",
        phone: "081234567891",
        email: "ustadz.abdullah@rumahtahfidz.com",
        specialization: "Tahfidz Al-Quran",
        joinDate: new Date("2020-01-15"),
        status: "ACTIVE",
        userId: musyrif1.id,
      },
    });

    const musyrif2Profile = await prisma.musyrif.create({
      data: {
        name: "Ustadz Ahmad",
        gender: "MALE",
        birthDate: new Date("1990-08-20"),
        birthPlace: "Bandung",
        address: "Jl. Pesantren No. 45, Bandung",
        phone: "081234567892",
        email: "ustadz.ahmad@rumahtahfidz.com",
        specialization: "Tahsin dan Tajwid",
        joinDate: new Date("2020-02-10"),
        status: "ACTIVE",
        userId: musyrif2.id,
      },
    });

    console.log("✅ Musyrif profiles created");

    // Create Sample Halaqah
    const halaqah1 = await prisma.halaqah.create({
      data: {
        name: "Halaqah Al-Fatihah",
        description: "Halaqah untuk santri pemula yang baru belajar membaca Al-Quran",
        level: "BEGINNER",
        capacity: 15,
        musyrifId: musyrif1Profile.id,
        room: "Ruang A1",
        schedule: "Senin & Rabu 14:00-16:00",
        status: "ACTIVE",
      },
    });

    const halaqah2 = await prisma.halaqah.create({
      data: {
        name: "Halaqah Al-Baqarah",
        description: "Halaqah untuk santri menengah yang sudah lancar membaca Al-Quran",
        level: "INTERMEDIATE",
        capacity: 20,
        musyrifId: musyrif2Profile.id,
        room: "Ruang B1",
        schedule: "Selasa & Kamis 15:00-17:00",
        status: "ACTIVE",
      },
    });

    console.log("✅ Sample halaqah created");

    // Create Sample Santri
    const santri1 = await prisma.santri.upsert({
      where: { nis: "STR001" },
      update: {},
      create: {
        nis: "STR001",
        name: "Muhammad Fauzi",
        birthDate: new Date("2010-05-15"),
        birthPlace: "Jakarta",
        gender: "MALE",
        address: "Jl. Masjid No. 123, Jakarta Selatan",
        phone: "081234567895",
        email: "fauzi@student.com",
        status: "ACTIVE",
        waliId: wali.id,
        halaqahId: halaqah1.id,
      },
    });

    const santri2 = await prisma.santri.upsert({
      where: { nis: "STR002" },
      update: {},
      create: {
        nis: "STR002",
        name: "Aisyah Zahra",
        birthDate: new Date("2011-08-20"),
        birthPlace: "Bogor",
        gender: "FEMALE",
        address: "Jl. Pondok No. 456, Bogor",
        phone: "081234567896",
        email: "aisyah@student.com",
        status: "ACTIVE",
        waliId: wali.id,
        halaqahId: halaqah2.id,
      },
    });

    console.log("✅ Sample santri created");

    // Create Sample News
    await prisma.news.createMany({
      data: [
        {
          title: "Selamat Datang di TPQ Baitus Shuffah",
          excerpt: "Sistem manajemen digital untuk memudahkan pembelajaran Al-Quran",
          content: "Alhamdulillah, kami dengan bangga memperkenalkan sistem manajemen digital TPQ Baitus Shuffah.",
          author: "Administrator",
          category: "PENGUMUMAN",
          status: "PUBLISHED",
          featured: true,
          publishedAt: new Date(),
        },
        {
          title: "Prestasi Santri dalam Lomba Tahfidz",
          excerpt: "Alhamdulillah, santri kami meraih juara dalam lomba tahfidz",
          content: "Dengan bangga kami sampaikan bahwa santri TPQ Baitus Shuffah berhasil meraih prestasi gemilang.",
          author: "Ustadz Abdullah",
          category: "PRESTASI",
          status: "PUBLISHED",
          featured: false,
          publishedAt: new Date(),
        },
      ],
    });

    console.log("✅ Sample news created");

    // 🎯 CREATE PROGRAMS - This is what you requested!
    console.log("📚 Creating programs...");
    
    await prisma.program.createMany({
      data: [
        {
          title: "Tahfidz Al-Quran",
          description: "Program menghafal Al-Quran dengan metode yang mudah dan menyenangkan. Santri akan dibimbing untuk menghafal Al-Quran secara bertahap dengan teknik yang telah terbukti efektif.",
          features: JSON.stringify([
            "Metode Talaqqi (face to face)",
            "Bimbingan intensif dari ustadz berpengalaman",
            "Evaluasi hafalan berkala",
            "Target hafalan sesuai kemampuan",
            "Sertifikat kelulusan"
          ]),
          duration: "2-4 Tahun",
          ageGroup: "7-17 Tahun",
          schedule: "Senin-Jumat 14:00-17:00",
          price: "Rp 300.000/bulan",
          image: "/images/programs/tahfidz.jpg",
          isActive: true,
          order: 1,
        },
        {
          title: "Tahsin Al-Quran",
          description: "Program perbaikan bacaan Al-Quran sesuai kaidah tajwid yang benar. Fokus pada perbaikan makhorijul huruf dan kelancaran bacaan.",
          features: JSON.stringify([
            "Perbaikan makhorijul huruf",
            "Pembelajaran ahkamul huruf",
            "Praktik bacaan langsung",
            "Koreksi individual",
            "Materi tajwid lengkap"
          ]),
          duration: "6-12 Bulan",
          ageGroup: "5+ Tahun",
          schedule: "Sabtu-Minggu 08:00-11:00",
          price: "Rp 200.000/bulan",
          image: "/images/programs/tahsin.jpg",
          isActive: true,
          order: 2,
        },
        {
          title: "Baca Tulis Al-Quran (BTQ)",
          description: "Program dasar untuk belajar membaca dan menulis huruf hijaiyah serta Al-Quran. Cocok untuk pemula yang belum bisa membaca Al-Quran.",
          features: JSON.stringify([
            "Pengenalan huruf hijaiyah",
            "Belajar menulis Arab",
            "Latihan membaca Al-Quran",
            "Metode Iqro dan Qiroati",
            "Bimbingan sabar dan telaten"
          ]),
          duration: "3-6 Bulan",
          ageGroup: "4+ Tahun",
          schedule: "Senin-Jumat 14:00-16:00",
          price: "Rp 150.000/bulan",
          image: "/images/programs/btq.jpg",
          isActive: true,
          order: 3,
        },
        {
          title: "Pendidikan Akhlak",
          description: "Program pembentukan karakter islami dan akhlakul karimah. Santri akan diajarkan adab-adab islami dalam kehidupan sehari-hari.",
          features: JSON.stringify([
            "Pembelajaran adab islami",
            "Pembentukan akhlak mulia",
            "Keteladanan dari ustadz",
            "Praktik dalam kehidupan",
            "Monitoring perkembangan"
          ]),
          duration: "Berkelanjutan",
          ageGroup: "Semua Usia",
          schedule: "Terintegrasi dengan program lain",
          price: "Termasuk dalam program utama",
          image: "/images/programs/akhlak.jpg",
          isActive: true,
          order: 4,
        },
        {
          title: "Kelas Intensif Weekend",
          description: "Program intensif untuk santri yang ingin belajar lebih fokus di akhir pekan. Kombinasi tahfidz, tahsin, dan pendidikan akhlak.",
          features: JSON.stringify([
            "Pembelajaran intensif",
            "Kombinasi tahfidz dan tahsin",
            "Pendidikan akhlak terintegrasi",
            "Kelas kecil maksimal 10 santri",
            "Evaluasi mingguan"
          ]),
          duration: "1-2 Tahun",
          ageGroup: "8-15 Tahun",
          schedule: "Sabtu-Minggu 08:00-15:00",
          price: "Rp 400.000/bulan",
          image: "/images/programs/intensif.jpg",
          isActive: true,
          order: 5,
        }
      ],
    });

    console.log("✅ Programs created successfully!");

    console.log("\n🎉 Complete seeding finished successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("👨‍💼 Admin: admin@rumahtahfidz.com / admin123");
    console.log("👨‍🏫 Musyrif: ustadz.abdullah@rumahtahfidz.com / musyrif123");
    console.log("👨‍👩‍👧‍👦 Wali: bapak.ahmad@gmail.com / wali123");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
