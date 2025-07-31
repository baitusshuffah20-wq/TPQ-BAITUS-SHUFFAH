import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNotifications() {
  try {
    console.log('🔍 Creating test notifications...');
    
    // Get users
    const users = await prisma.user.findMany({
      take: 3,
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
    
    // Create different types of notifications
    const testNotifications = [
      {
        userId: adminUser.id,
        title: 'Selamat Datang di Sistem TPQ',
        message: 'Selamat datang di sistem informasi TPQ Baitus Shuffah. Semoga bermanfaat untuk kemajuan pendidikan Al-Quran.',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'HIGH',
        status: 'SENT',
        channels: 'IN_APP,EMAIL',
        createdBy: adminUser.id
      },
      {
        userId: adminUser.id,
        title: 'Pengingat Pembayaran SPP',
        message: 'Pembayaran SPP bulan ini akan jatuh tempo pada tanggal 15. Mohon segera lakukan pembayaran.',
        type: 'PAYMENT_REMINDER',
        priority: 'NORMAL',
        status: 'SENT',
        channels: 'IN_APP,WHATSAPP',
        createdBy: adminUser.id
      },
      {
        userId: adminUser.id,
        title: 'Update Progress Hafalan',
        message: 'Progress hafalan santri telah diperbarui. Silakan cek dashboard untuk melihat perkembangan terbaru.',
        type: 'HAFALAN_PROGRESS',
        priority: 'LOW',
        status: 'PENDING',
        channels: 'IN_APP',
        createdBy: adminUser.id
      },
      {
        userId: adminUser.id,
        title: 'Alert Absensi',
        message: 'Terdapat beberapa santri yang belum hadir hari ini. Mohon segera konfirmasi kehadiran.',
        type: 'ATTENDANCE_ALERT',
        priority: 'URGENT',
        status: 'SENT',
        channels: 'IN_APP,EMAIL,WHATSAPP',
        createdBy: adminUser.id
      },
      {
        userId: adminUser.id,
        title: 'Konfirmasi Pembayaran Diterima',
        message: 'Pembayaran SPP bulan ini telah diterima dan dikonfirmasi. Terima kasih atas pembayarannya.',
        type: 'PAYMENT_CONFIRMATION',
        priority: 'NORMAL',
        status: 'SENT',
        channels: 'IN_APP,EMAIL',
        createdBy: adminUser.id
      }
    ];
    
    // Create notifications for each user
    for (const user of users) {
      for (const notifData of testNotifications) {
        const notification = await prisma.notification.create({
          data: {
            ...notifData,
            userId: user.id,
            sentAt: notifData.status === 'SENT' ? new Date() : null,
            isRead: Math.random() > 0.5, // Random read status
            readAt: Math.random() > 0.7 ? new Date() : null
          }
        });
        
        console.log(`✅ Created notification "${notification.title}" for ${user.name}`);
      }
    }
    
    // Get final count
    const totalNotifications = await prisma.notification.count();
    console.log(`\n🎉 Total notifications in database: ${totalNotifications}`);
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
