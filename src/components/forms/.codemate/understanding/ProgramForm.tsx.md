# ProgramForm Component High-Level Documentation

## Purpose

The `ProgramForm` is a React component used for **creating and editing educational program data** within a UI. It provides a user-friendly interface to input and validate relevant program details, such as title, description, features, schedule, price, order, image, and active status.

---

## Key Features

### 1. **Form Initialization & Pre-filling**

- Can operate in "Create" or "Edit" mode:
  - If a `program` prop is provided, it pre-fills the input fields for editing.
  - Otherwise, fields are initialized as empty for a new entry.
- Maintains local state for all input fields and validation errors.

### 2. **Input Fields**

- **Text Inputs** for: title, description, duration, age group, schedule, price, order, and image URL.
- **Feature List**: Allows dynamic add/remove/edit of multiple feature descriptions per program.
- **Checkbox** for active/inactive status.
- **Order field** for specifying display order.

### 3. **Dynamic Feature Editing**

- Users can add or remove features (program highlights) dynamically.
- At least one feature is required, validated on submission.

### 4. **Validation**

- Client-side validation rules for all required fields, with inline error messages.
- Prevents submission if required fields are incomplete or invalid.

### 5. **Submission and Events**

- Submits form data via async `onSubmit` callback prop.
- Filters empty feature entries before submit.
- Runs validation before calling `onSubmit`.
- "Cancel" button calls the `onCancel` prop function.

### 6. **Loading State**

- Disables fields and buttons when `isLoading` is true.
- Shows spinner and text feedback during loading.

### 7. **Styling & UI**

- Uses Card, Button, Input, and Badge UI components for consistent styling.
- Provides section dividers and titles for clarity.
- Integrates iconography for usability cues.

### 8. **Feedback**

- Uses toast notifications for global error feedback.

---

## Props

| Name      | Type                               | Description                                        |
| --------- | ---------------------------------- | -------------------------------------------------- |
| program   | ProgramFormData (optional)         | Program data to edit, or undefined for new program |
| onSubmit  | (data) => Promise<void>            | Handler to invoke on successful submit             |
| onCancel  | () => void                         | Handler to invoke on cancel                        |
| isLoading | boolean (optional, default: false) | Disables form UI and shows loading states          |

---

## Internal State

- `formData`: Holds values for all form fields.
- `errors`: Holds error messages (keyed by field name).

---

## Usage Example

```jsx
<ProgramForm
  program={programObj} // Optional, for editing
  onSubmit={handleSave} // Promise returning handler
  onCancel={() => setShowForm(false)}
  isLoading={loadingState}
/>
```

---

## Summary

**`ProgramForm`** is a comprehensive and interactive form component for managing educational program entries, offering dynamic field management, robust validation, and user-friendly interaction for both creating and editing scenarios.
