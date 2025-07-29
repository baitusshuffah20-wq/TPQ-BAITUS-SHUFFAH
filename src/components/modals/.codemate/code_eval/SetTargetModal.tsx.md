# Software Code Review Report

## Target: `SetTargetModal` Component

**Reviewed for:**

- Unoptimized/inefficient code patterns.
- Violations of React and TypeScript best practices.
- Potential bugs and undefined behavior.
- Omitted error cases, memory leaks, or usability traps.
- Adherence to modern coding standards.

---

---

## 1. Inefficient or Unstable State/Prop Handling

### Observed Problem

**A. State Initialization based on props**

- `formData` is initialized with prop values once, but if `santriId` or `santriName` prop changes (while modal open), form will not update accordingly.

#### Correction (pseudocode):

```js
// Add effect to sync prop changes when modal opens or santriId/santriName changes.
useEffect(() => {
  if (!existingTarget) {
    setFormData((prev) => ({
      ...prev,
      santriId: santriId || "",
      santriName: santriName || "",
    }));
  }
}, [isOpen, santriId, santriName]);
```

---

## 2. Incorrect Use of Keys or Mapping in Rendering

### Observed Problem

**A. Use of array indices as keys or unstable IDs can lead to issues if the array changes. (None observed in current mapping, but best to double check that all mapped elements have true unique keys.)**

#### Correction:

Check that for all `.map`, the key is unique and stable from source data (already correct in your code).

---

## 3. Potential Fetch Memory Leak

### Observed Problem

**A. `loadSantriList` async function in useEffect is not guarded against unmount/race conditions. If the modal is closed quickly, fetch's setState may cause React warning.**

#### Correction (pseudocode):

```js
useEffect(() => {
  let isMounted = true;

  const loadSantriList = async () => {
    // ... as before ...
    if (isMounted) {
      setSantriList(data);
    }
  };

  if (!santriId) {
    loadSantriList();
  }

  return () => {
    isMounted = false;
  };
}, [santriId]);
```

---

## 4. Form Reset May Not Cover All Cases

### Observed Problem

**A. `resetForm` does not consider whether the modal should be fully reset on close. If modal is closed and reopened with a different prop, the form might not be as expected.**

#### Correction:

Call `resetForm()` inside a `useEffect` on `isOpen === false`, or when `onClose` is called.

```js
// Add this effect:
useEffect(() => {
  if (!isOpen) {
    resetForm();
  }
}, [isOpen]);
```

---

## 5. Data Types, Edge Cases, and "Magic" Defaults

### Observed Problems

**A. Surah selection: If surah is changed and targetAyahs is set to 0, user might submit an invalid target.  
B. `targetAyahs` should default to surah's totalAyahs when picking a surah; user can lower but not exceed max.**

#### Correction:

```js
const handleSurahChange = (surahId: number) => {
  const surah = getSurahById(surahId);
  setFormData(prev => ({
    ...prev,
    surahId,
    targetAyahs: surah?.totalAyahs || 1, // Use 1 instead of 0 to prevent impossible 0-target.
  }));
};
```

- In the form: set min={1} for input type number for targetAyahs input.

---

## 6. Form Input Validation

### Observed Problem

**A. In `handleSubmit`, you check `!formData.santriId || !formData.surahId || !formData.targetDate`, but not for `targetAyahs > 0`.  
B. Date inputs could be persisted in invalid order (targetDate before startDate)**

#### Correction:

```js
if (
  !formData.santriId ||
  !formData.surahId ||
  !formData.targetDate ||
  formData.targetAyahs < 1
) {
  toast.error("Mohon lengkapi semua field yang diperlukan");
  return;
}

// After: Check for logical date order
if (formData.targetDate < formData.startDate) {
  toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
  return;
}
```

---

## 7. Accessibility

### Observed Problems

**A. Some labels missing `htmlFor` property.  
B. Add ARIA roles where appropriate especially for the modal container.**

#### Correction:

```jsx
// Example for label association:
<label htmlFor="input-id">
  Label Text
</label>
<input id="input-id" ... />

// For modal container:
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  ...
>
```

---

## 8. UI/UX: Date Inputs

### Observed Problem

If the date fields allow picking past dates, it could cause logical errors.

#### Correction:

```jsx
// Prevent picking a startDate in the past:
<input
  type="date"
  value={formData.startDate}
  min={new Date().toISOString().split("T")[0]}
  ...
/>

// Prevent targetDate before startDate as already corrected above
```

---

## 9. Modal Portal Isolation

### Observed Problem

Modal rendered in parent’s tree, may not always be accessible/visible as expected, especially if the parent changes layout via overflow:hidden, z-index layers, etc.

#### Suggestion (not code, architectural):

- Either use a React Portal for modal rendering (`ReactDOM.createPortal`) or ensure parent allows overflow/visibility for fixed modals.

---

## 10. Performance: Repeated Fetching

### Observed Problem

Each open (if no santriId) causes `/api/santri` fetch, which may be unnecessary if modal is frequently toggled open/close.

#### Correction:

Cache santriList in a context or at least atop the modal’s state if possible to minimize API calls.

```js
// Pseudocode idea, not literal code:
const [santriList, setSantriList] = useSantriCache();
```

---

## 11. Component Extraction

### Observed Problem

Large fat component with multiple responsibility (`SetTargetModal` is >500 lines).  
Recommended to split into:

- TemplateSelector
- TargetForm
- ReminderSettings
- TargetSummary

---

## 12. Minor: Use of `console.log`

### Observed Problem

Development-only logs such as `console.log("Memuat daftar santri...");` should be removed for production.

#### Correction:

Remove all `console.log` statements or wrap with environment checks.

---

# Summary of Corrections

```js
// 1. Sync formData santri fields to prop on prop change:
useEffect(() => {
  if (!existingTarget) {
    setFormData(prev => ({
      ...prev,
      santriId: santriId || "",
      santriName: santriName || "",
    }));
  }
}, [isOpen, santriId, santriName]);

// 2. Guard API fetch memory leak:
useEffect(() => {
  let isMounted = true;
  // ... in loadSantriList: if (isMounted) { setSantriList(...) }
  return () => { isMounted = false };
}, [santriId]);

// 3. Reset form on modal close:
useEffect(() => {
  if (!isOpen) { resetForm(); }
}, [isOpen]);

// 4. Prevent zero ayahs:
const handleSurahChange = (surahId: number) => {
  const surah = getSurahById(surahId);
  setFormData(prev => ({
    ...prev,
    surahId,
    targetAyahs: surah?.totalAyahs || 1,
  }));
};

// 5. Input validation in handleSubmit:
if (
  !formData.santriId ||
  !formData.surahId ||
  !formData.targetDate ||
  formData.targetAyahs < 1
) {
  toast.error("Mohon lengkapi semua field yang diperlukan");
  return;
}
if (formData.targetDate < formData.startDate) {
  toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
  return;
}

// 6. Accessibility (for each input):
<label htmlFor="form-surah">Pilih Surah *</label>
<select id="form-surah" ... />

// 7. Modal container ARIA:
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" ... >

// 8. Date input min value for startDate:
<input
  type="date"
  value={formData.startDate}
  min={new Date().toISOString().split("T")[0]}
  ...
/>
```

---

## Final Notes

- Your implementation is already robust and maintainable, but addressing above items will improve resiliency, accessibility, stability, and forward maintainability.
- **Most important:** validate form logic more strictly, cleanup async fetches, and ensure prop synchronization.

---

**END OF REVIEW**
