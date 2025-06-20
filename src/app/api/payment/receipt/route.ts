import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payment/receipt - Generate payment receipt
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

    // Get order details
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        }
      });
    } else if (paymentId) {
      const paymentTransaction = await prisma.paymentTransaction.findUnique({
        where: { paymentId }
      });

      if (paymentTransaction) {
        order = await prisma.order.findUnique({
          where: { id: paymentTransaction.orderId },
          include: {
            customer: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse order items
    const orderItems = JSON.parse(order.items);

    // Generate HTML receipt
    const receiptHtml = generateReceiptHtml({
      orderId: order.id,
      paymentId: order.paymentId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: orderItems,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      createdAt: order.createdAt
    });

    // For now, return HTML. In production, you'd want to use a PDF library like puppeteer
    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="receipt-${order.id}.html"`
      }
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate receipt',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate HTML receipt
function generateReceiptHtml(data: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt Pembayaran - ${data.orderId}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .receipt {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .status {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 25px;
          text-align: center;
        }
        .status-icon {
          color: #16a34a;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .status-text {
          color: #15803d;
          font-weight: 600;
          margin: 0;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
          color: #6b7280;
          font-weight: 500;
        }
        .info-value {
          color: #111827;
          font-weight: 600;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .items-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .item-name {
          font-weight: 500;
          color: #111827;
        }
        .item-description {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .total-section {
          background: #f9fafb;
          border-radius: 6px;
          padding: 20px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total-row.final {
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 12px;
          font-size: 18px;
          font-weight: bold;
          color: #3b82f6;
        }
        .footer {
          background: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .print-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .print-button:hover {
          background: #2563eb;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
      
      <div class="receipt">
        <div class="header">
          <h1>TPQ Baitus Shuffah</h1>
          <p>Receipt Pembayaran</p>
        </div>

        <div class="content">
          <div class="status">
            <div class="status-icon">✅</div>
            <p class="status-text">PEMBAYARAN BERHASIL</p>
          </div>

          <div class="section">
            <div class="section-title">Informasi Transaksi</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Order ID</span>
                <span class="info-value">${data.orderId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment ID</span>
                <span class="info-value">${data.paymentId || '-'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tanggal Pembayaran</span>
                <span class="info-value">${data.paidAt ? formatDate(data.paidAt) : '-'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Metode Pembayaran</span>
                <span class="info-value">${data.paymentMethod || '-'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informasi Pembeli</div>
            <div class="info-item">
              <span class="info-label">Nama</span>
              <span class="info-value">${data.customerName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${data.customerEmail}</span>
            </div>
            ${data.customerPhone ? `
            <div class="info-item">
              <span class="info-label">Telepon</span>
              <span class="info-value">${data.customerPhone}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Detail Pembayaran</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Harga</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map((item: any) => `
                  <tr>
                    <td>
                      <div class="item-name">${item.name}</div>
                      ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.price)}</td>
                    <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(data.subtotal)}</span>
              </div>
              ${data.tax > 0 ? `
              <div class="total-row">
                <span>Pajak</span>
                <span>${formatCurrency(data.tax)}</span>
              </div>
              ` : ''}
              ${data.discount > 0 ? `
              <div class="total-row">
                <span>Diskon</span>
                <span style="color: #16a34a;">-${formatCurrency(data.discount)}</span>
              </div>
              ` : ''}
              <div class="total-row final">
                <span>Total Pembayaran</span>
                <span>${formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Terima kasih atas pembayaran Anda!</strong></p>
          <p>Receipt ini adalah bukti sah pembayaran Anda.</p>
          <p>Simpan receipt ini untuk keperluan administrasi.</p>
          <p style="margin-top: 15px;">
            <strong>TPQ Baitus Shuffah</strong><br>
            Email: admin@tpqbaitusshuffah.com | Telepon: +62 21 1234 5678
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
