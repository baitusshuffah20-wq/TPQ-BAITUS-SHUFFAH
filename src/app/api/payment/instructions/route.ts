import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payment/instructions - Get payment instructions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Order ID or Payment ID is required' },
        { status: 400 }
      );
    }

    let order;
    let paymentTransaction;

    // Get order details
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (order?.paymentId) {
        paymentTransaction = await prisma.paymentTransaction.findUnique({
          where: { paymentId: order.paymentId }
        });
      }
    } else if (paymentId) {
      paymentTransaction = await prisma.paymentTransaction.findUnique({
        where: { paymentId }
      });

      if (paymentTransaction) {
        order = await prisma.order.findUnique({
          where: { id: paymentTransaction.orderId }
        });
      }
    }

    if (!order || !paymentTransaction) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Parse gateway response to get payment details
    const gatewayResponse = paymentTransaction.gatewayResponse 
      ? JSON.parse(paymentTransaction.gatewayResponse) 
      : {};

    // Generate instructions based on payment method
    const instructions = generatePaymentInstructions(
      order.paymentMethod || '',
      order.paymentGateway || '',
      gatewayResponse
    );

    const responseData = {
      orderId: order.id,
      paymentId: paymentTransaction.paymentId,
      amount: order.total,
      paymentMethod: order.paymentMethod,
      gateway: paymentTransaction.gateway,
      vaNumber: gatewayResponse.va_numbers?.[0]?.va_number || gatewayResponse.account_number,
      bankCode: gatewayResponse.va_numbers?.[0]?.bank || gatewayResponse.bank_code,
      qrCode: gatewayResponse.qr_string || gatewayResponse.qr_code,
      instructions: instructions,
      expiryTime: paymentTransaction.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: order.status
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error getting payment instructions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get payment instructions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate payment instructions based on method
function generatePaymentInstructions(paymentMethod: string, gateway: string, gatewayResponse: any): string[] {
  const method = paymentMethod.toLowerCase();
  
  if (method.includes('bca')) {
    return [
      'Buka aplikasi BCA Mobile atau kunjungi ATM BCA terdekat',
      'Pilih menu "Transfer" > "Virtual Account"',
      `Masukkan nomor Virtual Account: ${gatewayResponse.va_numbers?.[0]?.va_number || 'Lihat di atas'}`,
      `Masukkan jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Konfirmasi detail pembayaran dan lanjutkan',
      'Simpan bukti pembayaran sebagai konfirmasi',
      'Pembayaran akan diverifikasi secara otomatis dalam 1-5 menit'
    ];
  }
  
  if (method.includes('bni')) {
    return [
      'Buka aplikasi BNI Mobile Banking atau kunjungi ATM BNI',
      'Pilih menu "Transfer" > "Virtual Account Billing"',
      `Masukkan nomor Virtual Account: ${gatewayResponse.va_numbers?.[0]?.va_number || 'Lihat di atas'}`,
      `Masukkan jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Periksa detail pembayaran dan konfirmasi',
      'Simpan bukti transfer untuk referensi',
      'Status pembayaran akan diperbarui otomatis'
    ];
  }
  
  if (method.includes('bri')) {
    return [
      'Buka aplikasi BRImo atau kunjungi ATM BRI terdekat',
      'Pilih menu "Pembayaran" > "BRIVA"',
      `Masukkan nomor BRIVA: ${gatewayResponse.va_numbers?.[0]?.va_number || 'Lihat di atas'}`,
      `Masukkan jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Verifikasi detail pembayaran',
      'Masukkan PIN untuk konfirmasi',
      'Simpan bukti pembayaran',
      'Pembayaran akan diproses dalam 1-5 menit'
    ];
  }
  
  if (method.includes('mandiri')) {
    return [
      'Buka aplikasi Livin\' by Mandiri atau kunjungi ATM Mandiri',
      'Pilih menu "Bayar" > "Multipayment"',
      `Masukkan kode perusahaan: 70012`,
      `Masukkan nomor Virtual Account: ${gatewayResponse.va_numbers?.[0]?.va_number || 'Lihat di atas'}`,
      `Konfirmasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN untuk otorisasi',
      'Simpan bukti pembayaran',
      'Pembayaran akan diverifikasi otomatis'
    ];
  }
  
  if (method.includes('gopay')) {
    return [
      'Buka aplikasi Gojek di smartphone Anda',
      'Pilih menu "GoPay" atau "Bayar"',
      'Scan QR Code yang tersedia atau gunakan link pembayaran',
      `Konfirmasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN GoPay Anda',
      'Pembayaran akan diproses secara instan',
      'Anda akan menerima notifikasi konfirmasi pembayaran'
    ];
  }
  
  if (method.includes('shopeepay')) {
    return [
      'Buka aplikasi Shopee di smartphone Anda',
      'Pilih menu "ShopeePay"',
      'Scan QR Code atau gunakan link pembayaran yang disediakan',
      `Konfirmasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN ShopeePay',
      'Pembayaran akan diproses langsung',
      'Simpan notifikasi pembayaran sebagai bukti'
    ];
  }
  
  if (method.includes('dana')) {
    return [
      'Buka aplikasi DANA di smartphone Anda',
      'Pilih menu "Scan" atau "Bayar"',
      'Scan QR Code yang tersedia',
      `Konfirmasi detail pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN DANA untuk konfirmasi',
      'Pembayaran akan diproses secara real-time',
      'Anda akan menerima notifikasi sukses pembayaran'
    ];
  }
  
  if (method.includes('ovo')) {
    return [
      'Buka aplikasi OVO di smartphone Anda',
      'Pilih menu "Scan" atau "Pay"',
      'Scan QR Code pembayaran',
      `Verifikasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN OVO atau gunakan biometrik',
      'Pembayaran akan diproses instan',
      'Simpan bukti pembayaran dari notifikasi'
    ];
  }
  
  if (method.includes('qris')) {
    return [
      'Buka aplikasi pembayaran favorit Anda (GoPay, DANA, OVO, ShopeePay, dll)',
      'Pilih menu "Scan QR" atau "Bayar"',
      'Scan QR Code QRIS yang tersedia',
      `Konfirmasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Masukkan PIN aplikasi pembayaran',
      'Pembayaran akan diproses secara langsung',
      'Anda akan menerima konfirmasi pembayaran'
    ];
  }
  
  if (method.includes('credit') || method.includes('cc')) {
    return [
      'Anda akan diarahkan ke halaman pembayaran kartu kredit',
      'Masukkan nomor kartu kredit Anda',
      'Masukkan tanggal kedaluwarsa dan CVV',
      'Masukkan nama pemegang kartu sesuai di kartu',
      `Konfirmasi jumlah pembayaran: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
      'Klik "Bayar" untuk memproses pembayaran',
      'Anda akan menerima konfirmasi pembayaran via email'
    ];
  }
  
  // Default instructions
  return [
    'Ikuti instruksi pembayaran yang diberikan oleh gateway',
    `Pastikan jumlah pembayaran sesuai: ${formatCurrency(gatewayResponse.gross_amount || 0)}`,
    'Simpan bukti pembayaran untuk referensi',
    'Pembayaran akan diverifikasi secara otomatis',
    'Hubungi customer service jika ada kendala'
  ];
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
}
