// Midtrans Configuration
export const MIDTRANS_CONFIG = {
  // Server Key (for backend)
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY',
  
  // Client Key (for frontend)
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY',
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  
  // Snap URL
  snapUrl: process.env.NODE_ENV === 'production' 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js',
    
  // API Base URL
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com',
};

// Payment Methods Configuration
export const PAYMENT_METHODS = {
  BANK_TRANSFER: {
    enabled_payments: ['bank_transfer'],
    bank_transfer: {
      bank: ['bca', 'bni', 'bri', 'mandiri', 'permata']
    }
  },
  
  E_WALLET: {
    enabled_payments: ['gopay', 'shopeepay', 'dana', 'linkaja', 'ovo']
  },
  
  QRIS: {
    enabled_payments: ['qris']
  },
  
  CREDIT_CARD: {
    enabled_payments: ['credit_card'],
    credit_card: {
      secure: true,
      bank: 'bca',
      installment: {
        required: false,
        terms: {
          bni: [3, 6, 12],
          mandiri: [3, 6, 12],
          cimb: [3],
          bca: [3, 6, 12],
          offline: [6, 12]
        }
      }
    }
  },
  
  CONVENIENCE_STORE: {
    enabled_payments: ['cstore'],
    cstore: {
      store: 'indomaret'
    }
  },
  
  ALL_METHODS: {
    enabled_payments: [
      'credit_card', 
      'bank_transfer', 
      'gopay', 
      'shopeepay', 
      'dana', 
      'linkaja', 
      'ovo', 
      'qris', 
      'cstore'
    ]
  }
};

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  // Default expiry (24 hours)
  defaultExpiry: 24 * 60, // in minutes
  
  // Custom expiry for different payment types
  customExpiry: {
    bank_transfer: 24 * 60, // 24 hours
    gopay: 15, // 15 minutes
    shopeepay: 15, // 15 minutes
    dana: 15, // 15 minutes
    linkaja: 15, // 15 minutes
    ovo: 15, // 15 minutes
    qris: 30, // 30 minutes
    cstore: 3 * 24 * 60, // 3 days
    credit_card: 30 // 30 minutes
  },
  
  // Callback URLs
  callbacks: {
    finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/finish`,
    unfinish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/unfinish`,
    error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`,
    notification: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notification`
  }
};

// Fee Configuration
export const FEE_CONFIG = {
  // Admin fee for different payment methods (in IDR)
  adminFee: {
    bank_transfer: 4000,
    gopay: 0,
    shopeepay: 0,
    dana: 0,
    linkaja: 0,
    ovo: 0,
    qris: 0,
    cstore: 2500,
    credit_card: 0 // Usually percentage-based
  },
  
  // Credit card fee (percentage)
  creditCardFeePercentage: 2.9,
  
  // Minimum transaction amount
  minimumAmount: 10000, // Rp 10,000
  
  // Maximum transaction amount
  maximumAmount: 50000000 // Rp 50,000,000
};

// Status Mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SETTLEMENT: 'settlement',
  CAPTURE: 'capture',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire',
  FAILURE: 'failure',
  REFUND: 'refund',
  PARTIAL_REFUND: 'partial_refund',
  AUTHORIZE: 'authorize'
};

// Status Mapping to Internal Status
export const STATUS_MAPPING = {
  [PAYMENT_STATUS.PENDING]: 'PENDING',
  [PAYMENT_STATUS.SETTLEMENT]: 'PAID',
  [PAYMENT_STATUS.CAPTURE]: 'PAID',
  [PAYMENT_STATUS.DENY]: 'FAILED',
  [PAYMENT_STATUS.CANCEL]: 'CANCELLED',
  [PAYMENT_STATUS.EXPIRE]: 'EXPIRED',
  [PAYMENT_STATUS.FAILURE]: 'FAILED',
  [PAYMENT_STATUS.REFUND]: 'REFUNDED',
  [PAYMENT_STATUS.PARTIAL_REFUND]: 'PARTIAL_REFUND',
  [PAYMENT_STATUS.AUTHORIZE]: 'AUTHORIZED'
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Jumlah pembayaran tidak valid',
  AMOUNT_TOO_LOW: `Minimum pembayaran Rp ${FEE_CONFIG.minimumAmount.toLocaleString('id-ID')}`,
  AMOUNT_TOO_HIGH: `Maximum pembayaran Rp ${FEE_CONFIG.maximumAmount.toLocaleString('id-ID')}`,
  INVALID_PAYMENT_METHOD: 'Metode pembayaran tidak valid',
  TRANSACTION_FAILED: 'Transaksi gagal diproses',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan',
  SERVER_ERROR: 'Terjadi kesalahan server',
  EXPIRED_TRANSACTION: 'Transaksi telah kedaluwarsa',
  CANCELLED_TRANSACTION: 'Transaksi dibatalkan',
  INSUFFICIENT_BALANCE: 'Saldo tidak mencukupi'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PAYMENT_SUCCESS: 'Pembayaran berhasil diproses',
  PAYMENT_PENDING: 'Pembayaran sedang diproses',
  REFUND_SUCCESS: 'Refund berhasil diproses',
  TRANSACTION_CREATED: 'Transaksi berhasil dibuat'
};

export default MIDTRANS_CONFIG;
