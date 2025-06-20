import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing page accessibility...');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const pages = [
      // Public pages
      { name: 'Home Page', url: `${baseUrl}/`, type: 'public' },
      { name: 'Login Page', url: `${baseUrl}/auth/login`, type: 'public' },
      
      // Admin pages
      { name: 'Admin Dashboard', url: `${baseUrl}/dashboard/admin`, type: 'admin' },
      { name: 'Users Management', url: `${baseUrl}/dashboard/admin/users`, type: 'admin' },
      { name: 'Students Management', url: `${baseUrl}/dashboard/admin/santri`, type: 'admin' },
      { name: 'Hafalan Management', url: `${baseUrl}/dashboard/admin/hafalan`, type: 'admin' },
      { name: 'Attendance Management', url: `${baseUrl}/dashboard/admin/attendance`, type: 'admin' },
      { name: 'Payments Management', url: `${baseUrl}/dashboard/admin/payments`, type: 'admin' },
      { name: 'Donations Management', url: `${baseUrl}/dashboard/admin/donations`, type: 'admin' },
      { name: 'News Management', url: `${baseUrl}/dashboard/admin/news`, type: 'admin' },
      { name: 'Reports', url: `${baseUrl}/dashboard/admin/reports`, type: 'admin' },
      { name: 'AI Insights', url: `${baseUrl}/dashboard/admin/insights`, type: 'admin' },
      { name: 'System Monitoring', url: `${baseUrl}/dashboard/admin/monitoring`, type: 'admin' },
      { name: 'System Audit', url: `${baseUrl}/dashboard/admin/audit`, type: 'admin' },
      
      // API endpoints
      { name: 'Health Check API', url: `${baseUrl}/api/health`, type: 'api' },
      { name: 'Test DB API', url: `${baseUrl}/api/test/db`, type: 'api' },
      { name: 'System Insights API', url: `${baseUrl}/api/insights/system`, type: 'api' },
    ];

    const results = [];

    for (const page of pages) {
      try {
        console.log(`Testing: ${page.name}`);
        
        const response = await fetch(page.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'System-Test-Bot/1.0'
          }
        });

        const isAccessible = response.status < 500; // 200, 300, 400 are considered accessible
        const isWorking = response.status === 200;

        results.push({
          name: page.name,
          url: page.url,
          type: page.type,
          status: response.status,
          statusText: response.statusText,
          accessible: isAccessible,
          working: isWorking,
          responseTime: 'N/A' // We can't measure this easily in this context
        });

        console.log(`✅ ${page.name}: ${response.status} ${response.statusText}`);

      } catch (error) {
        results.push({
          name: page.name,
          url: page.url,
          type: page.type,
          status: 0,
          statusText: 'Connection Error',
          accessible: false,
          working: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        console.log(`❌ ${page.name}: Connection Error`);
      }
    }

    // Calculate statistics
    const stats = {
      total: results.length,
      accessible: results.filter(r => r.accessible).length,
      working: results.filter(r => r.working).length,
      errors: results.filter(r => !r.accessible).length,
      byType: {
        public: {
          total: results.filter(r => r.type === 'public').length,
          working: results.filter(r => r.type === 'public' && r.working).length
        },
        admin: {
          total: results.filter(r => r.type === 'admin').length,
          working: results.filter(r => r.type === 'admin' && r.working).length
        },
        api: {
          total: results.filter(r => r.type === 'api').length,
          working: results.filter(r => r.type === 'api' && r.working).length
        }
      }
    };

    const successRate = Math.round((stats.accessible / stats.total) * 100);

    console.log(`🎉 Page test completed: ${stats.accessible}/${stats.total} pages accessible`);

    return NextResponse.json({
      success: stats.errors === 0,
      message: `Page accessibility test completed: ${stats.accessible}/${stats.total} pages accessible`,
      successRate,
      timestamp: new Date().toISOString(),
      stats,
      results,
      summary: {
        totalPages: stats.total,
        accessiblePages: stats.accessible,
        workingPages: stats.working,
        errorPages: stats.errors,
        publicPages: `${stats.byType.public.working}/${stats.byType.public.total}`,
        adminPages: `${stats.byType.admin.working}/${stats.byType.admin.total}`,
        apiEndpoints: `${stats.byType.api.working}/${stats.byType.api.total}`
      }
    });

  } catch (error) {
    console.error('❌ Page test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Page accessibility test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
