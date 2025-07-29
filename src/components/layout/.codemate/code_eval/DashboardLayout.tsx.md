# Code Review Report

## Overview

This is a large React component serving as a dashboard layout in a Next.js application. The code is generally organized but has multiple areas that can be improved for performance, reliability, best industry practices, and to prevent potential bugs. Below is a critical analysis with specific improvements and pseudo code snippets for corrections.

---

## 1. **Repeated Unnecessary Calculations of Dynamic Paths**

**Issue:**  
Navigation `href`s are computed using string interpolation referencing `user?.role?.toLowerCase()` in every single nav item and also in profile links. When `user` is not loaded yet, this yields `undefined`, which means navigation links are potentially rendered with invalid or broken URLs initially.

**Recommendation:**

- Compute `roleSlug = user?.role?.toLowerCase() ?? ""` once, and use this in all hrefs to avoid code duplication and errors when `user` is not ready.
- Also, avoid rendering anything navigation related until `user` is loaded.

**Pseudo code:**

```javascript
// Add at top after user is defined:
const roleSlug = user?.role?.toLowerCase() ?? "";

// Example fix for href:
href: `/dashboard/${roleSlug}/akademik`;
```

---

## 2. **Incorrect Rendering During User Loading States**

**Issue:**

- The component renders navigation links and evaluates `user?.role` even when user/session isn't loaded yet. This leads to rendering links with "undefined" as path, risking navigation errors or broken links on first paint.
- The `filteredNavigationGroups` computation and its use should only happen when `user` is available.

**Recommendation:**

- Show a loading indicator or a fallback skeleton until session and user are loaded.
- Also, if `user` is undefined after `loading`, treat as "unauthenticated".

**Pseudo code:**

```javascript
if (status === "loading" || !user) {
  // Render loading spinner/skeleton
  return <LoadingSkeleton />;
}
```

---

## 3. **Client-Side Routing Side Effects**

**Issue:**

- The effect to redirect unauthenticated users (`router.push("/login")`) runs whenever the `status` changes to `"unauthenticated"`, but if `router.push` is used carelessly it could run on the client even if navigating from SSR/hydrated app.

**Recommendation:**

- Add a guard to prevent double redirection or running in the wrong context.

**Pseudo code:**

```javascript
useEffect(() => {
  if (!loading && status === "unauthenticated") {
    router.replace("/login");
  }
}, [status, loading]);
```

---

## 4. **Risk of Infinite Loops with useEffect Dependent on `user`**

**Issue:**

- The effect which logs user and status includes `user` in the dependency array, which can potentially cause repeated effect runs as `user` object reference may change.

**Recommendation:**

- Only depend on `status` and `router` unless truly intending to watch user state. Logging the user object is not necessary except for debugging.

**Pseudo code:**

```javascript
// Remove user from dependencies:
useEffect(() => {
  if (status === "unauthenticated") {
    //...
  }
}, [status, router]);
```

---

## 5. **Event Listener Cleanup Robustness**

**Issue:**

- The "click outside" detection for profile dropdown attaches an event on `document` but doesn't account for multiple mount/unmount cycles, nor does it support keyboard navigation accessibility.

**Recommendation:**

- Use useRef for the dropdown and trigger elements instead of ids.
- Attach event listeners in a more React-friendly and accessible way.

**Pseudo code:**

```javascript
const triggerRef = useRef(null);
const dropdownRef = useRef(null);

useEffect(() => {
  function handleClick(event) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target)
    ) {
      setProfileDropdownOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);
```

And update the JSX:

```jsx
<button ref={triggerRef} ...> ... </button>
<div ref={dropdownRef} ...> ... </div>
```

---

## 6. **Improper Key Usage in Lists**

**Issue:**  
`filteredNavigationGroups.map((group, groupIndex) => ...)` uses `group.name` as key for both desktop and mobile, but group names could duplicate or change.

**Recommendation:**

- Use a stable, unique key (like a hash or slug) or use both group name and index.

**Pseudo code:**

```jsx
key={`${group.name}-${groupIndex}`}
```

---

## 7. **Unsafe Rendering of Components Without Fallbacks**

**Issue:**

- The user avatar and related elements render `user.avatar` without ensuring it's a valid, trusted URL, which could potentially crash or lead to broken images.

**Recommendation:**

- Validate or sanitize the `user.avatar`, or use a default image on load error.

**Pseudo code:**

```jsx
<Image
  src={user.avatar || "/img/default-avatar.png"}
  onError={e => e.target.src = "/img/default-avatar.png"}
  ...
/>
```

---

## 8. **Potential Scroll Lock & Accessibility Issues For Mobile Sidebar**

