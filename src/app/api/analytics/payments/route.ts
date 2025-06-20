import { NextRequest, NextResponse } from 'next/server';
import { PaymentAnalyticsService } from '@/lib/payment-analytics';

// GET /api/analytics/payments - Get payment analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const paymentMethod = searchParams.get('paymentMethod');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const export_format = searchParams.get('export');

    // Parse dates
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Build filters
    const filters: any = {};
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (status) filters.status = status;
    if (category) filters.category = category;

    // Handle export requests
    if (export_format) {
      if (export_format.toUpperCase() === 'CSV' || export_format.toUpperCase() === 'PDF') {
        const exportData = await PaymentAnalyticsService.exportAnalytics(
          export_format.toUpperCase() as 'CSV' | 'PDF',
          { startDate, endDate, ...filters }
        );

        const contentType = export_format.toUpperCase() === 'CSV' 
          ? 'text/csv' 
          : 'application/pdf';
        
        const filename = `payment-analytics-${new Date().toISOString().split('T')[0]}.${export_format.toLowerCase()}`;

        return new NextResponse(exportData, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid export format. Use CSV or PDF.' },
          { status: 400 }
        );
      }
    }

    // Get analytics data
    const analytics = await PaymentAnalyticsService.getPaymentAnalytics(
      startDate,
      endDate,
      filters
    );

    return NextResponse.json({
      success: true,
      data: analytics,
      filters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        paymentMethod,
        status,
        category
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting payment analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get payment analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
