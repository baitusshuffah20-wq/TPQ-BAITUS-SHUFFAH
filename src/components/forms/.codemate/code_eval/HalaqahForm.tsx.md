# Code Review Report – `HalaqahForm`

Review Date: 2024-06  
Scope: Industry standards, code maintainability, optimization, error detection, and best practices.  
Language: React (TypeScript, Next.js project)  
Author: [REDACTED]

---

## Summary

The code is generally clean, leverages React's functional paradigms, and follows modern conventions. However, several areas related to industry best practices, error handling, type-safety, code duplication, UI responsiveness, and minor bugs require improvements.

---

## Findings and Recommendations

### 1. **Async Function Inside `useEffect`**

**Problem:**  
You’re defining and calling `loadMusyrifList` outside and then referencing it in `useEffect`'s dependency array (`[]`). This is fine, but defining the async function inside `useEffect` (or wrapping in an IIFE inside `useEffect`) avoids unnecessary global exposure and bugs if `musyrifList` state or others are used within.

**Suggestion:**

```tsx
useEffect(() => {
  (async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/users?role=MUSYRIF");
      if (response.ok) {
        const data = await response.json();
        setMusyrifList(data.users || []);
      }
    } catch (error) {
      console.error("Error loading musyrif:", error);
      toast.error("Gagal memuat data musyrif");
    } finally {
      setLoadingData(false);
    }
  })();
}, []);
```

_Or, if you keep `loadMusyrifList` outside, wrap in useCallback and include as a dependency._

---

### 2. **Default Value Bug in `setFormData`**

**Problem:**  
You are spreading `...halaqah` after your specific default properties.
If `halaqah` contains properties, this can override your intended defaults for new forms.

**Suggestion:**  
Move the spread (`...halaqah`) to the _top_ of the object.

```tsx
const [formData, setFormData] = useState<HalaqahFormData>({
  ...halaqah,
  name: halaqah?.name || "",
  description: halaqah?.description || "",
  level: halaqah?.level || "Pemula",
  type: halaqah?.type || "QURAN",
  capacity: halaqah?.capacity || 20,
  musyrifId: halaqah?.musyrifId || "",
  schedules: halaqah?.schedules || [],
});
```

---

### 3. **Stale `formData` for Prop Updates**

**Problem:**  
If the `halaqah` prop changes after mount (e.g., for edit vs create), `formData` does not update accordingly.

**Suggestion:**

```tsx
useEffect(() => {
  setFormData({
    ...halaqah,
    name: halaqah?.name || "",
    description: halaqah?.description || "",
    level: halaqah?.level || "Pemula",
    type: halaqah?.type || "QURAN",
    capacity: halaqah?.capacity || 20,
    musyrifId: halaqah?.musyrifId || "",
    schedules: halaqah?.schedules || [],
  });
}, [halaqah]);
```

---

### 4. **Number Fields: `onChange` Handler**

**Problem:**  
`type === "number" ? parseInt(value) || 0 : value` can lead to `"0"` when the field is cleared, which is problematic for required values and UX.

**Suggestion:**  
Use `value === "" ? "" : Number(value)` to allow the input to be empty—do not force to `0` while typing:

```tsx
setFormData((prev) => ({
  ...prev,
  [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
}));
```

---

### 5. **Form Validation: Schedule Room Field Missing**

**Problem:**  
Schedule validation does not require "room", but if it is required, add check. If optional, ignore.

If required:

```tsx
if (!schedule.room) {
  newErrors[`schedule_${index}_room`] = "Ruangan wajib diisi";
}
```

If truly optional, this can be omitted.

---

### 6. **String Comparison for Times**

**Problem:**  
`startTime >= endTime` works for `"HH:MM"` strings in lexicographical order, but is brittle (e.g., with seconds or different formats).

**Suggestion:**  
Convert times to minutes or use `Date` objects for safer comparison.

```tsx
function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
if (
  schedule.startTime &&
  schedule.endTime &&
  timeToMinutes(schedule.startTime) >= timeToMinutes(schedule.endTime)
) {
  newErrors[`schedule_${index}_endTime`] =
    "Waktu selesai harus lebih besar dari waktu mulai";
}
```

---

### 7. **Missing Key in List Components**

**Problem:**  
The schedules use `index` as a key; ideally, use a unique id (if available).

**Suggestion:**  
If schedules have no id, generate a temporary GUID or Date.now() when adding.

