# Code Review Report

## General Assessment

The provided code is a React function component for a transaction form with TypeScript typings. It is comprehensive and follows modern React idioms. However, there are several points to address regarding industry standards, unoptimized implementations, and potential errors.

Below are the critical observations and the respective suggestions. Only snippets of code to be corrected/optimized are included as requested.

---

## 1. **Default State Initialization is Redundant and Error-Prone**

**Observation:**  
The default `formData` state object redundantly assigns properties both individually and spreads the `transaction` object, which can lead to unexpected overrides.

**Current code:**

```js
const [formData, setFormData] =
  useState <
  TransactionFormData >
  {
    type: transaction?.type || "INCOME",
    category: transaction?.category || "",
    amount: transaction?.amount || 0,
    description: transaction?.description || "",
    reference: transaction?.reference || "",
    accountId: transaction?.accountId || "",
    santriId: transaction?.santriId || "",
    donationId: transaction?.donationId || "",
    paymentId: transaction?.paymentId || "",
    transactionDate:
      transaction?.transactionDate || new Date().toISOString().split("T")[0],
    attachments: transaction?.attachments || [],
    tags: transaction?.tags || [],
    ...transaction,
  };
```

**Correction Suggestion:**

```js
const defaultFormData: TransactionFormData = {
  type: "INCOME",
  category: "",
  amount: 0,
  description: "",
  reference: "",
  accountId: "",
  santriId: "",
  donationId: "",
  paymentId: "",
  transactionDate: new Date().toISOString().split("T")[0],
  attachments: [],
  tags: [],
};

const [formData, setFormData] = useState<TransactionFormData>({
  ...defaultFormData,
  ...transaction,
});
```

---

## 2. **Form Data Not Updated on Props Change**

**Observation:**  
If the `transaction` prop changes (e.g., switching from add to edit mode), `formData` doesn't update accordingly.

**Correction Suggestion:**

```js
useEffect(() => {
  setFormData({
    ...defaultFormData,
    ...transaction,
  });
}, [transaction]);
```

---

## 3. **Potential Memory Leak: Unmounted Component State Update**

**Observation:**  
When the component unmounts while `loadSelectData` is running, you may get a "state update on unmounted component" warning.

**Correction Suggestion:**

```js
useEffect(() => {
  let isMounted = true;
  const loadData = async () => {
    setLoadingData(true);
    try {
      // ...fetch logic
      if (isMounted) {
        /* state updates */
      }
    } finally {
      if (isMounted) setLoadingData(false);
    }
  };
  loadData();
  return () => {
    isMounted = false;
  };
}, []);
```

---

## 4. **Event Handler: `handleChange` Improperly Resets Category**

**Observation:**  
Currently, when "type" changes, the handler may set category to empty **multiple times** due to two calls to setFormData in the same event tick, leading to race conditions.

**Correction Suggestion:**

```js
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;

  setFormData(prev => {
    let updated = {
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    };

    if (name === "type") {
      updated.category = "";
    }

    return updated;
  });

  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: "" }));
  }
};
```

---

## 5. **Currency Formatting and Negative Value Display**

**Observation:**  
In the preview, it always prepends "-" for expenses and "+" for incomes, but the formatting doesn't account for amount zero (which can be misleading).

**Correction Suggestion:**

