import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Seed Site Settings
    await Promise.all([
      // General Settings
      prisma.siteSetting.upsert({
        where: { key: "site.name" },
        update: {},
        create: {
          key: "site.name",
          value: "TPQ Baitus Shuffah",
          type: "STRING",
          category: "GENERAL",
          label: "Nama Situs",
          description: "Nama lembaga yang akan ditampilkan di seluruh situs",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "site.description" },
        update: {},
        create: {
          key: "site.description",
          value: "Lembaga Pendidikan Tahfidz Al-Quran",
          type: "STRING",
          category: "GENERAL",
          label: "Deskripsi Situs",
          description: "Deskripsi singkat tentang lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "site.timezone" },
        update: {},
        create: {
          key: "site.timezone",
          value: "Asia/Jakarta",
          type: "STRING",
          category: "GENERAL",
          label: "Zona Waktu",
          description: "Zona waktu yang digunakan oleh sistem",
          isPublic: false,
        },
      }),

      // About Settings
      prisma.siteSetting.upsert({
        where: { key: "about.vision" },
        update: {},
        create: {
          key: "about.vision",
          value:
            "Menjadi lembaga pendidikan tahfidz Al-Quran terkemuka yang melahirkan generasi Qurani berakhlak mulia.",
          type: "STRING",
          category: "ABOUT",
          label: "Visi",
          description: "Visi lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "about.mission" },
        update: {},
        create: {
          key: "about.mission",
          value:
            "Menyelenggarakan pendidikan tahfidz Al-Quran berkualitas, membentuk karakter Islami, dan mengembangkan potensi santri secara komprehensif.",
          type: "STRING",
          category: "ABOUT",
          label: "Misi",
          description: "Misi lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "about.history" },
        update: {},
        create: {
          key: "about.history",
          value:
            "TPQ Baitus Shuffah didirikan pada tahun 2009 oleh sekelompok alumni pesantren yang peduli terhadap pendidikan Al-Quran. Berawal dari 15 santri, kini telah berkembang menjadi lembaga pendidikan tahfidz terpercaya.",
          type: "STRING",
          category: "ABOUT",
          label: "Sejarah",
          description: "Sejarah singkat lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "about.values" },
        update: {},
        create: {
          key: "about.values",
          value:
            "Keikhlasan, Kesungguhan, Kemandirian, Keteladanan, Keberkahan",
          type: "STRING",
          category: "ABOUT",
          label: "Nilai-nilai",
          description: "Nilai-nilai yang dijunjung tinggi oleh lembaga",
          isPublic: true,
        },
      }),

      // Contact Settings
      prisma.siteSetting.upsert({
        where: { key: "contact.address" },
        update: {},
        create: {
          key: "contact.address",
          value: "Jl. Islamic Center No. 123, Jakarta Pusat",
          type: "STRING",
          category: "CONTACT",
          label: "Alamat",
          description: "Alamat lengkap lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "contact.phone" },
        update: {},
        create: {
          key: "contact.phone",
          value: "021-12345678",
          type: "STRING",
          category: "CONTACT",
          label: "Telepon",
          description: "Nomor telepon lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "contact.email" },
        update: {},
        create: {
          key: "contact.email",
          value: "info@tpqbaitusshuffah.ac.id",
          type: "STRING",
          category: "CONTACT",
          label: "Email",
          description: "Alamat email lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "contact.whatsapp" },
        update: {},
        create: {
          key: "contact.whatsapp",
          value: "081234567890",
          type: "STRING",
          category: "CONTACT",
          label: "WhatsApp",
          description: "Nomor WhatsApp untuk tombol chat",
          isPublic: true,
        },
      }),

      // Appearance Settings
      prisma.siteSetting.upsert({
        where: { key: "appearance.logo" },
        update: {},
        create: {
          key: "appearance.logo",
          value: "/logo.png",
          type: "IMAGE",
          category: "APPEARANCE",
          label: "Logo",
          description: "Logo lembaga",
          isPublic: true,
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "appearance.favicon" },
        update: {},
        create: {
          key: "appearance.favicon",
          value: "/favicon.ico",
          type: "IMAGE",
          category: "APPEARANCE",
          label: "Favicon",
          description: "Favicon untuk browser",
          isPublic: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Site settings seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding site settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed site settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
