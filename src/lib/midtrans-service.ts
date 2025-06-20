import { 
  MIDTRANS_CONFIG, 
  PAYMENT_METHODS, 
  TRANSACTION_CONFIG, 
  FEE_CONFIG,
  PAYMENT_STATUS,
  STATUS_MAPPING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from './midtrans-config';

// Types
export interface PaymentItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
  brand?: string;
  category?: string;
  merchant_name?: string;
}

export interface CustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  billing_address?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country_code: string;
  };
  shipping_address?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country_code: string;
  };
}

export interface TransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface CreateTransactionRequest {
  transaction_details: TransactionDetails;
  item_details: PaymentItem[];
  customer_details: CustomerDetails;
  enabled_payments?: string[];
  custom_expiry?: {
    order_time: string;
    expiry_duration: number;
    unit: 'minute' | 'hour' | 'day';
  };
  callbacks?: {
    finish?: string;
    unfinish?: string;
    error?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  token: string;
  redirect_url: string;
}

export interface TransactionStatus {
  order_id: string;
  transaction_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  merchant_id: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  biller_code?: string;
  bill_key?: string;
  permata_va_number?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

export class MidtransService {
  private static instance: MidtransService;
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;
  private apiUrl: string;

  private constructor() {
    this.serverKey = MIDTRANS_CONFIG.serverKey;
    this.clientKey = MIDTRANS_CONFIG.clientKey;
    this.isProduction = MIDTRANS_CONFIG.isProduction;
    this.apiUrl = MIDTRANS_CONFIG.apiUrl;
  }

  public static getInstance(): MidtransService {
    if (!MidtransService.instance) {
      MidtransService.instance = new MidtransService();
    }
    return MidtransService.instance;
  }

  // Create payment token
  public async createTransaction(request: CreateTransactionRequest): Promise<PaymentResponse> {
    try {
      // Validate request
      this.validateTransactionRequest(request);

      // Add default callbacks if not provided
      if (!request.callbacks) {
        request.callbacks = TRANSACTION_CONFIG.callbacks;
      }

      // Add custom expiry if not provided
      if (!request.custom_expiry) {
        request.custom_expiry = {
          order_time: new Date().toISOString(),
          expiry_duration: TRANSACTION_CONFIG.defaultExpiry,
          unit: 'minute'
        };
      }

      const response = await fetch(`${this.apiUrl}/v2/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_messages?.[0] || ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      const data = await response.json();
      
      return {
        token: data.token,
        redirect_url: data.redirect_url
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get transaction status
  public async getTransactionStatus(orderId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_messages?.[0] || ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  // Cancel transaction
  public async cancelTransaction(orderId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_messages?.[0] || ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling transaction:', error);
      throw error;
    }
  }

  // Refund transaction
  public async refundTransaction(orderId: string, amount?: number, reason?: string): Promise<TransactionStatus> {
    try {
      const body: any = {};
      if (amount) body.refund_amount = amount;
      if (reason) body.reason = reason;

      const response = await fetch(`${this.apiUrl}/v2/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_messages?.[0] || ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      return await response.json();
    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  // Validate notification
  public validateNotification(notification: any): boolean {
    try {
      const orderId = notification.order_id;
      const statusCode = notification.status_code;
      const grossAmount = notification.gross_amount;
      const serverKey = this.serverKey;

      const signatureKey = notification.signature_key;
      const input = orderId + statusCode + grossAmount + serverKey;
      
      const crypto = require('crypto');
      const hash = crypto.createHash('sha512').update(input).digest('hex');

      return hash === signatureKey;
    } catch (error) {
      console.error('Error validating notification:', error);
      return false;
    }
  }

  // Map Midtrans status to internal status
  public mapStatus(midtransStatus: string): string {
    return STATUS_MAPPING[midtransStatus] || 'UNKNOWN';
  }

  // Calculate admin fee
  public calculateAdminFee(paymentMethod: string, amount: number): number {
    if (paymentMethod === 'credit_card') {
      return Math.round(amount * (FEE_CONFIG.creditCardFeePercentage / 100));
    }
    return FEE_CONFIG.adminFee[paymentMethod] || 0;
  }

  // Calculate total amount including admin fee
  public calculateTotalAmount(amount: number, paymentMethod: string): number {
    const adminFee = this.calculateAdminFee(paymentMethod, amount);
    return amount + adminFee;
  }

  // Get payment methods for specific amount
  public getAvailablePaymentMethods(amount: number): string[] {
    const methods = PAYMENT_METHODS.ALL_METHODS.enabled_payments;
    
    // Filter based on amount limits
    return methods.filter(method => {
      const totalAmount = this.calculateTotalAmount(amount, method);
      return totalAmount >= FEE_CONFIG.minimumAmount && totalAmount <= FEE_CONFIG.maximumAmount;
    });
  }

  // Validate transaction request
  private validateTransactionRequest(request: CreateTransactionRequest): void {
    const { transaction_details, item_details, customer_details } = request;

    // Validate transaction details
    if (!transaction_details.order_id) {
      throw new Error('Order ID is required');
    }

    if (!transaction_details.gross_amount || transaction_details.gross_amount < FEE_CONFIG.minimumAmount) {
      throw new Error(ERROR_MESSAGES.AMOUNT_TOO_LOW);
    }

    if (transaction_details.gross_amount > FEE_CONFIG.maximumAmount) {
      throw new Error(ERROR_MESSAGES.AMOUNT_TOO_HIGH);
    }

    // Validate item details
    if (!item_details || item_details.length === 0) {
      throw new Error('Item details are required');
    }

    // Validate customer details
    if (!customer_details.first_name || !customer_details.email || !customer_details.phone) {
      throw new Error('Customer details (name, email, phone) are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_details.email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone format (Indonesian)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(customer_details.phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  // Generate order ID
  public generateOrderId(prefix: string = 'TPQ'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Format currency
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export default MidtransService;
