# MusyrifDetailModal Component - High-Level Documentation

## Component Overview

**MusyrifDetailModal** is a **React functional component** that displays a detailed modal dialog for viewing information about a "Musyrif" (mentor/teacher). The modal is rendered as an overlay and is designed to be shown or hidden based on its `isOpen` prop. It features sections for personal, academic, educational, professional, and certificate information, and includes action buttons for editing, exporting, deleting, and closing.

---

## Props

- **isOpen** (`boolean`): Controls the modal’s visibility.
- **onClose** (`function`): Handler invoked when the modal is closed.
- **onEdit** (`function`): Handler invoked when the "Edit" action is triggered.
- **onDelete** (`function`): Handler invoked when the "Delete" action is triggered.
- **musyrif** (`object`): The data object representing a Musyrif to be displayed. Can contain nested fields such as education, experience, certificates, etc.

---

## Structure & Features

### Modal Container

- Appears as a centered overlay with a translucent darkened background.
- The modal is a fixed-positioned box with responsive sizing and scrollable content.

### Header

- Title: _"Detail Musyrif"_.
- Buttons: Edit, Export (placeholder, no handler), and Close (large X icon).
- Handlers: Edit and Close trigger their respective props.

### Main Content Sections

**1. Overview Header**

- Avatar (shows image or name initial).
- Name and status badge (with color coding for status).
- Key info grid with specialization, age, halaqah membership, and join date.

**2. Informasi Pribadi (Personal Information)**

- Name, gender, place/date of birth, phone, email, status, and address.
- Human-readable formatting (e.g., date in Indonesian, gender conversion).

**3. Informasi Akademik (Academic Information)**

- Specialization, halaqah, join date, and linked user account.
- Uses icons for visual distinction.

**4. Riwayat Pendidikan (Education History)**

- Lists each educational record with institution, year, degree, and an optional description.

**5. Pengalaman Kerja (Work Experience)**

- Lists job roles with position, organization, period (formatted), and description.

**6. Sertifikat & Dokumen (Certificates & Documents)**

- Lists each certificate with name, issue date, issuer, description, and a link to the document if available.

### Action Buttons (Footer)

- **Delete**: Calls `onDelete` (styled in red).
- **Tutup (Close)**: Calls `onClose`.
- **Edit Data**: Calls `onEdit`.

---

## Utility Methods

- **getStatusColor**: Returns Tailwind CSS classes based on Musyrif’s status for badges.
- **getStatusText**: Converts status strings into human-friendly (Indonesian) text.
- **calculateAge**: Calculates age (years) based on `birthDate`.
- **formatDate**: Formats dates into long-form Indonesian dates.

---

## Design & Usability

- Responsive design for both mobile and desktop.
- Sections can be conditionally rendered (education, experience, certificates) only if data is available.
- Strong use of semantic HTML, label elements, screen-reader-friendly text, icons for visual cues.
- All user-triggered changes (edit, delete, close) are handled via props (parent-controlled).

---

## Dependencies & UI

- Uses custom UI components (`Card`, `Button`) from local library and icon components from **lucide-react**.
- Tailwind CSS utility classes used throughout.
- Designed to integrate into a modern React app with modal overlay, card styling, and material-inspired action buttons.

---

## Usage Scenario

You would use **MusyrifDetailModal** in a teacher/mentor management system or dashboard, where clicking a Musyrif’s name would open this modal to show detailed data, and provide actions like edit, delete, or export. Visibility is controlled externally via the `isOpen` and appropriate handlers.
