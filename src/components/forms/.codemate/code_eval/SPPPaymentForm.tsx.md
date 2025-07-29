# Code Review Report — `SPPPaymentForm` Component

### Assessment Criteria:

- **Industry standards & best practices**
- **Optimization issues**
- **Potential errors and type issues**
- **Robustness**

---

## 1. **Dependency Initialization and setState on Mounted**

### Issue

- `loadAccounts()` and `generateReceiptNumber()` are called synchronously in a single `useEffect`, but both perform state updates.
- Potential issue: Outdated state if accounts arrive after initial mounting. Account state initialization should not overlap with receipt generation which could use stale data.

### Suggestion

- Separate `useEffect`s and properly handle asynchrony in account setting (wait for fetch).

#### Pseudocode

```js
// Use separate useEffect for generating receipt number
useEffect(() => {
  generateReceiptNumber();
}, []); // Only once on mount

useEffect(() => {
  loadAccounts();
}, []);
```

- To avoid overwriting `accountId` by async fetching after some user interaction, only set it if it is still empty:

```js
// Inside loadAccounts, after fetching accounts successfully
if (data.accounts && data.accounts.length > 0 && !formData.accountId) {
  setFormData((prev) => ({ ...prev, accountId: data.accounts[0].id }));
}
```

---

## 2. **Uncontrolled/Controlled and Type Coercion on Input Change**

### Issue

- `handleChange` applies `parseFloat` to all inputs of type `"number"`. But React's number inputs can return `""` (empty string), leading to `NaN` or `0` unintentionally.
- For optional/empty fields, this breaks intention.

### Suggestion

- Distinguish empty values and ensure only numbers are parsed if valid, else keep empty string or original value for optional fields.

#### Pseudocode

```js
// In handleChange:
setFormData((prev) => ({
  ...prev,
  [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
}));
```

---

## 3. **Input Validation — Edge Cases**

### Issue

- Discount and fine are set to 0 if empty, meaning user can’t erase numbers. This can cause unexpected behavior in UX.
- Missing check: Negative/empty fine and discount handling for optional cases.

### Suggestion

- Allow empty string as value (for minimal UX friction), and only validate on form submit.

#### Pseudocode

```js
// In validateForm, treat "" properly
if (formData.discount === "" || formData.discount < 0) {
  newErrors.discount = "Diskon tidak boleh negatif";
}
if (formData.fine === "" || formData.fine < 0) {
  newErrors.fine = "Denda tidak boleh negatif";
}
```

---

## 4. **Asynchronous State Updates and Race Condition**

### Issue

- Directly using `formData` after setting it in `loadAccounts` async handler may cause a race condition if multiple async calls overlap.

### Suggestion

- Set default account only if it’s still empty (see above).

---

## 5. **Number Input Step Attribute & Currency Formatting**

### Issue

- Using `"step=1000"` hard-coded for all monetary inputs may not be flexible for SPP in smaller denominations or future changes.

### Suggestion

- Make `step` a constant or prop, or use `1` by default, unless only thousands are allowed.

#### Pseudocode

```js
// Example:
<Input step={props.step ?? 1} ... />
```

---

## 6. **Potential Error: Type Safety for Accounts**

### Issue

- `accounts` state typed as `any[]`.

### Suggestion

- Use strict typing for account items to avoid runtime errors.

#### Pseudocode

```ts
interface Account {
  id: string;
  name: string;
  type: string;
}

const [accounts, setAccounts] = useState<Account[]>([]);
```

---

## 7. **Date Comparison Without Zeroing Time**

### Issue

- `new Date(sppRecord.dueDate) < new Date()` can fail if today is due date (because time of day is included).

### Suggestion

- Compare only the date part.

#### Pseudocode

```js
const isOverdue = (d1, d2) => d1.setHours(0, 0, 0, 0) < d2.setHours(0, 0, 0, 0);

// Use in render:
isOverdue(new Date(sppRecord.dueDate), new Date());
```

