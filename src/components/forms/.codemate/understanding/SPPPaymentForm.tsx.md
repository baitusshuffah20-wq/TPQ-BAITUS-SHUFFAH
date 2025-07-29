# SPP Payment Form Component - High-Level Documentation

## Overview

This component renders a form used for processing SPP (school tuition) payments for a student ("santri"). It provides a user interface to display payment information, accept payment details from the user, validate the input, and submit the payment data.

---

## Main Features

### 1. **Student & SPP Information Display**

- Shows key details:
  - Student name and ID
  - Payment period (month/year)
  - SPP setting name
  - SPP amount, amount already paid, and outstanding balance
  - Payment deadline (due date) and late badge if overdue

### 2. **Payment Input & Selection**

- Allows user to input:
  - Amount to pay
  - Method of payment (cash, bank transfer, digital wallet)
  - Financial account for the payment (with live loading from backend/callable API)
  - Receipt number (auto-generated, can be changed)
  - Discount amount
  - Fine (late fee) amount
  - Optional payment notes

### 3. **Validation**

- Provides real-time, form-level validation on key inputs:
  - Required fields: paid amount, method, account
  - Numerical correctness (e.g., amount > 0, discount/fine not negative, discount not exceeding base amount, no overpayment)
- On validation error, shows error message under the relevant input.

### 4. **Interactive Payment Summary**

- Dynamically calculates and displays:
  - Outstanding amount
  - Applied discount and fine
  - Total to be paid
  - Payment status after this transaction (Paid/Partial/Pending, using color coding and icons)

### 5. **Actions & Feedback**

- **Submit ("Proses Pembayaran"):** Validates, disables while loading, shows spinner, and calls `onSubmit` callback with form data.
- **Cancel ("Batal"):** Calls `onCancel` callback.
- Uses toast for user notifications in case of API or validation errors.

### 6. **Other UI/UX Considerations**

- Utilizes icons and badges for clarity.
- Pre-fills certain values, such as the receipt number and sets default account if available.
- Responsive layout for single or double column grids.

---

## Internal Helpers / Logic

- **`loadAccounts`**: Loads available financial accounts from an API and sets default.
- **`generateReceiptNumber`**: Creates a new (suggested) receipt number for each form open.
- **`validateForm`**: Checks inputs, updates error state, and determines if the form can be submitted.
- **Formatting helpers**: For currency and Indonesian month names.
- **Payment status & calculation helpers**: For total calculation and status assignment.

---

## Props

- **`sppRecord`**: The SPP record to be paid (student info, period, amounts, etc)
- **`onSubmit(formData)`**: Callback to execute when the form is valid and submitted.
- **`onCancel()`**: Callback when the cancel button is clicked.
- **`isLoading`**: Boolean to indicate whether the form is in a loading/submitting state.

---

## Technologies Used

- **React** (state management, forms)
- **TypeScript** (type safety)
- **Design:** Uses custom UI components (Button, Card, Input, Badge), icons via Lucide React
- **Notifications:** `react-hot-toast` for feedback
- **Async Data Fetch:** Native fetch API

---

## Use Case

This form is suitable for school management systems where an admin, finance operator, or teacher needs to process a student's SPP payment, apply discounts/fines, and keep accurate, validated financial records.

---

## Not Included

- Does not make the actual payment but passes data to a parent component or backend.
- Assumes external styling and component libraries.
- No persistent storage; uses API only for accounts.
- No advanced logic for multi-payment or payment history (only 1 SPP record per form).
