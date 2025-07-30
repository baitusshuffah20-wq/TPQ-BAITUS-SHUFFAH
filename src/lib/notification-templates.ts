// Define types locally to avoid importing Prisma on client-side
export const NotificationType = {
  PAYMENT_REMINDER: "PAYMENT_REMINDER",
  PAYMENT_CONFIRMATION: "PAYMENT_CONFIRMATION",
  PAYMENT_OVERDUE: "PAYMENT_OVERDUE",
  ATTENDANCE_ALERT: "ATTENDANCE_ALERT",
  ATTENDANCE_CONFIRMATION: "ATTENDANCE_CONFIRMATION",
  HAFALAN_PROGRESS: "HAFALAN_PROGRESS",
  ACHIEVEMENT: "ACHIEVEMENT",
  TARGET_REMINDER: "TARGET_REMINDER",
  BIRTHDAY_REMINDER: "BIRTHDAY_REMINDER",
  EVENT_REMINDER: "EVENT_REMINDER",
  EXAM_REMINDER: "EXAM_REMINDER",
  GRADE_REPORT: "GRADE_REPORT",
  GENERAL: "GENERAL",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
  ACCOUNT_UPDATE: "ACCOUNT_UPDATE",
} as const;

export const NotificationChannel = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  SMS: "SMS",
} as const;

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: NotificationType;
  channels: NotificationChannel[];
  variables: string[];
  description: string;
  category: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Hafalan Templates
  {
    id: "hafalan_completed",
    name: "Hafalan Selesai",
    title: "🎉 Hafalan {{surah}} Selesai!",
    message: "Alhamdulillah, {{santriName}} telah menyelesaikan hafalan {{surah}} dengan nilai {{grade}}. Semoga Allah mudahkan untuk hafalan selanjutnya.",
    type: NotificationType.ACHIEVEMENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["santriName", "surah", "grade"],
    description: "Notifikasi ketika santri menyelesaikan hafalan surah",
    category: "HAFALAN"
  },
  {
    id: "hafalan_progress",
    name: "Progress Hafalan",
    title: "📖 Update Progress Hafalan",
    message: "{{santriName}} telah mencapai progress {{progress}}% dalam hafalan {{surah}}. Target selesai: {{targetDate}}.",
    type: NotificationType.PROGRESS_UPDATE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    variables: ["santriName", "progress", "surah", "targetDate"],
    description: "Update progress hafalan santri",
    category: "HAFALAN"
  },
  {
    id: "hafalan_target_reminder",
    name: "Pengingat Target Hafalan",
    title: "⏰ Pengingat Target Hafalan",
    message: "Target hafalan {{surah}} untuk {{santriName}} akan berakhir pada {{targetDate}}. Saat ini progress: {{progress}}%.",
    type: NotificationType.TARGET_REMINDER,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["santriName", "surah", "targetDate", "progress"],
    description: "Pengingat target hafalan yang akan berakhir",
    category: "HAFALAN"
  },

  // Attendance Templates
  {
    id: "attendance_absent",
    name: "Notifikasi Ketidakhadiran",
    title: "❌ Pemberitahuan Ketidakhadiran",
    message: "{{santriName}} tidak hadir pada kegiatan {{activity}} hari {{date}}. Status: {{status}}. {{notes}}",
    type: NotificationType.ATTENDANCE_ALERT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["santriName", "activity", "date", "status", "notes"],
    description: "Notifikasi ketika santri tidak hadir",
    category: "KEHADIRAN"
  },
  {
    id: "attendance_present",
    name: "Konfirmasi Kehadiran",
    title: "✅ Konfirmasi Kehadiran",
    message: "{{santriName}} hadir pada kegiatan {{activity}} hari {{date}} pukul {{time}}. {{notes}}",
    type: NotificationType.ATTENDANCE_CONFIRMATION,
    channels: [NotificationChannel.IN_APP],
    variables: ["santriName", "activity", "date", "time", "notes"],
    description: "Konfirmasi kehadiran santri",
    category: "KEHADIRAN"
  },

  // Payment Templates
  {
    id: "payment_reminder",
    name: "Pengingat Pembayaran",
    title: "💰 Pengingat Pembayaran SPP",
    message: "Pembayaran SPP {{month}} {{year}} untuk {{santriName}} akan jatuh tempo pada {{dueDate}}. Jumlah: {{amount}}.",
    type: NotificationType.PAYMENT_REMINDER,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP, NotificationChannel.EMAIL],
    variables: ["santriName", "month", "year", "dueDate", "amount"],
    description: "Pengingat pembayaran SPP yang akan jatuh tempo",
    category: "PEMBAYARAN"
  },
  {
    id: "payment_confirmation",
    name: "Konfirmasi Pembayaran",
    title: "✅ Pembayaran Berhasil",
    message: "Pembayaran {{paymentType}} untuk {{santriName}} sebesar {{amount}} telah berhasil diproses pada {{date}}. Terima kasih.",
    type: NotificationType.PAYMENT_CONFIRMATION,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["santriName", "paymentType", "amount", "date"],
    description: "Konfirmasi pembayaran yang berhasil",
    category: "PEMBAYARAN"
  },
  {
    id: "payment_overdue",
    name: "Pembayaran Terlambat",
    title: "⚠️ Pembayaran Terlambat",
    message: "Pembayaran SPP {{month}} {{year}} untuk {{santriName}} telah melewati batas waktu. Mohon segera melakukan pembayaran. Jumlah: {{amount}}.",
    type: NotificationType.PAYMENT_OVERDUE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP, NotificationChannel.EMAIL],
    variables: ["santriName", "month", "year", "amount"],
    description: "Notifikasi pembayaran yang terlambat",
    category: "PEMBAYARAN"
  },

  // Birthday Templates
  {
    id: "birthday_reminder",
    name: "Pengingat Ulang Tahun",
    title: "🎂 Selamat Ulang Tahun!",
    message: "Selamat ulang tahun untuk {{santriName}} yang berulang tahun hari ini ({{birthDate}}). Semoga panjang umur dan barokah.",
    type: NotificationType.BIRTHDAY_REMINDER,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["santriName", "birthDate"],
    description: "Ucapan selamat ulang tahun untuk santri",
    category: "UMUM"
  },

  // General Templates
  {
    id: "general_announcement",
    name: "Pengumuman Umum",
    title: "📢 {{title}}",
    message: "{{message}}",
    type: NotificationType.GENERAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["title", "message"],
    description: "Template untuk pengumuman umum",
    category: "UMUM"
  },
  {
    id: "event_reminder",
    name: "Pengingat Acara",
    title: "📅 Pengingat Acara: {{eventName}}",
    message: "Jangan lupa acara {{eventName}} akan dilaksanakan pada {{eventDate}} pukul {{eventTime}} di {{location}}. {{description}}",
    type: NotificationType.EVENT_REMINDER,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP, NotificationChannel.EMAIL],
    variables: ["eventName", "eventDate", "eventTime", "location", "description"],
    description: "Pengingat untuk acara atau kegiatan",
    category: "ACARA"
  },

  // Academic Templates
  {
    id: "exam_reminder",
    name: "Pengingat Ujian",
    title: "📝 Pengingat Ujian {{examType}}",
    message: "Ujian {{examType}} akan dilaksanakan pada {{examDate}} pukul {{examTime}}. Materi: {{subjects}}. Persiapkan diri dengan baik!",
    type: NotificationType.EXAM_REMINDER,
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    variables: ["examType", "examDate", "examTime", "subjects"],
    description: "Pengingat ujian atau evaluasi",
    category: "AKADEMIK"
  },
  {
    id: "grade_report",
    name: "Laporan Nilai",
    title: "📊 Laporan Nilai {{period}}",
    message: "Laporan nilai {{period}} untuk {{santriName}} telah tersedia. Rata-rata: {{average}}. Silakan cek detail di aplikasi.",
    type: NotificationType.GRADE_REPORT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    variables: ["santriName", "period", "average"],
    description: "Laporan nilai santri",
    category: "AKADEMIK"
  }
];

// Helper functions
export function getTemplateById(id: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter(template => template.category === category);
}

export function getAllCategories(): string[] {
  const categories = NOTIFICATION_TEMPLATES.map(template => template.category);
  return [...new Set(categories)];
}

export function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}
