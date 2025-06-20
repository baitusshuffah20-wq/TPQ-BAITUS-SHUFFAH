import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock dashboard data
  const dashboardData = {
    stats: {
      totalSantri: 250,
      totalHafidz: 50,
      totalDonations: 25500000,
      sppRevenue: 45200000,
      activeHalaqah: 15,
      attendanceRate: 95
    },
    recentActivities: [
      {
        id: 1,
        type: 'payment',
        message: 'Pembayaran SPP dari Ahmad Fauzi telah diterima',
        time: '5 menit yang lalu',
        icon: 'CreditCard',
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'donation',
        message: 'Donasi Rp 500.000 dari Ibu Siti untuk program beasiswa',
        time: '15 menit yang lalu',
        icon: 'Heart',
        color: 'text-red-600'
      },
      {
        id: 3,
        type: 'hafalan',
        message: 'Muhammad Rizki menyelesaikan hafalan Surah Al-Baqarah',
        time: '1 jam yang lalu',
        icon: 'Award',
        color: 'text-yellow-600'
      },
      {
        id: 4,
        type: 'registration',
        message: 'Pendaftaran santri baru: Fatimah Zahra',
        time: '2 jam yang lalu',
        icon: 'Users',
        color: 'text-blue-600'
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: 'Ujian Hafalan Juz 30',
        date: '2024-02-15',
        time: '08:00',
        participants: 25
      },
      {
        id: 2,
        title: 'Wisuda Hafidz Angkatan 16',
        date: '2024-02-20',
        time: '09:00',
        participants: 15
      },
      {
        id: 3,
        title: 'Rapat Wali Santri',
        date: '2024-02-25',
        time: '14:00',
        participants: 100
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: dashboardData
  });
}
