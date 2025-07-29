# Code Review Report for AddHafalanModal

Below is a **critical review** of the provided code regarding industry standards, unoptimized patterns, error handling, maintainability and correctness.

---

## 1. **Default Value Issue in `editData` Usage**

**Problem:** `useState` is initialized with `editData` values, but `editData` can change after initial mount (e.g., when editing a different entry), yet `formData` will not update accordingly.

**Recommendation:** Use `useEffect` to synchronize `formData` with `editData` if `editData` changes.

#### Correction Pseudocode:

```pseudo
useEffect(() => {
  if (editData) {
    setFormData({ ...defaultFormData, ...editData, date: editData.date || today });
  } else {
    setFormData(defaultFormData);
  }
}, [editData, isOpen]);
```

_(Define `defaultFormData` as in your initial state definition for clarity.)_

---

## 2. **Mutating State Multiple Times in Single Handler**

**Problem:** `handleInputChange` calls `setFormData` multiple times conditionally. This can lead to race conditions due to React state batching.

**Recommendation:** Compose all updates into one object and call `setFormData` once per invocation.

#### Correction Pseudocode:

```pseudo
const handleInputChange = (field, value) => {
  let updates = { [field]: value };
  // Clear errors, auto-fill names, compute grades as needed, COMBINE in updates
  setFormData(prev => ({ ...prev, ...updates }))
}
```

_(Refactor so all computations, including autocompletes and grade, are combined before calling `setFormData`.)_

---

## 3. **Ayah Validation: Type Safety**

**Problem:** Comparing `parseInt(formData.ayahStart) > parseInt(formData.ayahEnd)` may fail or behave unexpectedly when values are `""` (empty string), `undefined`, etc.

**Recommendation:** Validate both values exist before comparing, and ensure both are valid numbers.

#### Correction Pseudocode:

```pseudo
if (formData.ayahStart && formData.ayahEnd) {
  const ayahStartNum = parseInt(formData.ayahStart, 10);
  const ayahEndNum = parseInt(formData.ayahEnd, 10);
  if (!isNaN(ayahStartNum) && !isNaN(ayahEndNum) && ayahStartNum > ayahEndNum) {
    newErrors.ayahEnd = "Ayat akhir harus lebih besar dari ayat awal";
  }
}
```

---

## 4. **Numeric Inputs: Values Must Be Numbers**

**Problem:** All form fields are strings, including numbers. This can lead to bugs especially for validation, calculations, and API payload expectations.

**Recommendation:** Store numeric fields as numbers in state, especially for fields like `ayahStart`, `ayahEnd`, `tajwid`, etc.

#### Correction Pseudocode:

```pseudo
onChange(e):
  value = e.target.value
  if (field in ["ayahStart", "ayahEnd", "duration", "tajwid", "kelancaran", "fashahah"])
      value = parseInt(value, 10)
      if (isNaN(value)) value = ""
  handleInputChange(field, value)
```

---

## 5. **Resetting Form After Save: Potential UX Bug with Edit**

**Problem:** Calling `setFormData(default)` after `onClose` means if the modal is instantaneously opened again (e.g. for 'edit'), user sees default form then editData few ms later, leading to flicker.

**Recommendation:** Reset only when adding; on edit, state is driven by `editData`+`isOpen` in a `useEffect`.

#### Correction Pseudocode:

```pseudo
// Remove reset logic from handleSave
onSave(hafalanData)
onClose()
```

---

## 6. **Magic Strings for Types and Status**

**Problem:** Hardcoded strings used everywhere for `type`, `status`, etc. No central definition.

**Recommendation:** Use enums or constant objects.

#### Correction Pseudocode:

```pseudo
const HAFALAN_TYPES = { SETORAN: "SETORAN", MURAJAAH: "MURAJAAH", TASMI: "TASMI" };
const EVALUASI_STATUS = { PENDING: "PENDING", APPROVED: "APPROVED", NEEDS_IMPROVEMENT: "NEEDS_IMPROVEMENT" };
```

---

## 7. **Repetitive Error Message Handling**

**Problem:** Repeating error messages for each field.

**Recommendation:** Consider a helper method to display error messages for each field.

#### Correction Pseudocode:

```pseudo
function FieldError({ error }) {
  return error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null;
}
```

_(Then use `<FieldError error={errors.santriId} />` instead of repeating the `<p>` block every time.)_

---

## 8. **Form Accessibility**

**Problem:** Inputs and selects lack explicit `id`/`htmlFor` associations.

**Recommendation:** Add `id` to input/select and `htmlFor` to label.

#### Correction Pseudocode:

```pseudo
<label htmlFor="surah" ...>Surah</label>
<select id="surah" ... />
```

---

## 9. **Key Prop on Option in Surah/Musyrif**

**Problem:** In the surah dropdown: `<option key={surah} value={surah}>` is fine unless a surah is present twice. For safety: use index for simple arrays.

#### Correction Pseudocode:

```pseudo
{surahList.map((surah, idx) => (
  <option key={surah + idx} ...>
```

---

## 10. **Date Handling: Time Zone**

**Problem:** Using `toISOString().split("T")[0]` can cause date jumps due to TZ differences.

**Recommendation:** Use local date formatting for initial value.

#### Correction Pseudocode:

```pseudo
const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd
// in formData default: date: editData?.date || today
```

---

# Summary

The provided code is functional and clear, but it can be improved for reliability, maintainability and user experience. The above points address:

- **State synchronization and avoiding stale values**
- **Capturing all updates per input change in one batch**
- **Correct validation with type safety**
- **Consistent numeric field handling**
- **Form reset and modal opening logic**
- **Minimizing magic strings**
- **Reducing repetition for errors**
- **Improving accessibility**
- **Better date handling for different locales**

## **Please implement the above **pseudocode corrections** in your codebase for robust, industry-grade React code!**
