import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSantri() {
  try {
    console.log('🌱 Seeding santri data...');

    // First, let's check if we have any users to use as wali
    const waliUsers = await prisma.users.findMany({
      where: { role: 'WALI' },
      take: 5
    });

    if (waliUsers.length === 0) {
      console.log('Creating sample wali users...');
      // Create some wali users first
      const waliData = [
        {
          email: 'wali1@example.com',
          name: 'Ahmad Fauzi',
          phone: '081234567890',
          role: 'WALI',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          isActive: true
        },
        {
          email: 'wali2@example.com',
          name: 'Siti Aminah',
          phone: '081234567891',
          role: 'WALI',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          isActive: true
        },
        {
          email: 'wali3@example.com',
          name: 'Muhammad Yusuf',
          phone: '081234567892',
          role: 'WALI',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          isActive: true
        }
      ];

      for (const wali of waliData) {
        await prisma.users.create({ data: wali });
      }

      // Refresh wali users
      const newWaliUsers = await prisma.users.findMany({
        where: { role: 'WALI' },
        take: 5
      });
      waliUsers.push(...newWaliUsers);
    }

    // Check if we have halaqah
    let halaqahList = await prisma.halaqah.findMany({
      where: { status: 'ACTIVE' },
      take: 3
    });

    if (halaqahList.length === 0) {
      console.log('Creating sample halaqah...');
      const halaqahData = [
        {
          name: 'Halaqah Al-Fatihah',
          level: 'Pemula',
          capacity: 15,
          currentStudents: 0,
          schedule: 'Senin, Rabu, Jumat 16:00-17:30',
          status: 'ACTIVE'
        },
        {
          name: 'Halaqah Al-Baqarah',
          level: 'Menengah',
          capacity: 12,
          currentStudents: 0,
          schedule: 'Selasa, Kamis, Sabtu 16:00-17:30',
          status: 'ACTIVE'
        },
        {
          name: 'Halaqah An-Nisa',
          level: 'Lanjutan',
          capacity: 10,
          currentStudents: 0,
          schedule: 'Senin, Rabu, Jumat 19:00-20:30',
          status: 'ACTIVE'
        }
      ];

      for (const halaqah of halaqahData) {
        await prisma.halaqah.create({ data: halaqah });
      }

      halaqahList = await prisma.halaqah.findMany({
        where: { status: 'ACTIVE' },
        take: 3
      });
    }

    // Create sample santri
    const santriData = [
      {
        nis: 'TPQ001',
        name: 'Muhammad Rizki Pratama',
        birthDate: new Date('2010-05-15'),
        birthPlace: 'Jakarta',
        gender: 'MALE',
        address: 'Jl. Masjid No. 123, Jakarta Selatan',
        phone: '081234567893',
        email: 'rizki@example.com',
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-01-15'),
        waliId: waliUsers[0]?.id,
        halaqahId: halaqahList[0]?.id
      },
      {
        nis: 'TPQ002',
        name: 'Fatimah Zahra',
        birthDate: new Date('2011-03-20'),
        birthPlace: 'Bandung',
        gender: 'FEMALE',
        address: 'Jl. Pondok Pesantren No. 456, Bandung',
        phone: '081234567894',
        email: 'fatimah@example.com',
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-02-01'),
        waliId: waliUsers[1]?.id,
        halaqahId: halaqahList[1]?.id
      },
      {
        nis: 'TPQ003',
        name: 'Ahmad Firdaus',
        birthDate: new Date('2009-08-10'),
        birthPlace: 'Surabaya',
        gender: 'MALE',
        address: 'Jl. Al-Quran No. 789, Surabaya',
        phone: '081234567895',
        email: 'firdaus@example.com',
        status: 'ACTIVE',
        enrollmentDate: new Date('2022-09-01'),
        waliId: waliUsers[2]?.id,
        halaqahId: halaqahList[2]?.id
      },
      {
        nis: 'TPQ004',
        name: 'Aisyah Nur Hidayah',
        birthDate: new Date('2012-01-25'),
        birthPlace: 'Yogyakarta',
        gender: 'FEMALE',
        address: 'Jl. Sunnah No. 321, Yogyakarta',
        phone: '081234567896',
        email: 'aisyah@example.com',
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-03-15'),
        waliId: waliUsers[0]?.id,
        halaqahId: halaqahList[0]?.id
      },
      {
        nis: 'TPQ005',
        name: 'Umar bin Khattab',
        birthDate: new Date('2010-11-30'),
        birthPlace: 'Medan',
        gender: 'MALE',
        address: 'Jl. Sahabat No. 654, Medan',
        phone: '081234567897',
        email: 'umar@example.com',
        status: 'ACTIVE',
        enrollmentDate: new Date('2023-01-20'),
        waliId: waliUsers[1]?.id,
        halaqahId: halaqahList[1]?.id
      }
    ];

    console.log('Creating santri records...');
    for (const santri of santriData) {
      try {
        await prisma.santri.create({ data: santri });
        console.log(`✅ Created santri: ${santri.name}`);
      } catch (error) {
        console.log(`❌ Failed to create santri ${santri.name}:`, error.message);
      }
    }

    const totalSantri = await prisma.santri.count();
    console.log(`🎉 Seeding completed! Total santri in database: ${totalSantri}`);

  } catch (error) {
    console.error('❌ Error seeding santri:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSantri();
