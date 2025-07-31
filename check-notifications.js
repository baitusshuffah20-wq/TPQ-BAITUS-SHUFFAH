import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotificationSchema() {
  try {
    console.log('🔍 Checking notification schema...');
    
    // Check if notifications table exists and get sample data
    const notifications = await prisma.notification.findMany({
      take: 5,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });
    
    console.log('Notifications found:', notifications.length);
    
    if (notifications.length > 0) {
      console.log('Sample notification:');
      console.log(JSON.stringify(notifications[0], null, 2));
    } else {
      console.log('No notifications found in database');
    }
    
    // Check users for testing
    const users = await prisma.user.findMany({
      take: 3,
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log('\nUsers found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Try to create a test notification
    if (users.length > 0) {
      console.log('\n📝 Creating test notification...');
      const testUser = users[0];
      
      const testNotification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          title: 'Test Notification',
          message: 'This is a test notification to verify the schema',
          type: 'SYSTEM_ANNOUNCEMENT',
          priority: 'NORMAL',
          status: 'SENT',
          channels: 'IN_APP',
          createdBy: testUser.id
        }
      });
      
      console.log('✅ Test notification created:', testNotification.id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotificationSchema();
