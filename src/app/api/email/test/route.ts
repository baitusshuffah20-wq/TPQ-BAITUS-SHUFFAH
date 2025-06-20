import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subject, message } = body;

    // Validate email service configuration
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Email service not configured',
          details: 'Please check your SMTP credentials in environment variables'
        },
        { status: 500 }
      );
    }

    // Use test email if not provided
    const testEmail = email || process.env.SMTP_USER || 'test@rumahtahfidz.com';
    const testSubject = subject || '🧪 Test Email dari Rumah Tahfidz Baitus Shuffah';
    const testMessage = message || `
      <h2>🧪 Test Email</h2>
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Ini adalah email test untuk memastikan konfigurasi SMTP berfungsi dengan baik.</p>
      
      <div style="background-color: #f0fdfa; border: 2px solid #5eead4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3>✅ Status Konfigurasi:</h3>
        <ul>
          <li>SMTP Host: ${process.env.SMTP_HOST}</li>
          <li>SMTP Port: ${process.env.SMTP_PORT}</li>
          <li>SMTP User: ${process.env.SMTP_USER}</li>
          <li>From Email: ${process.env.EMAIL_FROM}</li>
        </ul>
      </div>

      <p><strong>🕐 Waktu Test:</strong> ${new Date().toLocaleString('id-ID')}</p>
      
      <p>Jika Anda menerima email ini, berarti konfigurasi email sudah benar!</p>
      
      <p>Barakallahu fiikum,<br>
      Tim Rumah Tahfidz Baitus Shuffah</p>
    `;

    // Send test email
    const result = await emailService.sendEmail({
      to: testEmail,
      subject: testSubject,
      html: testMessage,
      text: `Test Email dari Rumah Tahfidz - ${new Date().toLocaleString('id-ID')}`
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        email: testEmail,
        message: 'Test email sent successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          details: result.error
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check email service configuration
    const isConfigured = emailService.isConfigured();
    
    // Get environment variables status (without exposing actual values)
    const envStatus = {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpPort: !!process.env.SMTP_PORT,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasEmailFrom: !!process.env.EMAIL_FROM,
      hasAppName: !!process.env.NEXT_PUBLIC_APP_NAME
    };

    // Calculate configuration completeness
    const configuredCount = Object.values(envStatus).filter(Boolean).length;
    const totalRequired = Object.keys(envStatus).length;
    const completeness = Math.round((configuredCount / totalRequired) * 100);

    // Test SMTP connection
    let connectionStatus = 'unknown';
    let connectionError = null;

    if (isConfigured) {
      try {
        const connectionTest = await emailService.verifyConnection();
        connectionStatus = connectionTest.success ? 'connected' : 'failed';
        connectionError = connectionTest.error || null;
      } catch (error: any) {
        connectionStatus = 'failed';
        connectionError = error.message;
      }
    } else {
      connectionStatus = 'not_configured';
    }

    return NextResponse.json({
      isConfigured,
      completeness,
      connectionStatus,
      connectionError,
      environment: envStatus,
      recommendations: getConfigurationRecommendations(envStatus),
      status: isConfigured ? (connectionStatus === 'connected' ? 'ready' : 'connection_failed') : 'needs_configuration'
    });

  } catch (error: any) {
    console.error('Email status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check email status',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function getConfigurationRecommendations(envStatus: any): string[] {
  const recommendations: string[] = [];

  if (!envStatus.hasSmtpHost) {
    recommendations.push('Set SMTP_HOST environment variable (e.g., smtp.gmail.com)');
  }

  if (!envStatus.hasSmtpPort) {
    recommendations.push('Set SMTP_PORT environment variable (e.g., 587 for TLS)');
  }

  if (!envStatus.hasSmtpUser) {
    recommendations.push('Set SMTP_USER environment variable (your email address)');
  }

  if (!envStatus.hasSmtpPass) {
    recommendations.push('Set SMTP_PASS environment variable (app password for Gmail)');
  }

  if (!envStatus.hasEmailFrom) {
    recommendations.push('Set EMAIL_FROM environment variable (sender email address)');
  }

  if (!envStatus.hasAppName) {
    recommendations.push('Set NEXT_PUBLIC_APP_NAME environment variable');
  }

  if (recommendations.length === 0) {
    recommendations.push('Configuration looks good! You can now send test emails.');
    recommendations.push('For Gmail: Use App Password instead of regular password');
    recommendations.push('For other providers: Check SMTP settings and authentication');
  }

  return recommendations;
}
