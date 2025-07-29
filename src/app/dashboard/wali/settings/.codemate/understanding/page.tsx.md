# AdminSettingsPage High-Level Documentation

## Overview

`AdminSettingsPage` is a React functional component that renders a multi-tab, form-driven administrative settings interface for a dashboard-style web application. This page enables administrators to view and adjust a range of system and user settings, including profile information, notifications, system configuration, integrations, and security preferences.

---

## Main Features

### 1. **Tabbed Sidebar Navigation**

- Uses a sidebar with navigation tabs, each represented by an icon and a label:
  - **Profil** — User profile info & password change
  - **Notifikasi** — Notifications preferences
  - **Sistem** — System-global settings
  - **Integrasi** — API & email gateway config
  - **Keamanan** — Security, e.g., sessions, 2FA (as imported component)
- The active tab determines which content/form is displayed in the main area.

### 2. **User Setting Forms per Tab**

- **Profile Tab**  
  View and edit:
  - Name, email, phone, address
  - Password change (current/new/confirm — with show/hide toggle)
- **Notifications Tab**  
  Toggle email, SMS, push, and periodic (weekly/monthly) notification settings.
- **System Tab**  
  Edit system name, description, timezone, and language; enable/disable maintenance mode.
- **Integrations Tab**
  - **WhatsApp**: Set API token
  - **Email**: Configure SMTP host, port, email account info
  - **Payment Gateway**: Select provider
- **Security Tab**
  - (Provided through an imported `SecuritySettings` component, likely for advanced security controls.)

### 3. **Reactive UI**

- All forms are controlled components, driven by React state.
- Inputs update the corresponding section of a central `settings` state object.
- "Save Changes" button triggers (currently) a simple alert; designed to be replaced by an API save call.

### 4. **Responsive Layout**

- Utilizes CSS classes for modern, responsive layouts (single column on mobile, sidebar with content grid on desktop).
- Clean and modern dashboard styling through utility classes (likely TailwindCSS).

### 5. **User Data Integration**

- Initial profile data (name, email) fetched from a user object provided by context (`useAuth` hook).

---

## Code Structure

- **Imports**: Modular component imports for layout, UI, icons, context, and settings.
- **Tabs/Sidebar**: Renders navigation with dynamic highighting of current tab.
- **Tab Panels**: Each setting area is encapsulated in its own form panel.
  - Form elements wired to update local component state.
- **Save Handler**: Centralized function for handling settings submission.
- **Specialized Components**: Security settings are delegated to a separate subcomponent.

---

## Intended Usage

- Used within a protected, authenticated administrative area.
- Allows an administrator to manage both their own settings and global application settings in one place.

---

## Extensibility & Best Practices

- **Separation of Concerns**: Individual settings logic per section; security has its own component.
- **State Management**: Uses local React state suitable for low/medium scale, could be abstracted if extending.
- **Design/UX**: Aims for clarity and quick access to all settings; accessible and well-labeled forms.

---

## Customization

- Replace alert in `handleSave` with actual API integration.
- Expand security and integration options by customizing respective forms/sections.
- Add validations and error handling as needed for production robustness.

---

## Dependencies

- React and React hooks
- Application-specific UI components and layout
- Context providers for auth
- Icon libraries (`lucide-react`)
- CSS utility framework (presumed TailwindCSS)

---

**Summary**:  
`AdminSettingsPage` is a modular, extensible admin settings dashboard page built with modern React and clean UI practices, supporting robust, flexible editing of both user and system-wide config.
