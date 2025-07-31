// Check wali data in database
import { PrismaClient } from '@prisma/client';

async function checkWaliData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking wali data in database...');
    
    // Get all users with WALI role
    const waliUsers = await prisma.user.findMany({
      where: {
        role: 'WALI'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    
    console.log(`👥 Found ${waliUsers.length} wali users:`);
    waliUsers.forEach(wali => {
      console.log(`  - ${wali.name} (${wali.email}) - ID: ${wali.id}`);
    });
    
    // Check santri for each wali
    for (const wali of waliUsers) {
      const santri = await prisma.santri.findMany({
        where: {
          waliId: wali.id,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          nis: true,
          status: true,
        }
      });
      
      console.log(`\n📚 Santri for ${wali.name}:`);
      if (santri.length > 0) {
        santri.forEach(s => {
          console.log(`  - ${s.name} (${s.nis}) - Status: ${s.status}`);
        });
      } else {
        console.log('  - No santri found');
      }
    }
    
    // Check payments
    const payments = await prisma.payment.findMany({
      where: {
        santri: {
          wali: {
            role: 'WALI'
          }
        }
      },
      include: {
        santri: {
          include: {
            wali: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      take: 5
    });
    
    console.log(`\n💳 Found ${payments.length} payments for wali santri:`);
    payments.forEach(payment => {
      console.log(`  - ${payment.type} - ${payment.santri.name} - ${payment.status} - Rp ${payment.amount}`);
    });
    
    // Check notifications
    const notifications = await prisma.notification.findMany({
      where: {
        user: {
          role: 'WALI'
        }
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      take: 5
    });
    
    console.log(`\n🔔 Found ${notifications.length} notifications for wali:`);
    notifications.forEach(notif => {
      console.log(`  - ${notif.title} - ${notif.user?.name} - Read: ${notif.isRead}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWaliData();
