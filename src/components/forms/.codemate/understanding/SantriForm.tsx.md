# SantriForm Component Documentation

## Overview

The `SantriForm` component is a reusable React form for **creating or editing student ("Santri") data** in an educational web application, likely for a pesantren or Islamic boarding school. The form supports comprehensive "Santri" (student) details including basic info, contact, academic information, and associated relations like guardian (Wali) and group (Halaqah).

---

## Features

- **Dynamic Form**: Supports both _add_ and _edit_ modes (automatically determined by whether `santri.id` exists).
- **Validation**: Robust client-side validation with real-time feedback for all required and optional fields.
- **Dropdowns Loaded from API**: "Wali" and "Halaqah" options are fetched from the server when the form loads.
- **Status Management**: Visual badge and label system for active/inactive/graduated/dropped-out states.
- **Responsive/Accessible Design**: Marked-up with clear labels and error highlighting.
- **UX Enhancements**:
  - Shows a loading animation while data is loading.
  - Disables submit/cancel buttons while submitting.
  - Error and success notifications (toast messages).
- **Extensible**: Easy to integrate into larger apps (accepts callbacks for submit and cancel, and exposes loading state).

---

## Props

- **santri** _(optional)_: An object containing existing student data for edit mode.
- **onSubmit** _(required)_: Async callback that receives the validated form data on form submission.
- **onCancel** _(required)_: Callback for when the user cancels the form.
- **isLoading** _(optional)_: Boolean that disables the form during ongoing submissions.

---

## Data Model

### SantriFormData Structure

- `id` (string, optional)
- `nis` (string): Student ID (required)
- `name` (string): Student's full name (required)
- `birthDate` (string): Date of birth (YYYY-MM-DD, required)
- `birthPlace` (string): Place of birth (required)
- `gender` ("MALE" | "FEMALE")
- `address` (string): Full address (required)
- `phone` (string, optional)
- `email` (string, optional)
- `photo` (string, optional)
- `status` ("ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED_OUT")
- `waliId` (string): Guardian's ID (required)
- `halaqahId` (string, optional): ID of study group
- `enrollmentDate` (string): Date of entry (required)
- `graduationDate` (string, optional)

---

## Form Sections

### 1. Basic Information

- NIS (student number, required)
- Name (required)
- Date of Birth (required)
- Place of Birth (required)
- Gender (select, required)
- Status (select with badge, required)
- Full Address (required textarea)

### 2. Contact Information

- Phone number (optional)
- Email (optional)

### 3. Academic Information

- Wali Santri (guardian, select, required — loaded from API)
- Halaqah (study group, select, optional — loaded from API)
- Enrollment Date (required)
- Graduation/Exit Date (if status = GRADUATED or DROPPED_OUT)

### 4. Actions

- Cancel button
- Submit (Save/Update) button, with loading indicator

---

## Validation

The form enforces:

- Required fields must not be empty.
- NIS and Name have minimum length requirements.
- Email and phone formats are validated if present.
- Enrollment date is required.
- Guardian is required.
- Shows errors inline, and also toasts a summary message if validation fails.

---

## User Experience Notes

- While fetching data for dropdowns, a spinner/loading state is shown.
- Field errors are highlighted; error messages shown beneath each field.
- Disables form and buttons during save.
- Status field uses a colored badge for better visual status cues.
- "Graduation Date" shown/hidden depending on status.

---

## Technical Implementation

- The component is a **functional React component** ([React 18+], also marked as `"use client"` for Next.js app directory).
- State management with useState, useEffect for loading related data, and a loading flag for async data fetching.
- Uses custom UI primitives (`Input`, `Button`, `Badge`, `Card` etc) — these are likely design system components.
- Prepares and submits data through controlled inputs and fires the `onSubmit` callback after validation.
- Depends on several icons (from `lucide-react`) and `react-hot-toast` for notifications.

---

## Extending

- To add more fields: extend the `SantriFormData` interface and the JSX form accordingly.
- To change how wali/halaqah are loaded: modify the API URLs or fetching logic in the `loadSelectData` function.
- To add more status types: update the `getStatusBadgeColor` and `getStatusLabel` helper functions.

---

## Example Usage

```jsx
<SantriForm
  santri={santriToEdit} // Pass undefined or empty for 'add' mode
  onSubmit={handleSantriSubmit}
  onCancel={closeFormModal}
  isLoading={isSaving}
/>
```

---

## Summary

This component provides a powerful, interactive, and validated way to add or edit "Santri" entries including relationships to guardians and study groups, ensuring a robust user experience and data integrity in educational management applications.
