import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  title: string;
  subtitle?: string;
  period: string;
  generatedBy: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: 'table' | 'chart' | 'summary' | 'text' | 'image';
  data: any;
  description?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface SummaryData {
  metrics: {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

class ReportGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF();
  }

  // Generate comprehensive report
  async generateReport(data: ReportData): Promise<Blob> {
    this.pdf = new jsPDF();
    this.currentY = 20;

    // Add header
    this.addHeader(data);
    
    // Add sections
    for (const section of data.sections) {
      await this.addSection(section);
    }

    // Add footer
    this.addFooter();

    return this.pdf.output('blob');
  }

  // Add header to report
  private addHeader(data: ReportData) {
    // Logo placeholder
    this.pdf.setFillColor(13, 148, 136); // Teal color
    this.pdf.rect(this.margin, this.currentY, 30, 15, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('RUMAH', this.margin + 2, this.currentY + 6);
    this.pdf.text('TAHFIDZ', this.margin + 2, this.currentY + 12);

    // Title
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(data.title, this.margin + 40, this.currentY + 8);

    if (data.subtitle) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(data.subtitle, this.margin + 40, this.currentY + 15);
    }

    // Report info
    this.currentY += 25;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Periode: ${data.period}`, this.margin, this.currentY);
    this.pdf.text(`Dibuat oleh: ${data.generatedBy}`, this.margin, this.currentY + 5);
    this.pdf.text(`Tanggal: ${data.generatedAt}`, this.margin, this.currentY + 10);

    this.currentY += 20;
    this.addLine();
  }

  // Add section to report
  private async addSection(section: ReportSection) {
    this.checkPageBreak(30);

    // Section title
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(13, 148, 136);
    this.pdf.text(section.title, this.margin, this.currentY);
    this.currentY += 8;

    // Section description
    if (section.description) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(section.description, this.margin, this.currentY);
      this.currentY += 6;
    }

    this.currentY += 5;

    // Add content based on type
    switch (section.type) {
      case 'table':
        this.addTable(section.data as TableData);
        break;
      case 'summary':
        this.addSummary(section.data as SummaryData);
        break;
      case 'text':
        this.addText(section.data as string);
        break;
      case 'chart':
        await this.addChart(section.data);
        break;
      default:
        this.addText('Unsupported section type');
    }

    this.currentY += 10;
  }

  // Add table to report
  private addTable(data: TableData) {
    const { headers, rows } = data;
    const colWidth = (this.pdf.internal.pageSize.width - 2 * this.margin) / headers.length;
    
    this.checkPageBreak(20 + rows.length * 8);

    // Table headers
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(this.margin, this.currentY, this.pdf.internal.pageSize.width - 2 * this.margin, 8, 'F');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    headers.forEach((header, index) => {
      this.pdf.text(header, this.margin + index * colWidth + 2, this.currentY + 5);
    });
    
    this.currentY += 8;

    // Table rows
    this.pdf.setFont('helvetica', 'normal');
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250);
        this.pdf.rect(this.margin, this.currentY, this.pdf.internal.pageSize.width - 2 * this.margin, 6, 'F');
      }
      
      row.forEach((cell, cellIndex) => {
        this.pdf.text(cell.toString(), this.margin + cellIndex * colWidth + 2, this.currentY + 4);
      });
      
      this.currentY += 6;
    });
  }

  // Add summary metrics
  private addSummary(data: SummaryData) {
    const { metrics } = data;
    const cols = 2;
    const colWidth = (this.pdf.internal.pageSize.width - 2 * this.margin) / cols;
    
    this.checkPageBreak(Math.ceil(metrics.length / cols) * 25);

    metrics.forEach((metric, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = this.margin + col * colWidth;
      const y = this.currentY + row * 25;

      // Metric box
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.rect(x, y, colWidth - 5, 20, 'F');
      
      // Metric label
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(metric.label, x + 3, y + 6);
      
      // Metric value
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(metric.value.toString(), x + 3, y + 14);
      
      // Change indicator
      if (metric.change) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        const color = metric.trend === 'up' ? [34, 197, 94] : 
                     metric.trend === 'down' ? [239, 68, 68] : [156, 163, 175];
        this.pdf.setTextColor(color[0], color[1], color[2]);
        this.pdf.text(metric.change, x + 3, y + 18);
      }
    });

    this.currentY += Math.ceil(metrics.length / cols) * 25;
  }

  // Add text content
  private addText(text: string) {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.pdf.internal.pageSize.width - 2 * this.margin);
    
    this.checkPageBreak(lines.length * 5);
    
    lines.forEach((line: string) => {
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  // Add chart (from HTML element)
  private async addChart(elementId: string) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        this.addText('Chart not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pdf.internal.pageSize.width - 2 * this.margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.checkPageBreak(imgHeight + 10);

      this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight;
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
      this.addText('Error loading chart');
    }
  }

  // Add horizontal line
  private addLine() {
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, this.pdf.internal.pageSize.width - this.margin, this.currentY);
    this.currentY += 5;
  }

  // Check if page break is needed
  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  // Add footer
  private addFooter() {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.line(this.margin, this.pageHeight - 15, this.pdf.internal.pageSize.width - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text('Rumah Tahfidz Baitus Shuffah', this.margin, this.pageHeight - 10);
      this.pdf.text(`Halaman ${i} dari ${pageCount}`, this.pdf.internal.pageSize.width - this.margin - 30, this.pageHeight - 10);
    }
  }

  // Generate student progress report
  generateStudentReport(studentData: any): Promise<Blob> {
    const reportData: ReportData = {
      title: 'Laporan Progress Santri',
      subtitle: studentData.name,
      period: 'Februari 2024',
      generatedBy: 'Admin System',
      generatedAt: new Date().toLocaleDateString('id-ID'),
      sections: [
        {
          title: 'Ringkasan Performance',
          type: 'summary',
          data: {
            metrics: [
              { label: 'Rata-rata Nilai', value: studentData.averageGrade || 85, change: '+5%', trend: 'up' },
              { label: 'Tingkat Kehadiran', value: '95%', change: '+2%', trend: 'up' },
              { label: 'Hafalan Selesai', value: studentData.completedSurah || 15, change: '+3', trend: 'up' },
              { label: 'Target Progress', value: '87%', change: '+12%', trend: 'up' }
            ]
          }
        },
        {
          title: 'Riwayat Hafalan',
          type: 'table',
          description: 'Daftar hafalan yang telah diselesaikan',
          data: {
            headers: ['Tanggal', 'Surah', 'Ayat', 'Nilai', 'Status'],
            rows: [
              ['10/02/2024', 'Al-Baqarah', '1-10', '85', 'Lulus'],
              ['05/02/2024', 'Ali Imran', '1-20', '88', 'Lulus'],
              ['01/02/2024', 'An-Nisa', '1-15', '82', 'Lulus']
            ]
          }
        },
        {
          title: 'Catatan dan Rekomendasi',
          type: 'text',
          data: 'Santri menunjukkan progress yang sangat baik dalam hafalan Al-Quran. Disarankan untuk meningkatkan fokus pada tajwid dan memperbanyak murajaah untuk hafalan yang sudah dikuasai.'
        }
      ]
    };

    return this.generateReport(reportData);
  }

  // Generate class summary report
  generateClassReport(classData: any): Promise<Blob> {
    const reportData: ReportData = {
      title: 'Laporan Kelas',
      subtitle: 'Analisis Performance Keseluruhan',
      period: 'Februari 2024',
      generatedBy: 'Admin System',
      generatedAt: new Date().toLocaleDateString('id-ID'),
      sections: [
        {
          title: 'Statistik Kelas',
          type: 'summary',
          data: {
            metrics: [
              { label: 'Total Santri', value: classData.totalStudents || 62, change: '+5', trend: 'up' },
              { label: 'Rata-rata Nilai', value: classData.averageGrade || 87, change: '+3%', trend: 'up' },
              { label: 'Tingkat Kehadiran', value: '94%', change: '+1%', trend: 'up' },
              { label: 'Hafalan Selesai', value: classData.totalHafalan || 188, change: '+25', trend: 'up' }
            ]
          }
        },
        {
          title: 'Top Performers',
          type: 'table',
          description: 'Santri dengan performance terbaik',
          data: {
            headers: ['Ranking', 'Nama', 'Rata-rata Nilai', 'Hafalan Selesai', 'Kehadiran'],
            rows: [
              ['1', 'Siti Aisyah', '95', '18', '100%'],
              ['2', 'Ahmad Fauzi', '92', '16', '98%'],
              ['3', 'Muhammad Rizki', '90', '15', '96%']
            ]
          }
        }
      ]
    };

    return this.generateReport(reportData);
  }

  // Generate financial report
  generateFinancialReport(financialData: any): Promise<Blob> {
    const reportData: ReportData = {
      title: 'Laporan Keuangan',
      subtitle: 'Ringkasan Pendapatan dan Pengeluaran',
      period: 'Februari 2024',
      generatedBy: 'Admin System',
      generatedAt: new Date().toLocaleDateString('id-ID'),
      sections: [
        {
          title: 'Ringkasan Keuangan',
          type: 'summary',
          data: {
            metrics: [
              { label: 'Total Pendapatan', value: 'Rp 31M', change: '+8%', trend: 'up' },
              { label: 'Pembayaran SPP', value: 'Rp 24M', change: '+5%', trend: 'up' },
              { label: 'Donasi', value: 'Rp 7M', change: '+15%', trend: 'up' },
              { label: 'Tunggakan', value: 'Rp 2M', change: '-12%', trend: 'down' }
            ]
          }
        },
        {
          title: 'Detail Pembayaran',
          type: 'table',
          data: {
            headers: ['Jenis', 'Jumlah Transaksi', 'Total Nominal', 'Status'],
            rows: [
              ['SPP', '58', 'Rp 24.000.000', 'Lunas'],
              ['Donasi Umum', '25', 'Rp 4.500.000', 'Diterima'],
              ['Donasi Pembangunan', '12', 'Rp 2.500.000', 'Diterima']
            ]
          }
        }
      ]
    };

    return this.generateReport(reportData);
  }
}

export default ReportGenerator;
