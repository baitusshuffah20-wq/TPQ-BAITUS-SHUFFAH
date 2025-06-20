import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings/integrations - Get current integration settings
export async function GET(request: NextRequest) {
  try {
    // Get current configuration from database or environment
    const settings = await prisma.systemSetting.findMany({
      where: {
        category: {
          in: ['whatsapp', 'email']
        }
      }
    });

    // Convert to structured format
    const config = {
      whatsapp: {
        accessToken: getSettingValue(settings, 'whatsapp', 'access_token') || '',
        phoneNumberId: getSettingValue(settings, 'whatsapp', 'phone_number_id') || '',
        businessAccountId: getSettingValue(settings, 'whatsapp', 'business_account_id') || '',
        webhookVerifyToken: getSettingValue(settings, 'whatsapp', 'webhook_verify_token') || '',
        appSecret: getSettingValue(settings, 'whatsapp', 'app_secret') || '',
        apiVersion: getSettingValue(settings, 'whatsapp', 'api_version') || 'v18.0',
        isConfigured: Boolean(getSettingValue(settings, 'whatsapp', 'access_token')),
        status: Boolean(getSettingValue(settings, 'whatsapp', 'access_token')) ? 'connected' : 'disconnected'
      },
      email: {
        host: getSettingValue(settings, 'email', 'host') || 'smtp.gmail.com',
        port: getSettingValue(settings, 'email', 'port') || '587',
        secure: getSettingValue(settings, 'email', 'secure') === 'true',
        user: getSettingValue(settings, 'email', 'user') || '',
        pass: getSettingValue(settings, 'email', 'pass') || '',
        fromName: getSettingValue(settings, 'email', 'from_name') || 'TPQ Baitus Shuffah',
        fromAddress: getSettingValue(settings, 'email', 'from_address') || '',
        isConfigured: Boolean(getSettingValue(settings, 'email', 'user')),
        status: Boolean(getSettingValue(settings, 'email', 'user')) ? 'connected' : 'disconnected'
      }
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch integration settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get setting value
function getSettingValue(settings: any[], category: string, key: string): string | null {
  const setting = settings.find(s => s.category === category && s.key === key);
  return setting ? setting.value : null;
}