```tsx
// When adding:
{
  dayOfWeek: 1,
  startTime: "14:00",
  endTime: "16:00",
  room: "",
  tempId: Date.now() + Math.random()
}
// And in rendering:
<Card key={schedule.tempId ?? index} ...>
```

---

### 8. **Potential XSS via Textareas / Inputs**

**Problem:**  
If server-rendered values are displayed as HTML, sanitize. Here, only plain text is shown so not a concern.

---

### 9. **Consistency: Button Variant for "Delete"**

**Problem:**  
Delete/"Remove schedule" button uses "outline" + red text, but variant could be "destructive" if styled in the design system.

**Suggestion:**  
If your Button library supports it:

```tsx
<Button
  type="button"
  variant="destructive"
  onClick={...}
  ...
>
  <Trash2 .../>
</Button>
```

---

### 10. **Accessibility: Inputs and Labels**

**Problem:**  
`<label>` elements do not have a corresponding `htmlFor` property linking to the input's `id`, which may impact screen-readers.

**Suggestion:**

```tsx
<label htmlFor="halaqah-name" ...>Nama Halaqah *</label>
<Input id="halaqah-name" ... />
```

_Apply similar patterns for all input/label pairs._

---

### 11. **UI/UX: Error Clearing for Schedule Fields**

**Problem:**  
Errors for schedule fields only clear on parent-level field change, not when the user types into the nested schedule fields.

**Suggestion:**
In `updateSchedule`, clear related errors:

```tsx
if (errors[`schedule_${index}_${field}`]) {
  setErrors((prev) => ({ ...prev, [`schedule_${index}_${field}`]: "" }));
}
```

_Place after updating form state._

---

### 12. **Optimizations**

- **Avoid unnecessary renders:** e.g., useCallback for functions passed as props or deeply nested.
- **Extract some large inline functions/components to improve readability and maintainability.**

---

## Summary Table of Actions

| Issue # | Type          | Area              | Action Needed                 | Example Fix (Pseudo)     |
| ------- | ------------- | ----------------- | ----------------------------- | ------------------------ |
| 1       | Convention    | useEffect         | Move async inline             | See #1 suggestion        |
| 2       | Bug           | setFormData       | Change order of spread        | See #2                   |
| 3       | React Pattern | Prop Sync         | Add useEffect for prop update | See #3                   |
| 4       | UX/Bug        | onChange number   | Don't coerce to 0 on ""       | See #4                   |
| 5       | Validation    | schedule.room     | Add check if required         | See #5                   |
| 6       | Logic         | Time comparison   | Convert "HH:MM" safely        | See #6                   |
| 7       | React Key     | Map keys          | Use unique id for keys        | See #7                   |
| 8       | Security      |                   | (Acceptable for this context) | -                        |
| 9       | Consistency   | UI library Button | Use variant="destructive"     | See #9                   |
| 10      | Accessibility | Labels/Inputs     | Add htmlFor/id                | See #10                  |
| 11      | UX/Errors     | Error clearing    | Clear specific error          | See #11                  |
| 12      | Optimization  | Code splitting    | Extract logic                 | General, not single line |

---

## Most Important Lines to Change (Pseudo code)

```
// Change default formData spread order for correct initialization
setFormData({
  ...halaqah,
  name: halaqah?.name || "",
  // ...
});

// On props update (especially for edit mode support)
useEffect(() => {
  setFormData({.../* as above */})
}, [halaqah]);

// Safer number input parsing
setFormData((prev) => ({
  ...prev,
  [name]: type === "number"
    ? (value === "" ? "" : Number(value))
    : value,
}));

// Time comparison for validation
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
if (timeToMinutes(schedule.startTime) >= timeToMinutes(schedule.endTime)) {
   // error
}

// In updateSchedule, clear nested error when field changes
if (errors[`schedule_${index}_${field}`]) {
  setErrors((prev) => ({ ...prev, [`schedule_${index}_${field}`]: "" }));
}
```

---

## Additional Suggestions

- Extract schedules to their own memoized component if the form grows.
- Add tests for validateForm.
- Consider schema validation libraries (zod, yup).
- Document prop types and add more robust TypeScript interfaces as codebase grows.

---

# Conclusion

This code is quite solid for early-stage or in-house admin apps, but there is room for improvement in UX, validation, and maintainability. Addressing the above will ensure better reliability and scale-readiness!

---

**End of Report**
