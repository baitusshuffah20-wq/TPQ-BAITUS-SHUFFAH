# Code Review Report

## General Assessment

- **Modularity**: Good separation via hooks and utility functions. But some logic can be further optimized or separated for reusability/testing.
- **Type Safety**: Usage of TypeScript interfaces is good, but some dynamic keys (`Record<string, string>`) can be stricter.
- **User Experience**: Generally good, but numeric field handling has minor problems.
- **Edge Cases**: Some input handling is not robust, and some error cases are not optimally handled.
- **Performance**: No critical problems, but minor optimization is possible.
- **Code Cleanliness**: Adheres to React best practices. A few opportunities for code conciseness and maintenance improvement.

---

## Critical Flaws & Improvements (with Corrected Pseudo Code)

---

### 1. **Account Initialization Leakage**

**Problem:**  
The spread operator with `...account` at the end of `useState` overwrites all prior default/cleaned values, including fallback defaults.  
If `account` (i.e., on "add" mode) contains legacy or extra fields, they are passed down silently.

**Location:**

```js
const [formData, setFormData] =
  useState <
  FinancialAccountFormData >
  {
    name: account?.name || "",
    type: account?.type || "CASH",
    accountNumber: account?.accountNumber || "",
    balance: account?.balance || 0,
    isActive: account?.isActive ?? true,
    description: account?.description || "",
    ...account, // <-- THIS IS PROBLEMATIC
  };
```

**Correction:**

```pseudo
// Remove ...account, as all relevant fields are explicitly set above
const [formData, setFormData] = useState<FinancialAccountFormData>({
    name: account?.name || "",
    type: account?.type || "CASH",
    accountNumber: account?.accountNumber || "",
    balance: account?.balance || 0,
    isActive: account?.isActive ?? true,
    description: account?.description || "",
});
```

---

### 2. **Number Input Value Binding (Controlled Input Issue)**

**Problem:**  
The balance field binds directly to a number; React expects string for input values.  
May cause "changing a controlled input from uncontrolled" warning, or prevent editing zero/null gracefully.

**Location:**

```jsx
<Input
  type="number"
  name="balance"
  value={formData.balance} // not always a string
  ... // snip
/>
```

**Correction:**

```pseudo
value={formData.balance === 0 ? "" : String(formData.balance)}
// or for explicit string conversion:
value={String(formData.balance ?? "")}
```

_and in handleChange, allow for blank string_

```pseudo
// Inside handleChange:
if (name === "balance") {
    setFormData((prev) => ({
        ...prev,
        balance: value === "" ? 0 : parseFloat(value) || 0,
    }));
} else {
    setFormData((prev) => ({ ...prev, [name]: ... }));
}
```

---

### 3. **Disabled/Unchecked Radio Inputs**

**Problem:**  
Because `checked` and `value` are both controlled, but on rapid form updates, some browser/react versions can cause radio inputs to become "stuck" or fail to select if `name` is not properly unique for each group on the same page.  
Also, using `"sr-only"` class without an actual visible fallback for accessibility is suboptimal.

**Correction:**

```pseudo
// Ensure radio `name` is unique if multiple forms can exist.
// Prefer using id and htmlFor pairing for accessibility.

<input
  type="radio"
  id={`account-type-${type.value}`}
  name="type"
  value={type.value}
  checked={formData.type === type.value}
  onChange={handleChange}
  disabled={isLoading}
/>
<label htmlFor={`account-type-${type.value}`}>
  {type.icon}
  <span className="text-sm font-medium">{type.label}</span>
</label>
```

---

### 4. **TextArea Input Value Type**

**Problem:**  
React may throw warning if you pass `undefined` instead of an empty string to `textarea.value`.

**Correction:**

```pseudo
<textarea
  ...
  value={formData.description ?? ""}
/>
```

---

### 5. **handleChange Logic - Cleanliness and Robustness**

**Problem:**  
The logic inside handleChange is hard to read and error-prone for future changes. It's better to switch-case by input field.

**Correction:**

```pseudo
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  let newValue;
  switch (name) {
    case "balance":
      newValue = value === "" ? 0 : parseFloat(value) || 0;
      break;
    case "isActive":
      newValue = checked;
      break;
    default:
      newValue = value;
  }
  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));

  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};
```

---

### 6. **Error Handling on onSubmit**

**Problem:**  
The `catch` block in `handleSubmit` only logs error, but user receives no feedback when an exception occurs.

**Correction:**

```pseudo
catch (error) {
  console.error("Form submission error:", error);
  toast.error("Gagal menyimpan data akun. Coba lagi.");
}
```

---

### 7. **Form Reset On Cancel**

**Problem:**  
If `onCancel` only closes dialog but doesn't reset the form, previous dirty state might remain if the same form is reused.

**Suggestion:**  
If this form is used in a dialog/modal, consider calling `setFormData` to initial state on cancel.

---

### 8. **Type Safety on Form Data Propagation**

**Problem:**  
There's no guarantee that all properties are maintained (e.g., if a future backend field is added).

**Suggestion:**  
Validate/sanitize `formData` objects before passing to `onSubmit`.

---

### 9. **Optimization: UseMemo for Computed Values**

**Suggestion:**  
For display-only functions like `formatCurrency(formData.balance)`, use `useMemo` if performance is an issue (e.g., in very large forms).

---

## Summary Table

| Issue                     | Severity | Correction Summary                  |
| ------------------------- | -------- | ----------------------------------- |
| Account init with spread  | High     | Remove `...account` in useState     |
| Controlled numeric input  | High     | Always use string for input "value" |
| Radio input/Accessibility | Medium   | Use id/htmlFor and visible label    |
| Textarea controlled value | Low      | Use `""` default value              |
| handleChange switch       | Medium   | Use explicit switch/case            |
| Submit error feedback     | High     | Show toast on error                 |
| Form reset on cancel      | Medium   | Consider reset on cancel            |
| Prop type safety          | Medium   | Sanitize before submit              |
| Small perf/memo           | Low      | `useMemo` for display if laggy UI   |

---

## Recommendations

- Apply the corrections above for robustness and maintainability.
- Add integration tests for common form flows and edge cases (empty, partial, etc).
- Consider further extracting some helpers outside the component for testability.
- Ensure all inputs are accessible and keyboard-navigatable.
- Validate at both frontend and backend for all required properties.

---

**End of Report**
