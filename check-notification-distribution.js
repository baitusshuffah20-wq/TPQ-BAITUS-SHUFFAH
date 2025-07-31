import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotificationDistribution() {
  try {
    console.log('🔍 Checking notification distribution...');
    
    // Get all notifications grouped by userId
    const allNotifications = await prisma.notification.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        type: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📊 Total notifications in database:', allNotifications.length);
    
    // Group by userId
    const byUser = {};
    allNotifications.forEach(notif => {
      if (!byUser[notif.userId]) {
        byUser[notif.userId] = [];
      }
      byUser[notif.userId].push(notif);
    });
    
    console.log('\n📋 Distribution by user:');
    for (const [userId, notifications] of Object.entries(byUser)) {
      console.log(`User ${userId}: ${notifications.length} notifications`);
      notifications.forEach(n => {
        console.log(`  - ${n.title} (${n.type}, ${n.status})`);
      });
      console.log('');
    }
    
    // Check specific Administrator user
    const adminNotifications = await prisma.notification.findMany({
      where: { userId: 'cmdqxjrs100005w6299z3eesl' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('👤 Administrator (cmdqxjrs100005w6299z3eesl) notifications:', adminNotifications.length);
    adminNotifications.forEach(n => {
      console.log(`  - ${n.title} (${n.type}, ${n.status})`);
    });
    
    // Check if there are notifications for other users that should be visible to admin
    console.log('\n🔍 Checking if admin should see all notifications...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true
      }
    });
    
    console.log('\n👥 All users in system:');
    users.forEach(user => {
      const userNotifCount = byUser[user.id]?.length || 0;
      console.log(`  - ${user.name} (${user.role}): ${userNotifCount} notifications`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotificationDistribution();
