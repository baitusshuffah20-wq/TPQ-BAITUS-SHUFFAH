# High-Level Documentation: WaliProfilePage Component

## Purpose

The `WaliProfilePage` React component provides a user interface for "Wali" (Guardian) users to view, update, and manage their profile information and account security settings. It is designed for integration into a dashboard layout and supports features such as profile editing, avatar upload, and password change.

---

## Key Features

### 1. **Profile Information Display**

- Shows user's name, email, phone number, role, avatar, join date, last login date, address, and bio.
- All information is fetched from the authenticated user context.

### 2. **Profile Editing**

- Users can toggle between view and edit modes.
- When editing, input fields replace text displays, allowing users to modify their profile data (name, email, phone, address, bio).
- Saving triggers a mock update (simulated API) and provides notifications of success/failure.

### 3. **Avatar Management**

- Displays user's avatar or a fallback initial.
- Allows users in edit mode to select a new image for their avatar.
- Shows preview of the new avatar before upload.
- Upload button to "upload" (mock implementation) the new avatar file.

### 4. **Password Change**

- Accessible via a "Quick Action" in the sidebar.
- Modal dialog pops up for changing the current password.
- Includes fields for current password, new password, and confirmation.
- Toggle visibility of password fields.
- Validation applied to password criteria (e.g., minimum length, matching confirmation).
- Mock implementation for password change with notifications.

### 5. **Quick Actions Section**

- Buttons for changing password and accessing account security (UI only, some actions are stubs).

---

## Core Components Used

- **DashboardLayout:** Main layout wrapper for profile page.
- **Card, CardHeader, CardContent, CardTitle:** For structured, styled sections and widgets.
- **Button:** For all interactive actions.
- **Lucide-React Icons:** For user interface aesthetics and visual cues.

---

## State Management

- **isEditing:** Toggles edit mode for profile data.
- **isChangingPassword:** Toggles display of the password change modal.
- **showPassword:** Toggles visibility in password fields.
- **profileData:** Stores current profile form values.
- **passwordData:** Stores current, new, and confirm passwords for the form.
- **avatarFile / avatarPreview:** Handle avatar file selection and preview.

---

## User Interaction Flow

1. **View Profile:** Sees summary and details of own profile.
2. **Edit Profile:** Click "Edit Profile" → fields become editable → make changes → click "Simpan" to save or "Batal" to cancel.
3. **Change Avatar:** In edit mode, select an image file → preview displayed → click "Upload Avatar" to trigger upload.
4. **Change Password:** Click "Ubah Password" → modal opens → fill out form → click "Ubah Password" to submit or "Batal" to cancel.

---

## Validation & Error Handling

- Alerts users if profile or password update fails or if password criteria are not met.
- Ensures new password and confirmation match.

---

## Customization & Extensibility

- API calls are stubbed/mocked; integrate real endpoints as needed.
- Can adjust fields or design as the requirements evolve.

---

## Localization

- All static labels and dialog messages are in Indonesian, indicating the intended audience.

---

## Summary

`WaliProfilePage` is a user-focused dashboard page empowering authenticated users (Wali) to manage their profile details and security settings easily, with a modern, interactive, and visually guided UI structure.
