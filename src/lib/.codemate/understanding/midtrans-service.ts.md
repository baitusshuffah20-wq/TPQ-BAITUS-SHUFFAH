# High-Level Documentation: `MidtransService` Code

This module provides a TypeScript service class designed to facilitate communication and integration with the [Midtrans](https://midtrans.com/) payment gateway. It abstracts and manages various payment-related operations and contains utility methods to streamline payment processing, validation, and configuration.

---

## Main Components

### Configuration Imports

The service relies on several imported constants for API credentials, endpoints, fee structures, payment method lists, and standardized status/error messages (imported from `./midtrans-config`).

### Core Interfaces

- **PaymentItem** – Represents a single item/product in a payment transaction, with properties such as `id`, `price`, `quantity`, `name`, and optional details (category, brand, etc.).
- **CustomerDetails** – Contains customer information such as names, email, phone, and optional billing or shipping address structures.
- **TransactionDetails** – Describes a transaction's main properties: `order_id` and `gross_amount`.
- **CreateTransactionRequest** – Encapsulates all data for initiating a payment, including transaction and customer details, items, payment methods, callback URLs, expiry, and optional metadata.
- **PaymentResponse** – Standardizes a successful payment token response (token + redirect URL).
- **TransactionStatus** – Represents a response object from Midtrans describing status and metadata about a specific transaction (IDs, status, type, VA numbers, etc.).

---

## The `MidtransService` Class

A singleton (`getInstance`) class encapsulating all logic and API interactions with Midtrans. Key features:

### Initialization

- Stores server and client keys, production mode flag, and API endpoint from config.

### Key Methods

#### 1. **Transaction Operations**

- **createTransaction(request: CreateTransactionRequest)**  
  Initiates a payment transaction with Midtrans, validates input, attaches default callback and expiry if missing, and returns a payment URL and token.

- **getTransactionStatus(orderId: string)**
  Retrieves the latest transaction status for a given order ID.

- **cancelTransaction(orderId: string)**
  Requests the cancellation of a specific transaction/order.

- **refundTransaction(orderId: string, amount?: number, reason?: string)**
  Requests a refund for a transaction, supporting partial refunds (with amount and reason).

#### 2. **Notification & Status**

- **validateNotification(notification: any)**
  Confirms that a payment notification signature received from Midtrans is authentic and unaltered, using a server-side hash validation.

- **mapStatus(midtransStatus: string)**
  Maps Midtrans-specific status codes to internal status constants.

#### 3. **Fee & Payment Methods**

- **calculateAdminFee(paymentMethod: string, amount: number)**
  Computes the administrative fee for a given payment method and amount (supports both percentage and fixed).

- **calculateTotalAmount(amount: number, paymentMethod: string)**
  Returns the sum of transaction amount and corresponding admin fee.

- **getAvailablePaymentMethods(amount: number)**
  Returns a list of payment methods enabled and valid for a specific transaction amount based on configured limits.

#### 4. **Validation & Utilities**

- **validateTransactionRequest(request: CreateTransactionRequest)**
  Runs extensive checks on order, amount limits, item, customer data, and required formats (including regex validation for email and Indonesian phone numbers).

- **generateOrderId(prefix: string = "TPQ")**
  Generates a unique order ID using a prefix, timestamp, and random string.

- **formatCurrency(amount: number)**
  Formats an amount as a human-readable Indonesian Rupiah (IDR) currency string.

---

## Error Handling

All asynchronous API operations (`createTransaction`, `getTransactionStatus`, etc.) are wrapped in try-catch blocks. Standardized error messages and logging are used for robustness.

---

## Summary

This code provides an extensible and resilient wrapper service for handling every aspect of payment integration with the Midtrans API, including:

- Creating and managing transactions
- Calculating fees and validating payment info
- Validating notifications & mapping statuses
- Utility methods for order and currency formatting
- Singleton access and robust error handling

It is intended for use in projects where payment processing flows must be abstracted and made consistent, secure, and maintainable.
