import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/settings/integrations/whatsapp - Save WhatsApp configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
      phoneNumberId,
      businessAccountId,
      webhookVerifyToken,
      appSecret,
      apiVersion
    } = body;

    // Validation
    if (!accessToken || !phoneNumberId || !businessAccountId || !webhookVerifyToken) {
      return NextResponse.json(
        { success: false, message: 'Access Token, Phone Number ID, Business Account ID, and Webhook Verify Token are required' },
        { status: 400 }
      );
    }

    // Save settings to database
    const settings = [
      { category: 'whatsapp', key: 'access_token', value: accessToken },
      { category: 'whatsapp', key: 'phone_number_id', value: phoneNumberId },
      { category: 'whatsapp', key: 'business_account_id', value: businessAccountId },
      { category: 'whatsapp', key: 'webhook_verify_token', value: webhookVerifyToken },
      { category: 'whatsapp', key: 'app_secret', value: appSecret || '' },
      { category: 'whatsapp', key: 'api_version', value: apiVersion || 'v18.0' }
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
          description: `WhatsApp ${setting.key.replace('_', ' ')}`
        }
      });
    }

    // Also update environment variables (for runtime)
    process.env.WHATSAPP_ACCESS_TOKEN = accessToken;
    process.env.WHATSAPP_PHONE_NUMBER_ID = phoneNumberId;
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = businessAccountId;
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = webhookVerifyToken;
    process.env.WHATSAPP_APP_SECRET = appSecret;
    process.env.WHATSAPP_API_VERSION = apiVersion;

    return NextResponse.json({
      success: true,
      message: 'WhatsApp configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving WhatsApp configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save WhatsApp configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/settings/integrations/whatsapp - Get WhatsApp configuration
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        category: 'whatsapp'
      }
    });

    const config = {
      accessToken: getSettingValue(settings, 'access_token') || '',
      phoneNumberId: getSettingValue(settings, 'phone_number_id') || '',
      businessAccountId: getSettingValue(settings, 'business_account_id') || '',
      webhookVerifyToken: getSettingValue(settings, 'webhook_verify_token') || '',
      appSecret: getSettingValue(settings, 'app_secret') || '',
      apiVersion: getSettingValue(settings, 'api_version') || 'v18.0',
      isConfigured: Boolean(getSettingValue(settings, 'access_token')),
      status: Boolean(getSettingValue(settings, 'access_token')) ? 'connected' : 'disconnected'
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching WhatsApp configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch WhatsApp configuration',
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
