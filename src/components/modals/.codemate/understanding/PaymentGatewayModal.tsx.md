# High-Level Documentation: PaymentGatewayModal Component

## Overview

The `PaymentGatewayModal` is a React component designed to handle online payment workflows in a web application. It presents a modal dialog that allows users to select a payment method, process a payment, and view payment instructions, offering a seamless and interactive payment experience.

---

## Core Features & Flow

1. **Modal Display**
   - The modal appears when triggered (by `isOpen` prop). It overlays the current page and is dismissible.

2. **Payment Method Selection**
   - On opening, users see a list of available payment methods, each with an icon, description, estimated processing time, and total payable amount (including admin fees if any).
   - Payment methods and related fees/details are fetched dynamically from an API endpoint using the transaction amount.

3. **Payment Processing**
   - Once a payment method is selected and the user proceeds:
     - Details about the order, customer, and selection are sent via a POST API request to initiate a payment session.
     - On a successful response, a payment gateway (e.g., Midtrans Snap) is launched using a dynamically loaded script.
     - Callback handlers for success, pending, error, and popup closure manage the UI state and behavior.

4. **Payment Instructions & Status**
   - If the payment is “pending” or requires follow-up, the modal shows instructions and transaction details to guide the user.

5. **User Feedback**
   - Throughout, the user is given immediate feedback for loading states, errors, and successful actions using toasts and animated elements.
   - Options to retry, cancel, or finish are always available.

6. **Security**
   - The component communicates that transactions are secure (e.g., SSL notice).

---

## State Management

- **step**: Controls which stage to show (method selection, processing, or instructions).
- **selectedMethod**: Tracks the currently chosen payment method.
- **paymentMethods**: Fetched list of supported methods including admin details and UI elements.
- **loading**: Indicates if an API call or processing is occurring.
- **paymentToken**: Stores token for payment session if needed externally.
- **paymentInstructions**: Guides the user after a non-instant payment step.

---

## Customization & Extensibility

- Payment methods are displayed flexibly, with icons, descriptive text, and time estimates abstracted into helper functions for easy editing.
- Callback props (`onSuccess`, `onClose`) allow the parent to react to payment outcomes.
- Payment details, including itemized data and customer info, are passed as structured props.

---

## Third-party Integration

- Integrates with external payment services (such as Midtrans Snap) by injecting a script and handling callbacks for all payment statuses.
- Uses `react-hot-toast` for user notifications.
- Leverages UI kit components (Card, Button, icons) for a consistent look.

---

## Accessibility & Usability

- Mouse interactions for selection and navigation.
- Visual feedback for loading or disabled states.
- Breakdown of payment details for transparency.

---

## Typical Usage

```jsx
<PaymentGatewayModal
  isOpen={isModalOpen}
  onClose={handleModalClose}
  onSuccess={handlePaymentSuccess}
  paymentData={{
    orderId: "123",
    amount: 50000,
    description: "Order for services",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "081234567890",
    items: [{ id: "item1", name: "Product", price: 50000, quantity: 1 }],
  }}
/>
```

---

## Conclusion

The `PaymentGatewayModal` provides a user-friendly, robust interface for handling digital payments, abstracting away the complexity of integrating various payment methods and managing the payment flow from selection to completion. Its modular and extensible approach allows easy adaptation for various e-commerce or transactional platforms in the web ecosystem.
