## High-Level Documentation: Toast Notification System (React)

### Overview

This code implements a client-side toast notification system in React, using context for global state and TypeScript for type safety. It enables any part of a React application to show temporary notification messages (toasts) with various types (success, error, info, warning), which appear stacked in the bottom-right of the application and automatically disappear after a set duration.

---

### Main Components & Features

#### 1. Context-based State Management

- **ToastContext:**  
  A React context (`ToastContext`) provides access to the current list of toasts and methods to add or remove them (`addToast`, `removeToast`) across any descendant components.

- **useToast Hook:**  
  A custom hook ensures safe and easy access to the Toast context (`useToast`), throws an error if used outside the provider.

#### 2. Provider Component

- **ToastProvider:**  
  Wraps the app and manages the toast state (an array of notifications).
  - Allows components beneath it in the tree to trigger toasts.
  - Renders the `ToastContainer` inside a `ClientOnly` wrapper to ensure proper client-side rendering.
  - The `addToast` method generates a unique id for each toast, appends to the list.
  - The `removeToast` method deletes a toast by id.

#### 3. Rendering Toasts

- **ToastContainer:**  
  Stacks active toasts in a fixed position (bottom-right), ensuring they are always visible above content and do not overlap.

- **Toast Component:**  
  A presentational component displaying a single toast:
  - Shows an icon based on toast type (success/error/info/warning).
  - Supports an optional message.
  - Each toast has a timed auto-close (default: 5000ms), and a manual close (X button).
  - Visually styled (background color, border, icon) corresponding to the notification type.

#### 4. Types and Props

- Multiple TypeScript interfaces/types such as `ToastType` and `ToastProps` define the expected properties for type safety.

---

### How to Use

1. **Wrap your app** with `<ToastProvider>`.
2. **Trigger a toast** from anywhere using the `useToast()` hook:
   ```js
   const { addToast } = useToast();
   addToast({
     type: "success",
     title: "Saved!",
     message: "Your changes have been saved.",
     duration: 3000,
   });
   ```
3. Toast notifications will appear at the bottom-right, styled according to their type, and auto-dismiss or can be dismissed manually.

---

### Key Points

- **Global, convenient access:** Context API delivers toast functionality globally.
- **Automatic lifecycle:** Toasts appear, auto-dismiss, or can be manually dismissed.
- **Type-safe:** All props and APIs use TypeScript interfaces for reliability.
- **Customizable:** Duration, title, message, and type are all configurable per toast.
- **Client-side only:** Uses `ClientOnly` to prevent SSR/React hydration issues.

---

### Summary

This code enables a robust, extensible, and visually appropriate toast notification experience for React apps, with centralized state management, easy API, and React best practices.
