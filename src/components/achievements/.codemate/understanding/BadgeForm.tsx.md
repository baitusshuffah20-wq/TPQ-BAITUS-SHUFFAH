# BadgeForm Component - High-Level Documentation

## Overview

The `BadgeForm` component is a React form used for adding and editing "Achievement Badges" within an admin interface (likely in an educational or gamified Islamic app). It utilizes the `react-hook-form` library for form management and validation, and provides a user-friendly interface with several design enhancements (color/icon pickers, grouped fields, and error feedback).

## Key Features

- **Supports Create/Edit Modes:**  
  The form can be used for both creating a new badge or editing an existing one, with initial field values populated when editing.

- **Field Groups:**
  - **Basic Info:** Name (both Latin and Arabic), description, badge icon selection, and color picker.
  - **Properties:** Badge category, rarity, criteria (type, value, and condition), time frame, and points.
  - **Status & Messages:** Activate/deactivate badge, unlock message, and share message.

- **Icon & Color Picker:**  
  Users can choose the badge’s icon (from emoji/options) and color (from a palette or hex value).

- **Validation:**  
  Essential fields are validated with user-friendly required messages, some with additional constraints (e.g., minimum values).

- **UI Components:**  
  Utilizes custom UI components like `Card`, `CardHeader`, `CardTitle`, and `Button` for a consistent look-and-feel.

- **Error Handling:**  
  Displays validation errors for each field inline in the form.

- **Responsive Layout:**  
  The form fields are laid out using responsive grids for improved usability on wider screens.

## Props

- `badge?`: (optional) The badge data for editing (if omitted, the form is in "create new" mode).
- `onSubmit`: Callback for submitting form data.
- `onCancel`: Callback for canceling/closing the form.
- `isSubmitting`: Boolean to indicate if the form is being submitted (e.g., disables buttons).

## State & Lifecycle

- **Form State:**  
  Managed by `react-hook-form` with support for default values, validation, programmatic value changes, and form reset.

- **Effect:**  
  When an existing badge is loaded for editing, the form fields are reset to its values.

## Localization

- **Labels & Messages:**  
  All field labels and messages use Indonesian, making the form locally relevant.

## Usage Context

Intended for platform admins or moderators to create and edit gamified achievement badges that reward user behaviors, learning progress, or special achievements.

---

### Summary Table

| Feature Area  | Description                                  |
| ------------- | -------------------------------------------- |
| Modes         | Add / Edit badge                             |
| Data Handling | react-hook-form for state, validation, reset |
| UI            | Custom card/form/button and input controls   |
| Interactive   | Icon & color pickers, validation errors      |
| Accessibility | Labels, ARIA-appropriate controls            |
| Localization  | Indonesian language labels/descriptions      |
| Extensible    | Easily extended with new fields/options      |

---

**In essence**, `BadgeForm` is a comprehensive, localized, and user-friendly React component for administrating digital achievement badges.
