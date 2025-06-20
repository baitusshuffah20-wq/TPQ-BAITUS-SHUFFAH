interface ReceiptData {
  receiptNumber: string;
  date: Date;
  santri: {
    name: string;
    nis: string;
  };
  spp: {
    period: string;
    amount: number;
    paidAmount: number;
    discount: number;
    fine: number;
  };
  payment: {
    method: string;
    account: string;
  };
  notes?: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kwitansi SPP - ${data.receiptNumber}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .receipt {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border: 2px solid #0891b2;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0891b2, #06b6d4);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .header h2 {
          margin: 5px 0 0 0;
          font-size: 16px;
          font-weight: normal;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px dashed #e5e7eb;
        }
        .receipt-number {
          font-size: 18px;
          font-weight: bold;
          color: #0891b2;
        }
        .receipt-date {
          font-size: 14px;
          color: #6b7280;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 500;
          color: #6b7280;
        }
        .info-value {
          font-weight: 600;
          color: #374151;
        }
        .amount-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        .total-row.main {
          font-size: 18px;
          font-weight: bold;
          color: #0891b2;
          border-top: 2px solid #0891b2;
          padding-top: 15px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px dashed #e5e7eb;
          text-align: center;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-bottom: 1px solid #374151;
          margin: 60px 0 10px 0;
        }
        .notes {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .notes-title {
          font-weight: bold;
          color: #92400e;
          margin-bottom: 5px;
        }
        .notes-content {
          color: #92400e;
          font-size: 14px;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
            border: 1px solid #000;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>TPQ BAITUS SHUFFAH</h1>
          <h2>KWITANSI PEMBAYARAN SPP</h2>
        </div>
        
        <div class="content">
          <div class="receipt-info">
            <div>
              <div class="receipt-number">No. ${data.receiptNumber}</div>
            </div>
            <div>
              <div class="receipt-date">${formatDate(data.date)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informasi Santri</div>
            <div class="info-row">
              <span class="info-label">Nama Santri:</span>
              <span class="info-value">${data.santri.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">NIS:</span>
              <span class="info-value">${data.santri.nis}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detail SPP</div>
            <div class="info-row">
              <span class="info-label">Periode:</span>
              <span class="info-value">${data.spp.period}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Jumlah SPP:</span>
              <span class="info-value">${formatCurrency(data.spp.amount)}</span>
            </div>
          </div>

          <div class="amount-section">
            <div class="total-row">
              <span>Jumlah SPP:</span>
              <span>${formatCurrency(data.spp.amount)}</span>
            </div>
            ${data.spp.discount > 0 ? `
            <div class="total-row">
              <span>Diskon:</span>
              <span style="color: #10b981;">-${formatCurrency(data.spp.discount)}</span>
            </div>
            ` : ''}
            ${data.spp.fine > 0 ? `
            <div class="total-row">
              <span>Denda:</span>
              <span style="color: #ef4444;">+${formatCurrency(data.spp.fine)}</span>
            </div>
            ` : ''}
            <div class="total-row main">
              <span>Total Dibayar:</span>
              <span>${formatCurrency(data.spp.paidAmount)}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Metode Pembayaran</div>
            <div class="info-row">
              <span class="info-label">Metode:</span>
              <span class="info-value">${data.payment.method}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Akun:</span>
              <span class="info-value">${data.payment.account}</span>
            </div>
          </div>

          ${data.notes ? `
          <div class="notes">
            <div class="notes-title">Catatan:</div>
            <div class="notes-content">${data.notes}</div>
          </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div>Yang Menerima</div>
              <div class="signature-line"></div>
              <div>Bendahara</div>
            </div>
            <div class="signature-box">
              <div>Yang Membayar</div>
              <div class="signature-line"></div>
              <div>${data.santri.name}</div>
            </div>
          </div>

          <div class="footer">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              Kwitansi ini dicetak secara otomatis oleh Sistem Manajemen TPQ Baitus Shuffah
            </p>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">
              Dicetak pada: ${formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      <script>
        // Auto print when page loads
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getHours().toString().padStart(2, '0') + 
               now.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `SPP${year}${month}${day}${time}${random}`;
}
