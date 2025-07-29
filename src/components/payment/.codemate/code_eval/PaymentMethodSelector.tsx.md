# Code Review Report

## Summary

The reviewed code is a React functional component implementing a payment method selector with multiple payment options, filtering, and some UI interactivity. The following aspects were checked:

- **Compliance with industry standards**
- **Correctness and edge case handling**
- **Optimization of algorithms and rendering**
- **Styling responsibilities**
- **General code quality, safety, and maintainability**
- **Accessibility**

---

## Identified Issues and Recommendations

### 1. **Performance: Avoid Arrow Functions in Render**

**Issue:**  
The following lines inside render:

```jsx
{categories.map((category) => (
  ...
))}
{filteredMethods.map((method) => {
  ...
})}
```

cause the callback function to be redefined on every render. For lists with many elements or highly dynamic states, this can cause unnecessary re-renders. While tolerable for small lists, best practice is to always define large/complex callbacks outside of the render function or use `useCallback`.

**Recommendation:**  
For scalability, move complex map callbacks outside, or wrap with `useCallback`.

**Pseudo code:**

```
// Outside of render or with useCallback
const renderCategory = (category) => ( ... );
const renderPaymentMethod = (method) => ( ... );

// In JSX:
{categories.map(renderCategory)}
{filteredMethods.map(renderPaymentMethod)}
```

---

### 2. **Incorrect .includes usage for Filtering by Bank**

**Issue:**  
This line in the 'bank' case:

```js
return method.code.includes("_VA");
```

If a method with code 'LOAN_VA' or anything else containing `_VA` is ever added, it could get incorrectly included. If only bank VAs are included in a curated way, then a whitelist is preferable.

**Recommendation:**  
Use an explicit list, or, if all VAs share a consistent naming (i.e., always end with `_VA`), match only methods where code ends with "\_VA" to minimize false positives.

**Pseudo code:**

```js
// Better - explicit:
bankCodes = ["BCA_VA", "BNI_VA", "BRI_VA", "MANDIRI_VA"];
return bankCodes.includes(method.code);

// Or, regex:
return method.code.endsWith("_VA");
```

---

### 3. **Key for Rendered List: Payment Method May Not Be Globally Unique**

**Issue:**  
The usage `key={method.id}` is best practice, but only if `id` is always unique across all payment methods and won't change. It is assumed so, but confirm static guarantees on ids.

**Recommendation:**  
If there's any uncertainty about `id` uniqueness (e.g. dynamic method lists), improve the key, e.g. add `gateway`:

**Pseudo code:**

```js
key={`${method.gateway}-${method.id}`}
```

---

### 4. **Calculation Issues: Fees and Rounding**

**Issue:**  
In `calculateFee`:

```js
return (amount * method.fees) / 100;
```

This can cause floating point rounding errors (e.g., 3399.99999997). Also, does not round to integer – for currency, we must round reliably.

**Recommendation:**  
Use `.toFixed(0)` or `Math.round` so that the fee is in whole currency units.

**Pseudo code:**

```js
return Math.round((amount * method.fees) / 100);
```

---

### 5. **Unintentional Reliance on Truthiness for minAmount/maxAmount Check**

**Issue:**  
In `getFilteredMethods`:

```js
if (method.minAmount && amount < method.minAmount) return false;
if (method.maxAmount && amount > method.maxAmount) return false;
```

If `minAmount` is 0, the check fails, even though 0 may be a valid minimum.

**Recommendation:**  
Explicitly compare against undefined/null.

**Pseudo code:**

```js
if (typeof method.minAmount === "number" && amount < method.minAmount)
  return false;
if (typeof method.maxAmount === "number" && amount > method.maxAmount)
  return false;
```

---

### 6. **Event Handlers: Div Clickable for Selection**

**Issue:**  
Using pure `<div onClick={...}>` for list item selection is poor for accessibility (users with keyboard, screen readers), and may not be keyboard accessible or semantically clear.

**Recommendation:**  
Replace clickable `div` with `button` or add `role="button"`, `tabIndex="0"` and handle keyboard events.

**Pseudo code:**

```jsx
<div
  role="button"
  tabIndex={0}
  onClick={() => onSelect(method)}
  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(method); }}
  ...
>
```

**Or, semantically preferable:**

```jsx
<button
  type="button"
  onClick={() => onSelect(method)}
  aria-pressed={isSelected}
  ...
>
```

---

### 7. **Styling/Logic Separation**

