# High-Level Documentation: DonationForm Component

## Overview

The `DonationForm` component is a React functional component used to collect and process user donations within an application. It provides a guided interface for selecting donation categories, entering donation amounts, submitting donor information, and choosing payment methods. Upon completion, it communicates with backend APIs to create a donation entry and initiates a payment transaction.

---

## Main Features & Flow

### 1. Category Selection

- Displays the currently selected donation category or prompts the user to choose one.
- Shows category title, description, and a category-specific icon.

### 2. Amount Input

- Offers quick-select buttons for common donation amounts.
- Allows users to input a custom donation amount (numeric input).
- Dynamically displays the total donation value as entered by the user.

### 3. Donor Information

- Collects personal information: **Name**, **Email**, **Phone Number**, and an optional **Message**.
- Supports anonymous donations via a checkbox, which disables personal info fields if checked.

### 4. Payment Method

- Lists available payment options (Bank Transfer, E-Wallet, QRIS), each with its icon and description.
- Allows the user to select their preferred payment method visually.

### 5. Summary Section

- Provides a concise summary of the donation category and the entered donation amount.

### 6. Submission & API Workflow

- On form submission, validates amount, category, and donor information.
- Creates a "cart" for the donation by posting to a `/api/cart/donation` endpoint (with local cart ID management via `localStorage`).
- Initiates the payment process by posting to `/api/payment/cart`, passing cart ID and donor information.
- On successful response, notifies the user and redirects to the payment page.
- Error handling via toast notifications and custom error handler hooks.
- Disables the submit button and shows a loading indicator while processing.

### 7. User Feedback

- Provides clear success and error messages at each step as toast notifications.
- Displays loading indicators during API communication.

---

## Tech Stack & Dependencies

- **React hooks**: `useState` for local state, custom hooks for API and error handling, toast notifications.
- **UI Components**: Card layout, Button, and Input components from a shared library.
- **Icons**: Uses Lucide icons for visual cues.
- **Formatting utilities**: Formats currency amounts for display.
- **CSS**: Utility classes for styling and responsive design.

---

## Notable Props & Configuration

- **selectedCategory**: The currently chosen category ID.
- **selectedCategoryData**: Contains details of the selected category.
- **getIconComponent**: Function to resolve an icon name to a React component for dynamic icon rendering.

---

## Error Handling

- Validates donation amount, category selection, and donor info before submission.
- Displays clear, immediate toast notifications for all validation and API errors.

---

## Extensibility Points

- Payment method list and quick-amounts are easily extendable.
- Can be integrated into larger donation or fundraising platforms requiring step-by-step donation flows.
- API endpoints, category and payment method data, and icons are all pluggable.

---

## Security & User Experience

- Prevents donation submission while incomplete or during processing.
- Manages donor anonymity carefully.
- Shows immediate feedback and disables actions appropriately to avoid duplicate submissions.

---

## Conclusion

The `DonationForm` is a comprehensive, user-friendly form component designed to streamline the donation process. It guides users through category selection, amount entry, personal details, and payment, while robustly managing state, providing feedback, and interfacing with backend services to ensure a smooth donation experience.
