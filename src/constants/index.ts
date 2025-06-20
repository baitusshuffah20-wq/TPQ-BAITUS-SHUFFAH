// Application Constants

export const APP_NAME = 'Rumah Tahfidz Baitus Shuffah';
export const APP_DESCRIPTION = 'Sistem Informasi Manajemen Rumah Tahfidz yang modern dan terintegrasi';

// Contact Information
export const CONTACT_INFO = {
  address: 'Jl. Islamic Center No. 123, Jakarta Pusat',
  phone: '+62 21 1234 5678',
  email: 'info@rumahtahfidz.com',
  whatsapp: '+62 812 3456 7890',
  website: 'https://rumahtahfidz.com'
};

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/rumahtahfidz',
  instagram: 'https://instagram.com/rumahtahfidz',
  youtube: 'https://youtube.com/@rumahtahfidz',
  twitter: 'https://twitter.com/rumahtahfidz'
};

// Operating Hours
export const OPERATING_HOURS = {
  weekdays: '07:00 - 17:00',
  saturday: '07:00 - 15:00',
  sunday: '08:00 - 12:00'
};

// Statistics
export const STATS = {
  totalStudents: 250,
  totalGraduates: 50,
  yearsExperience: 15,
  totalDonations: 500000000,
  activePrograms: 8,
  successRate: 95
};

// Surah Names (First 30 for common use)
export const SURAH_NAMES = [
  'Al-Fatihah',
  'Al-Baqarah',
  'Ali \'Imran',
  'An-Nisa\'',
  'Al-Ma\'idah',
  'Al-An\'am',
  'Al-A\'raf',
  'Al-Anfal',
  'At-Tawbah',
  'Yunus',
  'Hud',
  'Yusuf',
  'Ar-Ra\'d',
  'Ibrahim',
  'Al-Hijr',
  'An-Nahl',
  'Al-Isra\'',
  'Al-Kahf',
  'Maryam',
  'Ta-Ha',
  'Al-Anbiya\'',
  'Al-Hajj',
  'Al-Mu\'minun',
  'An-Nur',
  'Al-Furqan',
  'Ash-Shu\'ara\'',
  'An-Naml',
  'Al-Qasas',
  'Al-\'Ankabut',
  'Ar-Rum'
];

// Payment Methods
export const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Transfer Bank',
    description: 'BCA, Mandiri, BNI, BRI',
    icon: 'CreditCard'
  },
  {
    id: 'e_wallet',
    name: 'E-Wallet',
    description: 'GoPay, OVO, DANA, ShopeePay',
    icon: 'Smartphone'
  },
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan QR Code untuk pembayaran',
    icon: 'QrCode'
  }
];

// Bank Account Information
export const BANK_ACCOUNTS = [
  {
    bank: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Yayasan Rumah Tahfidz Baitus Shuffah'
  },
  {
    bank: 'Mandiri',
    accountNumber: '0987654321',
    accountName: 'Yayasan Rumah Tahfidz Baitus Shuffah'
  },
  {
    bank: 'BNI',
    accountNumber: '1122334455',
    accountName: 'Yayasan Rumah Tahfidz Baitus Shuffah'
  }
];

// Program Levels
export const PROGRAM_LEVELS = {
  BEGINNER: 'Pemula',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Lanjutan'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  MUSYRIF: 'Musyrif/Guru',
  WALI: 'Wali Santri'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Hadir',
  ABSENT: 'Tidak Hadir',
  LATE: 'Terlambat',
  EXCUSED: 'Izin'
};

// Hafalan Status
export const HAFALAN_STATUS = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  NEEDS_IMPROVEMENT: 'Perlu Perbaikan',
  REJECTED: 'Ditolak'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Menunggu',
  PAID: 'Lunas',
  OVERDUE: 'Terlambat',
  CANCELLED: 'Dibatalkan'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'Info',
  WARNING: 'Peringatan',
  SUCCESS: 'Berhasil',
  ERROR: 'Error',
  PAYMENT_DUE: 'Tagihan',
  ATTENDANCE: 'Absensi',
  HAFALAN: 'Hafalan',
  ANNOUNCEMENT: 'Pengumuman'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USERS: '/api/users',
  SANTRI: '/api/santri',
  HALAQAH: '/api/halaqah',
  HAFALAN: '/api/hafalan',
  ATTENDANCE: '/api/attendance',
  PAYMENTS: '/api/payments',
  DONATIONS: '/api/donations',
  NOTIFICATIONS: '/api/notifications',
  DASHBOARD: '/api/dashboard'
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd MMMM yyyy HH:mm',
  TIME: 'HH:mm'
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NIS_LENGTH: 5,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15
};

// Theme Colors (matching Tailwind config)
export const THEME_COLORS = {
  primary: '#008080',
  secondary: '#fbbf24',
  accent: '#22c55e',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Islamic Phrases
export const ISLAMIC_PHRASES = {
  BISMILLAH: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
  ALHAMDULILLAH: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  SUBHANALLAH: 'سُبْحَانَ اللَّهِ',
  ALLAHU_AKBAR: 'اللَّهُ أَكْبَرُ',
  LA_ILAHA_ILLA_ALLAH: 'لَا إِلَهَ إِلَّا اللَّهُ',
  ASSALAMU_ALAIKUM: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ'
};

// Default Avatar Colors for user initials
export const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500'
];

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
  UNAUTHORIZED: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  FORBIDDEN: 'Akses ditolak.',
  NOT_FOUND: 'Data tidak ditemukan.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Berhasil masuk ke sistem.',
  LOGOUT: 'Berhasil keluar dari sistem.',
  SAVE: 'Data berhasil disimpan.',
  UPDATE: 'Data berhasil diperbarui.',
  DELETE: 'Data berhasil dihapus.',
  UPLOAD: 'File berhasil diunggah.'
};
