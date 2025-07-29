## High-Level Documentation: DonationSection Component

### Overview

The `DonationSection` React component implements an interactive donation form for a charitable institution's website. It allows users to select a donation category, enter a donation amount, provide donor details, choose a payment method, and submit their donation, which initiates a payment process.

### Major Functional Areas

1. **Fetching & Displaying Donation Categories**
   - The component retrieves available donation categories from different API endpoints (with fallback strategies) and handles various scenarios (network/API errors, seeding data, etc.).
   - Each category includes info like title, description, target amount, collected amount, and an associated icon.
   - The UI displays selectable cards for each category, showing progress toward fundraising goals and "urgent" badges if applicable.

2. **Selecting Donation Amount**
   - Users may choose from quick amount buttons or enter a custom amount.
   - The amount is displayed in a formatted currency style.

3. **Collecting Donor Information**
   - The form collects donor name, email, phone number, and an optional message or prayer.
   - Users can choose to donate anonymously (disabling personal data inputs).

4. **Selecting Payment Method**
   - Several payment options are displayed as selectable cards (Bank transfer, E-Wallet, QRIS), each with an icon and description.
   - The selected payment method is visually highlighted.

5. **Form Submission & Donation Creation**
   - Upon submitting, the form:
     - Validates required fields and donor input.
     - Adds the donation to a "cart" (via API call), using a generated cart ID (stored in localStorage).
     - Initiates the payment process (via another API call), providing donor info.
     - Redirects the user to a payment gateway URL if successful.
     - Displays success or error messages via toast notifications.
   - All API errors and submission problems are handled gracefully with detailed error feedback.

6. **UX/UI Experience**
   - Uses loading indicators, progress bars, and disabled states for components during asynchronous operations.
   - Renders using modular UI components (`Card`, `Button`, `Input`, etc.) and leverages dynamic styles and icons.
   - Provides accessibility features and responsive design for mobile and desktop.

### Technical Highlights

- **Resilient Data Fetching:** Fetches donation categories with retries and multiple fallback strategies, including default in-memory data.
- **Composable & Typed:** Uses TypeScript interfaces (`DonationCategory`, `PaymentMethod`) for strict typing.
- **Reusable Hooks:** Integrates custom hooks for API calls, error handling, and notifications.
- **State Management:** Utilizes React's local state and effects to orchestrate loading, input values, and UI state.
- **Code Modularity:** Segregates responsibilities (logic, fetch, UI, helpers) within a single but organized component.

### Intended Usage

This component is designed for use in websites that support online donations for charitable campaigns. It aims to provide donors with a clear, streamlined experience — from selecting a cause, entering their info, and picking a payment method, to being seamlessly redirected for payment.

---

**Note:** All specific names, labels, currencies, and payment options are in Indonesian, tailored for an Indonesian audience or an Islamic charitable institution. The component is ready for further integration with actual backend APIs and payment gateways.
