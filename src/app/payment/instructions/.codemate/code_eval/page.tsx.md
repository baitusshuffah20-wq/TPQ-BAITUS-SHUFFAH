# Critical Code Review Report

_Applied to provided Payment Instructions Page (React/Next.js)_

---

## 1. **Unoptimized useEffect Leading to Potential Infinite Loops or Unwanted Fetching**

**Problem:**  
Within the first `useEffect`, `loadPaymentInstructions` is redeclared inside the component and is un-memoized, so it gets redefined on every render, which may confuse code readers though it doesn’t break the effect but could trigger lint warnings.

**Suggestion:**  
Memoize `loadPaymentInstructions` using `useCallback`, or move it out of the component, or suppress the ESLint warning correctly.

**Pseudo-code correction:**

```js
const loadPaymentInstructions = useCallback(async () => {
  ... // same logic
}, [orderId, paymentId, router]);
```

Then in `useEffect`:

```js
useEffect(() => {
  if (orderId && paymentId) {
    loadPaymentInstructions();
  } else {
    router.push("/payment");
  }
}, [orderId, paymentId, loadPaymentInstructions]);
```

---

## 2. **Possible Memory Leak in Timer useEffect**

**Problem:**  
If `expiryTime` never changes and `paymentInstructions` is nulled rapidly, `timer` from the interval may leak.

**Suggestion:**  
Clear interval on unmount _and_ on change of dependencies to guarantee cleanup.

**Pseudo-code correction:**  
The code is correct but make explicit:

```js
useEffect(() => {
  if (!paymentInstructions?.expiryTime) return;

  const timer = setInterval(...);

  return () => clearInterval(timer); // Ensure clear on unmount/change
}, [paymentInstructions]);
```

Additional robustness can be achieved by adding a check at the cleanup:

```js
// At start of effect
let timer;
// ...
return () => {
  if (timer) clearInterval(timer);
};
```

---

## 3. **Missing Null Checks and Type Guards**

### a. **When Accessing Properties of SearchParams**

**Problem:**  
`searchParams.get('orderId')` could be `null`, but passed into fetch as a string.

**Suggestion:**  
Add early return or type guards/validation.

**Pseudo-code:**

```js
if (!orderId || !paymentId) {
  router.push("/payment");
  return; // <--- Prevents further execution
}
```

### b. **Accessing `paymentInstructions.instructions` Without Validation**

You do:

```js
{paymentInstructions.instructions.map(...)}
```

If `instructions` could be null/undefined from API, this crashes.

**Suggestion:**  
Add an array default:

```js
{(paymentInstructions.instructions || []).map(...)}
```

Or, better, validate at API layer/response.

---

## 4. **Handling of Asynchronous Copy Operations & API Failures**

**Problem:**  
`navigator.clipboard.writeText` returns a Promise. If it fails (e.g., permissions, unavailable), no error is caught.

**Suggestion:**  
Await the promise and handle errors.

**Pseudo-code:**

```js
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  } catch {
    toast.error("Gagal menyalin ke clipboard");
  }
};
```

**Change all usages accordingly.**

---

## 5. **Weak Error Handling on Fetch Responses**

**Problem:**  
There is a lack of null/undefined validation for expected object shapes from API (e.g., `data.data.status`, `data.data`).

**Suggestion:**  
Add checks to handle API structure change:

**Pseudo-code:**

```js
if (response.ok) {
  const data = await response.json();
  if (!data || !data.data) throw new Error("Malformed response");
  setPaymentInstructions(data.data);
} else {
  ...
}
```

Apply similar checks in `checkPaymentStatus`.

---

## 6. **Printing – Prefer `window.print()` Trigger Outside of Button**

**Note:** This is fine, but if you want industry perfection, wrap with try/catch and a `setTimeout` to let UI settle.

**Suggestion:**

```js
onClick={() => {
  setTimeout(() => window.print(), 0);
}}
```

---

## 7. **UI/Accessibility**

**Suggestion:**

- All interactive elements (`Button`) should have suitable `aria-label` when icon-only.
- `img` for QR code should have descriptive `alt`.

**Pseudo-code:**

```js
<Button aria-label="Salin Order ID" ...>
  <Copy ... />
</Button>
<img src={...} alt="Kode QR untuk pembayaran" ... />
```

---

