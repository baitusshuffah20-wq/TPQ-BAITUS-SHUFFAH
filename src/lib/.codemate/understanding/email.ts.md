# High-Level Documentation: EmailService Class

## Overview

This module provides a comprehensive email service for a web application (specifically branded for "Rumah Tahfidz Baitus Shuffah"). The `EmailService` class handles configuration, sending, templating, and logging of emails, as well as some basic statistics and verification features. It uses the `nodemailer` package for sending emails and Prisma ORM for logging email records to a database.

## Core Functionalities

### Initialization

- **Configurable SMTP**: Email sending is configured via environment variables (SMTP host, port, user, pass, etc.), supporting providers like Gmail or any other SMTP server.
- **Sender Identity**: The sender email and display name are also configurable.

### Email Sending

- **Generic Email Send**: The `sendEmail(options)` method sends an email using either a specified template or custom HTML/Text content, with support for attachments, CC, BCC, etc.
- **Templated Emails**: Multiple helper methods generate and send specific types of emails using pre-built templated designs and dynamic data, including:
  - Welcome emails for new users
  - Hafalan (Quran memorization) progress reports
  - Monthly student reports
  - Payment invoices and payment confirmations
  - Attendance notifications
  - Newsletters (including images/CTA links)

### Email Templates

- Templates are rendered to both HTML and plain text, with responsive layouts and branding.
- Templates are dynamic: content is populated based on user/student names, roles, progress, statistics, invoice/payment details, and more.

### Logging and Statistics

- **Email Logs**: Every sent or failed email is logged in the database with details like recipient, subject, status, template used, and any errors.
- **Statistics**: The service can report on total/sent/failed emails and success rate over a configurable time period.

### Miscellaneous Features

- **SMTP Connection Verification**: `verifyConnection()` checks if the email configuration and SMTP credentials work.
- **Email Service Configuration Check**: `isConfigured()` returns whether required environment variables are present.
- **Extensible and Testable**: The design supports easy addition of new templates and sending methods.

## Integrations

- **Nodemailer** for transport and sending emails.
- **Prisma** for database operations (email logging).

## Usage

- Import and use the singleton: `import { emailService } from '...'`
- Call template-specific methods (`sendWelcomeEmail`, `sendPaymentInvoice`, etc.) or the generic `sendEmail`.
- The system abstracts away email formatting, variable replacement, and logging.

---

**In summary:**  
`EmailService` provides a robust, templated, and fully logged email platform for a web application, making use of best practices for sending, formatting, tracking, and error handling of transactional and notification emails. It is easily configurable for different environments and supports extensibility for new email scenarios.
