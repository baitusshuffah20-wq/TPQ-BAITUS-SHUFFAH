# ClientOnly Component Documentation

## Overview

The `ClientOnly` component is a React functional component designed to render its children exclusively on the client side. This is particularly useful when you have components that:

- Rely on browser-specific APIs (such as `window`, `document`, etc.)
- May cause server/client hydration mismatches in Next.js or React Server Components setups

## Features

- **Client-side Rendering Only:** Ensures the wrapped components are rendered only after the component is mounted in the browser, not during server-side rendering.
- **Fallback Support:** Allows specifying an optional `fallback` UI to be displayed until client-side rendering is activated.
- **Hydration Warning Suppression:** Adds `suppressHydrationWarning` to the container div to avoid console warnings when the server and client render different children.

## Usage

```jsx
<ClientOnly fallback={<LoadingSpinner />}>
  <SomeBrowserOnlyComponent />
</ClientOnly>
```

- **children:** The components to render on the client.
- **fallback (optional):** A node to display before the client-side mount occurs (renders as `null` by default).

## Internal Logic

1. Uses React `useState` to track a `isMounted` state, initialized as `false`.
2. On component mount (`useEffect` with `[]` dependency), sets `isMounted` to `true`.
3. Before mounting (`isMounted === false`), renders the `fallback`.
4. After client-side mount (`isMounted === true`), renders the actual children.
5. Always wraps content in a `<div>` with `suppressHydrationWarning` to prevent hydration mismatch warnings.

## When to Use

- Wrapping components that are not compatible with server-side rendering.
- Guarding code that directly manipulates browser APIs.
- Preventing React hydration errors in hybrid applications like Next.js.