## 8. **Check Payment Status Logic Not Covering All Statuses**

You are checking:

```js
if (data.data.status === "PAID" || data.data.status === "SUCCESS")
```

But status may be lowercase or different; best to normalize string comparison.

**Suggestion:**

```js
const status = String(data.data.status).toLowerCase();
if (status === "paid" || status === "success") { ... }
```

---

## 9. **Potential Duplicated 'Cek Status' Requests**

There are two "Cek Status" buttons. Consider disabling all states if one is running.

**Suggestion:**

- Disable both buttons when `checking` is true (already done).
- Optional, debounce the call if needed.

---

## 10. **Missing Unique Keys for List**

You correctly use `index` as key for instructions.  
But industry best practice: if instructions are static, use a better key, e.g., hash or id. If dynamic, `index` is tolerable.

**Suggestion:**  
If instructions can mutate, prefer unique id if provided.

---

## 11. **Hardcoded Text/Inconsistent i18n**

For a larger project, extract string copy to constant or localization file.

---

## 12. **Potential Unhandled Rejection from `navigator.share()`**

If `navigator.share` call fails, there's no `catch`.

**Suggestion:**

```js
onClick={async () => {
  if (navigator.share) {
    try {
      await navigator.share({/*...*/});
    } catch (e) {
      toast.error("Gagal membagikan tautan");
    }
  } else {
    copyToClipboard(window.location.href, "Link instruksi");
  }
}}
```

---

# **Summary Table of Key Corrections**

| #   | Location/ Concern                 | Correction Pseudocode / Summary                              |
| --- | --------------------------------- | ------------------------------------------------------------ |
| 1   | useEffect/loadPaymentInstructions | Memoize with `useCallback`, add to deps.                     |
| 2   | Timer cleanup                     | Ensure timer is cleared on unmount/dep change.               |
| 3   | Null Checks                       | Guard API values, add early returns on null.                 |
| 4   | Clipboard                         | `await` and try/catch with feedback.                         |
| 5   | API Response                      | Type/shape validate API data before use.                     |
| 6   | Printing                          | Use `setTimeout(() => window.print(), 0)` for robust intent. |
| 7   | Accessibility/UI                  | `aria-label` for icon buttons, descriptive image alt.        |
| 8   | Payment Status                    | Normalize status to lower-case.                              |
| 9   | Debounce Cek Status               | Optional – debounce if needed.                               |
| 10  | List Keys                         | Use unique value as key if available.                        |
| 11  | i18n                              | Extract UI strings for translation in real app.              |
| 12  | navigator.share                   | Catch errors in share logic.                                 |

---

# Key Pseudocode Correction Snippets

```js
// 1. Memoize loadPaymentInstructions
const loadPaymentInstructions = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `/api/payment/instructions?orderId=${orderId}&paymentId=${paymentId}`,
    );
    if (response.ok) {
      const data = await response.json();
      if (!data || !data.data) throw new Error("Malformed response");
      setPaymentInstructions(data.data);
    } else {
      toast.error("Gagal memuat instruksi pembayaran");
      router.push("/payment");
    }
  } catch (error) {
    console.error("Error loading payment instructions:", error);
    toast.error("Gagal memuat instruksi pembayaran");
    router.push("/payment");
  } finally {
    setLoading(false);
  }
}, [orderId, paymentId, router]);

// 4. Safe clipboard usage
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin`);
  } catch {
    toast.error("Gagal menyalin ke clipboard");
  }
};

// 8. Normalize status string
const status = String(data.data.status).toLowerCase();
if (status === "paid" || status === "success") {
  ...
}

// 12. Safe sharing
onClick={async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: ...,
        text: ...,
        url: ...,
      });
    } catch {
      toast.error("Gagal membagikan tautan");
    }
  } else {
    copyToClipboard(window.location.href, "Link instruksi");
  }
}}
```

---

# **General Best Practices**

- Always validate and type-guard user/map/fetched data before use.
- Make all potentially async UI operations safe by catching errors.
- Use accessibility standards for all UI components (e.g. aria-label).
- Memoize or wrap expensive functions/hooks that are used within hook dependencies.
- Keep UI actions clear and avoid duplicated triggers.
- If code is to be maintained by a team, extract strings and constants for easier i18n and code evolution.

---

**End of Report**
