# High-Level Documentation: Admin Settings Page Component

## Overview

This component renders an "Admin Settings" page, intended for a dashboard interface. The page allows an authenticated user to manage different aspects of their account and system settings via a clean, tabbed UI inside a dashboard layout.

---

## Main Features

1. **Tabbed Sidebar Navigation**
   - The left-side panel lists tabs: Profile, Notifications, System, Integrations, and Security.
   - Icons visually represent each tab, and clicking a tab changes the main content panel accordingly.

2. **Dynamic Per-Tab Content**
   - **Profile:** Update personal details (name, email, phone, address) and change password (with show/hide toggle for password fields).
   - **Notifications:** Manage email, SMS, push notifications, and report frequencies via toggles.
   - **System:** Change site settings (site name, description, timezone, and maintenance mode).
   - **Integrations:** Configure WhatsApp, Email (SMTP), and Payment Gateway settings.
   - **Security:** Renders a `SecuritySettings` component for managing security-specific options.

3. **Settings State Management**
   - All settings are held in a single `settings` state object, subdivided by tab/feature area.
   - Inputs update their part of the `settings` state via a generic change handler.

4. **Save Action**
   - A save button at the top triggers a handler (currently just `alert`s), representing where integration with API/backend would occur to persist changes.

5. **Responsive Layout**
   - Uses CSS grid, spacing, and responsive classes for a clean appearance on various screen sizes.

6. **Reusable Custom UI Components**
   - Makes use of shared UI components like `Card`, `Button`, and dashboard layout.
   - Relies on external icons (Lucide), and a separate `SecuritySettings` component.

---

## Technology & Libraries Used

- **React (with hooks)**
- **Next.js (client component)**
- **Context-based Auth (`useAuth`)**
- **Custom UI kit components**
- **Lucide icons**

---

## Extensibility

- Settings and sections can be easily added or removed by adjusting the `tabs` list and the `settings` schema.
- The profile section is prepared to receive initial values from authenticated user info.
- Integrations and security areas are designed for drop-in custom configuration components.

---

## Main Props, State, and Handlers

- **user**: Pulled from auth provider, initializes settings for profile.
- **selectedTab**: State controlling active tab (navigation).
- **showPassword**: Controls visibility of password fields in the profile changer.
- **settings**: The main object holding all modifiable user/system settings.
- **handleInputChange**: Generalized function for updating any setting.
- **handleSave**: Top-level handler for applying changes (to be connected to backend API).

---

## User Experience

- Clean, segmented interface for administration and configuration tasks.
- Immediate visual feedback for setting changes (toggling switches, input changes).
- Preserved state per tab, with a single point of save (user must click save for changes to persist).

---

## Security Considerations

- Passwords are masked by default.
- Security settings are handled in a dedicated place (potentially by a specialized component).

---

## Typical Use Cases

- Admin panel for a SaaS product
- Internal dashboard for managing organization or platform settings
- Modular settings/profile management for authenticated users

---

### Summary

This component is designed for a robust admin/management dashboard, balancing user profile management, system settings, third-party integrations, notification preferences, and security controls—presented in a modular, easy-to-navigate layout.
