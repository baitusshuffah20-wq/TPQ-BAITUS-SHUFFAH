import { createDonationPayment } from "./midtrans";

interface PaymentRequest {
  orderId: string;
  amount: number;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    itemType: string;
    metadata?: Record<string, unknown>;
  }>;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  token?: string;
  amount: number;
  status: string;
  expiryTime?: string;
  error?: string;
  details?: Record<string, unknown> | string;
  devMode?: boolean;
  fallbackToManual?: boolean;
}

export class PaymentGatewayService {
  private maxRetries = 2;
  private retryDelay = 1000; // 1 second

  async createPayment(
    paymentRequest: PaymentRequest,
    preferredGateway: string = "MIDTRANS",
  ): Promise<PaymentResponse> {
    // Try payment gateway first
    const gatewayResponse = await this.tryPaymentGateway(
      paymentRequest,
      preferredGateway,
    );

    // If gateway fails, automatically fallback to manual transfer
    if (!gatewayResponse.success) {
      console.log("Payment gateway failed, falling back to manual transfer");
      return {
        success: true,
        fallbackToManual: true,
        amount: paymentRequest.amount,
        status: "MANUAL_TRANSFER_REQUIRED",
        error: "Payment gateway unavailable, please use manual transfer",
      };
    }

    return gatewayResponse;
  }

  private async tryPaymentGateway(
    paymentRequest: PaymentRequest,
    gateway: string,
  ): Promise<PaymentResponse> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `Attempting payment gateway (${gateway}) - Attempt ${attempt}/${this.maxRetries}`,
        );

        let response: PaymentResponse;

        switch (gateway.toUpperCase()) {
          case "MIDTRANS":
            response = await this.createMidtransPayment(paymentRequest);
            break;
          case "XENDIT":
            response = await this.createXenditPayment(paymentRequest);
            break;
          default:
            throw new Error(`Unsupported payment gateway: ${gateway}`);
        }

        if (response.success) {
          return response;
        }

        // If not successful but not the last attempt, retry
        if (attempt < this.maxRetries) {
          console.log(
            `Payment attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`,
          );
          await this.delay(this.retryDelay);
          continue;
        }

        return response;
      } catch (error) {
        console.error(`Payment gateway attempt ${attempt} error:`, error);

        if (attempt === this.maxRetries) {
          return {
            success: false,
            amount: paymentRequest.amount,
            status: "GATEWAY_ERROR",
            error:
              error instanceof Error ? error.message : "Payment gateway error",
          };
        }

        // Wait before retry
        await this.delay(this.retryDelay);
      }
    }

    return {
      success: false,
      amount: paymentRequest.amount,
      status: "GATEWAY_ERROR",
      error: "All payment gateway attempts failed",
    };
  }

  async createMidtransPayment(
    paymentRequest: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      console.log(
        "Creating Midtrans payment with request:",
        JSON.stringify(paymentRequest, null, 2),
      );

      // Validate required fields
      if (
        !paymentRequest.orderId ||
        !paymentRequest.amount ||
        !paymentRequest.customer
      ) {
        throw new Error("Missing required payment data");
      }

      // Map the payment request to the format expected by midtrans
      const midtransPaymentRequest = {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        customerDetails: {
          firstName: paymentRequest.customer.name,
          email: paymentRequest.customer.email || "anonymous@example.com",
          phone: paymentRequest.customer.phone || "08123456789",
        },
        itemDetails: paymentRequest.items.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })),
        customExpiry: {
          expiry_duration: 24,
          unit: "hour" as const,
        },
      };

      console.log(
        "Mapped to Midtrans request:",
        JSON.stringify(midtransPaymentRequest, null, 2),
      );

      // Call the midtrans service
      const result = await createDonationPayment(midtransPaymentRequest);

      console.log(
        "Midtrans service response:",
        JSON.stringify(result, null, 2),
      );

      // Check if Midtrans service returned a valid response
      if (!result || typeof result.success !== "boolean") {
        throw new Error("Invalid response from Midtrans service");
      }

      // If we're in development mode and don't have a real payment gateway
      if (result.devMode) {
        console.log("Using development mode payment response");
        return {
          success: true,
          paymentId: "dev-" + Date.now(),
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?order_id=${paymentRequest.orderId}&dev_mode=true`,
          token: result.token,
          amount: paymentRequest.amount,
          status: "PENDING",
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          devMode: true,
        };
      }

      // If Midtrans failed, throw error to trigger fallback
      if (!result.success) {
        throw new Error(result.error || "Midtrans payment creation failed");
      }

      // Map the result to the format expected by the caller
      return {
        success: result.success,
        paymentId: result.token,
        paymentUrl: result.redirectUrl,
        token: result.token,
        error: result.error,
        details: result.details,
        amount: paymentRequest.amount,
        status: "PENDING",
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Error creating Midtrans payment:", error);

      // In development, return a mock success response to avoid breaking the flow
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Using fallback development mode payment response due to error",
        );
        return {
          success: true,
          paymentId: "dev-error-" + Date.now(),
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?order_id=${paymentRequest.orderId}&dev_mode=true&error=true`,
          token: "dev-token-" + Date.now(),
          amount: paymentRequest.amount,
          status: "PENDING",
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
          devMode: true,
        };
      }

      // Return error to trigger fallback
      return {
        success: false,
        amount: paymentRequest.amount,
        status: "GATEWAY_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to create payment",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createXenditPayment(
    paymentRequest: PaymentRequest,
  ): Promise<PaymentResponse> {
    console.log("Xendit payment requested but not implemented");

    // In development, return a mock success response
    if (process.env.NODE_ENV !== "production") {
      return {
        success: true,
        paymentId: "xendit-dev-" + Date.now(),
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?order_id=${paymentRequest.orderId}&dev_mode=true&gateway=xendit`,
        token: "xendit-token-" + Date.now(),
        amount: paymentRequest.amount,
        status: "PENDING",
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        devMode: true,
      };
    }

    return {
      success: false,
      amount: paymentRequest.amount,
      status: "GATEWAY_ERROR",
      error: "Xendit payment gateway not implemented yet",
    };
  }

  // Helper method for delays
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Method to check if a payment gateway is available
  async isGatewayAvailable(gateway: string): Promise<boolean> {
    try {
      switch (gateway.toUpperCase()) {
        case "MIDTRANS":
          // You could implement a health check here
          return process.env.MIDTRANS_SERVER_KEY ? true : false;
        case "XENDIT":
          return process.env.XENDIT_SECRET_KEY ? true : false;
        default:
          return false;
      }
    } catch (error) {
      console.error(
        `Error checking gateway availability for ${gateway}:`,
        error,
      );
      return false;
    }
  }

  // Method to get available payment methods
  getAvailablePaymentMethods(gateway: string): string[] {
    switch (gateway.toUpperCase()) {
      case "MIDTRANS":
        return [
          "credit_card",
          "bca_va",
          "mandiri_va",
          "bni_va",
          "bri_va",
          "gopay",
          "shopeepay",
          "qris",
        ];
      case "XENDIT":
        return [
          "credit_card",
          "bca_va",
          "mandiri_va",
          "bni_va",
          "bri_va",
          "ovo",
          "dana",
          "linkaja",
        ];
      default:
        return [];
    }
  }
}
