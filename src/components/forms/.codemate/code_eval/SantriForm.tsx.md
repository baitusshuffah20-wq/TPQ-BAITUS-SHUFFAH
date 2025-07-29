# Code Review Report: `SantriForm` Component

## Overview

The `SantriForm` React component is fairly comprehensive, following standard React development practices, but there are several places where both industry standards, potential optimizations, and error-prone/potential bug patterns can be improved.

## Key Issues Identified

### 1. State Initialization Redundancy and Potential Bugs

**Issue**:  
The initial state for `formData` redundantly spreads `...santri` after manually setting every individual property (with fallback to defaults). This can override values set above and introduces possible confusion/bugs if `santri` contains additional fields.

**Correction (pseudo code)**:

```pseudo
// Instead of:
setFormData({
  nis: santri?.nis || "",
  // ... other fields
  ...santri,
})

// Use:
setFormData({
  nis: santri?.nis ?? "",
  name: santri?.name ?? "",
  birthDate: santri?.birthDate ?? "",
  birthPlace: santri?.birthPlace ?? "",
  gender: santri?.gender ?? "MALE",
  address: santri?.address ?? "",
  phone: santri?.phone ?? "",
  email: santri?.email ?? "",
  photo: santri?.photo ?? "",
  status: santri?.status ?? "ACTIVE",
  waliId: santri?.waliId ?? "",
  halaqahId: santri?.halaqahId ?? "",
  enrollmentDate: santri?.enrollmentDate ?? (new Date().toISOString().split("T")[0]),
  graduationDate: santri?.graduationDate ?? "",
});
```

_Remove the spread `...santri` in the initialization to avoid silent bugs from extra/unexpected fields._

---

### 2. Data Fetching: Concurrency and Error Handling

**Issue**:  
The `loadSelectData` does two awaits sequentially. This delays the second API until the first returns. Also, partial failures aren’t surfaced to users (other than a generic error).

**Correction (pseudo code)**:

```pseudo
// Optimize to fetch in parallel and handle errors per-request.
const [waliResponse, halaqahResponse] = await Promise.all([
  fetch("/api/users?role=WALI"),
  fetch("/api/halaqah"),
]);
if (waliResponse.ok) {
  // ...
} else {
  toast.error("Gagal memuat data wali");
}
if (halaqahResponse.ok) {
  // ...
} else {
  toast.error("Gagal memuat data halaqah");
}
```

_Improves user feedback and UI responsiveness._

---

### 3. Side Effect Dependencies

**Issue**:  
`useEffect(() => { loadSelectData(); }, []);`  
This is fine, but if you ever add dynamic dependencies (such as a prop that might affect the dropdown data), it would silently not reload.

**Recommendation**:  
Document why empty array dependency is correct here (currently OK – just something to keep in mind for future maintenance).

---

### 4. Controlled Input Default Values

**Issue**:  
For `select` elements, `value={formData.halaqahId}` will be `undefined` if not set. It's best to guarantee an empty string when not set.

**Correction (pseudo code)**:

```pseudo
value={formData.halaqahId ?? ""}
```

---

### 5. Validation Regexp Escaping

**Issue**:  
Phone number regexp: `/^[0-9+\-\s()]+$/`  
This accepts basically any input with those characters in any order and any length, including things like `()+-`, which may not be phone numbers.

**Recommendation**:  
Consider using a more restrictive pattern, e.g.,

```pseudo
/^[+]?\d{9,15}$/
```

or at least validate length and logical format.

---

### 6. Asynchronous Submission: Multiple Submits

**Issue**:  
There's no local submit-lock state vs `isLoading` prop. If the parent doesn’t instantly flip `isLoading` on submit, double submits can happen.

**Correction (pseudo code)**:

```pseudo
// Add a local submit-in-progress state & disable submit button during submission
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    // ...
    return;
  }
  setSubmitting(true);
  try {
    await onSubmit(formData);
  } finally {
    setSubmitting(false);
  }
}
// In Button: disabled={isLoading || submitting}
```

---

### 7. `onSubmit` Error Feedback

**Issue**:  
If `onSubmit` fails, it only logs error, no user feedback.

**Correction (pseudo code)**:

```pseudo
try {
  await onSubmit(formData);
} catch (error) {
  toast.error("Gagal menyimpan data");
  console.error("Form submission error:", error);
}
```

---

### 8. Consistency of Optional vs. Required Form Fields

**Issue**:  
There is inconsistent indication of which fields are required. Use `required` attribute in addition to visual cues, when possible.

**Correction (pseudo code)**:

```pseudo
<Input
  type="text"
  name="nis"
  value={formData.nis}
  onChange={handleChange}
  placeholder="Contoh: 2024001"
  required
  ...otherProps
/>
```

---

### 9. Missing Dependency for useEffect

**Issue**:  
If `santri` might change (e.g., switching to edit different records), state will not be updated after initial render.

**Correction (pseudo code)**:

```pseudo
// Add useEffect to update formData when `santri` prop changes
useEffect(() => {
  setFormData({ ... });
}, [santri]);
```

---

### 10. Useless Spread of State Updator

**Issue**:  
In `handleChange`, you access `errors[name]`, but `name` might not match keys on `errors` correctly. Use a type-narrowing function.

**Correction**:  
(Not strictly required in this context but something to make more robust.)

---

### 11. Minor Inefficiency in Validation

**Issue**:  
You validate email with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. For user feedback, often worth trimming input first.

**Correction (pseudo code)**:

```pseudo
if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
  newErrors.email = "Format email tidak valid";
}
```

---

## Summary Table

| Issue                                 | Severity | Correction (Pseudo code)                          |
| ------------------------------------- | -------- | ------------------------------------------------- |
| Redundant spread in state             | ⚠️       | Remove `...santri` from initial state             |
| Inefficient API fetch                 | ⚠️       | Use `Promise.all` and handle each                 |
| input value defaults                  | ⚠️       | `value={... ?? ""}`                               |
| Phone/email validation                | 🟡       | Use stricter regex and trim input                 |
| Submission locking                    | ⚠️       | Add local `submitting` state                      |
| Missing user error feedback on submit | 🟢       | Add `toast.error` in submit catch                 |
| Form field `required` attribute       | ⚪       | Add `required` attr on required fields            |
| Update state on `santri` prop change  | 🟡       | Add `useEffect(() => setFormData(...), [santri])` |

---

## General Recommendations

- Ensure props changes propagate to internal state for consistency.
- Review field validation regex and UX feedback for better reliability.
- Avoid unnecessary state initialization complexity.
- Use parallel data fetching when possible for better performance.
- Always provide user feedback on actionable errors.

---

## Conclusion

With these targeted corrections, the code quality, maintainability, and user experience will be improved to meet higher industry standards.  
**If desired, request specific ready-to-paste code for any correction!**