**Issue:**  
Heavy use of template string class composition in render (`className={...}`) decreases readability.

**Recommendation:**  
Consider using a library (e.g. `clsx`) or helper function for complex class composition, outside render.

**Pseudo code:**

```js
// At top:
import clsx from 'clsx';

// In JSX:
className={clsx(
  'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
  isSelected
    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
    : 'border-gray-200 hover:border-gray-300'
)}
```

---

### 8. **A11y: Missing Labels & Roles on Category Buttons**

**Issue:**  
Accessibility for filtering buttons (category filter) may be improved by adding appropriate `aria-label` and roles, and grouping them in a `radiogroup`/`toolbar`.

**Recommendation:**  
Wrap in a container with `role="radiogroup"` and buttons with `role="radio"` + `aria-checked`.

**Pseudo code:**

```jsx
<div role="radiogroup" aria-label="Payment method categories">
  {categories.map(...(
    <Button
      ...
      role="radio"
      aria-checked={selectedCategory === category.id}
    >
    ...
  ))}
</div>
```

---

### 9. **Children as Fragment List**

**Issue:**  
There are repeated fragments in mapping `filteredMethods`. For React 18+, strongly recommend using a `<Fragment key={...}>` if returning arrays of nodes.

**Pseudo code:**

```jsx
<Fragment key={method.id}>...</Fragment>
```

---

### 10. **Security & Propagation of User Input**

**Issue:**  
Barely relevant here, but the code assumes `amount` is valid, non-negative. Add basic validation/guard early.

**Recommendation:**  
Early return or warning if `amount` is NaN or <0.

**Pseudo code:**

```js
if (typeof amount !== "number" || amount < 0) {
  // Show error or fallback
  return <div>Jumlah tidak valid</div>;
}
```

---

## Summary Table

| Issue                              | Recommendation / Pseudo-code                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Repeated arrow functions in render | Move mapping callbacks outside render or use `useCallback`                   |
| `.includes()` for filtering banks  | Use explicit list or `.endsWith('_VA')`                                      |
| Potential duplicate keys           | Use composite key if `id` not globally unique: `${gateway}-${id}`            |
| Fee calculation and rounding       | Use `Math.round()` for currency values                                       |
| minAmount/maxAmount checks         | `typeof method.minAmount === "number"` instead of just if-guard              |
| `div` for clickable                | Add `role="button"`, `tabIndex="0"`, and keyboard handler, or use `<button>` |
| Complex classNames                 | Use `clsx` or a class helper                                                 |
| Category buttons a11y              | Use `role="radio"` and `role="radiogroup"`, and `aria-checked`               |
| Frag lists in mapping              | Use `<Fragment key={...}>`                                                   |
| Validate user input                | Check typeof/NaN of `amount` early                                           |

---

## Example Corrected Code Lines (Pseudo)

Below is a summary of the recommended corrections in pseudo-code form:

```javascript
// --- Use endsWith for bank check ---
case "bank":
  return method.code.endsWith('_VA');

// --- Round fee value ---
return Math.round((amount * method.fees) / 100);

// --- Guard amount limit checks ---
if (typeof method.minAmount === "number" && amount < method.minAmount) return false;
if (typeof method.maxAmount === "number" && amount > method.maxAmount) return false;

// --- Accessible selection list item ---
<div
  role="button"
  tabIndex={0}
  onClick={() => onSelect(method)}
  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(method); }}
/>

// --- Category buttons as radiogroup ---
<div role="radiogroup" aria-label="Payment method categories">
  <Button
    role="radio"
    aria-checked={selectedCategory === category.id}
    ...
  >
    ...
  </Button>
</div>

// --- Class composition helper ---
className={clsx(..., isSelected ? "..." : "...")}

// --- Key for list items ---
key={`${method.gateway}-${method.id}`}

// --- Validate input amount ---
if (typeof amount !== 'number' || amount < 0) {
  return <div>Jumlah tidak valid</div>;
}
```

---

## Final Recommendations

The code is well-structured and generally robust, but the above industry best practices should be adopted:

- Always round monetary values.
- Ensure accessible interaction for interactive elements.
- Use explicit filters over substring-matching for stability.
- Avoid re-defining callbacks inside render—memoize or move outside when possible (as scale grows).
- Use utility libraries for class composition for maintainability.
- Validate assumptions about data/props early for better error handling and reliability.

**Adoption of these improves maintainability, user experience, and reduces risk of subtle bugs or regressions.**
