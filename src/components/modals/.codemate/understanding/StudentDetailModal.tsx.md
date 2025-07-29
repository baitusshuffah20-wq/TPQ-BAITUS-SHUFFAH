# StudentDetailModal Component Documentation

## Overview

`StudentDetailModal` is a React modal dialog component designed for displaying comprehensive details of a student record (Santri). This includes personal, parental, academic, and progress-related information. The modal provides robust summary and actionable options such as editing, exporting, and deleting student data.

## Props

- **isOpen**: `boolean`
  - Determines if the modal is visible or not.
- **onClose**: `() => void`
  - Callback for closing the modal.
- **onEdit**: `() => void`
  - Callback for editing the student information.
- **onDelete**: `() => void`
  - Callback for deleting the student record.
- **student**: `any`
  - The student data object containing all details to display.

## Key Features

- **Visibility & Conditional Rendering**
  - The modal appears centered on the screen when `isOpen` is true and a valid `student` object is provided.

- **User Interface**
  - Structured with a header (title and action buttons), followed by well-organized sections:
    - Avatar and basic info (name, status, identity numbers, Halaqah, Musyrif)
    - Personal information (name, NIS, birth, contact details, address)
    - Parent/guardian information
    - Academic information (class, supervisor, status, graduation)
    - Progress summaries for memorization (hafalan), attendance, payment
    - Latest memorization entries in a data table
- **Action Buttons**
  - **Edit:** Triggers the edit callback.
  - **Export:** (dummy button/UI present; not implemented here).
  - **Close:** Closes the modal.
  - **Delete:** Triggers deletion callback (with a red accent).
  - **Close (Footer):** Another option to close.
  - **Edit (Footer):** Another option to edit.

- **Status Tagging**
  - Student status (Active, Graduated, etc.) is displayed with dynamic color-coding and translated labels.

- **Dynamic Data Formatting**
  - Computes age from birthdate.
  - Formats all date fields using Indonesian locale.
  - Summarizes totals for memorization, attendance (present only), and paid payments.
  - Renders tables for hafalan/memorization records with status.

- **Responsiveness and Aesthetics**
  - Uses TailwindCSS for styling.
  - Responsive grid layouts for readability.

## Utility Functions

- **getStatusColor(status):** Returns appropriate styles for the student's status.
- **getStatusText(status):** Maps back-end status identifiers to user-friendly, localized text.
- **calculateAge(birthDate):** Computes student's age from the DOB string.

## Dependencies

- **UI Components**: Card, Button (local)
- **Icons**: Imported from `lucide-react`
- **Tailwind CSS** classes throughout

## Usage Example

```jsx
<StudentDetailModal
  isOpen={isModalOpen}
  student={currentStudent}
  onClose={() => setModalOpen(false)}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## When to Use

- To provide a detailed, easy-to-read, and actionable overview of a single student’s information in a modal dialog.
- Offers quick access for admin actions like edit or delete within the modal view.

## Notes and Limitations

- `student` is untyped (`any`), so for robust TypeScript usage, define a proper Student interface.
- Export functionality is only visually present, actual logic must be implemented.
- The modal assumes data structure (e.g., `halaqah`, `wali`, `hafalan`, etc.) – it may need adaptation for other data schemas.
- All text labels are in Indonesian language.

---

**Summary:**  
StudentDetailModal is a comprehensive, responsive modal for viewing, editing, exporting, and deleting detailed student information in an academic/admin interface, with advanced status labeling, progress summaries, and formatted data presentation.
