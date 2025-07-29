# Code Review Report for `DonationForm` Component

## Overview

The donation form component is generally well-organized, using modern React with hooks and TypeScript. However, the following issues relating to **industry standards**, **unoptimized implementation**, and **potential errors** were found:

---

## 1. **Uncontrolled LocalStorage Access**

**Problem:**  
Direct use of `localStorage` in React (especially on Next.js with SSR) can throw reference errors in non-browser environments.

#### Correction (Pseudo-code):

```typescript
if (typeof window !== "undefined") {
  // Safe to use localStorage
  // ... (rest of your localStorage code)
}
```

**Or wrap the logic:**

```typescript
let cartId;
if (typeof window !== "undefined") {
  cartId =
    localStorage.getItem("cartId") ||
    `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem("cartId", cartId);
}
```

---

## 2. **State Derivation of `finalAmount`**

**Problem:**  
The calculation of `finalAmount` is placed directly in render, possibly leading to bugs if `customAmount` parsing fails (e.g., empty string, overflows).

#### Correction (Pseudo-code):

```typescript
const safeCustomAmount = parseInt(customAmount, 10);
const finalAmount =
  selectedAmount ?? (safeCustomAmount > 0 ? safeCustomAmount : 0);
```

---

## 3. **Numeric Input Allowance**

**Problem:**  
`Input` for "Jumlah Donasi" uses `type="text"` and manual digit filter, but would be more robust with `type="number"`.

#### Correction (Pseudo-code):

```typescript
<Input
  type="number"
  min={1000}
  step={1000}
  placeholder="Jumlah lainnya"
  className="pl-10"
  value={customAmount}
  onChange={handleCustomAmountChange}
/>
```

Also, update the change handler:

```typescript
const handleCustomAmountChange = (e) => {
  const value = e.target.value;
  setCustomAmount(value);
  setSelectedAmount(null);
};
```

---

## 4. **Possible Duplicate Donor Data Reset**

**Problem:**  
No reset of payment method or additional state upon form reset.

#### Correction (Pseudo-code):

```typescript
const resetForm = () => {
  setSelectedAmount(null);
  setCustomAmount("");
  setSelectedPayment("bank"); // reset selected payment
  setDonorData({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
  });
};
```

---

## 5. **Improper Error Handling for Async Submission**

**Problem:**  
If `api.post` throws (network error), `cartResult` and `result` are undefined. The code may throw `undefined.message`.

#### Correction (Pseudo-code):

```typescript
try {
  // ...api.post
} catch (error) {
  const errMsg = error?.message || "Gagal membuat donasi. Silakan coba lagi.";
  handleError(error, errMsg);
}
```

---

## 6. **No Client-side Email/Phone Validation**

**Problem:**  
No format validation for donor's email/phone before submitting.

#### Correction (Pseudo-code):

```typescript
if (!donorData.isAnonymous) {
  if (!validateEmail(donorData.email)) {
    addToast({
      type: "error",
      title: "Email tidak valid",
      message: "Masukkan email yang valid",
    });
    return;
  }
  if (!validatePhone(donorData.phone)) {
    addToast({
      type: "error",
      title: "Nomor Telepon tidak valid",
      message: "Masukkan nomor telepon yang valid",
    });
    return;
  }
}
// Utility:
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}
function validatePhone(phone) {
  return /^\d{8,15}$/.test(phone);
}
```

---

## 7. **Hardcoded Default Customer Info**

**Problem:**  
Payment API request uses hardcoded dummy email/phone (`anonymous@example.com`, etc.) for anonymous users; this may not be accepted by payment gateways.

#### Correction (Pseudo-code):

```typescript
const paymentData = {
  // ...
  customerInfo: {
    name: donorData.name || "Donatur Anonim",
    email: donorData.email || "",
    phone: donorData.phone || "",
  },
};
```

## If required fields, inform the user to fill them even for anonymous, or handle more gracefully.

## 8. **Potential UI Feedback Delay**

**Problem:**  
`setTimeout` of 1 second to redirect after payment creation is arbitrary, may not enhance UX.

#### Correction (Pseudo-code):

- Redirect immediately or after a shorter delay, or show loading indicator until redirect.

```typescript
window.location.href = result.data.paymentUrl;
```

or better:

```typescript
setTimeout(() => {
  window.location.href = result.data.paymentUrl;
}, 200); // Reduce delay
```

---

## 9. **Type Safety: Input Event Types**

**Problem:**  
The reusable `handleDonorDataChange` is mixing `HTMLInputElement` and `HTMLTextAreaElement`, which might break type-safety.

#### Correction (Pseudo-code):

```typescript
const handleDonorDataChange = (
  e:
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>,
) => {
  /* ... */
};
```

## (NOTE: this is already present but double-check for implementation completeness.)

## 10. **Console Logs in Production Code**

**Problem:**  
Multiple `console.log` statements are present, which should not be present in production code for privacy and performance.

#### Correction (Pseudo-code):

```typescript
// Remove or wrap logs as necessary
if (process.env.NODE_ENV !== 'production') {
  console.log(...);
}
```

---

## 11. **Accessibility: Button Roles for Payment Methods**

**Problem:**  
Each payment method is a clickable `div`, which is not accessible.

#### Correction (Pseudo-code):

```typescript
<div
  ... // as is
  role="button"
  tabIndex={0}
  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedPayment(method.id); }}
>
  ...
</div>
```

## Or, better, use actual `<button>` styled as needed.

## 12. **Magic Numbers and Strings**

**Problem:**  
Predefined values such as amounts and dummy placeholders are magic values.

#### Correction (Pseudo-code):

```typescript
const QUICK_AMOUNTS = [50000,100000,250000,500000,1000000];
// ...later
{QUICK_AMOUNTS.map(...)}
```

---

## 13. **Unused Imports**

**Problem:**  
`Check` is imported from `lucide-react` but never used.

#### Correction (Pseudo-code):

```typescript
// Remove: import { ..., Check, ... }
```

---

---

# Summary Table

| Issue                     | Section           | Correction                                        |
| ------------------------- | ----------------- | ------------------------------------------------- |
| Uncontrolled localStorage | Submission        | Add browser check `typeof window !== 'undefined'` |
| State derivation          | `finalAmount`     | Use explicit parse and fallback                   |
| Numeric Input             | Amount Input      | Use `type="number"` and proper handler            |
| Full Form Reset           | Reset             | Reset payment method as well                      |
| Async Error Handling      | API Calls         | Check for `undefined`, fallback messages          |
| Email/Phone Validation    | Before Submit     | Add simple regex validation                       |
| Hardcoded Customer Info   | API Payload       | Handle empty email/phone more gracefully          |
| UI Delay                  | Redirect          | Reduce or remove `setTimeout`                     |
| Type Safety               | Event Handlers    | Use explicit typing as already present            |
| Console Logs              | Throughout        | Remove or wrap in environment checks              |
| Accessibility             | Payment selection | Use role="button"/keyboard handlers or button     |
| Magic Numbers             | Quick Amounts     | Use named constants                               |
| Unused Imports            | Imports           | Remove unused like `Check`                        |

---

# Priority Fixes

1. **localStorage safety** (`typeof window` check) — necessary for SSR support.
2. **Client-side validation** (email, phone) — data correctness.
3. **Accessibility/semantics** (interactive elements) — a11y compliance.
4. **Console log removal** — production hygiene.
5. **Async error handling improvements** — better user experience on network/logic errors.

---

**Implementing these corrections will improve code quality, reliability, user experience, and maintain industry best practices.**
