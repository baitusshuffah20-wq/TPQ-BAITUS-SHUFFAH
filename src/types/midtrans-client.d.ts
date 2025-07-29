declare module "midtrans-client" {
  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: Address;
    shipping_address?: Address;
  }

  interface Address {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
  }

  interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface SnapTransactionParameter {
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
    enabled_payments?: string[];
    credit_card?: {
      secure?: boolean;
      channel?: string;
      bank?: string;
      installment?: {
        required?: boolean;
        terms?: {
          [bank: string]: number[];
        };
      };
      whitelist_bins?: string[];
    };
    bca_va?: {
      va_number?: string;
    };
    bni_va?: {
      va_number?: string;
    };
    bri_va?: {
      va_number?: string;
    };
    permata_va?: {
      va_number?: string;
      recipient_name?: string;
    };
    callbacks?: {
      finish?: string;
    };
    expiry?: {
      start_time?: string;
      unit?: string;
      duration?: number;
    };
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
  }

  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: SnapTransactionParameter): Promise<{
      token: string;
      redirect_url: string;
    }>;
  }

  interface TransactionStatus {
    status_code: string;
    status_message: string;
    transaction_id: string;
    masked_card?: string;
    order_id: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
    approval_code?: string;
    signature_key?: string;
    bank?: string;
    gross_amount: string;
    channel_response_code?: string;
    channel_response_message?: string;
    card_type?: string;
    three_ds_version?: string;
    challenge_completion?: boolean;
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

  interface RefundParameter {
    refund_key?: string;
    amount?: number;
    reason?: string;
  }

  interface ChargeParameter {
    payment_type: string;
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
    credit_card?: {
      token_id?: string;
      bank?: string;
      installment_term?: number;
      bins?: string[];
      type?: string;
      save_token_id?: boolean;
    };
    bank_transfer?: {
      bank: string;
      va_number?: string;
    };
    echannel?: {
      bill_info1?: string;
      bill_info2?: string;
    };
    bca_klikpay?: {
      description: string;
    };
    bca_klikbca?: {
      description: string;
      user_id: string;
    };
    mandiri_clickpay?: {
      card_number: string;
      input1: string;
      input2: string;
      input3: string;
      token: string;
    };
    cimb_clicks?: {
      description: string;
    };
    danamon_online?: {
      description: string;
    };
    qris?: {
      acquirer?: string;
    };
    gopay?: {
      enable_callback?: boolean;
      callback_url?: string;
    };
    shopeepay?: {
      callback_url?: string;
    };
  }

  interface CaptureParameter {
    transaction_id: string;
    gross_amount: number;
  }

  interface CardTokenParameter {
    card_number: string;
    card_exp_month: string;
    card_exp_year: string;
    card_cvv: string;
    client_key?: string;
  }

  interface CardTokenResponse {
    status_code: string;
    status_message: string;
    token_id: string;
    hash: string;
  }

  interface CardPointResponse {
    status_code: string;
    status_message: string;
    point_balance_amount: string;
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    transaction: {
      status(orderId: string): Promise<TransactionStatus>;
      cancel(orderId: string): Promise<TransactionStatus>;
      approve(orderId: string): Promise<TransactionStatus>;
      deny(orderId: string): Promise<TransactionStatus>;
      expire(orderId: string): Promise<TransactionStatus>;
      refund(
        orderId: string,
        parameter?: RefundParameter,
      ): Promise<TransactionStatus>;
    };

    charge(parameter: ChargeParameter): Promise<TransactionStatus>;
    capture(parameter: CaptureParameter): Promise<TransactionStatus>;
    cardToken(parameter: CardTokenParameter): Promise<CardTokenResponse>;
    cardPointInquiry(tokenId: string): Promise<CardPointResponse>;
  }
}
