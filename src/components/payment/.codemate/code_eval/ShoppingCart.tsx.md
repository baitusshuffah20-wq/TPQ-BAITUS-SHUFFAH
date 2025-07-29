# Code Review Report

## General Observations

- Adheres to modern React/Next.js patterns (`use client`, function components, hooks).
- Good modularity, clear naming, and code organization.
- UI feedback mechanisms (toasts, loading indicators, disabled buttons) are in place.

However, there are coding issues, industry best practices overlooked, and optimizations possible. Below is a detailed critique and **pseudocode snippets** for corrections.

---

## 1. Error/Edge Handling and UX issues

#### **A. Possible Memory Leak on Unmounted Components (Async State Updates)**

If the user switches away from the component before `loadCart`, `updateQuantity`, or removal APIs finish, React might log "Can't perform a React state update on an unmounted component".

**Correction:**

Add a cleanup variable in `useEffect` and check in async calls before setting state:

```pseudo
// Before useEffect:
let isMounted = true;

// Inside useEffect and each async method:
useEffect(() => {
    isMounted = true;
    loadCart();
    return () => { isMounted = false; };
}, [cartId]);

// In async functions
if (isMounted) {
    setCartSummary(...);
    setLoading(false);
}
```

---

#### **B. Unnecessary Forced Non-Null Assertion (`!`) on `item.id`**

If `item.id` is possibly undefined, band-aiding it with `!` is risky and can mask real bugs. But your CartItem interface guarantees `id` string, so assertion not needed.

**Correction:**

```pseudo
// Change:
onClick={() => updateQuantity(item.id!, item.quantity - 1)}
// to:
onClick={() => updateQuantity(item.id, item.quantity - 1)}
```

(Repeat for all `.id!` and `.id!` in remove and add.)

---

#### **C. No Error Handling for Non-OK fetches in loadCart**

Currently, failed fetch (like 404 or 500) won’t show a toast unless there’s a JS error (network error, never http error).

**Correction:**

```pseudo
if (response.ok) {
    // as is
} else {
    toast.error("Gagal memuat keranjang");
}
```

---

## 2. Best Practices: API Efficiency and Data Consistency

#### **A. Redundant Reload After Every Update/Remove**

Using `await loadCart()` after every cart change is functionally safe but may lead to **extra API calls** and sometimes a delayed UI update.

**Improvement:**

Optimistically update UI, and (optionally) re-sync with loadCart after API resolve:

```pseudo
// After successful add/update/delete:
update only affected item(s) in state immediately
// optionally
await loadCart();
```

---

#### **B. Magic Strings for Item Types**

For better readability and error-proofing, extract magic values to an enum.

```pseudo
// Add:
const ITEM_TYPE = { SPP: "SPP", DONATION: "DONATION", ... }

// Use:
switch(itemType) {
    case ITEM_TYPE.SPP:
        ...
}
```

---

## 3. UI/UX

#### **A. Double Negative on the Decrement Button**

The decrement (-) button is disabled if quantity is <= 1 (prevents going negative), which is correct. But you should consider disabling decrement if already updating _or_ quantity is 1.

**Your code is correct here**, just noting it's a good practice.

---

#### **B. No Confirm Dialog on Clear Cart**

Destructive actions (“Kosongkan”) should be confirmed to prevent accidental clicks.

**Correction:**

```pseudo
onClick={() => {
    if (confirm("Kosongkan keranjang? Anda yakin?")) {
        clearCart();
    }
}}
```

---

#### **C. Checkout Button Should Be Disabled When Cart Is Empty or Loading**

Currently, handled because you render “empty cart” state separately. But for future-proofing:

```pseudo
<Button disabled={loading || !cartSummary || cartSummary.items.length === 0} ...>
```

---

## 4. Performance/Rendering

#### **A. No useMemo For formatCurrency / getItemIcon / getItemBadge**

These functions are cheap, but could be wrapped in `useCallback` for optimization if the list is long.

```pseudo
const formatCurrency = useCallback((amount) => { ... }, []);
```

---

#### **B. Key Prop for Iteration**

**You use `item.id` as key for list rendering -- this is correct**.

---

## 5. Type Safety

#### **A. Type `metadata?: any;`**

Where possible, avoid `any`. Type metadata more strictly, or use `unknown` and type guard.

---

## Summary of Major Code Suggestions

### 1. Guard Async State Updates (Prevent Memory Leaks)

```pseudo
let isMounted = true;
useEffect(() => {
    isMounted = true;
    loadCart();
    return () => { isMounted = false; };
}, [cartId]);

// in async blocks:
if (isMounted) setCartSummary(...);
if (isMounted) setLoading(false);
```

---

### 2. Handle HTTP Error Response in loadCart

```pseudo
if (response.ok) {
    const data = await response.json();
    setCartSummary(data.data);
} else {
    toast.error("Gagal memuat keranjang");
}
```

---

### 3. Remove Non-Null Assertions on Cart Item Id

```pseudo
onClick={() => updateQuantity(item.id, item.quantity - 1)}
onClick={() => removeItem(item.id)}
```

---

### 4. Confirm Dialog for Clear Cart

```pseudo
onClick={() => {
    if (confirm("Kosongkan keranjang? Anda yakin?")) {
        clearCart();
    }
}}
```

---

### 5. Use enum/object for Item Types (Optional, Best Practice)

```pseudo
const ITEM_TYPE = { SPP: "SPP", DONATION: "DONATION" }
// Then:
case ITEM_TYPE.SPP:
```

---

### 6. Wrap Utility Functions in useCallback or useMemo (Optional for Optimization)

```pseudo
const formatCurrency = useCallback((amount) => ..., []);
```

---

## Conclusion

Your code is well-structured, but the above changes will make it more robust, maintainable, and aligned with industry standards. Focus on proper async state management, error handling, and confirmation for destructive actions as top priorities. 🛠️
