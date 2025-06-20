interface ExportData {
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    totalBalance: number;
  };
  spp?: {
    totalAmount: number;
    collectedAmount: number;
    outstandingAmount: number;
    collectionRate: number;
    recordsCount: number;
  };
  accounts?: Array<{
    name: string;
    type: string;
    balance: number;
  }>;
  transactions?: Array<{
    date: string;
    description: string;
    type: string;
    category: string;
    amount: number;
    account: string;
  }>;
  transactionsByCategory?: Record<string, { income: number; expense: number }>;
}

export class ExportUtils {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  static generateCSV(data: ExportData): string {
    let csv = '';
    
    // Header
    csv += `"${data.title}"\n`;
    csv += `"Periode: ${this.formatDate(data.period.startDate)} - ${this.formatDate(data.period.endDate)}"\n`;
    csv += `"Generated: ${this.formatDate(new Date().toISOString())}"\n\n`;

    // Summary
    csv += '"RINGKASAN KEUANGAN"\n';
    csv += '"Kategori","Jumlah"\n';
    csv += `"Total Pemasukan","${this.formatCurrency(data.summary.totalIncome)}"\n`;
    csv += `"Total Pengeluaran","${this.formatCurrency(data.summary.totalExpense)}"\n`;
    csv += `"Pendapatan Bersih","${this.formatCurrency(data.summary.netIncome)}"\n`;
    csv += `"Total Saldo","${this.formatCurrency(data.summary.totalBalance)}"\n\n`;

    // SPP Summary
    if (data.spp) {
      csv += '"RINGKASAN SPP"\n';
      csv += '"Kategori","Jumlah"\n';
      csv += `"Total SPP","${this.formatCurrency(data.spp.totalAmount)}"\n`;
      csv += `"Terkumpul","${this.formatCurrency(data.spp.collectedAmount)}"\n`;
      csv += `"Belum Terbayar","${this.formatCurrency(data.spp.outstandingAmount)}"\n`;
      csv += `"Tingkat Koleksi","${data.spp.collectionRate.toFixed(1)}%"\n`;
      csv += `"Jumlah Record","${data.spp.recordsCount}"\n\n`;
    }

    // Accounts
    if (data.accounts && data.accounts.length > 0) {
      csv += '"SALDO AKUN"\n';
      csv += '"Nama Akun","Tipe","Saldo"\n';
      data.accounts.forEach(account => {
        csv += `"${account.name}","${account.type}","${this.formatCurrency(account.balance)}"\n`;
      });
      csv += '\n';
    }

    // Transactions by Category
    if (data.transactionsByCategory && Object.keys(data.transactionsByCategory).length > 0) {
      csv += '"TRANSAKSI PER KATEGORI"\n';
      csv += '"Kategori","Pemasukan","Pengeluaran","Net"\n';
      Object.entries(data.transactionsByCategory).forEach(([category, categoryData]) => {
        const net = categoryData.income - categoryData.expense;
        csv += `"${category}","${this.formatCurrency(categoryData.income)}","${this.formatCurrency(categoryData.expense)}","${this.formatCurrency(net)}"\n`;
      });
      csv += '\n';
    }

    // Transactions Detail
    if (data.transactions && data.transactions.length > 0) {
      csv += '"DETAIL TRANSAKSI"\n';
      csv += '"Tanggal","Deskripsi","Tipe","Kategori","Jumlah","Akun"\n';
      data.transactions.forEach(transaction => {
        csv += `"${this.formatDate(transaction.date)}","${transaction.description}","${transaction.type}","${transaction.category}","${this.formatCurrency(transaction.amount)}","${transaction.account}"\n`;
      });
    }

    return csv;
  }

