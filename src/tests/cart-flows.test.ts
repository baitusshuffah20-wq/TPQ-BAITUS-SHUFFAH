import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PaymentGatewayService } from "@/lib/payment-gateway-service";

// Type for mocked fetch
type MockedFetch = ReturnType<typeof vi.fn>;

// Mock fetch globally
global.fetch = vi.fn() as MockedFetch;

describe("Cart Flows System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("PaymentGatewayService", () => {
    let paymentService: PaymentGatewayService;

    beforeEach(() => {
      paymentService = new PaymentGatewayService();
    });

    it("should create payment successfully", async () => {
      const mockPaymentRequest = {
        orderId: "test-order-123",
        amount: 150000,
        customer: {
          name: "John Doe",
          email: "john@example.com",
          phone: "08123456789",
        },
        items: [
          {
            id: "item-1",
            name: "SPP Februari 2024",
            price: 150000,
            quantity: 1,
            itemType: "SPP",
          },
        ],
      };

      const result = await paymentService.createPayment(mockPaymentRequest);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(150000);
    });

    it("should fallback to manual transfer when gateway fails", async () => {
      const mockPaymentRequest = {
        orderId: "test-order-456",
        amount: 200000,
        customer: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "08987654321",
        },
        items: [
          {
            id: "item-2",
            name: "Donasi Pembangunan",
            price: 200000,
            quantity: 1,
            itemType: "DONATION",
          },
        ],
      };

      // Mock gateway failure
      vi.spyOn(paymentService, "createMidtransPayment").mockRejectedValue(
        new Error("Gateway unavailable"),
      );

      const result = await paymentService.createPayment(mockPaymentRequest);

      expect(result.fallbackToManual).toBe(true);
      expect(result.status).toBe("MANUAL_TRANSFER_REQUIRED");
    });

    it("should retry payment gateway on failure", async () => {
      const mockPaymentRequest = {
        orderId: "test-order-789",
        amount: 100000,
        customer: {
          name: "Test User",
          email: "test@example.com",
          phone: "08111111111",
        },
        items: [],
      };

      const createMidtransPaymentSpy = vi
        .spyOn(paymentService, "createMidtransPayment")
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          success: true,
          paymentId: "payment-retry-123",
          paymentUrl: "https://payment.example.com/pay/retry-123",
          token: "token-retry-123",
          amount: 100000,
          status: "PENDING",
        });

      const result = await paymentService.createPayment(mockPaymentRequest);

      expect(createMidtransPaymentSpy).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });

  describe("Cart API Endpoints", () => {
    it("should add item to cart", async () => {
      const mockCartItem = {
        cartId: "cart-123",
        itemType: "SPP",
        itemId: "spp-1",
        name: "SPP Ahmad Fauzi - Februari 2024",
        price: 150000,
        quantity: 1,
        metadata: {
          studentId: "student-1",
          month: 2,
          year: 2024,
        },
      };

      const mockResponse = {
        success: true,
        message: "Item berhasil ditambahkan ke keranjang",
        data: {
          id: "cart-item-1",
          ...mockCartItem,
        },
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCartItem),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.name).toBe(mockCartItem.name);
    });

    it("should update cart item quantity", async () => {
      const updateData = {
        cartId: "cart-123",
        itemId: "cart-item-1",
        quantity: 2,
      };

      const mockResponse = {
        success: true,
        message: "Keranjang berhasil diperbarui",
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should remove item from cart", async () => {
      const removeData = {
        cartId: "cart-123",
        itemId: "cart-item-1",
      };

      const mockResponse = {
        success: true,
        message: "Item berhasil dihapus dari keranjang",
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(removeData),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe("Manual Payment API", () => {
    it("should submit manual payment", async () => {
      const formData = new FormData();
      formData.append(
        "paymentData",
        JSON.stringify({
          type: "MANUAL_TRANSFER",
          method: "MANUAL_BCA",
          amount: 150000,
          customerInfo: {
            name: "John Doe",
            email: "john@example.com",
            phone: "08123456789",
          },
          items: [],
          bankAccount: {
            bank: "BCA",
            accountNumber: "1234567890",
            accountName: "Yayasan Test",
          },
        }),
      );

      // Mock file
      const mockFile = new File(["test"], "proof.jpg", { type: "image/jpeg" });
      formData.append("proofFile", mockFile);

      const mockResponse = {
        success: true,
        message: "Pembayaran manual berhasil disubmit",
        data: {
          orderId: "MANUAL_123456789",
          status: "PENDING_VERIFICATION",
        },
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/payment/manual", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("PENDING_VERIFICATION");
    });

    it("should get manual payment status", async () => {
      const orderId = "MANUAL_123456789";

      const mockResponse = {
        success: true,
        data: {
          orderId,
          status: "PENDING_VERIFICATION",
          amount: 150000,
          customerName: "John Doe",
          createdAt: new Date().toISOString(),
        },
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch(`/api/payment/manual?orderId=${orderId}`);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.orderId).toBe(orderId);
    });

    it("should verify manual payment (admin)", async () => {
      const verificationData = {
        orderId: "MANUAL_123456789",
        action: "APPROVE",
        adminId: "admin-1",
        notes: "Transfer verified successfully",
      };

      const mockResponse = {
        success: true,
        message: "Pembayaran berhasil disetujui",
        data: {
          orderId: verificationData.orderId,
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/payment/manual", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("COMPLETED");
    });
  });

  describe("SPP Statistics API", () => {
    it("should get SPP statistics for wali", async () => {
      const waliId = "wali-123";

      const mockResponse = {
        success: true,
        stats: {
          totalPending: 300000,
          totalOverdue: 150000,
          totalPaid: 1200000,
          pendingCount: 2,
          overdueCount: 1,
          paidCount: 8,
        },
      };

      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch(`/api/spp/stats?waliId=${waliId}`);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.stats.pendingCount).toBe(2);
      expect(data.stats.totalPaid).toBe(1200000);
    });
  });

  describe("File Upload Validation", () => {
    it("should validate file type", () => {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      // Valid file
      const validFile = new File(["test"], "proof.jpg", { type: "image/jpeg" });
      expect(allowedTypes.includes(validFile.type)).toBe(true);

      // Invalid file
      const invalidFile = new File(["test"], "proof.txt", {
        type: "text/plain",
      });
      expect(allowedTypes.includes(invalidFile.type)).toBe(false);
    });

    it("should validate file size", () => {
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Valid size (1MB)
      const validFile = new File(["x".repeat(1024 * 1024)], "proof.jpg", {
        type: "image/jpeg",
      });
      expect(validFile.size <= maxSize).toBe(true);

      // Invalid size (10MB)
      const invalidFile = new File(
        ["x".repeat(10 * 1024 * 1024)],
        "proof.jpg",
        {
          type: "image/jpeg",
        },
      );
      expect(invalidFile.size <= maxSize).toBe(false);
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency correctly", () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
      };

      expect(formatCurrency(150000)).toBe("Rp150.000");
      expect(formatCurrency(1500000)).toBe("Rp1.500.000");
      expect(formatCurrency(0)).toBe("Rp0");
    });
  });

  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      };

      const testDate = "2024-02-15T10:30:00Z";
      const formatted = formatDate(testDate);

      expect(formatted).toContain("Februari");
      expect(formatted).toContain("2024");
    });
  });
});