```js
<p
  className={`text-lg font-bold ${formData.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
>
  {formData.amount > 0 ? (formData.type === "EXPENSE" ? "-" : "+") : ""}
  {formatCurrency(formData.amount)}
</p>
```

---

## 6. **Missing Key Handling for Select Options**

**Observation:**  
No validation for the uniqueness of `account.id` or `santri.id` keys in mapping options. If data can ever have duplicate IDs, consider using a unique composite key, but for most DBs this is acceptable.

**Suggested Action:**  
Document and ensure backends enforce unique IDs. (No code change normally necessary.)

---

## 7. **Unused Imports:**

**Observation:**  
Lucide-react icons `Calendar`, `FileText`, `Upload`, `Tag`, and the `Badge` are imported but unused.

**Correction Suggestion:**

```js
// Remove: Calendar, FileText, Upload, Tag, Badge import statements
```

---

## 8. **`handleSubmit`: No Success Notification**

**Observation:**  
No positive feedback on successful submit (UX improvement).

**Correction Suggestion:**

```js
await onSubmit(submitData);
toast.success("Transaksi berhasil disimpan.");
```

---

## 9. **Hardcoded Fields Should Be Named Constants**

**Observation:**  
Repeated magic values like "INCOME", "EXPENSE", and the minimum description length.

**Correction Suggestion:**

```js
const MIN_DESCRIPTION_LENGTH = 5; // Use in validation
const TRANSACTION_TYPES = ["INCOME", "EXPENSE"];
```

---

## 10. **Accessibility: Add `aria-` Attributes**

**Observation:**  
Inputs and selects are missing `aria-required` for fields marked as required.

**Correction Suggestion Example:**

```js
<select aria-required="true" ... />
<Input aria-required="true" ... />
```

---

## 11. **Security: Validate Data on Backend as Well**

**Observation:**  
Client-side validation is present, but server-side validation is not mentioned.  
**Correction:** Document the need for backend validation for financial applications. _(No code line, documentation only.)_

---

## 12. **Code Duplication in Transaction Type Rendering**

**Observation:**  
The two radio buttons for type are nearly copy-pasted.

**Correction Suggestion:**  
Refactor into a mapped array for clarity and maintainability.

```js
const txTypes = [
  {
    value: "INCOME",
    icon: <TrendingUp className="h-6 w-6 text-green-600" />,
    label: "Pemasukan",
    description: "Dana masuk ke TPQ",
    selectedClass: "border-green-500 bg-green-50",
    hoverClass: "border-gray-300 hover:border-green-300",
  },
  {
    value: "EXPENSE",
    icon: <TrendingDown className="h-6 w-6 text-red-600" />,
    label: "Pengeluaran",
    description: "Dana keluar dari TPQ",
    selectedClass: "border-red-500 bg-red-50",
    hoverClass: "border-gray-300 hover:border-red-300",
  },
];

// In render:
{
  txTypes.map((t) => (
    <label
      key={t.value}
      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${formData.type === t.value ? t.selectedClass : t.hoverClass}`}
    >
      <input
        type="radio"
        name="type"
        value={t.value}
        checked={formData.type === t.value}
        onChange={handleChange}
        className="sr-only"
        disabled={isLoading}
      />
      {t.icon}
      <div>
        <p className="font-medium text-gray-900">{t.label}</p>
        <p className="text-sm text-gray-600">{t.description}</p>
      </div>
    </label>
  ));
}
```

---

## 13. **Minor: Use Consistent Quotation (" or ')**

Consistency helps maintain code uniformity. Project-wise, choose one and apply.

---

## Summary Table

| Issue # | Description                              | Severity | Suggestion                               |
| ------- | ---------------------------------------- | -------- | ---------------------------------------- |
| 1       | Redundant formData initialization        | Medium   | Use a default object, spread transaction |
| 2       | State not updated on prop change         | Major    | Add a useEffect on transaction prop      |
| 3       | Memory leak on async load                | Medium   | Use mounted flag in async effect         |
| 4       | handleChange potential race condition    | Major    | Apply single setFormData with logic      |
| 5       | Inaccurate currency sign for zero amount | Low      | Show sign only when amount > 0           |
| 6       | Select options key uniqueness            | Low      | Document requirement                     |
| 7       | Unused imports                           | Low      | Remove them                              |
| 8       | No success notification                  | Minor    | Add toast.success                        |
| 9       | Magic values                             | Low      | Use named constants                      |
| 10      | aria attributes/accessibility            | Low      | Add aria attributes to required fields   |
| 11      | No backend validation noted              | High     | Document need for backend validation     |
| 12      | Code duplication in type switch          | Low      | Refactor with map array                  |
| 13      | Quotation consistency                    | Low      | Project linting/config                   |

---

## **Final Notes**

- Apply above changes for optimal maintainability, correctness, and scalability.
- Ensure parity between frontend and backend validation.
- Consider adding comprehensive tests for transaction form component.

---

**End of Review**
