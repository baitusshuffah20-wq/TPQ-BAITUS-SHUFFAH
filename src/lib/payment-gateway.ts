import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Payment Gateway Types
export const PaymentGateway = {
  MIDTRANS: 'MIDTRANS',
  XENDIT: 'XENDIT',
  DOKU: 'DOKU',
  GOPAY: 'GOPAY',
  OVO: 'OVO',
  DANA: 'DANA',
  SHOPEEPAY: 'SHOPEEPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  QRIS: 'QRIS'
} as const;

// Payment Status
export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED'
} as const;

interface PaymentGatewayConfig {
  midtrans: {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
    merchantId: string;
  };
  xendit: {
    secretKey: string;
    publicKey: string;
    webhookToken: string;
  };
}

interface PaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  items: PaymentItem[];
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  billing?: {
    address: string;
    city: string;
    postalCode: string;
    countryCode: string;
  };
  metadata?: Record<string, any>;
  callbackUrl?: string;
  redirectUrl?: string;
  expiry?: Date;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl?: string;
  qrCode?: string;
  vaNumber?: string;
  bankCode?: string;
  amount: number;
  status: string;
  expiryTime?: Date;
  instructions?: string[];
  error?: string;
}

export class PaymentGatewayService {
  private config: PaymentGatewayConfig;

  constructor() {
    this.config = {
      midtrans: {
        serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        merchantId: process.env.MIDTRANS_MERCHANT_ID || ''
      },
      xendit: {
        secretKey: process.env.XENDIT_SECRET_KEY || '',
        publicKey: process.env.XENDIT_PUBLIC_KEY || '',
        webhookToken: process.env.XENDIT_WEBHOOK_TOKEN || ''
      }
    };
  }

