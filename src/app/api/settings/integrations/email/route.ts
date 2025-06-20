import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/settings/integrations/email - Save Email configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      host,
      port,
      secure,
      user,
      pass,
      fromName,
      fromAddress
    } = body;

    // Validation
    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { success: false, message: 'Host, Port, User, and Password are required' },
        { status: 400 }
      );
    }

    // Save settings to database
    const settings = [
      { category: 'email', key: 'host', value: host },
      { category: 'email', key: 'port', value: port.toString() },
      { category: 'email', key: 'secure', value: secure.toString() },
      { category: 'email', key: 'user', value: user },
      { category: 'email', key: 'pass', value: pass },
      { category: 'email', key: 'from_name', value: fromName || 'TPQ Baitus Shuffah' },
      { category: 'email', key: 'from_address', value: fromAddress || user }
    ];

    // Upsert each setting
    for (const setting of settings) {
      await prisma.systemSetting.upsert({
        where: {
          category_key: {
            category: setting.category,
            key: setting.key
          }
        },
        update: {
          value: setting.value,
          updatedAt: new Date()
        },
        create: {
          category: setting.category,
          key: setting.key,
          value: setting.value,
          description: `Email ${setting.key.replace('_', ' ')}`
        }
      });
    }

    // Also update environment variables (for runtime)
    process.env.EMAIL_HOST = host;
    process.env.EMAIL_PORT = port.toString();
    process.env.EMAIL_SECURE = secure.toString();
    process.env.EMAIL_USER = user;
    process.env.EMAIL_PASS = pass;
    process.env.EMAIL_FROM_NAME = fromName;
    process.env.EMAIL_FROM_ADDRESS = fromAddress;

    return NextResponse.json({
      success: true,
      message: 'Email configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving Email configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save Email configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/settings/integrations/email - Get Email configuration
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        category: 'email'
      }
    });

    const config = {
      host: getSettingValue(settings, 'host') || 'smtp.gmail.com',
      port: getSettingValue(settings, 'port') || '587',
      secure: getSettingValue(settings, 'secure') === 'true',
      user: getSettingValue(settings, 'user') || '',
      pass: getSettingValue(settings, 'pass') || '',
      fromName: getSettingValue(settings, 'from_name') || 'TPQ Baitus Shuffah',
      fromAddress: getSettingValue(settings, 'from_address') || '',
      isConfigured: Boolean(getSettingValue(settings, 'user')),
      status: Boolean(getSettingValue(settings, 'user')) ? 'connected' : 'disconnected'
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching Email configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch Email configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get setting value
function getSettingValue(settings: any[], key: string): string | null {
  const setting = settings.find(s => s.key === key);
  return setting ? setting.value : null;
}
