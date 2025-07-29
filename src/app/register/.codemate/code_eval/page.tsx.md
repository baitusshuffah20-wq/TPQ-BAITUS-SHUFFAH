# Code Review Report

This is a review of the provided React component `RegisterPage` using TypeScript and Next.js conventions. Several issues and improvement points have been identified, including industry-standard best practices, performance issues, correctness, and maintainability. Where possible, concise pseudocode for the fixes is suggested.

---

## 1. **Error: Uncontrolled Input to Controlled `select` (Radio) in Program Selection**

**Issue:** The radio input for `selectedProgram` uses both custom container `onClick` and `onChange`. This could lead to double state updates, and accessibility/semantic issues arise if the user clicks the text/container instead of the input itself.

**Fix (pseudocode):**

```jsx
// Instead of setting selectedProgram on container onClick,
// handle selection only with the <input> onChange

<div
  // remove onClick
  className={...}
>
  <input
    ...
    onChange={() => setFormData((prev) => ({
      ...prev,
      selectedProgram: program.id,
    }))}
    // Do not pass handleInputChange to radio group, keep it explicit!
  />
  ...
</div>
```

---

## 2. **Optimization: Input Change Handler Is Too Generic and Not Typesafe**

**Issue:** `handleInputChange` assumes all targets have `.checked`, risking runtime issues for `select` and other input types.

**Fix:**

```typescript
// Pseudocode: Use type narrowing to separate handling for checkboxes
if (type === "checkbox") {
  const checked = (e.target as HTMLInputElement).checked;
  setFormData({ ...prev, [name]: checked });
} else {
  setFormData({ ...prev, [name]: value });
}
```

_(Already present; just ensure explicit type narrowing and avoid handling non-checkbox types with `.checked`)_

---

## 3. **Best Practice: Email & Phone Validation**

**Issue:** No email or phone validation is done. Users can enter any string; should at least check for basic email format.

**Fix:**

```typescript
// Pseudocode inside validateStep:
if (step === 2) {
  if (!isValidEmail(formData.waliEmail))
    newErrors.waliEmail = "Format email tidak valid";
  // Similarly for santriEmail if required
}

// Helper function
function isValidEmail(email: string): boolean {
  // Simple regex or use validator.js/email dependency
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 4. **Security: Prevent XSS in Alert**

**Issue:** `alert()` is used with data. If interpolating data, escape all user data; as is, it's safe, but future modifications may introduce risks.

**Fix:** _(No code change, but caution note: Never interpolate raw user input in `alert` or DOM!)_

---

## 5. **Performance: Function Re-Creation in Render Loop**

**Issue:** `renderStepContent` closes over state, causing unnecessary recreation for each render.

**Fix:**

```javascript
// Move renderStepContent with useCallback if it causes performance issues.
// Or consider splitting steps into separate components.
```

---

## 6. **Semantic Accessibility: Inputs Should Have `id`s and Labels Should Use `htmlFor`**

**Issue:** Inputs lack explicit `id`, and label is not linked with `htmlFor`.

**Fix:**

```jsx
// For each Input/Select
<input id="santriName" name="santriName" ... />
<label htmlFor="santriName">Nama Lengkap Santri</label>
```

---

## 7. **Maintainability: Magic Numbers in Step Transitions**

**Issue:** `setCurrentStep((prev) => Math.min(prev + 1, 3));` and similar — hardcoded step count.

**Fix:**

```typescript
// Use steps.length instead of '3'
setCurrentStep((prev) => Math.min(prev + 1, steps.length));
...
setCurrentStep((prev) => Math.max(prev - 1, 1));
```

---

## 8. **Bug: Missing Required Field for Santri NIS**

**Issue:** `santriNis` is defined in state, but not rendered or validated anywhere.

**Fix:**

```jsx
// Add Input in Step 1:
<Input
  label="NIS Santri (Opsional)"
  name="santriNis"
  value={formData.santriNis}
  onChange={handleInputChange}
  placeholder="Masukkan NIS (jika ada)"
/>

// Or if required, add validation:
/*
if (!formData.santriNis) newErrors.santriNis = "...";
*/
```

---

## 9. **UI Bug: Accept/Disable Form Submission When Loading**

**Issue:** User can click "Daftar Sekarang" multiple times while loading. Button disables only on loading, but form can still interact.

**Fix:**

```jsx
<Button onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
  {isLoading ? "Memproses..." : "Daftar Sekarang"}
</Button>
```

---

## 10. **Best Practice: Prevent Default Form Submission**

**Issue:** No `<form onSubmit={handleSubmit}>` is present, so native submission is not blocked, but if added in the future, should always use `e.preventDefault()` in submit handler.

**Fix:**

```jsx
const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  ...
};
```

---

## 11. **Minor: Typo in Class Name `bg-teal-gold`**

**Issue:** `bg-teal-gold` is not a standard Tailwind class. Review custom Tailwind setup.

**Fix:**  
_Check and update to valid color class or define custom color in Tailwind config._

---

# **Summary Table**

| Issue                          | Severity | Suggested Fix                           | Reference                                                                            |
| ------------------------------ | -------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Uncontrolled program selection | Moderate | Move setFormData to input onChange only | [#1](#1-error-uncontrolled-input-to-controlled-select-radio-in-program-selection)    |
| Input handler type issues      | Minor    | Type narrowing for checkboxes           | [#2](#2-optimization-input-change-handler-is-too-generic-and-not-typesafe)           |
| No email/phone validation      | High     | Regex validation                        | [#3](#3-best-practice-email--phone-validation)                                       |
| Alert security                 | Moderate | Escape interpolated data                | [#4](#4-security-prevent-xss-in-alert)                                               |
| Re-created functions           | Minor    | Memoize or extract steps                | [#5](#5-performance-function-re-creation-in-render-loop)                             |
| Input accessibility            | Moderate | Add id/htmlFor                          | [#6](#6-semantic-accessibility-inputs-should-have-ids-and-labels-should-use-htmlfor) |
| Magic numbers                  | Minor    | Use steps.length                        | [#7](#7-maintainability-magic-numbers-in-step-transitions)                           |
| Unused NIS field               | Moderate | Add to form or remove                   | [#8](#8-bug-missing-required-field-for-santri-nis)                                   |
| Loading disables form          | Moderate | Disabled button during loading          | [#9](#9-ui-bug-acceptdisable-form-submission-when-loading)                           |
| preventDefault on submit       | Minor    | Add to handleSubmit                     | [#10](#10-best-practice-prevent-default-form-submission)                             |
| Color class typo               | Minor    | Use valid color                         | [#11](#11-minor-typo-in-class-name-bg-teal-gold)                                     |

---

# **General Advice**

- Strongly consider splitting out each step into its own component for modularity and to avoid large render functions.
- Use Formik, React Hook Form, or similar for more robust form state management and validation.
- Ensure accessibility by always linking labels and inputs.
- Use Next.js's router for navigation after success, not just `alert`.
- Validate all user inputs on both frontend and backend.

---

**If you have questions on any fix or reasoning, please ask for clarification.**
