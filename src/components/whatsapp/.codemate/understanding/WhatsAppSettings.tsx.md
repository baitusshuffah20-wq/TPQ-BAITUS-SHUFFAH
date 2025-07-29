# WhatsApp Notification Automation Settings — High-Level Documentation

## Overview

This React component provides an admin UI to manage WhatsApp notification automations, scheduled notifications, API configurations, and test/debug tools for WhatsApp Business API integration in a web application.

---

## Major Features

### 1. Automation Rules Management

- **View List of Automation Rules:** Lists all defined notification rules (e.g., attendance, payment due) with trigger info and recipient config.
- **Enable/Disable Rules:** Allows toggling rules on/off via switches. Status feedback and toasts are provided on update.
- **Visual Icons:** Each rule is shown with a contextual icon based on its trigger type.

### 2. Scheduled Notification Overview & Manual Execution

- **View Schedules:** Displays next scheduled run time (daily, weekly, monthly, payment reminders) for the notification jobs.
- **Run Manually:** Offers "Run Now" buttons to force immediate execution of any notification type, with visual feedback.

### 3. WhatsApp API Configuration Status

- **Status Overview:** Shows status ("Configured" or "Not configured") for necessary WhatsApp Business API environment variables (API URL, access token, phone ID, webhook token).
- **Environment-Only:** Never exposes actual secret values—only states whether config exists.
- **Info Section:** Provides important notes on setup, including the correct webhook URL and instructions.

### 4. Test & Debug WhatsApp Connection

- **Send Test Messages:** Lets admin enter a test phone number and send a test WhatsApp message to confirm integration works.
- **Error Handling:** Feedback (success/error toasts) is shown according to the API response.
- **Guidelines:** Outlines requirements and tips for proper test messaging.

---

## Data Management

- **Initial Data Loading:** On mount, fetches automation rule status and API config status via `/api/cron/whatsapp-notifications` and `/api/whatsapp/test`.
- **State Management:** Uses React state for live updates/optimistic UI.

---

## UI Structure

- **Tabs-Based Navigation:** Four main tabs: "Automation Rules", "Schedule", "Configuration", and "Test & Debug".
- **Reusable Components:** Leverages reusable UI components for cards, buttons, badges, tabs, switches, etc.
- **Visual Cues:** Badges, icons, color codes, and loading states for strong user feedback.

---

## Error Handling & Messaging

- **Toasts:** All key actions give user feedback via toast messages (success/failure).
- **Graceful Failures:** Convenience messages/instructions for loading and configuration.

---

## Security Considerations

- **No Secret Exposure:** API configuration shows only status, never secret content.
- **Env Usage:** Reads from environment variables, with fallbacks for dev/demo mode.

---

## Extensibility

- **Easy Rule Management:** Designed for more automation rules with dynamic mapping.
- **Support for More Actions:** Manual execution is extensible for more notification types.

---

## Intended Users

- System administrators managing messaging workflows in SaaS / internal tools using WhatsApp Business API.

---

## Summary

This component acts as a centralized dashboard for monitoring, configuring, and testing WhatsApp notification automations and their supporting system integrations. It aims to streamline admin workflows for messaging-based automations and ensure easy debugging and maintenance.
