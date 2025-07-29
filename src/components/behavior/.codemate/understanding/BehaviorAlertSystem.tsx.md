# Behavior Alert System Component - High-Level Documentation

## Purpose

This component implements a **Behavior Alert System** for a client-side web application (likely in an educational context). It displays behavioral alerts related to "santri" (students), supporting review, filtering, searching, resolution, and status-tracking of behavioral issues and improvements.

---

## Main Functionalities

1. **Display Alerts**
   - Shows a list of behavioral alerts, each describing an incident, pattern, or trend in a student's conduct.
   - Each alert contains information such as title, message, severity, type, related student, and actions required.

2. **Filtering & Search**
   - Alerts can be filtered by:
     - **Severity** (Low, Medium, High, Critical, or all)
     - **Type** (Pattern, Frequency, Severity, Goal Risk, Improvement, or all)
     - **Resolved Status** (show unresolved by default; can toggle to display resolved)
     - **Search Term** (matches student name, alert title, or message content)

3. **Actions on Alerts**
   - **Mark as Read**: Mark an alert as viewed.
   - **Resolve**: Mark an alert as resolved, providing a resolution note.
   - **View Details** (button present, actual detailed logic not shown).
   - **Follow Up** (button present, actual action not shown).

4. **State & Data Management**
   - Mock data is used (in production, likely replaced with a real API call).
   - Alerts are loaded and filtered locally; state updated according to user actions.

5. **UI & Feedback**
   - Alerts visually indicate status (unread, read, resolved, critical etc.) with icons and badges.
   - Pop-up toast notifications provide user feedback for actions (marking as read/resolved or on errors).
   - Loading states and empty states are visually handled.
   - Alerts are organized in a modal overlay, with a close button.

6. **Localization & Accessibility**
   - All displayed text is in Indonesian (e.g., "Tandai Dibaca", "Selesaikan", "Santri").
   - Dates and times are formatted for user readability.

---

## High-Level Structure

- **Props**:
  - `isOpen`: Boolean, dictates if the alert system modal is visible.
  - `onClose`: Function, closes the modal.

- **State Variables**:
  - `alerts`: Full list of loaded alerts.
  - `filteredAlerts`: Alerts after application of filters/search.
  - `loading`: Boolean, whether data is being loaded.
  - `selectedSeverity`, `selectedType`, `showResolved`, `searchTerm`: Filter and search state.

- **Core Functions**:
  - `loadAlerts`: Loads (mock) alert data, simulates async API.
  - `filterAlerts`: Applies all current filters and search term to alerts.
  - `markAsRead(alertId)`: Marks an alert as read.
  - `resolveAlert(alertId, resolution)`: Resolves an alert, records a resolution note.

- **UI Elements**:
  - **Header**: Title, critical/unread counter, close button.
  - **Filters**: Selects for severity, type, checkbox for resolved, input for search.
  - **Alerts List**: Card for each alert, showing type, icon, message, student, time, and status badges.
  - **Action Buttons**: Mark as read, resolve, view detail, follow up.
  - **Resolution Section**: Shown if alert is resolved, displaying the resolution information.
  - **Loading/Empty State**: Proper visuals when loading or if no alerts match.

- **Utilities**:
  - Various helper functions from `@/lib/behavior-data` for formatting and color-coding.
  - External icons (lucide-react), UI components.

---

## Key Technical Notes

- **Modal Design**: Renders conditionally based on `isOpen`.
- **Visual/UX Cues**: Unread, critical, and resolved alerts are color-coded and icon-marked for quick user understanding.
- **Extensibility**: Could be extended with real API integration, detail/follow-up modals, and role-based assignment.
- **Separation**: Logic for resolving, marking as read, and filtering is well-modularized.
- **Accessibility**: Buttons and controls are keyboard interactive and visually distinct.

---

## Target Use Case

Designed for educators or administrators to monitor, triage, and act on student behavioral events efficiently in a user-friendly, actionable interface.
