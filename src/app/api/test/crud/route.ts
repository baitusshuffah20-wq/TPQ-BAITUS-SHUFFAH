import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Starting CRUD operations test...');

    const results = [];

    // Test 1: Create User
    try {
      const testUser = await prisma.user.create({
        data: {
          email: `test-crud-${Date.now()}@test.com`,
          name: 'Test CRUD User',
          role: 'WALI',
          password: await bcrypt.hash('test123', 10),
          phone: '081234567890'
        }
      });
      
      results.push({
        operation: 'CREATE User',
        status: 'SUCCESS',
        data: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        }
      });
      console.log('✅ User created successfully');

      // Test 2: Read User
      const readUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      
      results.push({
        operation: 'READ User',
        status: readUser ? 'SUCCESS' : 'FAILED',
        data: readUser ? {
          id: readUser.id,
          email: readUser.email,
          name: readUser.name
        } : null
      });
      console.log('✅ User read successfully');

      // Test 3: Update User
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Updated CRUD User' }
      });
      
      results.push({
        operation: 'UPDATE User',
        status: updatedUser.name === 'Updated CRUD User' ? 'SUCCESS' : 'FAILED',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          updated: true
        }
      });
      console.log('✅ User updated successfully');

      // Test 4: Create Santri with relationship
      const testSantri = await prisma.santri.create({
        data: {
          nis: `TEST-${Date.now()}`,
          name: 'Test CRUD Santri',
          birthDate: new Date('2010-01-01'),
          birthPlace: 'Test City',
          gender: 'MALE',
          address: 'Test Address',
          status: 'ACTIVE',
          waliId: testUser.id
        }
      });
      
      results.push({
        operation: 'CREATE Santri with Relationship',
        status: 'SUCCESS',
        data: {
          id: testSantri.id,
          nis: testSantri.nis,
          name: testSantri.name,
          waliId: testSantri.waliId
        }
      });
      console.log('✅ Santri created with relationship');

      // Test 5: Read with relationships
      const santriWithWali = await prisma.santri.findUnique({
        where: { id: testSantri.id },
        include: {
          wali: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      results.push({
        operation: 'READ with Relationships',
        status: santriWithWali?.wali ? 'SUCCESS' : 'FAILED',
        data: {
          santri: santriWithWali?.name,
          wali: santriWithWali?.wali?.name,
          relationship: 'established'
        }
      });
      console.log('✅ Relationship read successfully');

      // Test 6: Create Hafalan record
      const testHafalan = await prisma.hafalan.create({
        data: {
          surahId: 1,
          surahName: 'Al-Fatihah',
          ayahStart: 1,
          ayahEnd: 7,
          type: 'SETORAN',
          status: 'PENDING',
          santriId: testSantri.id,
          musyrifId: testUser.id
        }
      });
      
      results.push({
        operation: 'CREATE Hafalan',
        status: 'SUCCESS',
        data: {
          id: testHafalan.id,
          surahName: testHafalan.surahName,
          type: testHafalan.type,
          status: testHafalan.status
        }
      });
      console.log('✅ Hafalan created successfully');

      // Test 7: Complex query with multiple relationships
      const complexQuery = await prisma.santri.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          wali: {
            select: {
              name: true,
              email: true
            }
          },
          hafalan: {
            select: {
              surahName: true,
              status: true,
              grade: true
            },
            take: 3
          },
          attendance: {
            select: {
              date: true,
              status: true
            },
            take: 3
          }
        },
        take: 3
      });
      
      results.push({
        operation: 'COMPLEX Query with Multiple Relationships',
        status: 'SUCCESS',
        data: {
          count: complexQuery.length,
          hasWali: complexQuery.some(s => s.wali),
          hasHafalan: complexQuery.some(s => s.hafalan.length > 0),
          hasAttendance: complexQuery.some(s => s.attendance.length > 0)
        }
      });
      console.log('✅ Complex query executed successfully');

      // Test 8: Aggregation queries
      const stats = await Promise.all([
        prisma.user.count(),
        prisma.santri.count(),
        prisma.hafalan.count(),
        prisma.attendance.count(),
        prisma.payment.count()
      ]);
      
      results.push({
        operation: 'AGGREGATION Queries',
        status: 'SUCCESS',
        data: {
          userCount: stats[0],
          santriCount: stats[1],
          hafalanCount: stats[2],
          attendanceCount: stats[3],
          paymentCount: stats[4]
        }
      });
      console.log('✅ Aggregation queries executed successfully');

      // Test 9: Delete operations (cleanup)
      await prisma.hafalan.delete({
        where: { id: testHafalan.id }
      });
      
      await prisma.santri.delete({
        where: { id: testSantri.id }
      });
      
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      
      results.push({
        operation: 'DELETE Operations (Cleanup)',
        status: 'SUCCESS',
        data: {
          deletedHafalan: testHafalan.id,
          deletedSantri: testSantri.id,
          deletedUser: testUser.id
        }
      });
      console.log('✅ Cleanup completed successfully');

    } catch (error) {
      results.push({
        operation: 'CRUD Test',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('❌ CRUD test failed:', error);
    }

    // Calculate success rate
    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const totalCount = results.length;
    const successRate = Math.round((successCount / totalCount) * 100);

    console.log(`🎉 CRUD test completed: ${successCount}/${totalCount} operations successful`);

    return NextResponse.json({
      success: successCount === totalCount,
      message: `CRUD test completed: ${successCount}/${totalCount} operations successful`,
      successRate,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
        operations: [
          'CREATE User',
          'READ User', 
          'UPDATE User',
          'CREATE Santri with Relationship',
          'READ with Relationships',
          'CREATE Hafalan',
          'COMPLEX Query',
          'AGGREGATION Queries',
          'DELETE Operations'
        ]
      }
    });

  } catch (error) {
    console.error('❌ CRUD test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'CRUD test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
