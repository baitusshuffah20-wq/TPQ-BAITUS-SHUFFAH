import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkPaymentStatus } from '@/lib/midtrans';

// GET /api/settings/integrations/payment - Get payment gateway settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to access this resource' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to access this resource' },
        { status: 403 }
      );
    }

    // Get payment gateway settings from database
    const paymentGateways = await prisma.systemSetting.findMany({
      where: {
        category: 'PAYMENT_GATEWAY'
      }
    });

    // Get payment methods from database
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Transform payment gateway settings into a more usable format
    const gateways = [];
    
    // Group settings by gateway
    const gatewaySettings = paymentGateways.reduce((acc, setting) => {
      const [gateway, key] = setting.key.split('.');
      if (!acc[gateway]) {
        acc[gateway] = {};
      }
      acc[gateway][key] = setting.value;
      return acc;
    }, {} as Record<string, Record<string, string>>);

    // Transform grouped settings into gateway objects
    for (const [gatewayCode, settings] of Object.entries(gatewaySettings)) {
      gateways.push({
        id: gatewayCode,
        name: settings.name || gatewayCode,
        code: gatewayCode,
        isActive: settings.isActive === 'true',
        mode: settings.mode || 'SANDBOX',
        clientKey: settings.clientKey || '',
        serverKey: settings.serverKey || '',
        merchantId: settings.merchantId || '',
        callbackUrl: settings.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
        redirectUrl: settings.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        notificationUrl: settings.notificationUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
        supportedMethods: (settings.supportedMethods || '').split(','),
        lastTested: settings.lastTested || null,
        status: settings.status || 'DISCONNECTED'
      });
    }

    return NextResponse.json({
      success: true,
      gateways,
      methods: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payment settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/integrations/payment - Save payment gateway settings
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to access this resource' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to access this resource' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gateway } = body;

    if (!gateway || !gateway.code) {
      return NextResponse.json(
        { success: false, error: 'Invalid gateway data' },
        { status: 400 }
      );
    }

    // Save gateway settings to database
    const settingsToSave = [
      { key: `${gateway.code}.name`, value: gateway.name },
      { key: `${gateway.code}.isActive`, value: gateway.isActive.toString() },
      { key: `${gateway.code}.mode`, value: gateway.mode },
      { key: `${gateway.code}.clientKey`, value: gateway.clientKey },
      { key: `${gateway.code}.serverKey`, value: gateway.serverKey },
      { key: `${gateway.code}.merchantId`, value: gateway.merchantId },
      { key: `${gateway.code}.callbackUrl`, value: gateway.callbackUrl },
      { key: `${gateway.code}.redirectUrl`, value: gateway.redirectUrl },
      { key: `${gateway.code}.notificationUrl`, value: gateway.notificationUrl },
      { key: `${gateway.code}.supportedMethods`, value: gateway.supportedMethods.join(',') },
      { key: `${gateway.code}.status`, value: gateway.status },
      { key: `${gateway.code}.lastTested`, value: gateway.lastTested || '' }
    ];

    // Use transaction to ensure all settings are saved
    await prisma.$transaction(
      settingsToSave.map(setting => 
        prisma.systemSetting.upsert({
          where: {
            category_key: {
              category: 'PAYMENT_GATEWAY',
              key: setting.key
            }
          },
          update: {
            value: setting.value
          },
          create: {
            category: 'PAYMENT_GATEWAY',
            key: setting.key,
            value: setting.value,
            description: `Payment gateway setting for ${gateway.name}`
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Payment gateway settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save payment settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/integrations/payment/test - Test payment gateway connection
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to access this resource' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to access this resource' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gatewayCode } = body;

    if (!gatewayCode) {
      return NextResponse.json(
        { success: false, error: 'Gateway code is required' },
        { status: 400 }
      );
    }

    // Get gateway settings
    const gatewaySettings = await prisma.systemSetting.findMany({
      where: {
        category: 'PAYMENT_GATEWAY',
        key: {
          startsWith: `${gatewayCode}.`
        }
      }
    });

    // Transform settings into an object
    const settings = gatewaySettings.reduce((acc, setting) => {
      const key = setting.key.split('.')[1];
      acc[key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Test connection based on gateway type
    let status = 'DISCONNECTED';
    let testResult = null;

    if (gatewayCode === 'MIDTRANS') {
      // Test Midtrans connection by checking a test transaction status
      const testOrderId = `test_${Date.now()}`;
      try {
        // Use the checkPaymentStatus function with a test order ID
        // This will validate if the server key is correct
        testResult = await checkPaymentStatus(testOrderId);
        
        // If we get here without an error, the connection is working
        // (even though the transaction doesn't exist)
        status = 'CONNECTED';
      } catch (error) {
        console.error('Midtrans test error:', error);
        status = 'ERROR';
      }
    }

    // Update gateway status and last tested timestamp
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: {
          category_key: {
            category: 'PAYMENT_GATEWAY',
            key: `${gatewayCode}.status`
          }
        },
        update: {
          value: status
        },
        create: {
          category: 'PAYMENT_GATEWAY',
          key: `${gatewayCode}.status`,
          value: status,
          description: `Payment gateway status for ${gatewayCode}`
        }
      }),
      prisma.systemSetting.upsert({
        where: {
          category_key: {
            category: 'PAYMENT_GATEWAY',
            key: `${gatewayCode}.lastTested`
          }
        },
        update: {
          value: new Date().toISOString()
        },
        create: {
          category: 'PAYMENT_GATEWAY',
          key: `${gatewayCode}.lastTested`,
          value: new Date().toISOString(),
          description: `Last tested timestamp for ${gatewayCode}`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      status,
      lastTested: new Date().toISOString(),
      testResult
    });
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test payment gateway',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}