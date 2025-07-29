# ErrorLogsPage High-Level Documentation

## Overview

`ErrorLogsPage` is a React component (using Next.js conventions, `use client`) that provides a management dashboard for error logs within an administrative interface. It enables users to view, search, filter, resolve, and delete system error logs.

---

## Main Features

1. **Display Error Logs**  
   Shows a list of error logs fetched from the server, with most data fields visible per log (message, context, URL, time, severity, etc.).

2. **Search Functionality**  
   Enables text-based searching through error messages, context, or URL.

3. **Filtering**  
   Allows users to filter logs by status: all, resolved, or unresolved.

4. **Log Actions**
   - **Expand/Collapse**: Users can expand logs to view detailed data (stack trace, user agent, metadata, resolution date).
   - **Resolve**: Mark unresolved logs as “resolved”.
   - **Delete**: Remove error logs after confirmation.

5. **Visual Status/Severity**  
   Badge indicators for severity (Error, Warning, Info) and resolved status, with contextual coloring/icons.

6. **Error Handling & Loading**  
   Shows loading spinners during data fetch/update, and error messages when server requests fail.

7. **Refresh Button**  
   To manually reload the log data.

---

## Data Flow

- **Fetch Logs**: On mount, fetches the list of error logs from `/api/admin/error-logs`.
- **Actions (Resolve/Delete)**: Sends update/post requests to API endpoints to modify or remove logs, then refetches data.
- **Filtering/Searching**: React state-driven; works client-side on fetched data.

---

## State Management

- `filter`: The active filter for log status.
- `searchQuery`: The current search input text.
- `expandedLogs`: Map of log IDs to booleans, controlling expand/collapse state.
- Uses custom hooks for data fetching with loading and error states.

---

## UI/UX Structure

- **Header**: Component title, search bar, filter dropdown, and refresh button are presented.
- **Content**:
  - Error state: Presents error and a retry button.
  - No data: Friendly empty states with contextual messages.
  - Data list: Cards for each log, with options and expandable details.
- **Log Card**: Each log displays severity/resolved status, timestamps, action buttons, and detailed info panel when expanded.

---

## Technical Details

- Utilizes custom components (`DashboardLayout`, `Button`, `Card`, etc.) and Lucide React icons.
- Uses a custom `useFetch` hook for data fetching/posting with loading and error tracking.
- Some UI text is in Indonesian.

---

## Key Dependencies

- React + useEffect/useState
- Next.js page conventions (`"use client"`)
- UI/utility components from project (`/components/ui`, `/components/layout`)
- Lucide React for icons

---

## Extensibility/Customization

- The page logic can support additional filters or actions as needed.
- Easy to adapt to new API endpoints or error log data fields.

---

## Security/UX Notes

- Delete action requires user confirmation.
- Error and loading states are handled gracefully with informative feedback.

---

## Summary

This component is a comprehensive, administrator-focused error log dashboard, enabling visibility, manageability, and resolution of system errors in a user-friendly and interactive manner.
