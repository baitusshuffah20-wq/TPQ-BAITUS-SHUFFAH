import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { aiInsights } from '@/lib/ai-insights';
import bcrypt from 'bcryptjs';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  details?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results: TestResult[] = [];

  console.log('🧪 Starting comprehensive test suite...');

  // Test 1: Database CRUD Operations
  try {
    const testStart = Date.now();
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@test.com`,
        name: 'Test User',
        role: 'WALI',
        password: await bcrypt.hash('test123', 10),
        phone: '081234567890'
      }
    });

    // Update test user
    await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Test User' }
    });

    // Read test user
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    // Delete test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    results.push({
      test: 'Database CRUD Operations',
      status: updatedUser?.name === 'Updated Test User' ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        created: !!testUser.id,
        updated: updatedUser?.name === 'Updated Test User',
        deleted: true
      }
    });
  } catch (error) {
    results.push({
      test: 'Database CRUD Operations',
      status: 'fail',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Authentication System
  try {
    const testStart = Date.now();
    
    // Test password hashing
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    const isInvalidPassword = await bcrypt.compare('wrongpassword', hashedPassword);

    results.push({
      test: 'Authentication System',
      status: isValidPassword && !isInvalidPassword ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        passwordHashing: !!hashedPassword,
        validPasswordCheck: isValidPassword,
        invalidPasswordCheck: !isInvalidPassword
      }
    });
  } catch (error) {
    results.push({
      test: 'Authentication System',
      status: 'fail',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: AI Insights System
  try {
    const testStart = Date.now();
    
    // Test system insights
    const systemInsights = await aiInsights.generateSystemInsights();
    
    // Test with existing student if available
    const firstStudent = await prisma.santri.findFirst();
    let studentInsights = null;
    
    if (firstStudent) {
      studentInsights = await aiInsights.generateStudentInsights(firstStudent.id);
    }

    results.push({
      test: 'AI Insights System',
      status: systemInsights && systemInsights.totalStudents >= 0 ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        systemInsights: !!systemInsights,
        studentInsights: !!studentInsights,
        totalStudents: systemInsights?.totalStudents,
        averageAttendance: systemInsights?.averageAttendance
      }
    });
  } catch (error) {
    results.push({
      test: 'AI Insights System',
      status: 'fail',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: Email Service
  try {
    const testStart = Date.now();
    
    const isConfigured = emailService.isConfigured();
    let connectionTest = { success: false, error: 'Not configured' };
    
    if (isConfigured) {
      connectionTest = await emailService.verifyConnection();
    }

    results.push({
      test: 'Email Service',
      status: isConfigured ? (connectionTest.success ? 'pass' : 'fail') : 'skip',
      duration: Date.now() - testStart,
      details: {
        configured: isConfigured,
        connectionSuccess: connectionTest.success,
        smtpHost: !!process.env.SMTP_HOST,
        smtpUser: !!process.env.SMTP_USER
      },
      error: connectionTest.error
    });
  } catch (error) {
    results.push({
      test: 'Email Service',
      status: 'fail',
      duration: Date.now() - testStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 5: Data Relationships
  try {
    const testStart = Date.now();
    
    // Test complex queries with relationships
    const studentsWithData = await prisma.santri.findMany({
      include: {
        wali: true,
        halaqah: {
          include: {
            musyrif: true
          }
        },
        hafalan: {
          take: 1
        },
        attendance: {
          take: 1
        }
      },
      take: 1
    });

    const hasRelationships = studentsWithData.length > 0 && 
                            studentsWithData[0].wali && 
                            studentsWithData[0].halaqah;

    results.push({
      test: 'Data Relationships',
      status: hasRelationships ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        studentsFound: studentsWithData.length,
        hasWali: !!studentsWithData[0]?.wali,
        hasHalaqah: !!studentsWithData[0]?.halaqah,
        hasMusyrif: !!studentsWithData[0]?.halaqah?.musyrif
      }
    });
  } catch (error) {
    results.push({
      test: 'Data Relationships',
      status: 'fail',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 6: API Endpoints
  try {
    const testStart = Date.now();
    
    // Test internal API calls
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    
    // Test insights endpoint
    const insightsResponse = await fetch(`${baseUrl}/api/insights/system`);
    const insightsData = await insightsResponse.json();

    results.push({
      test: 'API Endpoints',
      status: healthResponse.ok && insightsResponse.ok ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        healthEndpoint: healthResponse.ok,
        insightsEndpoint: insightsResponse.ok,
        healthStatus: healthData.status,
        insightsSuccess: insightsData.success
      }
    });
  } catch (error) {
    results.push({
      test: 'API Endpoints',
      status: 'fail',
      duration: Date.now() - testStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 7: Environment Configuration
  try {
    const testStart = Date.now();
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET'
    ];

    const optionalEnvVars = [
      'SMTP_HOST',
      'SMTP_USER',
      'WHATSAPP_API_URL',
      'MIDTRANS_SERVER_KEY'
    ];

    const missingRequired = requiredEnvVars.filter(env => !process.env[env]);
    const missingOptional = optionalEnvVars.filter(env => !process.env[env]);

    results.push({
      test: 'Environment Configuration',
      status: missingRequired.length === 0 ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        requiredVars: requiredEnvVars.length,
        missingRequired: missingRequired,
        optionalVars: optionalEnvVars.length,
        missingOptional: missingOptional,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    results.push({
      test: 'Environment Configuration',
      status: 'fail',
      duration: Date.now() - testStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 8: Performance Test
  try {
    const testStart = Date.now();
    
    // Test database query performance
    const queryStart = Date.now();
    await prisma.user.findMany({ take: 10 });
    const queryTime = Date.now() - queryStart;
    
    // Test complex query performance
    const complexQueryStart = Date.now();
    await prisma.santri.findMany({
      include: {
        wali: true,
        halaqah: true,
        hafalan: { take: 5 },
        attendance: { take: 5 }
      },
      take: 5
    });
    const complexQueryTime = Date.now() - complexQueryStart;

    const performanceGood = queryTime < 100 && complexQueryTime < 500;

    results.push({
      test: 'Performance Test',
      status: performanceGood ? 'pass' : 'fail',
      duration: Date.now() - testStart,
      details: {
        simpleQueryTime: queryTime,
        complexQueryTime: complexQueryTime,
        performanceGood,
        threshold: 'Simple: <100ms, Complex: <500ms'
      }
    });
  } catch (error) {
    results.push({
      test: 'Performance Test',
      status: 'fail',
      duration: Date.now() - testStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Calculate summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'pass').length;
  const failedTests = results.filter(r => r.status === 'fail').length;
  const skippedTests = results.filter(r => r.status === 'skip').length;
  const totalDuration = Date.now() - startTime;

  const summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    skipped: skippedTests,
    successRate: Math.round((passedTests / (totalTests - skippedTests)) * 100),
    duration: totalDuration
  };

  console.log(`✅ Test suite completed: ${passedTests}/${totalTests} passed`);

  return NextResponse.json({
    success: failedTests === 0,
    summary,
    results,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
