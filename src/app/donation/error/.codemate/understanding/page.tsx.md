# DonationErrorPage Component – High-Level Documentation

## Overview

The `DonationErrorPage` is a React functional component used in a Next.js application to display an error page when a donation attempt fails.

## Features

- **URL Query Retrieval:** Uses Next.js’s `useSearchParams` to get error details and the order ID from the URL query parameters.
- **User Feedback:** Shows a clear, visually distinct error message with an icon, a customizable message, and the failed transaction/order ID (if available).
- **User Options:**
  - **Retry Donation:** A prominent button to try the donation process again, redirecting to the donation page.
  - **Return to Home:** A button for returning to the home page for users not wishing to retry immediately.
- **UI Elements:** Modern, accessible, and responsive design using utility classes (likely Tailwind CSS) and componentized styling.

## Typical Use Case

Displayed when:

- A user’s donation can’t be processed,
- The user is redirected (with query params) to this error page from the donation flow.

## Dependencies

- React
- Next.js navigation hooks (useSearchParams, Link)
- Custom Button UI component
- Third-party Icon (lucide-react)

## Customization

- Error messages can be passed in the URL via a `message` query parameter.
- The transaction/order ID is shown if an `order_id` is present in the URL.

---

**Summary:**  
This component provides users with immediate, actionable information and guidance after a failed donation attempt, improving the overall user experience and helping guide next steps.
