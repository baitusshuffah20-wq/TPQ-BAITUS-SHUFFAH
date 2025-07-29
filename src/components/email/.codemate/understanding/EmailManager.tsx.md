# EmailManager Component - High-Level Documentation

## Overview

The `EmailManager` component is a comprehensive frontend UI for managing email operations in an application, intended for admin or operational staff. It provides functionality to send emails (bulk and test), view email logs/history, inspect available templates, and view/verify email (SMTP) settings and statistics.

---

## Key Features

### 1. Dashboard & Statistics

- **Display of Email Statistics:** Shows total emails sent, successful deliveries, failures, and success rate using summary cards.
- **Uses fetched data** from `/api/email/stats`.

### 2. Multi-Tab UI

- **Tabs Structure:**
  - **Kirim Email (Send Email):** Form to compose and send emails to selected recipients. Includes fields for type, subject, content, and recipient selection. Allows bulk sending and sending a test email.
  - **Riwayat Email (Email Logs):** Lists the history of sent emails, including status (success, failure, pending), recipient, subject, template type, sent timestamp, and error messages if any. Retrieves data from `/api/email/logs`.
  - **Template Email:** Shows a catalog of available email templates with name, icon, and description.
  - **Pengaturan Email (Settings):** Displays read-only SMTP configuration pulled from environment variables and tips on proper setup, compatibility, and best practices.

### 3. Email Sending

- **Bulk Email Sending:** Sends a custom or template-based message to multiple recipients concurrently.
- **Test Email Sending:** Allows sending a test email to verify SMTP configuration.
- **Error Handling and Feedback:** Uses toast notifications for success/failure feedback and error reporting.

### 4. Email Logs and Status

- **Status Visualization:** Displays email status using icons (success, failed, pending) and badges for quick recognition.
- **Error Display:** Shows error messages inline in the log if sending failed.

### 5. UI Controls

- **Reusable UI Components:** Such as Card, Button, Input, Textarea, Badge, Tabs.
- **Visual status indicators:** Using Lucide icons for clarity and enhanced user experience.

### 6. Data Handling

- **Remote Data Fetching:** Loads logs and statistics from API endpoints.
- **Loading State Management:** Shows proper loading states to prevent concurrent actions.

---

## Component Structure

1. **State Management:**
   - Holds email logs, statistics, sending state, recipient selection, form data, and loading status.

2. **Side-Effects:**
   - On mount, loads logs and statistics.

3. **Handlers:**
   - `sendBulkEmail`: Validates form, sends emails, handles success/failure, and updates history.
   - `sendTestEmail`: Sends and tests connection to email server.
   - `loadEmailData`: Fetches logs and stats from the backend.
   - Visual helpers for generating status badges/icons and identifying template icons.

4. **UI Composition:**
   - Responsive design, utilizes cards for statistics and templates.
   - Maintains a clean, modern workspace with separated concerns for sending, monitoring, templating, and configuring emails.

---

## Extensibility & Adaptability

- **Recipient selection UI** is assumed but not implemented (placeholder present).
- Easily adaptable for different organizations by adjusting templates and endpoints.
- Additional features like template editing, recipient search, or log filtering can be integrated.

---

## Technology Stack

- **React (Functional Component, Hooks)**
- **UI kit components** (assumed custom: Card, Button, etc.)
- **Lucide-react icons**
- **react-hot-toast** for user notifications

---

## Intended Audience

- Internal app admins managing user communications.
- Staff responsible for sending transactional, notification, and bulk emails.
- Devs/maintainers needing a starter UI for email operations.

---

## API Endpoints Used

- `/api/email/logs` : Fetches email history.
- `/api/email/stats` : Fetches summary/statistics.
- `/api/email/send` : Sends email to individual recipient (looped for bulk).
- `/api/email/test` : Sends a test email.

---

## Important Notes

- UI for choosing recipients is a placeholder and needs to be implemented.
- SMTP configuration is read-only and must be set in environment variables.
- Toast notifications display all error and success messages to users.
- Translations and labels are in Indonesian.

---

## Summary

The `EmailManager` component enables efficient, centralized management of all email-related tasks for administrative use, with UX considerations for feedback and oversight on each operation. It provides modularity, easy navigation, status monitoring, and direct controls for sending and configuring email communication channels within the application.
