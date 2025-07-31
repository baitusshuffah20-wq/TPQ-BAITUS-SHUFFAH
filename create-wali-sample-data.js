// Create sample data for wali testing
import { PrismaClient } from '@prisma/client';

async function createWaliSampleData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating sample data for wali testing...');
    
    // Get the wali user
    const wali = await prisma.user.findFirst({
      where: {
        role: 'WALI',
        email: 'bapak.ahmad@gmail.com'
      }
    });
    
    if (!wali) {
      console.log('❌ Wali user not found');
      return;
    }
    
    console.log(`✅ Found wali: ${wali.name} (${wali.id})`);
    
    // Get the santri
    const santri = await prisma.santri.findFirst({
      where: {
        waliId: wali.id,
        status: 'ACTIVE'
      }
    });
    
    if (!santri) {
      console.log('❌ Santri not found');
      return;
    }
    
    console.log(`✅ Found santri: ${santri.name} (${santri.id})`);
    
    // Create sample payments
    console.log('💳 Creating sample payments...');
    
    const payments = [
      {
        santriId: santri.id,
        type: 'SPP',
        amount: 150000,
        dueDate: new Date('2024-02-15'),
        status: 'PENDING',
        description: 'SPP Februari 2024',
        month: 'Februari 2024',
      },
      {
        santriId: santri.id,
        type: 'SPP',
        amount: 150000,
        dueDate: new Date('2024-01-15'),
        status: 'PAID',
        description: 'SPP Januari 2024',
        month: 'Januari 2024',
        paidDate: new Date('2024-01-10'),
        method: 'BANK_TRANSFER',
      },
      {
        santriId: santri.id,
        type: 'DONATION',
        amount: 500000,
        dueDate: new Date('2024-02-20'),
        status: 'PENDING',
        description: 'Donasi Pembangunan Masjid',
      },
    ];
    
    for (const payment of payments) {
      await prisma.payment.upsert({
        where: {
          santriId_type_month: {
            santriId: payment.santriId,
            type: payment.type,
            month: payment.month || 'N/A',
          }
        },
        update: payment,
        create: payment,
      });
    }
    
    console.log(`✅ Created ${payments.length} sample payments`);
    
    // Create sample hafalan records
    console.log('📚 Creating sample hafalan records...');
    
    const hafalanRecords = [
      {
        santriId: santri.id,
        surah: 'Al-Baqarah',
        ayahStart: 1,
        ayahEnd: 10,
        status: 'APPROVED',
        grade: 85,
        recordedAt: new Date('2024-02-10'),
        notes: 'Bacaan sudah lancar',
      },
      {
        santriId: santri.id,
        surah: 'Al-Baqarah',
        ayahStart: 11,
        ayahEnd: 20,
        status: 'PENDING',
        recordedAt: new Date('2024-02-11'),
        notes: 'Perlu perbaikan tajwid',
      },
      {
        santriId: santri.id,
        surah: 'Al-Fatihah',
        ayahStart: 1,
        ayahEnd: 7,
        status: 'APPROVED',
        grade: 90,
        recordedAt: new Date('2024-02-08'),
        notes: 'Sangat baik',
      },
    ];
    
    for (const hafalan of hafalanRecords) {
      await prisma.hafalan.create({
        data: hafalan,
      });
    }
    
    console.log(`✅ Created ${hafalanRecords.length} sample hafalan records`);
    
    // Create sample attendance records
    console.log('📅 Creating sample attendance records...');
    
    const attendanceRecords = [];
    const today = new Date();
    
    // Create attendance for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (assuming TPQ is weekdays only)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      attendanceRecords.push({
        santriId: santri.id,
        date: date,
        status: randomStatus,
        sessionType: 'REGULAR',
        notes: randomStatus === 'LATE' ? 'Terlambat 15 menit' : null,
      });
    }
    
    for (const attendance of attendanceRecords) {
      await prisma.attendance.upsert({
        where: {
          santriId_date: {
            santriId: attendance.santriId,
            date: attendance.date,
          }
        },
        update: attendance,
        create: attendance,
      });
    }
    
    console.log(`✅ Created ${attendanceRecords.length} sample attendance records`);
    
    // Create sample notifications
    console.log('🔔 Creating sample notifications...');
    
    const notifications = [
      {
        userId: wali.id,
        title: 'Progress Hafalan Anak',
        message: `${santri.name} telah menyelesaikan hafalan Al-Baqarah ayat 1-10 dengan nilai 85`,
        type: 'HAFALAN_PROGRESS',
        priority: 'NORMAL',
        status: 'SENT',
        channels: 'APP,EMAIL',
        isRead: false,
      },
      {
        userId: wali.id,
        title: 'Tagihan SPP Februari',
        message: `Tagihan SPP bulan Februari untuk ${santri.name} sebesar Rp 150.000 akan jatuh tempo pada 15 Februari 2024`,
        type: 'PAYMENT_REMINDER',
        priority: 'HIGH',
        status: 'SENT',
        channels: 'APP,EMAIL,WHATSAPP',
        isRead: false,
      },
      {
        userId: wali.id,
        title: 'Konfirmasi Pembayaran',
        message: `Pembayaran SPP Januari untuk ${santri.name} telah berhasil diproses`,
        type: 'PAYMENT_CONFIRMATION',
        priority: 'NORMAL',
        status: 'SENT',
        channels: 'APP,EMAIL',
        isRead: true,
      },
    ];
    
    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
    }
    
    console.log(`✅ Created ${notifications.length} sample notifications`);
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('📊 Summary:');
    console.log(`  - Wali: ${wali.name}`);
    console.log(`  - Santri: ${santri.name}`);
    console.log(`  - Payments: ${payments.length}`);
    console.log(`  - Hafalan: ${hafalanRecords.length}`);
    console.log(`  - Attendance: ${attendanceRecords.length}`);
    console.log(`  - Notifications: ${notifications.length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWaliSampleData();
