import { prisma } from './prisma';

export async function seedSubscriptionPlans() {
  try {
    console.log('Seeding subscription plans...');

    // Check if plans already exist
    const existingPlans = await prisma.subscriptionPlan.count();
    if (existingPlans > 0) {
      console.log('Subscription plans already exist, skipping seed');
      return;
    }

    const plans = [
      {
        name: 'SPP Bulanan Basic',
        description: 'Paket SPP bulanan untuk santri reguler',
        amount: 150000,
        currency: 'IDR',
        billingCycle: 'MONTHLY',
        trialDays: 7,
        features: [
          'Pembayaran SPP bulanan',
          'Akses materi pembelajaran',
          'Laporan progress hafalan',
          'Notifikasi pembayaran'
        ],
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'SPP Bulanan Premium',
        description: 'Paket SPP bulanan dengan fasilitas lengkap',
        amount: 250000,
        currency: 'IDR',
        billingCycle: 'MONTHLY',
        trialDays: 14,
        features: [
          'Pembayaran SPP bulanan',
          'Akses materi pembelajaran premium',
          'Laporan progress hafalan detail',
          'Notifikasi pembayaran',
          'Konsultasi dengan musyrif',
          'Akses perpustakaan digital',
          'Sertifikat hafalan'
        ],
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'SPP Triwulan Basic',
        description: 'Paket SPP triwulan dengan diskon 10%',
        amount: 405000, // 150000 * 3 * 0.9 (10% discount)
        currency: 'IDR',
        billingCycle: 'QUARTERLY',
        trialDays: 7,
        features: [
          'Pembayaran SPP triwulan',
          'Diskon 10% dari harga bulanan',
          'Akses materi pembelajaran',
          'Laporan progress hafalan',
          'Notifikasi pembayaran'
        ],
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'SPP Triwulan Premium',
        description: 'Paket SPP triwulan premium dengan diskon 15%',
        amount: 637500, // 250000 * 3 * 0.85 (15% discount)
        currency: 'IDR',
        billingCycle: 'QUARTERLY',
        trialDays: 14,
        features: [
          'Pembayaran SPP triwulan',
          'Diskon 15% dari harga bulanan',
          'Akses materi pembelajaran premium',
          'Laporan progress hafalan detail',
          'Notifikasi pembayaran',
          'Konsultasi dengan musyrif',
          'Akses perpustakaan digital',
          'Sertifikat hafalan'
        ],
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'SPP Tahunan Basic',
        description: 'Paket SPP tahunan dengan diskon 20%',
        amount: 1440000, // 150000 * 12 * 0.8 (20% discount)
        currency: 'IDR',
        billingCycle: 'YEARLY',
        trialDays: 30,
        features: [
          'Pembayaran SPP tahunan',
          'Diskon 20% dari harga bulanan',
          'Akses materi pembelajaran',
          'Laporan progress hafalan',
          'Notifikasi pembayaran',
          'Bonus seragam TPQ'
        ],
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'SPP Tahunan Premium',
        description: 'Paket SPP tahunan premium dengan diskon 25%',
        amount: 2250000, // 250000 * 12 * 0.75 (25% discount)
        currency: 'IDR',
        billingCycle: 'YEARLY',
        trialDays: 30,
        features: [
          'Pembayaran SPP tahunan',
          'Diskon 25% dari harga bulanan',
          'Akses materi pembelajaran premium',
          'Laporan progress hafalan detail',
          'Notifikasi pembayaran',
          'Konsultasi dengan musyrif',
          'Akses perpustakaan digital',
          'Sertifikat hafalan',
          'Bonus seragam TPQ',
          'Bonus tas TPQ',
          'Prioritas dalam kegiatan'
        ],
        isActive: true,
        sortOrder: 6
      }
    ];

    // Create plans
    for (const planData of plans) {
      await prisma.subscriptionPlan.create({
        data: {
          ...planData,
          features: JSON.stringify(planData.features)
        }
      });
    }

    console.log(`Created ${plans.length} subscription plans successfully`);
    
    // Display created plans
    const createdPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    console.log('\nCreated subscription plans:');
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(plan.amount)} (${plan.billingCycle})`);
    });

  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => {
      console.log('Subscription plans seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Subscription plans seeding failed:', error);
      process.exit(1);
    });
}
