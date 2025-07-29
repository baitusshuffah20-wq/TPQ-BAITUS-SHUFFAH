# High-Level Documentation: ClientOnly Component

## Overview

The `ClientOnly` component is a React functional component designed to ensure that its children are rendered **only on the client-side, after hydration**. This approach is especially useful in server-side rendered (SSR) React frameworks like Next.js, where certain components rely on browser APIs or client-side effects, and rendering them on the server could cause **hydration mismatches** (differences between server-rendered and client-rendered output).

---

## Key Features

- **Prevents Hydration Mismatches:** By delaying the rendering of its children until after the component has mounted on the client, it avoids discrepancies between server and client DOM during hydration.
- **Optional Fallback:** Accepts an optional `fallback` prop to render during the initial (server-side or pre-mount) render before the component is mounted on the client.
- **Suppresses Warnings:** Uses `suppressHydrationWarning` on the container `div` to silence warnings related to hydration mismatches in React.

---

## Props

- **children** (`React.ReactNode`): The content to render on the client side, after hydration.
- **fallback** (`React.ReactNode`, optional): Content to display before hydration (i.e., during server render or pre-mount); defaults to `null`.

---

## Usage Scenario

Use `ClientOnly` to wrap any UI or component that

- Depends on browser-only APIs (window, document, localStorage, etc.),
- Reads data only available after hydration,
- Must not be rendered on the server for consistency.

---

## Example Usage

```jsx
<ClientOnly fallback={<LoadingSpinner />}>
  <BrowserOnlyComponent />
</ClientOnly>
```

- Before hydration, `<LoadingSpinner />` is shown (or nothing if no fallback provided).
- After mounting on client, `<BrowserOnlyComponent />` is rendered.

---

## Implementation Summary

- Uses a state variable (`hasMounted`) to track whether the component has mounted.
- Calls `setHasMounted(true)` in a `useEffect`, which only runs on the client.
- Renders fallback (if provided) before mount, and the children after mount.
- Wraps children in a `<div suppressHydrationWarning>` to suppress React hydration warnings.

---

**Ideal for:** Next.js and similar SSR frameworks to reliably render browser-only components without hydration issues.
