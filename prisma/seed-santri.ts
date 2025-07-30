import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding santri data...');

  // Create sample wali users if they don't exist
  const existingWali = await prisma.users.findFirst({
    where: { role: 'WALI' }
  });

  let waliUsers = [];
  if (!existingWali) {
    console.log('Creating sample wali users...');
    const waliData = [
      {
        email: 'wali1@tpq.com',
        name: 'Ahmad Fauzi',
        phone: '081234567890',
        role: 'WALI' as const,
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        isActive: true
      },
      {
        email: 'wali2@tpq.com',
        name: 'Siti Aminah',
        phone: '081234567891',
        role: 'WALI' as const,
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        isActive: true
      },
      {
        email: 'wali3@tpq.com',
        name: 'Muhammad Yusuf',
        phone: '081234567892',
        role: 'WALI' as const,
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        isActive: true
      }
    ];

    for (const wali of waliData) {
      const created = await prisma.users.create({ data: wali });
      waliUsers.push(created);
      console.log(`✅ Created wali: ${wali.name}`);
    }
  } else {
    waliUsers = await prisma.users.findMany({
      where: { role: 'WALI' },
      take: 5
    });
  }

  // Create sample halaqah if they don't exist
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
        status: 'ACTIVE' as const
      },
      {
        name: 'Halaqah Al-Baqarah',
        level: 'Menengah',
        capacity: 12,
        currentStudents: 0,
        schedule: 'Selasa, Kamis, Sabtu 16:00-17:30',
        status: 'ACTIVE' as const
      }
    ];

    for (const halaqah of halaqahData) {
      const created = await prisma.halaqah.create({ data: halaqah });
      halaqahList.push(created);
      console.log(`✅ Created halaqah: ${halaqah.name}`);
    }
  }

  // Check if santri already exist
  const existingSantri = await prisma.santri.count();
  if (existingSantri > 0) {
    console.log(`📊 Database already has ${existingSantri} santri records`);
    return;
  }

  // Create sample santri
  const santriData = [
    {
      nis: 'TPQ001',
      name: 'Muhammad Rizki Pratama',
      birthDate: new Date('2010-05-15'),
      birthPlace: 'Jakarta',
      gender: 'MALE' as const,
      address: 'Jl. Masjid No. 123, Jakarta Selatan',
      phone: '081234567893',
      email: 'rizki@tpq.com',
      status: 'ACTIVE' as const,
      enrollmentDate: new Date('2023-01-15'),
      waliId: waliUsers[0]?.id,
      halaqahId: halaqahList[0]?.id
    },
    {
      nis: 'TPQ002',
      name: 'Fatimah Zahra',
      birthDate: new Date('2011-03-20'),
      birthPlace: 'Bandung',
      gender: 'FEMALE' as const,
      address: 'Jl. Pondok Pesantren No. 456, Bandung',
      phone: '081234567894',
      email: 'fatimah@tpq.com',
      status: 'ACTIVE' as const,
      enrollmentDate: new Date('2023-02-01'),
      waliId: waliUsers[1]?.id,
      halaqahId: halaqahList[1]?.id
    },
    {
      nis: 'TPQ003',
      name: 'Ahmad Firdaus',
      birthDate: new Date('2009-08-10'),
      birthPlace: 'Surabaya',
      gender: 'MALE' as const,
      address: 'Jl. Al-Quran No. 789, Surabaya',
      phone: '081234567895',
      email: 'firdaus@tpq.com',
      status: 'ACTIVE' as const,
      enrollmentDate: new Date('2022-09-01'),
      waliId: waliUsers[2]?.id,
      halaqahId: halaqahList[0]?.id
    },
    {
      nis: 'TPQ004',
      name: 'Aisyah Nur Hidayah',
      birthDate: new Date('2012-01-25'),
      birthPlace: 'Yogyakarta',
      gender: 'FEMALE' as const,
      address: 'Jl. Sunnah No. 321, Yogyakarta',
      phone: '081234567896',
      email: 'aisyah@tpq.com',
      status: 'ACTIVE' as const,
      enrollmentDate: new Date('2023-03-15'),
      waliId: waliUsers[0]?.id,
      halaqahId: halaqahList[1]?.id
    },
    {
      nis: 'TPQ005',
      name: 'Umar bin Khattab',
      birthDate: new Date('2010-11-30'),
      birthPlace: 'Medan',
      gender: 'MALE' as const,
      address: 'Jl. Sahabat No. 654, Medan',
      phone: '081234567897',
      email: 'umar@tpq.com',
      status: 'ACTIVE' as const,
      enrollmentDate: new Date('2023-01-20'),
      waliId: waliUsers[1]?.id,
      halaqahId: halaqahList[0]?.id
    }
  ];

  console.log('Creating santri records...');
  for (const santri of santriData) {
    try {
      await prisma.santri.create({ data: santri });
      console.log(`✅ Created santri: ${santri.name}`);
    } catch (error: any) {
      console.log(`❌ Failed to create santri ${santri.name}:`, error.message);
    }
  }

  const totalSantri = await prisma.santri.count();
  console.log(`🎉 Seeding completed! Total santri in database: ${totalSantri}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding santri:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
