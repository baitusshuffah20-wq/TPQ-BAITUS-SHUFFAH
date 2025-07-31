// Create simple sample data for wali testing
import { PrismaClient } from '@prisma/client';

async function createSimpleWaliData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating simple sample data for wali testing...');
    
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
    
    // Create simple payment
    console.log('💳 Creating simple payment...');
    
    const payment = await prisma.payment.create({
      data: {
        santriId: santri.id,
        type: 'SPP',
        amount: 150000,
        dueDate: new Date('2024-02-15'),
        status: 'PENDING',
        notes: 'SPP Februari 2024',
      }
    });
    
    console.log(`✅ Created payment: ${payment.id}`);
    
    // Create simple notification
    console.log('🔔 Creating simple notification...');
    
    const notification = await prisma.notification.create({
      data: {
        userId: wali.id,
        title: 'Tagihan SPP Februari',
        message: `Tagihan SPP bulan Februari untuk ${santri.name} sebesar Rp 150.000`,
        type: 'PAYMENT_REMINDER',
        priority: 'HIGH',
        status: 'SENT',
        channels: 'APP,EMAIL',
        isRead: false,
      }
    });
    
    console.log(`✅ Created notification: ${notification.id}`);
    
    console.log('\n🎉 Simple sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleWaliData();
