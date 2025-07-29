# High-Level Documentation: SPPSettingForm

## Overview

`SPPSettingForm` is a React functional component used for creating or editing "SPP Settings" (likely referring to recurring school fee/payment configurations) within an administrative dashboard for an educational application. It is implemented with TypeScript, uses Tailwind CSS for styling, leverages several custom UI components, and provides form validation and instant preview of inputs.

---

## Main Responsibilities

- **Render a Form:** Displays a form allowing users to define or edit an SPP setting, including the name, monthly amount, level, status, and description.
- **Validation:** Validates form fields (specifically name and amount) with instant feedback and error highlighting.
- **Preview:** Live previews the SPP configuration as the user fills out the form.
- **Submission:** Handles submission with async support and loading state, calling a parent-provided `onSubmit` callback.
- **Cancel:** Allows the user to cancel the action and revert changes using an `onCancel` callback.
- **Levels Support:** Allows optional association of the SPP with specific education levels ("Pemula", "Menengah", etc.).
- **Status Support:** Enables toggling the SPP setting as active/inactive.

---

## Props

- **`sppSetting?`**: (optional) The current SPP setting being edited (if any).
- **`onSubmit(data)`**: Function called when the form submits valid data (async, returns a Promise).
- **`onCancel()`**: Function called when the user clicks "cancel".
- **`isLoading?`**: (optional) Boolean indicating if the form is currently submitting/saving.

---

## Main Features/Sections

### 1. Basic Information

- **Name**: Required field. Minimum 3 characters.
- **Monthly Amount**: Required. Must be > 0. Currency formatted using Indonesian "IDR".
- **Level**: Optional. Radio input for predefined levels ("Pemula", "Menengah", etc.) or "All Levels". Custom icons and color tags are used.
- **Description**: Optional text area.

### 2. Status

- Checkbox to toggle whether the SPP setting is active.
- Shows a visual badge ("Aktif"/"Tidak Aktif").
- Inactive settings cannot be used to create new SPPs.

### 3. Preview

- Displays a real-time preview summary of all current form entries, including name, level, amount, description, and status, styled with icons and badges.

### 4. Actions

- **Cancel**: Calls `onCancel()`. Disabled if submitting.
- **Submit (Save/Update)**: Submits the form data via `onSubmit(data)`. Shows a spinner while loading.

---

## Validation

- Name: Required, min 3 characters.
- Amount: Required, must be a positive number.
- Validation messages are localized ("Nama SPP minimal 3 karakter", etc).
- If validation fails, an error toast is shown.
- Errors clear as the user edits affected fields.

---

## Supporting Features

- **Currency Formatting:** Uses `Intl.NumberFormat` for Indonesian Rupiah (IDR).
- **Dynamic Labels/Icons:** Custom icons and color schemes for each SPP level.
- **Accessible Markup:** Uses appropriate `label` and input connections, and visually hidden radio buttons.

---

## Libraries Used

- **React**, **TypeScript**
- **Tailwind CSS** for styling.
- **react-hot-toast** for notifications.
- **lucide-react** for icons.
- Custom UI components: `Card`, `Button`, `Input`, `Badge`.

---

## Typical Usage

- Used in an SPP management admin view for adding or editing payment rules/settings.
- Parent component must handle the submit/cancel logic, likely for integration with backend APIs and navigation.

---

## Example Scenario

> "Create a new SPP plan for the 'Menengah' level with a monthly fee of Rp 150.000,-, provide a relevant description, set it active, and preview exactly what the students/teachers will see before saving or updating it."

---

## Summary

SPPSettingForm is a robust, user-friendly, and visually clear form component for managing periodic fee settings in an educational admin dashboard, supporting validation, instant previews, and flexible configuration.
