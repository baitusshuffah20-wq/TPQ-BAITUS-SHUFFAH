import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, to } = body;

    const whatsappService = new WhatsAppService();

    // Use provided phone number or fallback
    const testPhone = to || phone || process.env.WHATSAPP_TEST_PHONE || '6281234567890';

    if (!testPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required for testing' },
        { status: 400 }
      );
    }

    const testMessage = message || `🧪 Test Message dari TPQ Baitus Shuffah

Ini adalah pesan test untuk memastikan integrasi WhatsApp berfungsi dengan baik.

✅ Koneksi berhasil
📱 API WhatsApp aktif
🕐 Waktu: ${new Date().toLocaleString('id-ID')}

Barakallahu fiikum 🤲

_Pesan test otomatis dari Sistem TPQ Baitus Shuffah_`;

    // Send test message
    const result = await whatsappService.sendTextMessage(
      testPhone,
      testMessage,
      { type: 'connection_test' }
    );

    return NextResponse.json({
      success: true,
      message: 'WhatsApp test message sent successfully',
      data: {
        messageId: result.messages?.[0]?.id,
        phone: testPhone,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error testing WhatsApp connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'WhatsApp connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check WhatsApp service configuration
    const isConfigured = whatsappService.isConfigured();
    
    // Get environment variables status (without exposing actual values)
    const envStatus = {
      hasApiUrl: !!process.env.WHATSAPP_API_URL,
      hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasTestPhone: !!process.env.WHATSAPP_TEST_PHONE,
      hasWebhookToken: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      hasWebhookSecret: !!process.env.WHATSAPP_WEBHOOK_SECRET
    };

    // Calculate configuration completeness
    const configuredCount = Object.values(envStatus).filter(Boolean).length;
    const totalRequired = Object.keys(envStatus).length;
    const completeness = Math.round((configuredCount / totalRequired) * 100);

    return NextResponse.json({
      isConfigured,
      completeness,
      environment: envStatus,
      recommendations: getConfigurationRecommendations(envStatus),
      status: isConfigured ? 'ready' : 'needs_configuration'
    });

  } catch (error: any) {
    console.error('WhatsApp status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check WhatsApp status',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function getConfigurationRecommendations(envStatus: any): string[] {
  const recommendations: string[] = [];

  if (!envStatus.hasApiUrl) {
    recommendations.push('Set WHATSAPP_API_URL environment variable');
  }

  if (!envStatus.hasAccessToken) {
    recommendations.push('Set WHATSAPP_ACCESS_TOKEN from Facebook Business Manager');
  }

  if (!envStatus.hasPhoneNumberId) {
    recommendations.push('Set WHATSAPP_PHONE_NUMBER_ID from WhatsApp Business API');
  }

  if (!envStatus.hasTestPhone) {
    recommendations.push('Set WHATSAPP_TEST_PHONE for testing purposes');
  }

  if (!envStatus.hasWebhookToken) {
    recommendations.push('Set WHATSAPP_WEBHOOK_VERIFY_TOKEN for webhook verification');
  }

  if (!envStatus.hasWebhookSecret) {
    recommendations.push('Set WHATSAPP_WEBHOOK_SECRET for webhook security');
  }

  if (recommendations.length === 0) {
    recommendations.push('Configuration looks good! You can now send test messages.');
  }

  return recommendations;
}