  // Create payment with Midtrans
  async createMidtransPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const midtransRequest = {
        transaction_details: {
          order_id: request.orderId,
          gross_amount: request.amount
        },
        item_details: request.items.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
          category: item.category || 'education'
        })),
        customer_details: {
          first_name: request.customer.name.split(' ')[0],
          last_name: request.customer.name.split(' ').slice(1).join(' '),
          email: request.customer.email,
          phone: request.customer.phone,
          billing_address: request.billing ? {
            first_name: request.customer.name.split(' ')[0],
            last_name: request.customer.name.split(' ').slice(1).join(' '),
            email: request.customer.email,
            phone: request.customer.phone,
            address: request.billing.address,
            city: request.billing.city,
            postal_code: request.billing.postalCode,
            country_code: request.billing.countryCode
          } : undefined
        },
        enabled_payments: [
          'credit_card', 'bca_va', 'bni_va', 'bri_va', 'mandiri_va',
          'permata_va', 'other_va', 'gopay', 'shopeepay', 'qris'
        ],
        custom_expiry: request.expiry ? {
          expiry_duration: Math.floor((request.expiry.getTime() - Date.now()) / 60000),
          unit: 'minute'
        } : {
          expiry_duration: 1440, // 24 hours
          unit: 'minute'
        },
        callbacks: {
          finish: request.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
        },
        custom_field1: request.metadata?.studentId || '',
        custom_field2: request.metadata?.type || 'spp',
        custom_field3: request.metadata?.period || ''
      };

      const response = await fetch(`${this.getMidtransBaseUrl()}/v2/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.config.midtrans.serverKey + ':').toString('base64')}`
        },
        body: JSON.stringify(midtransRequest)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error_messages?.[0] || 'Payment creation failed');
      }

      // Save payment to database
      await this.savePaymentRecord({
        paymentId: result.transaction_id,
        orderId: request.orderId,
        gateway: PaymentGateway.MIDTRANS,
        amount: request.amount,
        currency: request.currency,
        status: PaymentStatus.PENDING,
        customerId: request.customer.id,
        items: request.items,
        metadata: request.metadata,
        gatewayResponse: result
      });

      return {
        success: true,
        paymentId: result.transaction_id,
        paymentUrl: result.redirect_url,
        amount: request.amount,
        status: PaymentStatus.PENDING,
        expiryTime: request.expiry,
        instructions: this.generatePaymentInstructions(result)
      };
    } catch (error) {
      console.error('Midtrans payment creation error:', error);
      return {
        success: false,
        paymentId: '',
        amount: request.amount,
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create payment with Xendit
  async createXenditPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const xenditRequest = {
        external_id: request.orderId,
        amount: request.amount,
        currency: request.currency.toUpperCase(),
        customer: {
          reference_id: request.customer.id,
          given_names: request.customer.name.split(' ')[0],
          surname: request.customer.name.split(' ').slice(1).join(' '),
          email: request.customer.email,
          mobile_number: request.customer.phone
        },
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: 'ID_DANA', // Default to DANA, can be customized
        channel_properties: {
          success_redirect_url: request.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`
        },
        metadata: request.metadata
      };

      const response = await fetch('https://api.xendit.co/ewallets/charges', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.xendit.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(xenditRequest)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error_code || 'Payment creation failed');
      }

      // Save payment to database
      await this.savePaymentRecord({
        paymentId: result.id,
        orderId: request.orderId,
        gateway: PaymentGateway.XENDIT,
        amount: request.amount,
        currency: request.currency,
        status: PaymentStatus.PENDING,
        customerId: request.customer.id,
        items: request.items,
        metadata: request.metadata,
        gatewayResponse: result
      });

      return {
        success: true,
        paymentId: result.id,
        paymentUrl: result.actions?.desktop_web_checkout_url,
        qrCode: result.actions?.qr_checkout_string,
        amount: request.amount,
        status: PaymentStatus.PENDING,
        expiryTime: new Date(result.expires_at)
      };
    } catch (error) {
      console.error('Xendit payment creation error:', error);
      return {
        success: false,
        paymentId: '',
        amount: request.amount,
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string, gateway: string): Promise<any> {
    try {
      switch (gateway) {
        case PaymentGateway.MIDTRANS:
          return await this.getMidtransPaymentStatus(paymentId);
        case PaymentGateway.XENDIT:
          return await this.getXenditPaymentStatus(paymentId);
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Midtrans payment status
  private async getMidtransPaymentStatus(paymentId: string) {
    const response = await fetch(`${this.getMidtransBaseUrl()}/v2/${paymentId}/status`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(this.config.midtrans.serverKey + ':').toString('base64')}`
      }
    });

    return await response.json();
  }

  // Xendit payment status
  private async getXenditPaymentStatus(paymentId: string) {
    const response = await fetch(`https://api.xendit.co/ewallets/charges/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(this.config.xendit.secretKey + ':').toString('base64')}`
      }
    });

    return await response.json();
  }

  // Save payment record to database
  private async savePaymentRecord(data: {
    paymentId: string;
    orderId: string;
    gateway: string;
    amount: number;
    currency: string;
    status: string;
    customerId: string;
    items: PaymentItem[];
    metadata?: any;
    gatewayResponse: any;
  }) {
    try {
      await prisma.paymentTransaction.create({
        data: {
          paymentId: data.paymentId,
          orderId: data.orderId,
          gateway: data.gateway,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          customerId: data.customerId,
          items: JSON.stringify(data.items),
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          gatewayResponse: JSON.stringify(data.gatewayResponse)
        }
      });
    } catch (error) {
      console.error('Error saving payment record:', error);
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: string, gatewayData?: any) {
    try {
      await prisma.paymentTransaction.update({
        where: { paymentId },
        data: {
          status,
          paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
          gatewayResponse: gatewayData ? JSON.stringify(gatewayData) : undefined,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  // Helper methods
  private getMidtransBaseUrl(): string {
    return this.config.midtrans.isProduction 
      ? 'https://api.midtrans.com' 
      : 'https://api.sandbox.midtrans.com';
  }

  private generatePaymentInstructions(midtransResult: any): string[] {
    const instructions = [];
    
    if (midtransResult.payment_type === 'bank_transfer') {
      instructions.push(`Transfer ke Virtual Account: ${midtransResult.va_numbers?.[0]?.va_number}`);
      instructions.push(`Bank: ${midtransResult.va_numbers?.[0]?.bank}`);
      instructions.push(`Jumlah: Rp ${midtransResult.gross_amount?.toLocaleString('id-ID')}`);
    } else if (midtransResult.payment_type === 'qris') {
      instructions.push('Scan QR Code dengan aplikasi pembayaran Anda');
      instructions.push('Atau gunakan link pembayaran yang disediakan');
    }
    
    return instructions;
  }

  // Test connection
  async testConnection(gateway: string): Promise<boolean> {
    try {
      switch (gateway) {
        case PaymentGateway.MIDTRANS:
          const response = await fetch(`${this.getMidtransBaseUrl()}/v2/ping`, {
            headers: {
              'Authorization': `Basic ${Buffer.from(this.config.midtrans.serverKey + ':').toString('base64')}`
            }
          });
          return response.ok;
        
        case PaymentGateway.XENDIT:
          const xenditResponse = await fetch('https://api.xendit.co/balance', {
            headers: {
              'Authorization': `Basic ${Buffer.from(this.config.xendit.secretKey + ':').toString('base64')}`
            }
          });
          return xenditResponse.ok;
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing ${gateway} connection:`, error);
      return false;
    }
  }
}