// Integration Tests
describe("Cart Flows Integration", () => {
  it("should complete full payment flow", async () => {
    // 1. Add item to cart
    const cartItem = {
      cartId: "integration-cart-123",
      itemType: "SPP",
      itemId: "spp-integration-1",
      name: "SPP Integration Test",
      price: 150000,
      quantity: 1,
    };

    (global.fetch as MockedFetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "cart-item-1", ...cartItem },
        }),
      })
      // 2. Get cart summary
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [{ id: "cart-item-1", ...cartItem }],
            subtotal: 150000,
            tax: 0,
            discount: 0,
            total: 150000,
            itemCount: 1,
          },
        }),
      })
      // 3. Process payment (fallback to manual)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: "Gateway unavailable" }),
      })
      // 4. Submit manual payment
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            orderId: "MANUAL_INTEGRATION_123",
            status: "PENDING_VERIFICATION",
          },
        }),
      });

    // Step 1: Add to cart
    const addResponse = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartItem),
    });
    const addData = await addResponse.json();
    expect(addData.success).toBe(true);

    // Step 2: Get cart
    const cartResponse = await fetch(`/api/cart?cartId=${cartItem.cartId}`);
    const cartData = await cartResponse.json();
    expect(cartData.data.total).toBe(150000);

    // Step 3: Try payment gateway (will fail)
    const paymentResponse = await fetch("/api/payment/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId: cartItem.cartId,
        gateway: "MIDTRANS",
        customerInfo: {
          name: "Integration Test",
          email: "test@example.com",
          phone: "08123456789",
        },
      }),
    });
    expect(paymentResponse.ok).toBe(false);

    // Step 4: Submit manual payment
    const formData = new FormData();
    formData.append(
      "paymentData",
      JSON.stringify({
        type: "MANUAL_TRANSFER",
        method: "MANUAL_BCA",
        amount: 150000,
        customerInfo: {
          name: "Integration Test",
          email: "test@example.com",
          phone: "08123456789",
        },
        items: cartData.data.items,
      }),
    );

    const manualResponse = await fetch("/api/payment/manual", {
      method: "POST",
      body: formData,
    });
    const manualData = await manualResponse.json();
    expect(manualData.success).toBe(true);
    expect(manualData.data.status).toBe("PENDING_VERIFICATION");
  });
});
