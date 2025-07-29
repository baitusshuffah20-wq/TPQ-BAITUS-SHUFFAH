# High-Level Documentation: Authentication Context and Provider Module

## Overview

This module provides an **authentication context** and related utilities for a React (Next.js) application. Its features offer user authentication management, role-based access control, and helper functions to simplify user information handling.

---

## Main Components and Functions

### 1. **User and Context Types**

- **User**: Shape of an authenticated user, with id, name, email, role (`ADMIN`, `MUSYRIF`, `WALI`, `SANTRI`), and optional fields (avatar, phone, nis, etc).
- **AuthContextType**: Describes the value stored in context, including:
  - `user`: Current user or null
  - `loading`: Whether authentication state is being determined
  - `login(email, password)`: Authenticates, returns boolean success
  - `logout()`: Logs out
  - `updateUser(userData)`: Updates user info in state/storage
  - `isAuthenticated`: Indicates if user is logged in

---

### 2. **AuthProvider Component**

- Supplies authentication state and functions to all descendant components via context.
- Interacts with both:
  - **NextAuth.js session** (real backend)
  - **Mock local users** (for demo or fallback)
- On mount, attempts to restore session from NextAuth or localStorage.
- Persists user information to localStorage.

#### Key Features:

- Provides login, logout, and user update methods to consumers.
- Handles loading state during async checks.
- Automatically logs out and clears data if session is invalid.

---

### 3. **Mock Users**

- Fake user records with emails, passwords, and roles for demo/fallback.
- Used if NextAuth.js is not available.

---

### 4. **Auth Context and Hooks**

- `AuthContext`: The React context instance.
- `useAuth()`: Custom hook – allows access to authentication data and actions.

---

### 5. **withAuth Higher-Order Component (HOC)**

- Wraps other components to enforce authentication and (optionally) authorization.
- **If not authenticated**: Redirects to `/login`.
- **If authenticated but lacks required role**: Displays access denied message.
- **If authenticated and authorized**: Renders wrapped component.

---

### 6. **Helper Functions**

- **getRoleRedirectPath(role)**: Returns default dashboard path per user role.
- **hasPermission(userRole, requiredRoles)**: Checks if user has one of needed roles.
- **getUserDisplayName(user)**: Returns preferred display name.
- **getUserAvatar(user)**: Returns avatar image (URL, fallback to avatar generator).

---

## Usage Patterns

- **Wrap application** with `<AuthProvider>` to enable the context.
- **Use `useAuth()` hook** to access current user, check loading/authenticated state, and trigger login/logout/update actions.
- **Protect pages/components** using `withAuth(Component, [allowedRoles])`.
- **Utilize helper functions** to streamline UI code related to authorization and user info.

---

## Typical Flow

1. Upon app load, `AuthProvider` checks for existing session or local user data.
2. Exposes authentication methods and state to the entire app.
3. Developers enforce protected routes using `withAuth`.
4. UI uses context and helpers for personalized display and security checks.

---

## Intended Usage Context

- For Next.js/React applications that:
  - Use NextAuth.js (plus fallback for local mock users)
  - Require role-based access control and clean, centralized auth logic
  - Should not repeat auth code across components/pages

---

This module helps centralize authentication logic, encourages strong typing, and provides a robust structure for both real and mock authentication flows in modern React/Next.js projects.
