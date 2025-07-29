## High-Level Documentation: TransactionForm Component

### Purpose

**TransactionForm** is a React component that provides a user interface to create or edit financial transactions, such as recording incomes and expenses, for a TPQ (Islamic education center) financial management system.

---

### Features

- **Supports Transaction Types**: Handles both "INCOME" (e.g., donations, event income) and "EXPENSE" (e.g., salary, supplies), letting users toggle between them.
- **Category Selection**: Presents categories relevant to the selected type, with labels for each.
- **Form Fields**: Captures all relevant details: category, amount (with currency formatting), financial account, transaction date, description, reference/invoice number, and optionally, associated student (santri) for certain categories.
- **Validation**: Ensures all required fields are filled and valid before submitting.
- **Fetches Data**: Loads account and student (santri) lists from APIs for selection in dropdowns.
- **Live Preview**: Shows a formatted preview of the transaction as the user enters details.
- **UX Feedback**: Includes loading indicators, error messages, and disables actions while submitting.
- **Supports Edit Mode**: Can prefill fields if passed an existing transaction for editing.
- **Actions**: ‘Cancel’ and ‘Save/Update’ buttons to discard or submit the form.

---

### Props

- **transaction**: (optional) Data for the transaction to edit (if any).
- **onSubmit**: Async function to call with the form data upon submit.
- **onCancel**: Callback to go back/discard the form.
- **isLoading**: Indicates whether save action is in progress.
- **currentUserId**: The user ID to record as the transaction’s creator.

---

### Key Behaviors

- **Form Initialization**: If editing, initializes with the transaction’s existing data.
- **Dynamic Dropdowns**:
  - Loads list of financial accounts and active students; shows/hides the student field conditionally if the category is SPP.
- **Live Validation**:
  - Required fields: transaction type, category, amount (>0), description (>4 chars), account, date.
  - Errors shown beneath fields and block submission until resolved.
- **Dynamic Category Options**: Changes the category list based on whether "INCOME" or "EXPENSE" is selected.
- **Preview Section**: Real-time update of a transaction preview reflecting current input.
- **Submission**:
  - Upon valid input, calls `onSubmit` with form data (plus `createdBy` set to current user).
  - On failure, catches API errors and notifies the user.

---

### Visual Structure

- **Card Layout**: Contained within a styled card with a header and content.
- **Sectioned Form**:
  - Transaction type selection (with icons, explanations).
  - Main transaction details (category, amount, account, date, santri if SPP, description, reference).
  - Preview area (highlighted, formatted summary).
  - Action bar (Save/Update and Cancel).

---

### Extensibility

- **Attachment and Tag Features**: Placeholders exist in form data for attachments/tags, but UI for these is not implemented.
- **API Endpoints**: Designed to interface with RESTful endpoints `/api/financial/accounts` and `/api/santri`.

---

### Technologies Used

- React + Hooks
- Custom UI Components (Button, Input, Card, Badge)
- Third-party Icons (`lucide-react`)
- Toast for error notifications (`react-hot-toast`)

---

### Remarks

This component abstracts all UI/logic for financial transaction entry in a single, maintainable place, enforcing both UX consistency and business rules (categories, validation) appropriate to the TPQ’s financial flows. It is ready for integration into a larger financial management dashboard/application.
