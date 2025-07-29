# Wali Dashboard (Guardian Dashboard) - High-Level Documentation

## Overview

This component is a React page for displaying a feature-rich dashboard for _Wali Santri_ (parents/guardians of students) in a TPQ (Islamic educational institution) context. It is structured for modern web applications using Next.js and employs TypeScript and UI components for a polished experience.

### Main Features

- **Authentication & Authorization**: Ensures only authenticated users with the WALI (guardian) role can access.
- **Child Profile Overview**: Displays a summary card with key student data: name, NIS, halaqah, musyrif, memorization progress, attendance, and performance.
- **Recent Hafalan (Quran Memorization)**
  - Shows recent memorization submissions, their verification status, and grades.
- **Attendance**
  - Displays the latest attendance records with status.
- **Payments**
  - Shows recent payment obligations and statuses, with options to pay pending items.
- **Tabbed Interface for In-depth Data:**
  - **Overview**: Aggregates behavior summary, strengths, and areas needing improvement, as well as active character goals with progress tracking.
  - **Perilaku (Behavior)**: Not visible directly in the code, but reserved as a tab for expanded behavior tracking.
  - **Goal Karakter (Character Goals)**: Details student's ongoing character development goals and progress.
  - **Aktivitas (Activities)**: Shows a feed of recent notable events: positive behaviors, achievements, or goal progress.
  - **Pesan (Messages)**: Secure communication channel for messages from TPQ staff or teachers to guardians, with unread message indicators and actions (reply, mark as read).

### Design Patterns and Implementation Notes

- **UI/UX**: Uses cards, icons, and color-coded status indicators for intuitive comprehension.
- **Status Indicators**: Uniform status icons and color themes for status (e.g., APPROVED, PENDING, PRESENT, etc.).
- **State Management**: Uses React `useState` for tab navigation and child selection (supports future extension for multiple children).
- **Session & Routing**: Uses NextAuth for session handling and Next.js router for secure redirection.
- **Mock Data**: The current implementation uses static (mock) data for demonstration but can be connected with backend APIs.

### Modular Structure

- **Re-usable Components**: Relies on shared components (Card, Button, DashboardLayout) for consistency.
- **Helper Methods**: Includes utility functions for formatting (e.g., `formatCurrency`) and fetching icons/colors based on statuses.

### Extensibility

The architecture is designed for easy extension, e.g.:

- Add support for multiple children.
- Expand tabs with more analytics/statistics.
- Connect to real APIs/databases for dynamic data.
- Enhance real-time features, e.g., with websockets for live notifications.

### User Experience

- **Immediate Feedback**: Spinner/loading state while authenticating.
- **Notifications**: Badge for unread messages/notifications.
- **Actions**: Buttons to pay, view all, reply, or mark messages as read.

---

**Summary**:  
This code is a modern, interactive dashboard for guardians, presenting comprehensive overviews of a student's Quranic memorization progress, attendance, payments, behavior, goals, activities, and communication in an engaging, secure, and extensible format.
