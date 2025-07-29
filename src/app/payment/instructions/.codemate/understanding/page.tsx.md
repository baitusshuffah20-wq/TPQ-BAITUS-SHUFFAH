# Payment Instructions Page — High-Level Documentation

## Overview

This React (Next.js) component renders a detailed payment instructions page. It allows a user to view and interact with the instructions necessary to complete a payment for an order, including time limits, payment details, payment method-specific instructions, and action buttons for copying, printing, sharing, and checking payment status.

---

## Key Features and Workflow

### 1. **Parameter Detection & Data Loading**

- Fetches `orderId` and `paymentId` from URL query parameters.
- If missing, redirects to the main payment page.
- Loads payment instructions asynchronously from `/api/payment/instructions`.
- On load failure, shows error and redirects.

### 2. **Payment Countdown Timer**

- Displays a real-time countdown to the payment expiry time.
- Automatically updates every second; shows "Expired" when time is up.

### 3. **Payment Details & Actions**

- Shows:
  - Order ID (with copy-to-clipboard)
  - Amount (formatted as currency)
  - Virtual Account number or QR code (if applicable, with copy/scan feature)
  - Payment method icon and name
- Instructions for payment, shown as a step-by-step list.

### 4. **Status Checking**

- "Check Status" button verifies payment status via `/api/payment/status`.
- If paid, redirects to a payment success page; otherwise, notifies user.

### 5. **User Guidance**

- An "Important Notes" section highlights critical payment tips and support info.

### 6. **Utility Actions**

- Print the payment instructions.
- Share them via browser share or by copying the link.

---

## Error and Feedback Handling

- Shows spinners during loading and checking.
- Uses toast notifications for operation feedback (success, errors, info).

---

## Code Structure

### Components:

- **PaymentInstructionsPageContent**: Core component handling all UI logic, data loading, and user actions.
- **PaymentInstructionsPage**: Wraps content component; shows spinner fallback while suspended.

### Main UI Elements:

- Header, navigation, and back actions.
- Timer card.
- Detailed payment info card.
- Dynamic instructions card.
- Status check card.
- Important notes card.
- Action buttons (print/share).

---

## Customization

- Payment method display/adaptation based on type (bank, e-wallet, QR).
- Action buttons adapt to device capabilities (i.e., share API presence).

---

## Libraries/Dependencies

- Next.js navigation (router, searchParams)
- Custom UI components (Card, Button, Badge, etc.)
- Lucide Icons
- toast (react-hot-toast) for feedback

---

## Typical User Flow

1. User arrives on page with valid params.
2. Sees instructions, timer, and details.
3. Can copy critical info, print, or share page.
4. Performs payment based on shown instructions.
5. Checks payment status to verify transaction.
6. Receives feedback or success redirect.

---

## Notes

- Instructions and UI are in Indonesian.
- Designed for robust error handling and to guide the user carefully through payment.
- Intended for integration with server-side payment APIs.

---

**In summary**, this component provides a comprehensive, interactive, and user-friendly payment instruction interface that supports manual or QR-code-based payments and ensures clear guidance and feedback throughout the payment process.
