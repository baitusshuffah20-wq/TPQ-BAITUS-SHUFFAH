import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock payments data
  const payments = [
    {
      id: '1',
      santriName: 'Ahmad Fauzi',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      status: 'PAID',
      method: 'BANK_TRANSFER',
      reference: 'TRX001'
    },
    {
      id: '2',
      santriName: 'Siti Aisyah',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      status: 'PENDING',
      reference: 'TRX002'
    },
    {
      id: '3',
      santriName: 'Muhammad Rizki',
      type: 'REGISTRATION',
      amount: 1000000,
      dueDate: '2024-01-30',
      status: 'OVERDUE',
      reference: 'TRX003'
    },
    {
      id: '4',
      santriName: 'Fatimah Zahra',
      type: 'BOOK',
      amount: 200000,
      dueDate: '2024-02-20',
      paidDate: '2024-02-18',
      status: 'PAID',
      method: 'E_WALLET',
      reference: 'TRX004'
    },
    {
      id: '5',
      santriName: 'Abdullah Rahman',
      type: 'SPP',
      amount: 500000,
      dueDate: '2024-02-15',
      status: 'PENDING',
      reference: 'TRX005'
    },
    {
      id: '6',
      santriName: 'Khadijah Binti Ahmad',
      type: 'UNIFORM',
      amount: 300000,
      dueDate: '2024-02-10',
      paidDate: '2024-02-08',
      status: 'PAID',
      method: 'QRIS',
      reference: 'TRX006'
    }
  ];

  return NextResponse.json({
    success: true,
    data: payments,
    pagination: {
      page: 1,
      limit: 10,
      total: payments.length,
      totalPages: 1
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock payment creation
    const mockPayment = {
      id: `payment_${Date.now()}`,
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: mockPayment,
      message: 'Payment created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
