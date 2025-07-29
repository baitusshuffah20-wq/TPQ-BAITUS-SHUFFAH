# DashboardLayout Component – High-Level Documentation

## Overview

The `DashboardLayout` is a comprehensive React (Next.js) layout component designed for authenticated dashboard pages. It provides a responsive sidebar navigation, a top navigation bar, user profile handling, and integrates role-based navigation for admins, teachers (musyrif), and guardians (wali).

## Main Features

### 1. **Authentication and Redirection**

- **Authentication Status**: Uses `next-auth` to check session status.
- **Redirection**: If the user is unauthenticated, redirects to the login page.
- **Loading State**: Shows a spinner while session status is loading.

### 2. **Responsive Sidebar Navigation**

- **Desktop Sidebar**: Fixed, with a logo, grouped navigation items (by functional areas), and a profile section at the bottom.
- **Mobile Sidebar**: Hidden by default, slides in/out via a hamburger menu. Same contents as the desktop sidebar.
- **Navigation Filtering**: Navigation groups/items are dynamically filtered based on the user's role. Only links the user has permission to see are rendered.

### 3. **Navigation Groups**

Navigation is organized into high-level groups such as:

- Dashboard
- Akademik (Academic management)
- Keuangan (Financial)
- Laporan & Analisis (Reports & Analysis)
- Sistem & Monitoring (System & Monitoring)
- Komunikasi (Communications)
- Administrasi (Administration)

Each group contains links to specific dashboard sub-pages (e.g., attendance, reports, settings), each with permissions tied to user roles.

### 4. **Active Link Highlighting**

- The active navigation link is visually distinguished to indicate the current page.

### 5. **User Profile Handling**

- **Display**: Shows user avatar, name, and role in sidebar/profile dropdown.
- **Dropdown Menus**: Both in sidebar (desktop) and navbar (desktop & mobile), users can access:
  - Profile editing
  - Settings
  - Sign out button
- **Dropdown Closes**: On outside click.

### 6. **Notification Integration**

- Displays a notification dropdown in the top navbar.

### 7. **UI/UX Design**

- Makes extensive use of Tailwind CSS for utility-driven, responsive, and accessible UI styling.
- Icons from `lucide-react` represent navigation links visually.
- Enhanced styling via transitions, gradients, and visual cues for active states.

### 8. **Other**

- Uses a custom `Logo` component.
- Utility functions such as `cn` for class name concatenation.
- Uses Next.js' `Link` for client-side navigation.

## Key Behaviors

- **Sidebar Responsiveness**: Sidebar is always visible on desktop; togglable on mobile.
- **Navigation Adaptivity**: The menu adapts to the authenticated user’s role.
- **State Management**: Uses component state for mobile sidebar, dropdown menu, and manages closing on outside click.

## Usage

Wrap any authenticated dashboard content with this layout to provide a consistent navigation experience across the app. Child page components will be rendered inside the `<main>` tag.

---

**Summary:**  
`DashboardLayout` provides a secure, role-aware, and responsive navigation scaffold for complex dashboard-style apps, including user profile management and personalized navigation features.