**Issue:**

- When the mobile sidebar is open, background content is still scrollable & accessible via keyboard navigation, which is a usability/accessibility concern.

**Recommendation:**

- Prevent background scrolling when sidebar is open (by toggling body `overflow`).
- Trap focus within the open sidebar panel.

**Pseudo code:**

```javascript
// In useEffect watching sidebarOpen
useEffect(() => {
  if (sidebarOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [sidebarOpen]);
```

---

## 9. **Missing PropTypes or TypeScript Types for all Props**

**Issue:**

- It is unclear whether `user` object will always have expected keys, and roles/capabilities.

**Recommendation:**

- Define type for `user` and ensure all downstream consumers check for existence and types of user attributes.

**Pseudo code:**

```typescript
interface User {
  name?: string;
  email?: string;
  role: "ADMIN" | "MUSYRIF" | "WALI";
  avatar?: string;
}
```

---

## 10. **Non-Robust Active Link Highlight**

**Issue:**  
The `isActive` function simply checks for strict path equality, which fails for subpaths. For better UX, active link logic should also match children routes.

**Recommendation:**

- Change it to: `pathname.startsWith(item.href)`

**Pseudo code:**

```javascript
const isActive = (href: string) => pathname.startsWith(href);
```

---

## 11. **Hardcoded Strings and Duplicated Logic**

**Issue:**  
Many display strings, icons, and roles are hardcoded all over. Should extract nav groups and item definitions to a separate constants module or JSON for testability, maintenance, and localization.

---

## 12. **Other Minor Suggestions**

- **User Sign Out:** Consider using `await signOut({ ... })` and handling Promise for robust UX (spinner, errors).
- **Repeated Dropdowns:** Many dropdowns appear in both mobile and desktop - prefer extracting ProfileDropdown as a separate accessible component.

---

# Summary Table of Corrections

| Issue # | Summary                                                | Pseudo code for Correction                                                                                       |
| ------- | ------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| 1       | Use roleSlug variable to avoid repeated undefined href | const roleSlug = user?.role?.toLowerCase() ?? "";                                                                |
| 2       | Wait for user before rendering nav                     | if(status === "loading" \|\| !user) { return <LoadingSkeleton />; }                                              |
| 3       | Guard against double redirects                         | useEffect(() => { if (!loading && status === "unauthenticated") router.replace("/login"); }, [status, loading]); |
| 4       | Avoid unnecessary effect runs                          | useEffect(..., [status, router])                                                                                 |
| 5       | Use refs not ids for outside click                     | See ref-based handles above                                                                                      |
| 6       | Use stable keys for nav items                          | key={`${group.name}-${groupIndex}`}                                                                              |
| 7       | User avatar fallback                                   | src={user.avatar \|\| "/img/default-avatar.png"}                                                                 |
| 8       | Prevent bg scroll when sidebarOpen                     | useEffect for overflow as above                                                                                  |
| 9       | Explicit user typing                                   | interface User {...}                                                                                             |
| 10      | Improve active link logic                              | pathname.startsWith(href)                                                                                        |

---

# Actionable Next Steps

- Refactor role-dependent paths to use a single computed `roleSlug`.
- Gate nav and dropdowns on user being loaded.
- Migrate id-based DOM node lookups to direct React refs.
- Improve active link logic to support hierarchical navigation.
- Lift menu data to an external file or constant.
- Harden event cleanup for robust unmounting.
- Improve accessibility of overlays and dropdowns.
- Refactor repeated/complex conditionals for readability.

---

# Example Replacements (Not full code!)

```javascript
// Compute once
const roleSlug = user?.role?.toLowerCase() ?? "";

// Use everywhere
href: `/dashboard/${roleSlug}/akademik`

// Wait for user
if (status === "loading" || !user) {
  return <LoadingSkeleton />;
}

// Ref for dropdown
const dropdownRef = useRef(null);
const triggerRef = useRef(null);

// Outside click
useEffect(() => {
  // ... see above ...
}, []);

// Mobile sidebar
useEffect(() => {
  if (sidebarOpen) document.body.style.overflow = "hidden";
  else document.body.style.overflow = "";
  return () => { document.body.style.overflow = ""; }
}, [sidebarOpen]);

// isActive logic
const isActive = (href: string) => pathname.startsWith(href);

// Avatar fallback
<Image src={user.avatar || "/img/default-avatar.png"} ... />

// Key use
key={`${group.name}-${groupIndex}`}
```

---

## Overall

The component needs defensive coding for session/user loading, extraction of reusable constants, enhanced accessibility, and some best practices on handling events and navigation. After applying these changes, the code will be more robust, maintainable, and closer to modern industry standards.
