# PaymentGatewayModal Code Review Report

## General Comments

- The code is well-structured for a React functional component using hooks and TypeScript.
- Naming is clear and UI logic is decoupled into rendering helpers.
- Error handling is present, but implementation could be hardened and more defensive.
- **Critical Issues:** Loading external scripts in this fashion, potential duplicate script loads, memory leaks, unsanitized dynamic input, and a lack of [industry standard best practices](https://react.dev/learn/) for async React code.
- Lint-level issues and unoptimized state updates are noted.

---

## Detailed Issues, Industry Standard Critique & Suggestions

### 1. **Dynamic Script Injection:**

- **Issue:** Script is injected into the `<head>` every time a payment is processed, with NO cleanup.
- **Best Practice:** Use `useEffect` for script loading. Remove script on unmount or when no longer needed.
- **Fix:**
  ```
  // After appendChild, keep a ref to the script element:
  // At the top:
  const scriptRef = useRef<HTMLScriptElement | null>(null);

// In handleProceedPayment():
document.head.appendChild(script);
scriptRef.current = script;

// Add cleanup in useEffect or after use:
useEffect(() => {
return () => {
if (scriptRef.current) {
document.head.removeChild(scriptRef.current);
scriptRef.current = null;
}
};
}, []);
```

---

### 2. **Possible Multiple Script Loads**

- **Issue:** Multiple script tags could be injected if user goes back and forth.
- **Improvement:** Check for existing script by `src` or attribute before injection.
- **Fix:**
  ``if (!document.querySelector(`script[src="${result.data.snap_url}"]`)) {
  document.head.appendChild(script);
  scriptRef.current = script;
}
   ``

---

### 3. **Leaking Async Logic due to Stale Closures**

- **Issue:** User can close modal during async fetch/promise, leading to state updates on unmounted component.
- **Improvement:** Use `let isMounted = true` in closures, or an `AbortController` for fetch, plus React's `useEffect` cleanup.
- **Fix:**
  `// In loadPaymentMethods and handleProceedPayment:
let isActive = true;
setLoading(true);
// after async/await
if (!isActive) return;
// On cleanup:
return () => { isActive = false; };
   `

---

### 4. **Not Using useCallback for Handlers**

- **Issue:** Functions like `handleProceedPayment`, `handlePaymentMethodSelect` cause unnecessary re-renders in children as props.
- **Improvement:** Wrap with `useCallback`.
- **Fix:**
  `const handleProceedPayment = useCallback(async () => {
  // ...
}, [selectedMethod, paymentData, onSuccess, onClose]);
const handlePaymentMethodSelect = useCallback((method: string) => {
  setSelectedMethod(method);
}, []);
   `

---

### 5. **Inefficient Find in Render**

- **Issue:** `.find()` inside render (e.g. in `renderInstructions`) can be wasteful if the list is large (not here, but still).
- **Best Practice:** Memoize frequently used values via `useMemo`.
- **Fix:**
  `const selectedPaymentMethod = useMemo(
  () => paymentMethods.find((m) => m.method === selectedMethod),
  [paymentMethods, selectedMethod]
);
// ...then in renderInstructions, use selectedPaymentMethod?.name
   `

---

### 6. **Missing Schema Validation for API Responses**

- **Issue:** No validation on API responses, trust all JSON.
- **Best Practice:** Validate structure using Zod, yup or at least check existence of nested fields before access.
- **Suggestion:**
  `if (
  result.success &&
  result.data &&
  Array.isArray(result.data.payment_methods)
  // etc
) {
  // proceed
}
   `

---

### 7. **Process.env in Browser**

- **Issue:** You use `process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` directly in browser-side logic. This will only work if properly exposed and may cause undefined in SSR.
- **Best Practice:** Assert existence or pass via props/config.
- **Fix:**
  `const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
if (!midtransClientKey) {
  throw new Error("Missing MIDTRANS_CLIENT_KEY");
}
script.setAttribute("data-client-key", midtransClientKey);
   `

---

### 8. **User-Visible Amount Formatting**

- **Issue:** `.toLocaleString("id-ID")` can fail if amount is not a Number.
- **Suggestion:** Sanity check or force Number first.
- **Fix:**
  `Rp {Number(paymentData?.amount || 0).toLocaleString("id-ID")}
   `

---

### 9. **Error Logging Without Alerting User**

- **Issue:** Logging errors with `console.error` only, but user may not see the toast due to errors thrown before toast.
- **Suggestion:** Add global error boundary or at least ensure `toast.error()` is not skipped.
- **No code fix needed, but recommend:**
  ```
  try {
    // ...
  } catch (error) {
    toast.error("Terjadi kesalahan ...");
    console.error(error);
  }
  ```

---

### 10. **Hard-coded Strings (i18n)**

- **Issue:** Strings are hard coded in Indonesian only.
- **Best Practice:** Use i18n frameworks (e.g. `react-intl` or a translations object).
- **Suggestion:** Extract UI text into a localization object.

---

### 11. **Possible Modal Close During Processing**

- **Issue:** Users can close the modal during a payment step, which could cause unexpected states.
- **Best Practice:** Disable close button or prompt for confirmation during critical processing steps.
- **Fix:**
  `// In render, conditionally show the close button:
{step !== "processing" && (
  <button onClick={onClose} ...>...</button>
)}
   `

---

### 12. **Redundant State Updates**

- **Issue:** Setting `setLoading(false)` in multiple branches.
- **Best Practice:** Use `finally` block, which you already do - check for redundancy.

---

### 13. **Unclear Token Management**

- **Issue:** `paymentToken` is set but not used anywhere else. It can be removed for clarity unless used outside.
- **Suggestion:** Remove `paymentToken` if unneeded.

---

### 14. **General Code Organization**

- **Improvement:** Move rendering sub-components (`renderPaymentMethods`, etc) out of body for clarity.

---

## Summary Table

| Issue                           | Severity | Suggestion                                       |
| ------------------------------- | -------- | ------------------------------------------------ |
| Script handling & leak          | CRITICAL | Add script ref, cleanup, avoid duplicate inserts |
| Async leak on unmount           | MAJOR    | Use isActive/isMounted boolean pattern           |
| Non-memoized handlers           | MINOR    | use useCallback                                  |
| Object find inefficiency        | MINOR    | use useMemo                                      |
| API data validation             | MAJOR    | Validate response data type/structure            |
| Env var direct usage            | MAJOR    | Fallback/guard for missing key                   |
| String formatting risk          | MINOR    | Ensure amount is Number                          |
| UI text in code                 | MINOR    | Consider i18n                                    |
| Processing disables modal close | MAJOR    | Disable close in "processing"                    |
| Redundant state update          | MINOR    | DRY/finally block                                |
| Token management                | MINOR    | Remove unused state                              |

---

## Example of Several Corrected Lines (Pseudo Code Only)

```pseudo
// Script loading/cleanup:
const scriptRef = useRef(null)
...
if (!document.querySelector(`[src="${snap_url}"]`)) {
  document.head.appendChild(script)
  scriptRef.current = script
}
useEffect(() => () => {
  if (scriptRef.current) document.head.removeChild(scriptRef.current)
}, [])

// Async leaks:
let isActive = true
// Inside promise:
if (!isActive) return
// In cleanup:
return () => { isActive = false }

// Memoize selected method:
const selectedPaymentMethod = useMemo(() =>
  paymentMethods.find(m => m.method === selectedMethod), [paymentMethods, selectedMethod]
)

// Conditionally disable modal close:
{step !== 'processing' && <CloseButton ... />}

// Formatting
Rp {Number(paymentData?.amount || 0).toLocaleString("id-ID")}
```

---

## Final Note

**Recommend addressing the CRITICAL and MAJOR issues above before deploying to production.**  
For production-grade code, add further unit tests, end-to-end tests, and security reviews for any user-facing payment logic.
