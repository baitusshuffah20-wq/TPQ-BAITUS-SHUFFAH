// @ts-check
/* eslint-env node */
/* global console, process */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @typedef {Object} DonationCategorySeedData
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {number} target
 * @property {number} collected
 * @property {string} icon
 * @property {string} color
 * @property {string} bgColor
 * @property {boolean} urgent
 * @property {boolean} isActive
 * @property {number} order
 */

/**
 * Seed donation categories data
 * @returns {Promise<void>}
 */
async function seedDonationCategories() {
  console.log("🌱 Seeding donation categories...");

  /** @type {DonationCategorySeedData[]} */
  const donationCategoriesData = [
    {
      title: "Pembangunan & Renovasi",
      slug: "pembangunan-renovasi",
      description:
        "Dana untuk pembangunan dan renovasi fasilitas TPQ, termasuk ruang kelas baru dan perbaikan masjid.",
      target: 100000000,
      collected: 0,
      icon: "Building",
      color: "text-green-600",
      bgColor: "bg-green-100",
      urgent: true,
      isActive: true,
      order: 1,
    },
    {
      title: "Beasiswa Santri Yatim & Dhuafa",
      slug: "beasiswa-santri-yatim-dhuafa",
      description:
        "Bantuan biaya pendidikan untuk santri yatim dan dari keluarga kurang mampu agar mereka tetap bisa belajar Al-Quran.",
      target: 50000000,
      collected: 0,
      icon: "Users",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      urgent: true,
      isActive: true,
      order: 2,
    },
    {
      title: "Wakaf Al-Quran & Buku Islam",
      slug: "wakaf-al-quran-buku-islam",
      description:
        "Menyediakan Al-Quran, buku Iqro, dan buku-buku penunjang lainnya untuk para santri.",
      target: 15000000,
      collected: 0,
      icon: "BookOpen",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      urgent: false,
      isActive: true,
      order: 3,
    },
    {
      title: "Infaq Operasional TPQ",
      slug: "infaq-operasional-tpq",
      description:
        "Dukungan untuk biaya operasional bulanan TPQ, seperti listrik, air, dan kebutuhan harian lainnya.",
      target: 0,
      collected: 0,
      icon: "HeartHandshake",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      urgent: false,
      isActive: true,
      order: 4,
    },
  ];

  try {
    const createdCategories = await Promise.all(
      donationCategoriesData.map((category) =>
        prisma.donationCategory.upsert({
          where: { slug: category.slug },
          update: { ...category },
          create: { ...category },
        }),
      ),
    );

    console.log(
      "✅ Berhasil membuat/memperbarui kategori donasi:",
      createdCategories.map((c) => c.title).join(", "),
    );
  } catch (error) {
    console.error("❌ Gagal membuat kategori donasi:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDonationCategories();