  static generateHTML(data: ExportData): string {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
          }
          .report {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0891b2;
          }
          .header h1 {
            color: #0891b2;
            margin: 0;
            font-size: 28px;
          }
          .header h2 {
            color: #6b7280;
            margin: 10px 0 0 0;
            font-size: 18px;
            font-weight: normal;
          }
          .period {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid #0891b2;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
          }
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .amount.positive { color: #10b981; }
          .amount.negative { color: #ef4444; }
          .amount.neutral { color: #0891b2; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #374151;
          }
          tr:hover {
            background-color: #f8fafc;
          }
          .text-right {
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { background: white; padding: 0; }
            .report { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h1>TPQ BAITUS SHUFFAH</h1>
            <h2>${data.title}</h2>
          </div>

          <div class="period">
            <strong>Periode: ${this.formatDate(data.period.startDate)} - ${this.formatDate(data.period.endDate)}</strong>
          </div>

          <div class="section">
            <div class="section-title">Ringkasan Keuangan</div>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Pemasukan</h3>
                <p class="amount positive">${this.formatCurrency(data.summary.totalIncome)}</p>
              </div>
              <div class="summary-card">
                <h3>Total Pengeluaran</h3>
                <p class="amount negative">${this.formatCurrency(data.summary.totalExpense)}</p>
              </div>
              <div class="summary-card">
                <h3>Pendapatan Bersih</h3>
                <p class="amount ${data.summary.netIncome >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(data.summary.netIncome)}</p>
              </div>
              <div class="summary-card">
                <h3>Total Saldo</h3>
                <p class="amount neutral">${this.formatCurrency(data.summary.totalBalance)}</p>
              </div>
            </div>
          </div>

          ${data.spp ? `
          <div class="section">
            <div class="section-title">Ringkasan SPP</div>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total SPP</h3>
                <p class="amount neutral">${this.formatCurrency(data.spp.totalAmount)}</p>
              </div>
              <div class="summary-card">
                <h3>Terkumpul</h3>
                <p class="amount positive">${this.formatCurrency(data.spp.collectedAmount)}</p>
              </div>
              <div class="summary-card">
                <h3>Belum Terbayar</h3>
                <p class="amount negative">${this.formatCurrency(data.spp.outstandingAmount)}</p>
              </div>
              <div class="summary-card">
                <h3>Tingkat Koleksi</h3>
                <p class="amount neutral">${data.spp.collectionRate.toFixed(1)}%</p>
              </div>
              <div class="summary-card">
                <h3>Jumlah Record</h3>
                <p class="amount neutral">${data.spp.recordsCount}</p>
              </div>
            </div>
          </div>
          ` : ''}

          ${data.accounts && data.accounts.length > 0 ? `
          <div class="section">
            <div class="section-title">Saldo Akun</div>
            <table>
              <thead>
                <tr>
                  <th>Nama Akun</th>
                  <th>Tipe</th>
                  <th class="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                ${data.accounts.map(account => `
                  <tr>
                    <td>${account.name}</td>
                    <td>${account.type}</td>
                    <td class="text-right ${account.balance >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(account.balance)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${data.transactionsByCategory && Object.keys(data.transactionsByCategory).length > 0 ? `
          <div class="section">
            <div class="section-title">Transaksi per Kategori</div>
            <table>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th class="text-right">Pemasukan</th>
                  <th class="text-right">Pengeluaran</th>
                  <th class="text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.transactionsByCategory).map(([category, categoryData]) => {
                  const net = categoryData.income - categoryData.expense;
                  return `
                    <tr>
                      <td>${category}</td>
                      <td class="text-right positive">${this.formatCurrency(categoryData.income)}</td>
                      <td class="text-right negative">${this.formatCurrency(categoryData.expense)}</td>
                      <td class="text-right ${net >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(net)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>Laporan ini digenerate secara otomatis oleh Sistem Manajemen TPQ Baitus Shuffah</p>
            <p>Digenerate pada: ${this.formatDate(new Date().toISOString())}</p>
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

  static downloadCSV(data: ExportData, filename: string) {
    const csv = this.generateCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static downloadHTML(data: ExportData, filename: string) {
    const html = this.generateHTML(data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static printReport(data: ExportData) {
    const html = this.generateHTML(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }
}
