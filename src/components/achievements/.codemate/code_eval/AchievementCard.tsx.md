# Code Review Report: `AchievementCard` Component

## Summary

This report provides a **critical industry-level evaluation** of your `AchievementCard` component focusing on:

- Software development best practices
- Error handling
- Unoptimized implementations
- Maintainability/readability

**Corrections and suggestions are provided as pseudocode snippets** for you to easily integrate into your codebase.

---

## 1. **Component/DOM Inefficiencies**

### 1.1. Double Declaration of Icon Classes

**Issue:**  
You pass both `text-4xl` etc. to a div wrapping `{badge.icon}` and set icon sizes for `RarityIcon` as tailwind classes. If `badge.icon` is a React component (not a raw SVG or a string), you should pass the size via props, otherwise you'll risk improperly scaled icons.

**Solution:**  
If `badge.icon` is a Lucide component, render it as:

```jsx
// Instead of:
<div className={`${getIconSize()} ...`}>{badge.icon}</div>;

// Use:
{
  React.cloneElement(badge.icon, {
    className:
      getIconSize() +
      (isUnlocked ? "" : " grayscale") +
      " transition-all duration-300",
  });
}
```

_(Assuming `badge.icon` is a React element. Otherwise, clarify the shape of `badge.icon` for further refinement.)_

---

### 1.2. Unnecessary String Interpolation for Tailwind

**Issue:**  
Some className constructions are unnecessarily wrapped in template literals.

**Example:**

```jsx
className={`text-xs font-bold rounded-bl-lg ${getRarityColor(badge.rarity)}`}
// If getRarityColor always returns a string, OK. Else, sanitize output.
```

**Suggested Code:**  
Ensure `getRarityColor` and similar helpers always return **safe class string** (never undefined/null).

```js
function getRarityColor(rarity) {
  // return always valid Tailwind string (e.g., 'bg-yellow-200 text-yellow-900')
}
```

If conditional, use:

```jsx
className={['text-xs font-bold rounded-bl-lg', getRarityColor(badge.rarity) || ''].join(' ')}
```

---

## 2. **Error Handling & Defensive Programming**

### 2.1. Date Formatting

**Issue:**  
Possible crash if `santriAchievement.achievedAt` is not a valid date string.

**Solution:**

```jsx
const achievementDate = santriAchievement?.achievedAt;
const achievementDateStr = achievementDate
  ? new Date(achievementDate).toLocaleDateString(...)
  : "-";
```

Use `achievementDateStr` for rendering.  
Or guard with:

```jsx
{
  isUnlocked && santriAchievement && santriAchievement.achievedAt && (
    <div>...</div>
  );
}
```

---

## 3. **Prop Type Consistency and Validation**

### 3.1. `progress` Input Validation

**Issue:**  
`progress` prop may be outside `[0,100]` or non-numeric.

**Solution:**

```js
const clampedProgress = typeof progress === 'number' && progress > 0 ? Math.min(progress, 100) : 0;
...
style={{ width: `${clampedProgress}%` }}
...
Progress: {Number.isFinite(progress) ? progress.toFixed(0) : 0}%
```

---

## 4. **Readability / Clean Code**

### 4.1. Nested Ternaries

**Issue:**  
The `h3` for badge name uses deeply nested ternaries.

**Current:**

```jsx
className={`font-bold ${
  size === "sm"
    ? "text-sm"
    : size === "lg"
      ? "text-xl"
      : "text-lg"
} ${isUnlocked ? "text-gray-900" : "text-gray-600"}`}
```

**Suggested:**

```js
const nameSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg";
...
className={`font-bold ${nameSize} ${isUnlocked ? "text-gray-900" : "text-gray-600"}`}
```

---

### 4.2. Inline Functions in JSX

**Issue:**  
Avoid re-creating functions on every render inside JSX, such as `getSizeClasses`.

**Suggested:**
Move logic to top of function:

```js
const sizeClasses = getSizeClasses();
const iconSizeClass = getIconSize();
```

And use directly in JSX.

---

## 5. **Optional: Accessibility Concerns**

### 5.1. Missing ARIA & alt text

**Issue:**  
No aria-label/alt for icons = accessibility issues.

**Suggested:**

```jsx
<RarityIcon aria-label={`Rarity: ${getRarityText(badge.rarity)}`} className="..." />
<Lock aria-label="Kunci (terkunci)" ... />
// Add role/presentation where appropriate
```

---

## 6. **Optimization: Avoid Re-Renders**

### 6.1. PureComponent or memo

If this component can have frequent re-renders, wrap export:

```js
export default React.memo(AchievementCard);
```

If not, skip.

---

## 7. **Unoptimized/Clunky Logic**

### 7.1. Unused Imports

Scan code for unused imports (examples, `Award`, `Lock` etc. are used, but always check and remove unused).

---

## 8. **Miscellaneous: Magic Strings/Numbers**

**Issue:**  
Use of magic strings/numbers (e.g., sizes).

**Suggestion:**  
Define constant mappings:

```js
const SIZE_MAP = { sm: "p-4", md: "p-6", lg: "p-8" };
// then use SIZE_MAP[size] || 'p-6'
```

---

# **Summary Table**

| #   | Issue / Section                  | Correction/Refactor                                                          |
| --- | -------------------------------- | ---------------------------------------------------------------------------- |
| 1.1 | Badge icon render                | Use `React.cloneElement` for icons (if React element) or pass size via props |
| 2.1 | Date field robustness            | Guard date conversion, show fallback string if invalid                       |
| 3.1 | Progress clamping/NaN protection | Clamp progress to [0,100] and guard non-numeric                              |
| 4.1 | Readability: nested ternary      | Precompute class strings outside JSX                                         |
| 4.2 | Functions in JSX props           | Precompute values outside JSX                                                |
| 5.1 | a11y: missing ARIA               | Add aria-label/presentation where relevant                                   |
| 6.1 | Component unnecessary re-renders | Use React.memo if props are stable                                           |
| 7.1 | Unused imports                   | Remove unused imports                                                        |
| 8.1 | Magic strings/numbers            | Map sizes via constants                                                      |

---

## **Example: Corrected code as pseudocode snippets**

```js
// Pseudocode corrections for your codebase:

// --- Clamp progress in main body ---
const clampedProgress = typeof progress === 'number' && progress > 0 ? Math.min(progress, 100) : 0;

// --- Precompute nameSize and classes ---
const nameSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg";
const sizeClasses = getSizeClasses();
const iconSizeClass = getIconSize();

// --- Defensive Date Handling ---
const achievementDateStr = (santriAchievement?.achievedAt && !isNaN(new Date(santriAchievement.achievedAt)))
  ? new Date(santriAchievement.achievedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  : "-";

// --- Badge Icon with proper class ---
{React.cloneElement(badge.icon, { className: `${iconSizeClass}${!isUnlocked ? " grayscale" : ""} transition-all duration-300` })}

// --- Add aria-label for icons ---
<RarityIcon aria-label={`Rarity: ${getRarityText(badge.rarity)}`} ... />
<Lock aria-label="Terkunci" ... />

// --- Memoize component if suitable ---
export default React.memo(AchievementCard);
```

---

# **Final Notes**

- Refactor for readability and ease of future maintenance.
- Use PropTypes or TypeScript strictness to avoid inconsistent data shapes.
- Always think about a11y.
- Review all utility functions (e.g., `getRarityColor`) to **never return undefined**.

If you make these changes, your code will be more robust, readable, and in line with industry standards.
