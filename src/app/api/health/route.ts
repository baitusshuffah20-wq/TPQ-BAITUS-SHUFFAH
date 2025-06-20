import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  error?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  // 1. Database Health Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;
    
    // Check database counts
    const [userCount, santriCount, hafalanCount] = await Promise.all([
      prisma.user.count(),
      prisma.santri.count(),
      prisma.hafalan.count()
    ]);

    checks.push({
      service: 'database',
      status: 'healthy',
      responseTime: dbTime,
      details: {
        users: userCount,
        santri: santriCount,
        hafalan: hafalanCount,
        connection: 'active'
      }
    });
  } catch (error) {
    checks.push({
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }

  // 2. Email Service Health Check
  try {
    const emailStart = Date.now();
    const emailCheck = await emailService.verifyConnection();
    const emailTime = Date.now() - emailStart;

    checks.push({
      service: 'email',
      status: emailCheck.success ? 'healthy' : 'unhealthy',
      responseTime: emailTime,
      details: {
        configured: emailService.isConfigured(),
        smtp: process.env.SMTP_HOST || 'not configured'
      },
      error: emailCheck.error
    });
  } catch (error) {
    checks.push({
      service: 'email',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Email service error'
    });
  }

  // 3. WhatsApp Service Health Check
  try {
    const whatsappStart = Date.now();
    const hasWhatsAppConfig = !!(
      process.env.WHATSAPP_API_URL && 
      process.env.WHATSAPP_ACCESS_TOKEN && 
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
    const whatsappTime = Date.now() - whatsappStart;

    checks.push({
      service: 'whatsapp',
      status: hasWhatsAppConfig ? 'healthy' : 'degraded',
      responseTime: whatsappTime,
      details: {
        configured: hasWhatsAppConfig,
        apiUrl: !!process.env.WHATSAPP_API_URL,
        accessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID
      }
    });
  } catch (error) {
    checks.push({
      service: 'whatsapp',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'WhatsApp service error'
    });
  }

  // 4. Payment Gateway Health Check
  try {
    const paymentStart = Date.now();
    const hasPaymentConfig = !!(
      process.env.MIDTRANS_SERVER_KEY && 
      process.env.MIDTRANS_CLIENT_KEY
    );
    const paymentTime = Date.now() - paymentStart;

    checks.push({
      service: 'payment',
      status: hasPaymentConfig ? 'healthy' : 'degraded',
      responseTime: paymentTime,
      details: {
        configured: hasPaymentConfig,
        serverKey: !!process.env.MIDTRANS_SERVER_KEY,
        clientKey: !!process.env.MIDTRANS_CLIENT_KEY,
        environment: process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'production' : 'sandbox'
      }
    });
  } catch (error) {
    checks.push({
      service: 'payment',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Payment service error'
    });
  }

  // 5. File Storage Health Check
  try {
    const storageStart = Date.now();
    const hasStorageConfig = !!(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    const storageTime = Date.now() - storageStart;

    checks.push({
      service: 'storage',
      status: hasStorageConfig ? 'healthy' : 'degraded',
      responseTime: storageTime,
      details: {
        configured: hasStorageConfig,
        cloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    });
  } catch (error) {
    checks.push({
      service: 'storage',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Storage service error'
    });
  }

  // 6. Authentication Health Check
  try {
    const authStart = Date.now();
    const hasAuthConfig = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.JWT_SECRET
    );
    const authTime = Date.now() - authStart;

    checks.push({
      service: 'authentication',
      status: hasAuthConfig ? 'healthy' : 'unhealthy',
      responseTime: authTime,
      details: {
        configured: hasAuthConfig,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        jwtSecret: !!process.env.JWT_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not set'
      }
    });
  } catch (error) {
    checks.push({
      service: 'authentication',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Auth service error'
    });
  }

  // Calculate overall health
  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const degradedCount = checks.filter(c => c.status === 'degraded').length;
  const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (unhealthyCount > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const totalTime = Date.now() - startTime;

  // System information
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  };

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: totalTime,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    system: systemInfo,
    services: {
      total: checks.length,
      healthy: healthyCount,
      degraded: degradedCount,
      unhealthy: unhealthyCount
    },
    checks
  };

  // Return appropriate HTTP status
  const httpStatus = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
