# High-Level Documentation: `midtrans-client` Module

This TypeScript module declaration provides type definitions for the main classes of the `midtrans-client` JavaScript library, which is a payment gateway client for the Midtrans API. It supports both Snap (UI-based payments) and Core API (server-to-server integration).

## Classes

### 1. Snap

- **Purpose:**  
  Handles payments via Midtrans Snap, which is the hosted UI checkout system.

- **Constructor:**
  - `options`: An object with properties:
    - `isProduction` (boolean): Selects between production and sandbox environments.
    - `serverKey` (string): Your Midtrans Server Key.
    - `clientKey` (string): Your Midtrans Client Key.

- **Methods:**
  - `createTransaction(parameter: any): Promise<{ token: string; redirect_url: string; }>`
    - Initiates a transaction and returns a token and redirect URL for the Snap payment page.

---

### 2. CoreApi

- **Purpose:**  
  Provides direct server-to-server API access for deeper control over payments and their life-cycle.

- **Constructor:**
  - `options`: An object with properties:
    - `isProduction` (boolean): Selects between production and sandbox environments.
    - `serverKey` (string): Your Midtrans Server Key.
    - `clientKey` (string): Your Midtrans Client Key.

- **Properties and Methods:**
  - **transaction**: Object containing methods to manage transactions by Order ID:
    - `status(orderId: string)`: Fetches transaction status.
    - `cancel(orderId: string)`: Cancels a transaction.
    - `approve(orderId: string)`: Approves a challenged transaction.
    - `deny(orderId: string)`: Denies a challenged transaction.
    - `expire(orderId: string)`: Expires a pending transaction.
    - `refund(orderId: string, parameter?: any)`: Refunds a transaction.

  - `charge(parameter: any): Promise<any>`
    - Charges a customer's card or account.

  - `capture(parameter: any): Promise<any>`
    - Captures an authorized transaction.

  - `cardToken(parameter: any): Promise<any>`
    - Obtains a card token for card-not-present transactions.

  - `cardPointInquiry(tokenId: string): Promise<any>`
    - Inquires about point balance for cards supporting rewards.

---

## Usage Notes

- All async methods return Promises.
- You must configure the class with the proper credentials and environment using the constructor.
- The methods support a variety of transaction and payment management tasks, both with and without a hosted payment UI.

---

**Summary:**  
This module serves as a typed interface for the main functionalities of the Midtrans client SDK, including payment initiation, transaction management, card tokenization, and reward inquires. It helps ensure proper method usage and option structure when integrating Midtrans payments into a TypeScript project.
