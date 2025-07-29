# High-Level Documentation

## Purpose

This code defines the root layout for a Next.js application ("TPQ Baitus Shuffah") that incorporates global styles, font configurations, multiple providers for state and context, a maintenance mode wrapper, and enhanced browser extension attribute cleanup. It also sets up Toaster for notifications with custom configurations.

---

## Main Responsibilities

### 1. Global Metadata and Viewport

- Declares global metadata (`title`, `description`, `keywords`, SEO settings) for the site.
- Sets the default viewport properties for responsive design.

### 2. Global and Font Styles

- Imports global and theme-specific CSS.
- Uses Google Fonts (Inter and Amiri) with CSS variables and optimization (`display: swap`).

### 3. HTML Scaffold

- Sets up the HTML document structure (`<html>`, `<head>`, `<body>`) with the appropriate language and classes.
- Ensures server-to-client hydration consistency with `suppressHydrationWarning`.

### 4. Security & Hygiene Script

- Injects a script to automatically remove unwanted or injected browser extension attributes from the DOM, and observes for future additions to keep the DOM clean.

### 5. Context Providers

- Wraps children components with several context and state providers:
  - **ClientProviders**: Likely manages client-side-specific context.
  - **Providers**: Handles cross-cutting providers (e.g., theme, i18n).
  - **AuthProvider**: Manages authentication state.
  - **NavigationProvider**: Handles navigation-related state/context.
  - **NotificationProvider**: Handles notifications and toasts.
  - **MaintenanceMode**: Conditionally gates content for maintenance, if enabled.

### 6. Application Layout Structure

- Renders three root-level divs for mounting content, modals, and toasts.
- Places the main application under `<div id="root">`, separate modals in `<div id="modal-root">`, and toast notifications in `<div id="toast-root">`.

### 7. Toast Notifications

- Configures `react-hot-toast`'s `Toaster` component:
  - Positions toasts at the top-right.
  - Customizes styling and behavior for default, success, error, and loading toasts.
  - Tweaks durations, colors, font sizes, and icons per type for a consistent UX.

---

## Key Features Summary

- **Global Theming**: Sets up fonts and theme variables for the whole app.
- **SEO & Metadata**: Provides core SEO and social meta tags for discoverability.
- **Security & UX**: Cleans up browser extension DOM pollution for a safer, cleaner UI.
- **State Management**: Composes multiple providers to deliver modular, scalable state/context handling.
- **Maintenance Mode**: Offers a centralized way to flip the application into maintenance.
- **User Feedback**: Delivers consistent, styled toast notifications.

---

## Usage

All pages and components rendered in the app will automatically inherit these settings, contexts, fonts, and notification facilities. This acts as the foundational entry point for the application UI and client logic.
