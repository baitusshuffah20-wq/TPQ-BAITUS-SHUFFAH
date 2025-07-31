import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserIds() {
  try {
    console.log('🔍 Checking all users and their notifications...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log('\n👥 All users:');
    for (const user of users) {
      const notifCount = await prisma.notification.count({
        where: { userId: user.id }
      });
      console.log(`- ${user.name} (${user.role}): ID=${user.id}, Notifications=${notifCount}`);
    }
    
    // Get all notifications with user info
    console.log('\n📋 All notifications:');
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      take: 5
    });
    
    notifications.forEach(notif => {
      console.log(`- ${notif.title} -> User: ${notif.user?.name} (${notif.userId})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserIds();
