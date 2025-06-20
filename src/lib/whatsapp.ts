import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'media';
  content: string;
  templateName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send a template message via WhatsApp
   */
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    params: string[] = []
  ): Promise<WhatsAppResponse> {
    try {
      const components = params.length > 0 ? [{
        type: 'body',
        parameters: params.map(param => ({
          type: 'text',
          text: param
        }))
      }] : [];

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'id'
            },
            components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error: any) {
      console.error('WhatsApp template send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send media message via WhatsApp
   */
  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    caption?: string
  ): Promise<WhatsAppResponse> {
    try {
      const mediaObject: any = {
        link: mediaUrl
      };

      if (caption && (mediaType === 'image' || mediaType === 'video')) {
        mediaObject.caption = caption;
      }

      if (mediaType === 'document') {
        mediaObject.filename = mediaUrl.split('/').pop() || 'document';
      }

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: mediaType,
          [mediaType]: mediaObject
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error: any) {
      console.error('WhatsApp media send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send hafalan progress report to parent
   */
  async sendHafalanProgressToParent(
    parentPhone: string,
    studentName: string,
    surah: string,
    progress: number,
    grade?: number
  ): Promise<WhatsAppResponse> {
    const message = `🕌 *Laporan Hafalan - Rumah Tahfidz Baitus Shuffah*

👤 *Santri:* ${studentName}
📖 *Surah:* ${surah}
📊 *Progress:* ${progress}%
${grade ? `⭐ *Nilai:* ${grade}` : ''}

Alhamdulillah, putra/putri Anda menunjukkan kemajuan yang baik dalam menghafal Al-Quran.

Barakallahu fiikum 🤲

_Pesan otomatis dari Sistem Rumah Tahfidz_`;

    return this.sendTextMessage(parentPhone, message);
  }

  /**
   * Send attendance notification to parent
   */
  async sendAttendanceNotification(
    parentPhone: string,
    studentName: string,
    status: 'HADIR' | 'ALPHA' | 'IZIN' | 'SAKIT',
    date: string,
    time?: string
  ): Promise<WhatsAppResponse> {
    const statusEmoji = {
      'HADIR': '✅',
      'ALPHA': '❌',
      'IZIN': '📝',
      'SAKIT': '🏥'
    };

    const message = `🕌 *Notifikasi Kehadiran - Rumah Tahfidz Baitus Shuffah*

👤 *Santri:* ${studentName}
📅 *Tanggal:* ${date}
${time ? `🕐 *Waktu:* ${time}` : ''}
${statusEmoji[status]} *Status:* ${status}

${status === 'HADIR' 
  ? 'Alhamdulillah, putra/putri Anda hadir tepat waktu.' 
  : status === 'ALPHA'
  ? 'Putra/putri Anda tidak hadir hari ini. Mohon konfirmasi jika ada keperluan.'
  : 'Terima kasih atas informasinya.'
}

Barakallahu fiikum 🤲

_Pesan otomatis dari Sistem Rumah Tahfidz_`;

    return this.sendTextMessage(parentPhone, message);
  }

  /**
   * Send payment reminder to parent
   */
  async sendPaymentReminder(
    parentPhone: string,
    studentName: string,
    paymentType: string,
    amount: number,
    dueDate: string
  ): Promise<WhatsAppResponse> {
    const message = `🕌 *Pengingat Pembayaran - Rumah Tahfidz Baitus Shuffah*

👤 *Santri:* ${studentName}
💳 *Jenis:* ${paymentType}
💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
📅 *Jatuh Tempo:* ${dueDate}

Mohon untuk melakukan pembayaran sebelum tanggal jatuh tempo.

Untuk pembayaran dapat melalui:
🏦 Transfer Bank
💳 E-Wallet
🏪 Datang langsung ke kantor

Barakallahu fiikum 🤲

_Pesan otomatis dari Sistem Rumah Tahfidz_`;

    return this.sendTextMessage(parentPhone, message);
  }

  /**
   * Send monthly report to parent
   */
  async sendMonthlyReport(
    parentPhone: string,
    studentName: string,
    reportData: {
      attendanceRate: number;
      hafalanProgress: number;
      currentSurah: string;
      averageGrade: number;
      totalHafalan: number;
    }
  ): Promise<WhatsAppResponse> {
    const message = `🕌 *Laporan Bulanan - Rumah Tahfidz Baitus Shuffah*

👤 *Santri:* ${studentName}
📅 *Periode:* ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}

📊 *RINGKASAN PERFORMANCE:*
✅ Kehadiran: ${reportData.attendanceRate}%
📖 Progress Hafalan: ${reportData.hafalanProgress}%
📚 Surah Saat Ini: ${reportData.currentSurah}
⭐ Rata-rata Nilai: ${reportData.averageGrade}
🎯 Total Hafalan Selesai: ${reportData.totalHafalan}

${reportData.attendanceRate >= 90 
  ? 'Mashaa Allah! Kehadiran sangat baik.' 
  : reportData.attendanceRate >= 80
  ? 'Kehadiran cukup baik, tingkatkan lagi.'
  : 'Perlu peningkatan kehadiran.'
}

${reportData.averageGrade >= 85
  ? 'Alhamdulillah, prestasi hafalan sangat memuaskan!'
  : reportData.averageGrade >= 75
  ? 'Prestasi hafalan cukup baik, terus semangat!'
  : 'Perlu bimbingan lebih intensif untuk hafalan.'
}

Barakallahu fiikum 🤲

_Laporan otomatis dari Sistem Rumah Tahfidz_`;

    return this.sendTextMessage(parentPhone, message);
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Validate WhatsApp configuration
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }
}

export const whatsappService = new WhatsAppService();
export default WhatsAppService;
