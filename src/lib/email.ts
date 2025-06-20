import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailAttachment {
  filename: string;
  content?: Buffer;
  path?: string;
  contentType?: string;
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: any;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@rumahtahfidz.com';
    this.fromName = process.env.NEXT_PUBLIC_APP_NAME || 'Rumah Tahfidz Baitus Shuffah';

    this.transporter = nodemailer.createTransport(config);
  }

  /**
   * Send email with template or custom content
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let { html, text, subject } = options;

      // Use template if specified
      if (options.template && options.templateData) {
        const template = await this.getTemplate(options.template, options.templateData);
        html = template.html;
        text = template.text;
        subject = template.subject;
      }

      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject,
        html,
        text,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log email
      await this.logEmail({
        to: mailOptions.to,
        subject,
        status: 'SENT',
        messageId: result.messageId,
        template: options.template
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error: any) {
      console.error('Email send error:', error);

      // Log failed email
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'FAILED',
        error: error.message,
        template: options.template
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: string): Promise<any> {
    const templateData = {
      userName,
      userRole,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      supportEmail: 'support@rumahtahfidz.com',
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: userEmail,
      template: 'welcome',
      templateData
    });
  }

  /**
   * Send hafalan progress report to parent
   */
  async sendHafalanProgressReport(
    parentEmail: string,
    studentName: string,
    hafalanData: {
      surah: string;
      progress: number;
      grade?: number;
      notes?: string;
      musyrif: string;
      date: string;
    }
  ): Promise<any> {
    const templateData = {
      studentName,
      ...hafalanData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: parentEmail,
      template: 'hafalan_progress',
      templateData
    });
  }

  /**
   * Send monthly report to parent
   */
  async sendMonthlyReport(
    parentEmail: string,
    studentName: string,
    reportData: {
      month: string;
      year: number;
      attendanceRate: number;
      hafalanProgress: number;
      currentSurah: string;
      averageGrade: number;
      totalHafalan: number;
      achievements: string[];
      recommendations: string[];
    }
  ): Promise<any> {
    const templateData = {
      studentName,
      ...reportData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: parentEmail,
      template: 'monthly_report',
      templateData
    });
  }

  /**
   * Send payment invoice
   */
  async sendPaymentInvoice(
    recipientEmail: string,
    invoiceData: {
      invoiceNumber: string;
      studentName: string;
      items: Array<{
        description: string;
        amount: number;
      }>;
      totalAmount: number;
      dueDate: string;
      paymentMethods: string[];
    }
  ): Promise<any> {
    const templateData = {
      ...invoiceData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: recipientEmail,
      template: 'payment_invoice',
      templateData
    });
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(
    recipientEmail: string,
    paymentData: {
      transactionId: string;
      studentName: string;
      amount: number;
      paymentMethod: string;
      paymentDate: string;
      description: string;
    }
  ): Promise<any> {
    const templateData = {
      ...paymentData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: recipientEmail,
      template: 'payment_confirmation',
      templateData
    });
  }

  /**
   * Send attendance notification
   */
  async sendAttendanceNotification(
    parentEmail: string,
    studentName: string,
    attendanceData: {
      date: string;
      status: string;
      notes?: string;
      consecutiveAbsent?: number;
    }
  ): Promise<any> {
    const templateData = {
      studentName,
      ...attendanceData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: parentEmail,
      template: 'attendance_notification',
      templateData
    });
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(
    recipients: string[],
    newsletterData: {
      title: string;
      content: string;
      imageUrl?: string;
      ctaText?: string;
      ctaUrl?: string;
    }
  ): Promise<any> {
    const templateData = {
      ...newsletterData,
      currentYear: new Date().getFullYear()
    };

    return this.sendEmail({
      to: recipients,
      template: 'newsletter',
      templateData
    });
  }

  /**
   * Get email template
   */
  private async getTemplate(templateName: string, data: any): Promise<EmailTemplate> {
    const templates = {
      welcome: this.getWelcomeTemplate(data),
      hafalan_progress: this.getHafalanProgressTemplate(data),
      monthly_report: this.getMonthlyReportTemplate(data),
      payment_invoice: this.getPaymentInvoiceTemplate(data),
      payment_confirmation: this.getPaymentConfirmationTemplate(data),
      attendance_notification: this.getAttendanceNotificationTemplate(data),
      newsletter: this.getNewsletterTemplate(data)
    };

    return templates[templateName as keyof typeof templates] || templates.welcome;
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(data: any): EmailTemplate {
    return {
      subject: `Selamat Datang di ${this.fromName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Selamat Datang</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
            .button { display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .islamic-pattern { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>'); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header islamic-pattern">
              <h1>🕌 Assalamu'alaikum</h1>
              <h2>Selamat Datang di Rumah Tahfidz Baitus Shuffah</h2>
            </div>
            <div class="content">
              <p>Bismillahirrahmanirrahim,</p>
              <p>Selamat datang <strong>${data.userName}</strong>!</p>
              <p>Alhamdulillah, akun Anda sebagai <strong>${data.userRole}</strong> telah berhasil dibuat di sistem manajemen Rumah Tahfidz Baitus Shuffah.</p>
              
              <h3>🎯 Fitur yang Tersedia:</h3>
              <ul>
                <li>📖 Manajemen hafalan Al-Quran</li>
                <li>📅 Sistem absensi digital</li>
                <li>💳 Pembayaran online</li>
                <li>📊 Laporan progress real-time</li>
                <li>📱 Akses mobile application</li>
              </ul>

              <div style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Masuk ke Sistem</a>
              </div>

              <p>Jika Anda membutuhkan bantuan, silakan hubungi kami di <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
              
              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah. Membangun Generasi Penghafal Al-Quran.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Assalamu'alaikum ${data.userName}, Selamat datang di Rumah Tahfidz Baitus Shuffah! Akun Anda sebagai ${data.userRole} telah berhasil dibuat. Silakan login di ${data.loginUrl}`
    };
  }

  /**
   * Hafalan progress email template
   */
  private getHafalanProgressTemplate(data: any): EmailTemplate {
    return {
      subject: `📖 Laporan Hafalan ${data.studentName} - ${data.surah}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Laporan Hafalan</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .progress-card { background-color: #f0fdfa; border: 2px solid #5eead4; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .grade-badge { display: inline-block; background-color: #0d9488; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📖 Laporan Hafalan</h1>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>

              <div class="progress-card">
                <h3>👤 Santri: ${data.studentName}</h3>
                <h3>📖 Surah: ${data.surah}</h3>
                <h3>📊 Progress: ${data.progress}%</h3>
                ${data.grade ? `<h3>⭐ Nilai: <span class="grade-badge">${data.grade}</span></h3>` : ''}
                <h3>👨‍🏫 Musyrif: ${data.musyrif}</h3>
                <h3>📅 Tanggal: ${data.date}</h3>
              </div>

              ${data.notes ? `
                <h4>📝 Catatan Musyrif:</h4>
                <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                  ${data.notes}
                </p>
              ` : ''}

              <p>Alhamdulillah, putra/putri Anda menunjukkan kemajuan yang baik dalam menghafal Al-Quran. Semoga Allah senantiasa memberkahi usaha dan doa kita semua.</p>

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Laporan Hafalan ${data.studentName} - Surah: ${data.surah}, Progress: ${data.progress}%, Nilai: ${data.grade || 'Belum dinilai'}, Musyrif: ${data.musyrif}`
    };
  }

  /**
   * Monthly report email template
   */
  private getMonthlyReportTemplate(data: any): EmailTemplate {
    return {
      subject: `📊 Laporan Bulanan ${data.studentName} - ${data.month} ${data.year}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Laporan Bulanan</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background-color: #f8fafc; border-radius: 8px; padding: 15px; text-align: center; border: 1px solid #e2e8f0; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0d9488; }
            .achievements { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .recommendations { background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Laporan Bulanan</h1>
              <h2>${data.month} ${data.year}</h2>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>

              <h3>👤 Santri: ${data.studentName}</h3>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.attendanceRate}%</div>
                  <div>Kehadiran</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.hafalanProgress}%</div>
                  <div>Progress Hafalan</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.averageGrade}</div>
                  <div>Rata-rata Nilai</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.totalHafalan}</div>
                  <div>Hafalan Selesai</div>
                </div>
              </div>

              <h4>📖 Surah Saat Ini: ${data.currentSurah}</h4>

              ${data.achievements.length > 0 ? `
                <div class="achievements">
                  <h4>🏆 Pencapaian Bulan Ini:</h4>
                  <ul>
                    ${data.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${data.recommendations.length > 0 ? `
                <div class="recommendations">
                  <h4>💡 Rekomendasi:</h4>
                  <ul>
                    ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <p>Semoga laporan ini bermanfaat untuk memantau perkembangan putra/putri Anda. Mari kita terus berdoa dan berusaha bersama dalam mendidik generasi penghafal Al-Quran.</p>

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Laporan Bulanan ${data.studentName} - ${data.month} ${data.year}. Kehadiran: ${data.attendanceRate}%, Progress: ${data.hafalanProgress}%, Nilai: ${data.averageGrade}`
    };
  }

  /**
   * Payment invoice email template
   */
  private getPaymentInvoiceTemplate(data: any): EmailTemplate {
    const totalFormatted = data.totalAmount.toLocaleString('id-ID');

    return {
      subject: `💳 Invoice Pembayaran #${data.invoiceNumber} - ${data.studentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice Pembayaran</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .invoice-details { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            .items-table th { background-color: #f1f5f9; font-weight: bold; }
            .total-row { background-color: #0d9488; color: white; font-weight: bold; }
            .payment-methods { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Invoice Pembayaran</h1>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <div class="invoice-details">
                <h3>📄 Invoice #${data.invoiceNumber}</h3>
                <p><strong>👤 Santri:</strong> ${data.studentName}</p>
                <p><strong>📅 Jatuh Tempo:</strong> ${data.dueDate}</p>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Deskripsi</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map((item: any) => `
                    <tr>
                      <td>${item.description}</td>
                      <td>Rp ${item.amount.toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>Rp ${totalFormatted}</strong></td>
                  </tr>
                </tbody>
              </table>

              <div class="payment-methods">
                <h4>💳 Metode Pembayaran:</h4>
                <ul>
                  ${data.paymentMethods.map((method: string) => `<li>${method}</li>`).join('')}
                </ul>
              </div>

              <p>Mohon untuk melakukan pembayaran sebelum tanggal jatuh tempo. Jika ada pertanyaan, silakan hubungi kami.</p>

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Invoice #${data.invoiceNumber} untuk ${data.studentName}. Total: Rp ${totalFormatted}. Jatuh tempo: ${data.dueDate}`
    };
  }

  /**
   * Payment confirmation email template
   */
  private getPaymentConfirmationTemplate(data: any): EmailTemplate {
    return {
      subject: `✅ Konfirmasi Pembayaran #${data.transactionId} - ${data.studentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Konfirmasi Pembayaran</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .payment-details { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .success-badge { display: inline-block; background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pembayaran Berhasil</h1>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>

              <div style="text-align: center; margin: 20px 0;">
                <span class="success-badge">PEMBAYARAN BERHASIL</span>
              </div>

              <div class="payment-details">
                <h3>📄 Detail Pembayaran</h3>
                <p><strong>🆔 ID Transaksi:</strong> ${data.transactionId}</p>
                <p><strong>👤 Santri:</strong> ${data.studentName}</p>
                <p><strong>💰 Jumlah:</strong> Rp ${data.amount.toLocaleString('id-ID')}</p>
                <p><strong>💳 Metode:</strong> ${data.paymentMethod}</p>
                <p><strong>📅 Tanggal:</strong> ${data.paymentDate}</p>
                <p><strong>📝 Deskripsi:</strong> ${data.description}</p>
              </div>

              <p>Alhamdulillah, pembayaran Anda telah berhasil diproses. Terima kasih atas kepercayaan Anda kepada Rumah Tahfidz Baitus Shuffah.</p>

              <p>Jika ada pertanyaan mengenai pembayaran ini, silakan hubungi kami dengan menyertakan ID transaksi di atas.</p>

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Pembayaran berhasil! ID: ${data.transactionId}, Santri: ${data.studentName}, Jumlah: Rp ${data.amount.toLocaleString('id-ID')}, Metode: ${data.paymentMethod}`
    };
  }

  /**
   * Attendance notification email template
   */
  private getAttendanceNotificationTemplate(data: any): EmailTemplate {
    const statusEmoji = {
      'HADIR': '✅',
      'ALPHA': '❌',
      'IZIN': '📝',
      'SAKIT': '🏥'
    };

    return {
      subject: `📅 Notifikasi Kehadiran ${data.studentName} - ${data.date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notifikasi Kehadiran</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .attendance-card { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0d9488; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .status-hadir { background-color: #22c55e; color: white; }
            .status-alpha { background-color: #ef4444; color: white; }
            .status-izin { background-color: #f59e0b; color: white; }
            .status-sakit { background-color: #8b5cf6; color: white; }
            .warning { background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Notifikasi Kehadiran</h1>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>

              <div class="attendance-card">
                <h3>👤 Santri: ${data.studentName}</h3>
                <h3>📅 Tanggal: ${data.date}</h3>
                <h3>${statusEmoji[data.status as keyof typeof statusEmoji]} Status:
                  <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
                </h3>
              </div>

              ${data.notes ? `
                <h4>📝 Catatan:</h4>
                <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                  ${data.notes}
                </p>
              ` : ''}

              ${data.consecutiveAbsent && data.consecutiveAbsent >= 3 ? `
                <div class="warning">
                  <h4>⚠️ Peringatan</h4>
                  <p>Putra/putri Anda telah tidak hadir selama ${data.consecutiveAbsent} hari berturut-turut. Mohon untuk segera menghubungi pihak sekolah.</p>
                </div>
              ` : ''}

              <p>Terima kasih atas perhatian Anda terhadap kehadiran putra/putri di Rumah Tahfidz.</p>

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Notifikasi Kehadiran ${data.studentName} - ${data.date}: ${data.status}${data.notes ? `. Catatan: ${data.notes}` : ''}`
    };
  }

  /**
   * Newsletter email template
   */
  private getNewsletterTemplate(data: any): EmailTemplate {
    return {
      subject: `📰 ${data.title} - Rumah Tahfidz Baitus Shuffah`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #0d9488, #115e59); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .newsletter-image { width: 100%; max-width: 500px; height: auto; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📰 Newsletter</h1>
              <h2>${data.title}</h2>
              <p>Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="content">
              <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>

              ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Newsletter Image" class="newsletter-image">` : ''}

              <div style="line-height: 1.6;">
                ${data.content}
              </div>

              ${data.ctaText && data.ctaUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a>
                </div>
              ` : ''}

              <p>Barakallahu fiikum,<br>
              Tim Rumah Tahfidz Baitus Shuffah</p>
            </div>
            <div class="footer">
              <p>© ${data.currentYear} Rumah Tahfidz Baitus Shuffah</p>
              <p><a href="#" style="color: #64748b;">Unsubscribe</a> | <a href="#" style="color: #64748b;">Update Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${data.title}\n\n${data.content.replace(/<[^>]*>/g, '')}\n\n${data.ctaText && data.ctaUrl ? `${data.ctaText}: ${data.ctaUrl}` : ''}`
    };
  }

  /**
   * Log email to database
   */
  private async logEmail(logData: {
    to: string;
    subject: string;
    status: 'SENT' | 'FAILED';
    messageId?: string;
    error?: string;
    template?: string;
  }) {
    try {
      await prisma.emailLog.create({
        data: {
          recipient: logData.to,
          subject: logData.subject,
          status: logData.status,
          messageId: logData.messageId || '',
          template: logData.template || '',
          error: logData.error || '',
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [total, sent, failed] = await Promise.all([
        prisma.emailLog.count({
          where: { sentAt: { gte: startDate } }
        }),
        prisma.emailLog.count({
          where: {
            sentAt: { gte: startDate },
            status: 'SENT'
          }
        }),
        prisma.emailLog.count({
          where: {
            sentAt: { gte: startDate },
            status: 'FAILED'
          }
        })
      ]);

      const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

      return {
        total,
        sent,
        failed,
        successRate,
        period: days
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return null;
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }
}

export const emailService = new EmailService();
export default EmailService;
