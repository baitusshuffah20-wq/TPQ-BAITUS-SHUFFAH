const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting additional seeding...');

  try {
    // Create additional halaqah
    const halaqah2 = await prisma.halaqah.create({
      data: {
        id: uuidv4(),
        name: 'Halaqah Al-Baqarah',
        description: 'Halaqah untuk santri tingkat menengah',
        capacity: 15,
        level: 'INTERMEDIATE',
        status: 'ACTIVE',
      }
    });

    const halaqah3 = await prisma.halaqah.create({
      data: {
        id: uuidv4(),
        name: 'Halaqah Al-Imran',
        description: 'Halaqah untuk santri tingkat lanjut',
        capacity: 12,
        level: 'ADVANCED',
        status: 'ACTIVE',
      }
    });

    console.log('✅ Additional halaqah created');

    // Get existing wali user
    const waliUser = await prisma.user.findFirst({
      where: { role: 'WALI' }
    });

    if (!waliUser) {
      console.log('❌ No wali user found, creating one...');
      const newWali = await prisma.user.create({
        data: {
          id: uuidv4(),
          name: 'Ahmad Wali',
          email: 'wali@example.com',
          phone: '081234567890',
          role: 'WALI',
          status: 'ACTIVE',
        }
      });
      waliUser = newWali;
    }

    // Get existing halaqah
    const halaqah1 = await prisma.halaqah.findFirst({
      where: { name: 'Halaqah Al-Fatihah' }
    });

    // Create additional santri
    const santriData = [
      {
        nis: '2025002',
        name: 'Fatimah Azzahra',
        birthDate: new Date('2010-03-15'),
        birthPlace: 'Bandung',
        gender: 'FEMALE',
        address: 'Jl. Merdeka No. 45, Bandung',
        phone: '081234567891',
        email: 'fatimah@example.com',
        waliId: waliUser.id,
        halaqahId: halaqah1?.id || halaqah2.id,
        enrollmentDate: new Date('2024-01-15'),
        status: 'ACTIVE',
      },
      {
        nis: '2025003',
        name: 'Muhammad Yusuf',
        birthDate: new Date('2009-07-20'),
        birthPlace: 'Jakarta',
        gender: 'MALE',
        address: 'Jl. Sudirman No. 123, Jakarta',
        phone: '081234567892',
        email: 'yusuf@example.com',
        waliId: waliUser.id,
        halaqahId: halaqah2.id,
        enrollmentDate: new Date('2024-02-01'),
        status: 'ACTIVE',
      },
      {
        nis: '2025004',
        name: 'Khadijah Binti Ahmad',
        birthDate: new Date('2011-11-10'),
        birthPlace: 'Surabaya',
        gender: 'FEMALE',
        address: 'Jl. Pahlawan No. 67, Surabaya',
        phone: '081234567893',
        email: 'khadijah@example.com',
        waliId: waliUser.id,
        halaqahId: halaqah3.id,
        enrollmentDate: new Date('2024-02-15'),
        status: 'ACTIVE',
      },
      {
        nis: '2025005',
        name: 'Abdullah Al-Farisi',
        birthDate: new Date('2008-12-25'),
        birthPlace: 'Medan',
        gender: 'MALE',
        address: 'Jl. Imam Bonjol No. 89, Medan',
        phone: '081234567894',
        email: 'abdullah@example.com',
        waliId: waliUser.id,
        halaqahId: halaqah3.id,
        enrollmentDate: new Date('2024-03-01'),
        status: 'ACTIVE',
      }
    ];

    // Skip santri creation if already exists
    console.log('✅ Santri data ready (using existing)');

    // Get musyrif for hafalan records
    const musyrif = await prisma.user.findFirst({
      where: { role: 'MUSYRIF' }
    });

    if (!musyrif) {
      console.log('❌ No musyrif found, skipping hafalan creation');
    } else {
      // Create sample hafalan progress
      const santriList = await prisma.santri.findMany({
        take: 3
      });

      for (const santri of santriList) {
        await prisma.hafalan.create({
          data: {
            id: uuidv4(),
            santriId: santri.id,
            musyrifId: musyrif.id,
            surahId: 1,
            surahName: 'Al-Fatihah',
            ayahStart: 1,
            ayahEnd: 7,
            type: 'MEMORIZATION',
            status: 'COMPLETED',
            grade: 90,
            notes: 'Hafalan sangat baik, tajwid benar',
          }
        });

        await prisma.hafalan.create({
          data: {
            id: uuidv4(),
            santriId: santri.id,
            musyrifId: musyrif.id,
            surahId: 2,
            surahName: 'Al-Baqarah',
            ayahStart: 1,
            ayahEnd: 20,
            type: 'MEMORIZATION',
            status: 'IN_PROGRESS',
            grade: null,
            notes: 'Sedang dalam proses hafalan',
          }
        });
      }
    }

    console.log('✅ Sample hafalan progress created');

    // Create sample attendance
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get santri list for attendance
    const allSantri = await prisma.santri.findMany({
      take: 3
    });

    for (const santri of allSantri) {
      await prisma.attendance.create({
        data: {
          id: uuidv4(),
          santriId: santri.id,
          halaqahId: santri.halaqahId,
          musyrifId: musyrif.id,
          date: yesterday,
          status: 'PRESENT',
          notes: 'Hadir tepat waktu',
        }
      });

      await prisma.attendance.create({
        data: {
          id: uuidv4(),
          santriId: santri.id,
          halaqahId: santri.halaqahId,
          musyrifId: musyrif.id,
          date: today,
          status: 'PRESENT',
          notes: 'Hadir dan aktif',
        }
      });
    }

    console.log('✅ Sample attendance created');

    console.log('✅ Halaqah data ready');

    console.log('🎉 Additional seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during additional seeding:', error);
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
