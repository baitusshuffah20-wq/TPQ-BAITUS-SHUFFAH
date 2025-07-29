## AddStudentModal Component Documentation (High-Level)

### Overview

`AddStudentModal` is a React functional component that provides an interactive modal dialog for adding or editing student ("santri") records in a web application. It supports form input for personal details, guardian ("wali") selection, academic data, and photo upload. The modal is styled using custom and utility-class-based design, and includes real-time validation and dynamic loading of dependent data.

---

### Key Features

- **Modal Dialog**: The component displays as a modal overlay, blocking interaction with the underlying UI until closed.
- **Dual Mode**: Handles both "add new" and "edit existing" student scenarios, populating fields when editing.
- **Form Sections**:
  - **Personal Information**: Name, NIS, gender, birthplace/date, phone, address, email, and photo/avatar.
  - **Guardian (Wali) Information**: Selection from dynamically-loaded list, with detail preview.
  - **Academic Information**: Halaqah (class/group), admission and graduation dates, student status.
- **Photo Upload**: Supports image file selection for the student's avatar, with live preview.
- **Data Integration**:
  - Fetches list of guardians (wali) and halaqah options from APIs when the modal opens.
  - Displays fallback static data if API requests fail.
- **Field Validation**: Required fields are marked and validated, with error messages displayed inline.
- **State Management**: Uses local React state to hold form data, loading states, file previews, and errors.
- **Action Buttons**: "Cancel" to close the modal, "Save/Update" to process the form.

---

### Component Props

- **isOpen (boolean)**: Controls modal visibility.
- **onClose (function)**: Callback to close the modal when requested.
- **onSave (function)**: Callback invoked with form data when saving.
- **editData (optional)**: Existing student data to populate the form for editing (otherwise assumes a new student).

---

### Major Internal Behaviors

- **Form Initialization**:
  - On open or when editData changes, initializes the form state either blank (for new) or from the given data (for edit).
- **Dynamic Dropdowns**:
  - Fetches guardian and halaqah data on open; loading states and fallback logic included.
- **Field Change Handlers**:
  - Updates local state for form fields, resets validation errors on input.
- **Validation and Error Handling**:
  - Validates presence of required fields; errors shown near the relevant input.
- **Photo Handling**:
  - Allows avatar file upload with preview; stores image in form state for submission.
- **Submission**:
  - On successful validation, passes complete student data to `onSave` callback for further processing (e.g., API call or local state update in parent).
- **Responsive Layout**:
  - Form groups are arranged to be friendly on both desktop and mobile devices, leveraging CSS grid and utility classes.

---

### Visual Hierarchy

- Card-styled modal with clear header, separated form sections, and a fixed action button row.
- Form fields grouped logically with headings and icons for context.
- Guardian detail box appears when a guardian is selected.
- Loading spinner overlayed when fetching options data.

---

### Intended Usage

This component is built for apps that need to manage student/guardian/academic records, especially in religious or educational institution management systems. It can be directly integrated into dashboards or admin panels, with parent components managing the `isOpen`, `onSave`, and `editData` props.

---

### Dependencies

- **React & Hooks**: useState, useEffect
- **UI Components**: Card, Button, various icon components
- **API endpoints**: `/api/users?role=WALI`, `/api/halaqah` (replaceable per backend)
- **Styling**: Likely using Tailwind CSS utilities

---

**Note:** This documentation describes high-level structure and behavior. For API contract, validations, and extensibility, refer to the detailed comments and code logic.