---

## 8. **Random Receipt Number Generation Collision**

### Issue

- Random 3-digit number can lead to high chance of duplicate receipt numbers.

### Suggestion

- Use a UUID, timestamp, or increase randomness/uniqueness.

#### Pseudocode

```js
const receiptNumber = `SPP${year}${month}${Date.now().toString().slice(-6)}`; // Or add random
```

---

## 9. **Accessibility — Input Labels**

### Issue

- Inputs associate label visually but not structurally (no `htmlFor`).

### Suggestion

- Use `label htmlFor` & input `id` for accessibility.

#### Pseudocode

```jsx
<label htmlFor="discount" ...>Diskon</label>
<Input id="discount" ... />
```

---

## 10. **Magic Strings and Hard-Coded Values**

### Issue

- Statuses and some labels are sprinkled as magic strings.

### Suggestion

- Store statuses as enums/constants.

#### Pseudocode

```ts
const STATUS = { PAID: "PAID", PENDING: "PENDING", ... }
```

---

## 11. **Form Button Loading State Due to Async onSubmit**

### Issue

- Form could be submitted multiple times quickly before `isLoading` is set.

### Suggestion

- Debounce/throttle or immediately set local `isLoading` when `handleSubmit` starts.

#### Pseudocode

```js
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (...) => {
  if (submitting) return;
  setSubmitting(true);
  try { ... }
  finally { setSubmitting(false); }
}

// Button: disabled={isLoading || submitting}
```

---

## 12. **No Memoization for Expensive Methods**

### Issue

- Methods like `formatCurrency` or `getMonthName` are not memoized/reused (minor impact).

### Suggestion

- For large forms, consider `useMemo` for static functions.

---

## 13. **UI/Layout**

### Issue

- Not a major code issue, but consider handling potential overflow/large data in select menus.

---

## 14. **Optional: Internationalization**

### Issue

- Strings hardcoded.

### Suggestion

- Use i18n library if the app will support more than Bahasa Indonesia.

---

# **Conclusion**

This component is clear and functional, but improving type safety, user experience for forms, avoiding async state bugs, and adhering to accessibility standards will make the code more robust and maintainable.

---

### **SUMMARY OF CORRECTED/IMPROVED CODE SNIPPETS**

```js
// Use separate useEffect calls for different side-effects
useEffect(() => { generateReceiptNumber(); }, []);
useEffect(() => { loadAccounts(); }, []);

// Set accountId only if it's empty (prevents overwriting user edits)
if (data.accounts && data.accounts.length > 0 && !formData.accountId) {
  setFormData((prev) => ({ ...prev, accountId: data.accounts[0].id }));
}

// In handleChange: allow empty string for controlled inputs
setFormData(prev => ({
  ...prev,
  [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
}));

// Validate discount and fine for empty string and negatives
if (formData.discount === "" || formData.discount < 0) {
  newErrors.discount = "Diskon tidak boleh negatif";
}

// Use strict typing for accounts
interface Account { id: string; name: string; type: string; }
const [accounts, setAccounts] = useState<Account[]>([]);

// Safer date comparisons (zero out time)
const isOverdue = (d1, d2) => (d1.setHours(0,0,0,0) < d2.setHours(0,0,0,0));
// In render: isOverdue(new Date(sppRecord.dueDate), new Date())

// More unique receipt number
const receiptNumber = `SPP${year}${month}${Date.now().toString().slice(-6)}`;

// Use button disabled state safely to prevent rapid double submission
const [submitting, setSubmitting] = useState(false);
<Button disabled={submitting || isLoading} ... />

// For accessibility
<label htmlFor="discount">Diskon</label>
<Input id="discount" ... />

// Define PAYMENT_METHODS and statuses as typed constants/enums for maintainability
```

---

**Apply these improvements for a more robust, maintainable, and user-friendly SPPPaymentForm!**
