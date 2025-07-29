# High-Level Documentation: Donation Success Page Component

## Overview

This code implements a **Donation Success Page** for a web application (likely built with Next.js and React) that informs users of the success of their donation, displays relevant donation details, and offers actions like downloading a receipt, sharing on WhatsApp, or making another donation.

## Key Features

### 1. **Dynamic Data Retrieval:**

- **Extracts donation info from URL query parameters** (order ID, donor name, amount, etc.) for display.
- **Supports both development and production modes:**
  - _Development mode_: Uses mocked data from URL parameters for easier testing.
  - _Production mode_: Fetches actual donation data via `/api/donations/[orderId]`. If fetch fails, falls back to mock data.

### 2. **Robust Error Handling:**

- Handles API errors or missing data by falling back to meaningful, safe mock data.

### 3. **Informative Display:**

- **Visual feedback**: Shows a spinner during loading; after success, displays a prominent success icon and message.
- **Donation details card**: Shows:
  - Donation reference/ID, donor name (with anonymity support), category/type, timestamp, donor message, and total amount.
- **Status badge**: Clearly indicates successful donation status.
- **Islamic inspirational quote**: Culturally and thematically relevant motivational text.
- **Thank you and post-donation explanation**: Outlines next steps and how the donation will be managed.

### 4. **User Actions:**

- **Download proof**: Button provided (implementation of download not shown).
- **Share on WhatsApp**: Constructs and opens a pre-filled share message including the donation amount and category.
- **Donate Again**: Link to restart the donation process.
- **Return Home**: Button to go back to the homepage.
- **Contact Information**: Displays ways to contact the organization.

### 5. **Reusable and Maintainable:**

- Makes use of utility functions for:
  - Formatting currency amounts and timestamps for Indonesian locale.
  - Mapping donation type codes to user-friendly labels.
- Uses reusable UI components (Card, Button) and icons for clarity and consistency.
- Wrapped in React’s `<Suspense>` to support Next.js server-side rendering and asynchronous data loading.

### 6. **Accessibility and Responsiveness:**

- Uses clear icons, structured HTML, and responsive CSS classes (Tailwind CSS utility classes) for mobile and desktop devices.

## Usage

- **Entry Point**: The default export is a wrapper component using React's `<Suspense>`, ensuring fallback loading UI is shown during data fetching.
- **Component Structure**: Main logic lives in `DonationSuccessPage`, which handles data retrieval, error fallback, presentation, and user actions.
- **Customization**: Donation categories, wording, and organizational details can be updated as needed.

## Technologies and Packages Involved

- **React hooks** (`useState`, `useEffect`) for state and lifecycle management.
- **Next.js hooks** (`useSearchParams` for routing/query parsing).
- **Custom UI and icon components** for consistent, styled interfaces.
- **Intl API** for currency and date formatting appropriate to Indonesian locale.

---

**In summary:**  
This component gives donors a clear, reassuring, and action-oriented confirmation after a successful donation, handling a variety of data sources gracefully and promoting further engagement with the organization.
