# Code Review Report

---

## General Notes

- The code is largely clear, modular, and readable.
- The code follows React and general JS/TS conventions.
- There are some areas where improvements can be made for optimization, consistency, type safety, and future extensibility.
- Mock data is used, indicating this is not final production code.

---

## Issues, Suggestions & Corrections

### 1. **Type Safety and TypeScript Usage**

#### Problem

- You are passing payment objects around which have an ad-hoc structure.
- Use of `any`-like (implicit) object shapes hurts maintainability.

#### Fix (`Payment` interface)

```typescript
interface Payment {
  id: string;
  type: string;
  month: string;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  description: string;
  childName: string;
  childId: string;
  paidDate?: string;
  paymentMethod?: string;
}
```

- Add: `const payments: Payment[] = [ ... ];`
- Also add types to all relevant functions, e.g.:

```typescript
const getStatusColor = (status: Payment["status"]) => { ... }
const getStatusIcon = (status: Payment["status"]) => { ... }
const formatCurrency = (amount: number): string => { ... }
```

---

### 2. **Date Manipulation and Display**

#### Problem

- Dates are displayed as raw strings (`payment.dueDate`, `payment.paidDate`).
- This could lead to poor UX for localized users. Use a date formatter.

#### Fix

```typescript
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
// Usage:
<span className="text-sm text-gray-500">Jatuh tempo: {formatDate(payment.dueDate)}</span>
```

---

### 3. **Avoid Inefficient Filtering (DRY Principle)**

#### Problem

- You're repeatedly filtering `payments` array for each tab and calculation.
- This is inefficient as the data grows.

#### Fix

```typescript
const paymentByStatus = React.useMemo(() => {
  return payments.reduce(
    (acc, p) => {
      acc[p.status] = acc[p.status] || [];
      acc[p.status].push(p);
      return acc;
    },
    { PAID: [], PENDING: [], OVERDUE: [] } as Record<string, Payment[]>,
  );
}, [payments]);
```

- Then access:
  - `const pendingPayments = paymentByStatus.PENDING;`
  - `const overduePayments = paymentByStatus.OVERDUE;`
  - etc.

---

### 4. **Case Consistency in Status Checks**

#### Problem

- Mixed use of lowercase/uppercase across status variables.
- `selectedTab` is lowercased, while `payment.status` is UPPERCASE.

#### Fix

- Normalize `selectedTab` to uppercase where you use it for filtering.

```typescript
const matchesTab =
  selectedTab === "ALL" || payment.status === selectedTab.toUpperCase();
```

- Also, define the tab keys in uppercase for clarity, or normalize both sides on comparison.

---

### 5. **Conditional Rendering Logic (“else” Preferred)**

#### Problem

- Status display logic is less extensible and less readable.

```jsx
{
  payment.status === "PAID"
    ? "Lunas"
    : payment.status === "PENDING"
      ? "Menunggu"
      : "Terlambat";
}
```

#### Fix

```typescript
const getStatusLabel = (status: Payment["status"]) => {
  switch (status) {
    case "PAID":
      return "Lunas";
    case "PENDING":
      return "Menunggu";
    case "OVERDUE":
      return "Terlambat";
    default:
      return status;
  }
};
// Usage: {getStatusLabel(payment.status)}
```

---

### 6. **Performance: Keys in List Rendering**

#### Problem

- In list mapping, keys should be unique & stable.
- `payment.id` is suitable; if unsure, confirm it's unique.

#### Fix

**No code change needed if you’re confident**.

---

### 7. **Component Extraction for Payment List Item**

#### Problem

- The payment card rendering block is large, and could be a separate presentational component for clarity, reduce indentation, and reusability.

#### Suggestion (pseudo-structure)

```typescript
// Create a PaymentListItem component
const PaymentListItem = ({ payment }: { payment: Payment }) => ( ... );
// Usage: <PaymentListItem payment={payment} />
```

---

### 8. **Mock Data Separation**

#### Problem

- Mock data defined in the component will re-initialize on every render.
- Also, mixing business/data logic with UI.

#### Suggestion

- Move mock payment data to a separate utility module/file.
- Use `useMemo` if the data is purely static and stays inside the component.

---

### 9. **Unused Imports and Icons**

#### Problem

- Several imported icons aren’t used in the file.

#### Fix

- Remove unused icons from the import statement.

---

### 10. **Accessibility**

#### Problem

- Lack of semantic labels/ARIA attributes on buttons and inputs may hinder accessibility.

#### Fix (examples)

```tsx
<Button aria-label="Unduh Riwayat">
...
<input
  aria-label="Cari pembayaran"
  ...
/>
```

---

## Summary Table

| **Issue**            | **Severity** | **Action**            |
| -------------------- | ------------ | --------------------- |
| Type Safety          | High         | Add type/interface    |
| Date Formatting      | Medium       | Add formatter fn      |
| Inefficient Filter   | Medium       | Use `useMemo`         |
| Status Key Casing    | Medium       | Normalize casing      |
| Status Label Logic   | Low          | Move to function      |
| List Item Extraction | Low          | Refactor component    |
| Mock Data Placement  | Low          | Move out or `useMemo` |
| Unused Imports       | Low          | Remove unused         |
| Accessibility        | Medium       | Add ARIA labels       |

---

### **Recommended Corrected Code Snippets**

#### **Type for Payment and Function signatures**

```typescript
interface Payment { ... } // see above

const payments: Payment[] = [ ... ];
const getStatusColor = (status: Payment["status"]) => { ... }
const getStatusIcon = (status: Payment["status"]) => { ... }
```

#### **Date Formatter**

```typescript
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
// Use: formatDate(payment.dueDate)
```

#### **Optimized Filter via useMemo**

```typescript
const paymentByStatus = React.useMemo(() =>
  payments.reduce((acc, p) => { ... }, { PAID: [], PENDING: [], OVERDUE: [] } as Record<string, Payment[]>), [payments]
);
```

#### **Casing Consistency in Filtering**

```typescript
const matchesTab =
  selectedTab === "all" ||
  payment.status.toLowerCase() === selectedTab.toLowerCase();
```

#### **Status Label Function**

```typescript
const getStatusLabel = (status: Payment["status"]) => { ... }
// Usage: {getStatusLabel(payment.status)}
```

#### **Accessibility Example**

```tsx
<Button aria-label="Unduh Riwayat">
<input aria-label="Cari pembayaran" ... />
```

---

## **Final Assessment**

- The code is solid for demo/mock data, but some production-level issues (typing, memoization, accessibility, code modularity) must be addressed.
- The above changes will substantially help with maintainability, readability, and performance as the codebase and dataset grow.
