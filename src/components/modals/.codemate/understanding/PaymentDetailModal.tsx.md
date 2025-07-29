# PaymentDetailModal Component - High Level Documentation

## Overview

**PaymentDetailModal** is a React functional component that presents a detailed modal dialog for viewing and interacting with payment (transaction) data in a user interface. It is intended for use in client-side Next.js applications (as indicated by `"use client"`).

---

## Main Features

- **Modal Display:**
  Renders a detailed modal dialog overlay with payment information when `isOpen` is `true` and a `payment` object is supplied.

- **View Payment Details:**
  - Shows critical payment attributes (amount, status, date, user, payment type, IDs, and timestamps).
  - Highlights payment status with colored badges and appropriate icons.
  - Localizes currency (Indonesian Rupiah) and dates for Indonesian users.

- **Actions:**
  - Edit: Calls `onEdit` handler when edit is requested.
  - Delete: Calls `onDelete` handler when user wants to delete the payment.
  - Export: Placeholder button for export functionality (does not currently perform an action).
  - Close: Calls `onClose` handler to close the modal, available both in the header and footer.

- **Information Structure:**
  - Header: Payment summary (amount, status, key attributes).
  - Sections:
    - **Informasi Pembayaran:** Details such as student (santri) name, type, amount, date, and status.
    - **Detail Transaksi:** Transaction metadata, including payment ID, creation, and last update timestamps.
    - **Ringkasan Pembayaran:** Payment summary, including total bill, payment status (PAID/UNPAID), and payment type.
  - Footer: Action buttons (delete, close, edit).

- **Visuals:**
  - Utilizes icons (from lucide-react), badges, and cards for structured and visually appealing display.
  - Responsive layout: adapts details section into grid for larger screens.
  - Color-coded statuses (PAID: green, PENDING: yellow, OVERDUE: red).

---

## Props

| Prop Name | Type         | Description                             |
| --------- | ------------ | --------------------------------------- |
| isOpen    | `boolean`    | Controls modal visibility.              |
| onClose   | `() => void` | Triggered to close the modal.           |
| onEdit    | `() => void` | Triggered to start editing the payment. |
| onDelete  | `() => void` | Triggered to delete the payment.        |
| payment   | `any`        | The payment object to show details for. |

---

## Helper Functions

- **getStatusColor(status):** Returns Tailwind CSS classes for the status badge based on payment status.
- **getStatusText(status):** Returns the Indonesian-language, human-readable status string.
- **getStatusIcon(status):** Returns the relevant status icon for the payment status.
- **getPaymentTypeText(type):** Maps type codes to descriptive Indonesian text.

---

## Usage Notes

- Relies on custom UI components: `Card`, `CardHeader`, `CardContent`, `CardTitle`, and `Button`.
- Only renders content if modal should be shown (`isOpen` is `true` and `payment` is supplied).
- Designed for extensibility: e.g., the export button can be connected to file-generation functionality.
- All data and labels are tailored for an Indonesian context.
- `payment` object structure must match expected property names (`amount`, `status`, `santriName`, `paymentType`, `paymentDate`, `id`, `createdAt`, `updatedAt`).

---

## Integration Example

```jsx
<PaymentDetailModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onEdit={handleEdit}
  onDelete={handleDelete}
  payment={selectedPayment}
/>
```

---

## Summary

This component provides a complete, user-friendly, and visually organized modal view for inspecting and managing payment record details, suitable for use in web-based payment management/admin systems.
