# QuickLoginPage: High-Level Documentation

## Overview

**QuickLoginPage** is a React component designed as a developer/testing utility to enable rapid login as different user roles. It presents a simple UI with predefined account options, enabling testers or developers to instantly log in as an Admin, Musyrif, Wali, or Santri. Upon successful login, it redirects the user to the appropriate dashboard based on their role.

---

## Core Features

- **Quick Role-Based Login:**  
  Offers a set of buttons, each associated with a test user (Admin, Musyrif, Wali, Santri). Clicking a button attempts to log in using the test account's credentials.
- **Redirection After Login:**  
  If the user is already authenticated, or login is successful, the component uses each user's role to determine and redirect to the correct dashboard or landing page.

- **Real-Time Login Status:**  
  Displays feedback (e.g., "Logging in...", "Login successful", or error messages) to inform the user of the current login process or errors.

- **Reusable Authentication Integration:**  
  Leverages a provided `useAuth` hook for login mechanism, and a helper `getRoleRedirectPath` function for post-login navigation.

- **Returns to Home:**  
  Includes a "Back to Home" link for convenience.

---

## How It Works

1. **Initialization:**
   - Imports authentication utilities (`useAuth`, `getRoleRedirectPath`).
   - Sets up state for `loginStatus` to report feedback.

2. **Account Selection:**
   - Renders buttons for predefined demo accounts. Each contains a role label and email.

3. **Login & Redirect Logic:**
   - When a button is clicked, triggers `handleLogin` which:
     - Shows login progress/status.
     - Calls authentication function with the selected creds.
     - Updates feedback status accordingly.
   - Uses a React effect hook to watch for authentication changes and redirects logged-in users to the appropriate page.

4. **UI/UX:**
   - Uses Tailwind CSS for styling (clean, simple card interface).
   - Provides clear call-to-action and status display.

---

## Use Cases

- **Development and QA:**  
  Ideal for quickly testing authentication, role-specific features, and redirects without manual credential entry.
- **Demos:**  
  Useful in product demonstrations for switching between user roles effortlessly.
- **End-to-End Testing:**  
  Easily script automatic logins for testing flows.

---

## Extension Points

- The component can be extended with more roles or dynamic account lists.
- The UI can be modified for production use, but it's primarily intended only for development/testing environments due to the hardcoded credentials.

---

## Security Note

**Not for production deployment.** Exposes plain credentials for developer/testing convenience only. Should be disabled or removed in any public or production release to prevent security risks.
