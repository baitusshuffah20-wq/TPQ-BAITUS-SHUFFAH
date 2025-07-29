# HalaqahMaterialForm Component - High-Level Documentation

## Overview

`HalaqahMaterialForm` is a React functional component used for creating or editing "Halaqah" learning materials in a web application. It provides a structured form for inputting and validating information about an educational material, such as its title, description, content, file attachment, order of appearance, and related halaqah ID.

---

## Main Features

1. **Create & Edit Modes**
   - Can be used both to add new materials or edit existing ones, indicated by the props and the presence of a material object.

2. **Form Structure**
   - Uses various form fields to collect material details: title, description, content, order, supporting file (URL or future upload), and halaqahId.
   - Validation is provided for required fields (notably title and halaqahId).
   - Displays error messages below relevant inputs when validation fails.

3. **File Support**
   - Has a UI for supporting file attachment — currently text input for URLs, with a placeholder for future direct file uploads (no real upload logic implemented yet).

4. **User Feedback**
   - Utilizes toast notifications for validation errors and placeholder upload feedback.

5. **Interaction and State**
   - Manages form state with React’s `useState` hook.
   - Error states are tracked and displayed inline.
   - Button states reflect loading status and prevent multiple submissions.

6. **Styling and Layout**
   - Uses card UI abstraction for layout.
   - Divides form visually into sections.
   - Responsive layout adapts to different screen sizes.

7. **Actions**
   - Form submit (calls provided `onSubmit` prop).
   - Cancel (calls provided `onCancel` prop).
   - Buttons change appearance based on context (`edit` vs. `create`) and state (`isLoading`).

---

## Props

- **material** (optional): Existing data for pre-filling the form during edit mode.
- **halaqahId** (optional): Contextual ID if creating a new material for a specific halaqah.
- **onSubmit** (required): Function to handle form submission; receives current form data as argument.
- **onCancel** (required): Function invoked when the user cancels the action.
- **isLoading** (optional): Boolean flag to disable form controls and indicate a loading/submitting state.

---

## Data Model

- **HalaqahMaterialFormData** includes:
  - `id?: string`
  - `title: string`
  - `description: string`
  - `content: string`
  - `fileUrl: string`
  - `order: number`
  - `halaqahId: string`

---

## Form Field Validation

- **Title**: Required, minimum 3 characters.
- **halaqahId**: Required.
- **Other fields**: No strict validation, optional.

---

## Advanced UX details

- Input errors are cleared as the user types.
- On file-upload button click, the component triggers the upload file input, but actual file upload is not yet implemented.
- If a `fileUrl` exists, a link is provided for users to view/download the supporting file.

---

## Icons and UI Components

- Uses icons for better user experience (BookOpen, Save, X, Upload, FileText).
- Imports custom/reusable `Input`, `Button`, and `Card` UI components from the application’s UI library.

---

## Usage Context

This component would typically be found in an admin or instructor interface for managing teaching materials in an educational platform that supports "halaqah" learning circles. It is designed for extensibility with file attachment and robust data handling.

---

## Limitations

- File uploading is not yet supported; only URLs can be provided for now.
- Does not manage form submission results (e.g., errors from the backend) except for local validation.

---

**In summary:**  
`HalaqahMaterialForm` is a flexible, user-friendly, and validated material editor UI for an Islamic educational context, ready for both creation and update of halaqah materials, with clear room for future file upload support.
