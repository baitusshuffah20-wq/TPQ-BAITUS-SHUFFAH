# FinancialAccountForm Component – High-Level Documentation

## Purpose

The `FinancialAccountForm` is a React component designed for adding or editing financial account records within a user interface. It supports different types of accounts (Cash, Bank, Digital Wallet), provides form validation, previews entered data, and manages form submission and cancellation with customizable behavior.

## Key Features

- **Form Input**: Gathers details for a financial account, including name, type, account number (if bank), initial balance, active status, and description.
- **Validation**: Built-in client-side validation for required fields, minimum lengths, and valid balances. Shows error messages inline.
- **Account Types**: Supports three types—Cash, Bank, and Digital Wallet—with clear UI indicators (icons and labels).
- **Preview Section**: Dynamically shows a live preview of the account as the user fills in the form.
- **Status Indicator**: Allows toggling the 'active' status and shows a status badge.
- **Submission Handling**: Handles form submission via a provided `onSubmit` callback, and disables UI while submitting.
- **Cancellation Support**: Provides a cancel button wired to an `onCancel` callback.
- **User Feedback**: Shows toast notifications for validation errors and form submission feedback.
- **Loading States**: Disables inputs and shows a spinner on the submit button when loading.

## API

### Props

- `account?: FinancialAccountFormData`  
  (Optional) An existing account object. If provided, the form is in 'edit' mode and fields are pre-filled.

- `onSubmit: (data: FinancialAccountFormData) => Promise<void>`  
  Callback called with form data on successful submit.

- `onCancel: () => void`  
  Callback invoked when the user cancels the form.

- `isLoading?: boolean`  
  (Optional) If true, disables controls and shows submitting state.

### FinancialAccountFormData Structure

- `id?`: string (for edit mode)
- `name`: string (required)
- `type`: "CASH" | "BANK" | "DIGITAL_WALLET" (required)
- `accountNumber?`: string (required for BANK)
- `balance`: number (default: 0)
- `isActive`: boolean (default: true)
- `description?`: string

## UX Details

- **Inline Validation**: All errors are shown beneath the relevant fields.
- **Submission**: Prevents submission if validation fails; gives a clear error message.
- **Preview**: Visual card that updates with user input, displays name, type, (and account number if relevant), status, and formatted balance.
- **Accessibility**: Uses labels, proper input types, and visible error messaging.
- **Responsive UI**: Input grid adapts for mobile/desktop.

## Usage Scenario

Use this component wherever users need to add or edit financial accounts—such as in bookkeeping, accounting, or personal finance management dashboards.

---

**Note:**  
The component utilizes UI elements (Card, Input, Button, Badge) from a custom or third-party design system and uses `react-hot-toast` for notifications. External icons are provided by the `lucide-react` icon pack.
