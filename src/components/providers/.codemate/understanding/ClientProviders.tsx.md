# High-Level Documentation for `ClientProviders` Component

## Overview

The `ClientProviders` component is a wrapper that supplies several essential providers to the React context tree of a Next.js client-side application. It is intended to be used at a high level (such as at the root of a layout or page) to ensure that all its child components have access to session, authentication, and toast notification contexts.

---

## Key Providers Used

1. **SessionProvider (from next-auth)**
   - Supplies authentication session context, allowing child components to access user session data and status throughout the app.

2. **AuthProvider (custom)**
   - Further encapsulates application-specific authentication logic beyond what next-auth provides (e.g., roles, permissions, etc).

3. **ToastProvider (custom)**
   - Provides toast notification functionality to child components, likely wrapping a global toast context for easy messaging.

4. **ClientOnly (custom)**
   - Ensures that its children render only on the client side, preventing mismatches during server rendering and hydration.

5. **Toaster (from react-hot-toast)**
   - Renders the notification container at the bottom-right of the screen, displaying toast messages for end-users.

---

## Usage

Wrap this component around your application's main content to enable:

- Centralized session and authentication state management.
- Global toast message notifications, with UI rendering only on the client side.
- Safe, client-only rendering of UI that depends on browser APIs or dynamic client data.

_Example:_

```tsx
<ClientProviders>
  <AppContent />
</ClientProviders>
```

---

## Children Prop

- `children`: Any React nodes representing your application's content, which will gain access to the provided contexts.

---

## High-Level Flow

1. User/session data flows from `SessionProvider` and `AuthProvider` to all children.
2. `ToastProvider` enables any nested component to trigger toast notifications.
3. The `Toaster` component, wrapped inside `ClientOnly`, ensures toast notifications render only on the client.
4. All provided contexts are available to any descendant component in the tree.

---

## Summary

**`ClientProviders`** is a composite provider component that standardizes and centralizes the setup for user session management, authentication, and notification messaging across the client portions of a Next.js app. Use it as a root-level wrapper to enable these core features application-wide.
