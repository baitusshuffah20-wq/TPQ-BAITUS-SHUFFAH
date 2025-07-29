# Code Review Report: Perbaikan Visibilitas Tombol

**Scope:**  
Critical review based on industry standards (accessibility, maintainability, optimization, and error handling).

---

## 1. Identified Issues

### a. Accessibility & WCAG

- **Contrast might still not be WCAG compliant**: Manual color selections may not pass recommended contrast ratios (4.5:1 for normal text).
- **No `aria-*` or role attributes**: Buttons lack accessibility attributes for screen readers.
- **No `type` attribute on `<button>`**: Defaults to "submit" in forms, may cause bugs.

### b. Code Maintainability

- **Hard-coded color classes**: Makes future changes harder, best managed via theme variables.
- **Style duplication in global CSS and inline classes**: Can lead to specificity issues and maintenance problems.
- **No check for additional/unknown class combinations**: Potential for inconsistent appearance.

### c. Optimization & Robustness

- **Improper usage of `!important` in global CSS**: Overpowers all component-level customization, reduces flexibility.
- **No clear separation between component-level styles and global overrides**.

### d. Error Handling

- **No error boundary around button actions**—if handlers like `handleViewDetail` throw, UI may break.
- **No defensive checks on prop usage (e.g., `variant`, `size`)**—prone to invalid values.

---

## 2. Suggested Code Improvements

Below are proposed corrections (pseudo code style) for only the affected lines/parts; **do not include unrelated or already-correct parts**.

### a. Enforce Accessible Color Choices

```typescript
// Pseudocode for automation: Use a color utility to check contrast ratios for all variant combinations
for each variant in variants:
    assert WCAG_contrast(variant.background, variant.text) >= 4.5
```

_If contrast fails, update colors:_

```typescript
primary: 'bg-[#115e59] text-white ...',                 // darker teal (~teal-900)
secondary: 'bg-[#eab308] text-black ...',               // more vivid yellow, black text
// etc.
```

---

### b. Improve Button Accessibility

```jsx
<button
  type={type || "button"}
  aria-label={ariaLabel || "Tombol tindakan"}   // Provide descriptive label for screen readers
  role="button"
  tabIndex={0}
  ...
/>
```

---

### c. Defensive Prop Usage in Button Component

```typescript
// Validate variant and size props, fallback to 'primary' and 'md'
const allowedVariants = [
  "primary",
  "secondary",
  "accent",
  "danger",
  "info",
  "outline",
  "ghost",
];
const allowedSizes = ["sm", "md", "lg"];
const variantClass = allowedVariants.includes(variant)
  ? variants[variant]
  : variants["primary"];
const sizeClass = allowedSizes.includes(size)
  ? sizeVariants[size]
  : sizeVariants["md"];
```

---

### d. Remove Global CSS `!important` Overuse and Prefer Utility Classes

_Prefer utilities and minimal overrides:_

```css
/* Replace this: */
button {
  border: 2px solid rgba(0, 0, 0, 0.2) !important;
  ...
}

/* With class-based approach: */
.button-contrast {
  border-width: 2px;
  border-color: rgba(0,0,0,0.2);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
```

_Apply `.button-contrast` via the button component or variant string._

---

### e. Add Visual Feedback & Focus Styles

```typescript
// Example for focus and active
primary: "... focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 active:scale-95 transition-transform ...";
```

---

### f. Error Boundary (React Example)

```jsx
<ErrorBoundary>
  <Button .../>
</ErrorBoundary>
```

_Define `ErrorBoundary` at a higher level or wrap individual critical components as needed._

---

## 3. Summary Table of Major Corrections

| Issue                                  | Suggested Code/Pseudocode                                |
| -------------------------------------- | -------------------------------------------------------- |
| Color contrast not guaranteed          | See **a** above for automate/test and adjust colors      |
| Missing accessibility attributes       | See **b** for `aria-label`, `role`, `type`               |
| Prop validation/fallback               | See **c**: allowed options with default                  |
| Use of !important in CSS               | See **d**: prefer utility class or variant-based styling |
| Missing visual feedback                | See **e**: focus/active transition classes               |
| No error boundaries for button actions | See **f**: wrap with `<ErrorBoundary>`                   |

---

## 4. Additional Recommendations

- **Automate a11y checks**: Integrate [axe](https://github.com/dequelabs/axe-core) or [jest-axe](https://github.com/nickcolley/jest-axe) in testing pipeline.
- **Theming support**: Extract color and style definitions to a theme file for easy maintainability.
- **Reduce duplication**: Refactor inline/styles & global CSS to avoid multiple sources-of-truth.
- **Consistent variant logic**: Encapsulate in a shared `getButtonClass(variant, state)` util.

---

_This review targets code clarity, maintainability, accessibility, and long-term robustness as per industry software development standards._
