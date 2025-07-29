# High-Level Documentation for `RegisterPage` Component

## Overview

The `RegisterPage` is a multi-step registration form for new "santri" (students), likely within an educational or religious institution, e.g., a Rumah Tahfidz. It collects detailed information about the student, their guardian, and program preferences. It provides validation, visual progress steps, and submission handling.

---

## Key Features

### 1. Multi-Step Form

- **Three Steps**:
  1. **Data Santri**: Student’s name, gender, birthdate/place, address, phone, email
  2. **Data Wali**: Guardian’s name, relationship, contact/email/address
  3. **Program & Confirmation**: Program selection and agreement checkbox
- **Dynamic Render**: Each step displays relevant form fields.

### 2. Visual Progress Steps

- Visual progress bar showing current step and completed steps using icons and color cues.
- Easy user navigation between steps.

### 3. Inline Validation

- Step-specific validation before allowing next step or submission.
- Errors are displayed under relevant fields for better user experience.

### 4. State Management

- **Form Data State**: All fields are managed in one centralized state object.
- **Error State**: Step-specific errors shown inline.
- **Loading State**: Shows feedback (e.g., on submission).

### 5. Program Selection

- Presents a choice of programs, each with a name, price, duration, and description.
- Program selection is required to proceed.

### 6. Agreement Checkbox

- User must accept terms & privacy policy to submit.
- Links to terms and privacy pages.

### 7. Submission and Feedback

- On successful validation, simulates a registration request ("API call").
- Shows loading and success/alert messages.

### 8. Navigation Buttons

- Allows moving back to previous step or canceling the process.
- "Register Now" (`Daftar Sekarang`) is enabled only after all info is valid.

### 9. Styling & Icons

- Designed with a modern, responsive layout using custom UI components and Lucide React Icons.

### 10. Accessibility and User Experience

- Required fields are visually indicated.
- Form fields are labeled and error messages are descriptive.
- Navigation and call-to-actions are consistently styled and positioned.

---

## Major Components and Utilities Used

- **React State & Events**
- **Custom UI Components**: `Card`, `Button`, `Input`
- **Lucide Icons**: Visual cues for steps and fields
- **Next.js Link**: Internal navigation
- **CSS Utility Classes**: Responsive, modern design (Tailwindstyle)

---

## Summary of Flow

1. **User sees a registration intro** with branding.
2. **Step 1**: Inputs student data.
   - Validates required fields before proceeding.
3. **Step 2**: Inputs guardian's data.
   - Validates required fields before proceeding.
4. **Step 3**: Selects a program and accepts policies.
   - All required before the "Register Now" button is active.
5. **On Submit**: Simulates backend request, shows feedback.
6. **Consistent navigation**: Back, Cancel, and Home links always available.

---

## When to Use

Use this pattern when you have a multi-step process with conditional validation and want to guide users clearly through complex data entry, providing a visual progress indication and field-level feedback.
