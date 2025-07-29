# Documentation: AddMusyrifModal Component

## Overview

`AddMusyrifModal` is a React component designed to display a modal dialog for **adding or editing a Musyrif** (mentor/teacher) within an educational management system. It provides a comprehensive, multi-tabbed form interface allowing users to input and manage various categories of Musyrif data, including their personal details, academic history, work experience, certificates, and user account information.

---

## Features

- **Modal Dialog**: Presents a modal that overlays the current content for focused input.
- **Multi-Step Tabs**: Five main sections/tabs:
  1. **Personal Information** (with avatar upload)
  2. **Education History**
  3. **Work Experience**
  4. **Certificates & Documents**
  5. **Account Information**
- **Add/Edit Mode**: Supports both creation of new Musyrif entries and editing of existing ones.
- **Dynamic Form List Management**: Users can dynamically add, edit, or remove multiple entries for education, experience, and certificates.
- **Live Validation**: Validates required fields and displays error messages inline.
- **Progress Navigation**: Users can navigate between steps, preserving form states across tabs.
- **User Account Creation/Selection**: Option to create a new user account for the Musyrif, or link to an existing one, with live user fetching.
- **File Upload Support**: Supports uploading and previewing:
  - Profile avatar (image)
  - Certificate documents (PDF/JPG/PNG)
- **API Interaction with Fallback**: Fetches user data via an API call, falling back to sample mock data if unavailable.

---

## Props

| Prop Name   | Type     | Description                                                |
| ----------- | -------- | ---------------------------------------------------------- |
| isOpen      | boolean  | Controls modal visibility.                                 |
| onClose     | function | Triggered to close the modal.                              |
| onSave      | function | Callback fired with Musyrif data upon saving.              |
| editData    | any      | (Optional) Form data for editing an existing Musyrif.      |
| halaqahList | array    | List of available halaqah (academic groups) for selection. |

---

## State Structure

- **formData**: Contains all Musyrif personal, academic, and account information.
- **education / experience / certificates**: Arrays representing dynamic lists of these sub-entities.
- **avatarFile / avatarPreview**: States for handling and previewing avatar image files.
- **errors**: Tracks validation errors for all form fields (including dynamic lists).
- **activeTab**: Keeps track of which form section/tab user is currently viewing.
- **loading**: Indicates loading state (e.g., while fetching users).
- **userList**: Caches the fetched list of possible user accounts.

---

## Main Functionalities

1. **Initialization and Resetting**
   - Pre-fills form in edit mode via `editData`.
   - Resets form on close or mode switch.

2. **Field Handlers**
   - Individual field handlers update state and clear relevant errors.

3. **File Handling**
   - Avatar and certificate file uploads with previews.

4. **Dynamic List Management**
   - Add, update, and remove education, experience, and certificates.

5. **Fetching User Accounts**
   - Loads list of users with the MUSYRIF role; uses mock data as fallback.

6. **Validation**
   - Validates required fields before proceeding or saving.
   - Validation covers both base info and dynamic list entries.

7. **Step Navigation**
   - Buttons for "Next" and "Previous" swap between tabs.
   - Only "Save" on the last tab (account).

8. **Submission**
   - On successful validation, collects all data (including files and dynamic arrays) and triggers `onSave`.

---

## User Experience Details

- Each tab/section contains appropriate forms with inline validation and visual cues for required fields.
- If no entry exists in dynamic lists (education/experience/certificates), users are prompted and offered a "Tambah" (add) button for quick entry.
- Default values and placeholders provide context for expected data.
- Users cannot save unless all required information is present and valid.

---

## Extensibility

- Accepts lists for halaqah, and dynamic user data, making it adaptable to changing backend sources.
- Component interfaces (`Education`, `Experience`, `Certificate`) can be extended as needed.
- UI components (like Button, Card) are imported and can be styled or swapped as per project requirements.

---

## Usage Scenario Example

```jsx
<AddMusyrifModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onSave={handleSaveMusyrif}
  editData={selectedMusyrif}
  halaqahList={halaqahOptions}
/>
```

---

## Technology Dependencies

- **React** (hooks & functional components, TypeScript)
- **lucide-react** (for icons)
- Custom UI Components (Button, Card, etc.)

---

## Localization

- All interface text is in Bahasa Indonesia.
- Error and helper messages are provided in clear, instructional language suitable for local users.

---

## Accessibility and Responsiveness

- Modal is centered and responsive, with scrollable overflow for small screens.
- All form fields are labeled and grouped semantically.

---

## Limitations / Considerations

- File uploads for certificates and avatar are handled in the UI; actual upload to the server must be managed elsewhere (not handled in this component).
- The component expects Halaqah and User data lists to be provided in compatible formats.

---

**In summary:**  
`AddMusyrifModal` is a robust, extensible component for managing rich detailed data of Musyrif teachers, supporting multi-step input and complex nested data in a user-friendly modal interface.
