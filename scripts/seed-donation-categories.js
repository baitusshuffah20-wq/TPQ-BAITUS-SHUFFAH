const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding donation categories...');

  try {
    // Check if donationCategory model exists
    const models = Object.keys(prisma);
    if (!models.includes('donationCategory')) {
      console.log('DonationCategory model not found in Prisma client. You may need to run prisma generate first.');
      console.log('Available models:', models.join(', '));
      return;
    }
    
    // Delete existing categories
    await prisma.donationCategory.deleteMany({});
  
  // Create donation categories
  const categories = [
    {
      title: 'Donasi Umum',
      description: 'Untuk operasional sehari-hari rumah tahfidz',
      target: 100000000,
      collected: 75000000,
      icon: 'Heart',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      urgent: false,
      isActive: true,
      order: 1
    },
    {
      title: 'Pembangunan Gedung',
      description: 'Renovasi dan pembangunan fasilitas baru',
      target: 500000000,
      collected: 320000000,
      icon: 'Building',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      urgent: true,
      isActive: true,
      order: 2
    },
    {
      title: 'Beasiswa Santri',
      description: 'Bantuan biaya pendidikan untuk santri kurang mampu',
      target: 200000000,
      collected: 150000000,
      icon: 'GraduationCap',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      urgent: false,
      isActive: true,
      order: 3
    },
    {
      title: 'Buku & Alat Tulis',
      description: 'Pengadaan Al-Quran dan buku pembelajaran',
      target: 50000000,
      collected: 35000000,
      icon: 'BookOpen',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      urgent: false,
      isActive: true,
      order: 4
    },
    {
      title: 'Konsumsi Santri',
      description: 'Biaya makan dan snack untuk santri',
      target: 80000000,
      collected: 60000000,
      icon: 'Utensils',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      urgent: false,
      isActive: true,
      order: 5
    }
  ];

    for (const category of categories) {
      await prisma.donationCategory.create({
        data: category
      });
    }

    console.log('Donation categories seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding donation categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });