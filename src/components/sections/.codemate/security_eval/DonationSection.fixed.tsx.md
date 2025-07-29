# Security Vulnerability Report

## Scope

This report **only** analyzes the code posted (React component for a donation feature) for potential security vulnerabilities.

---

## Table of Contents

1. [Unvalidated Input / No Input Sanitization](#unvalidated-input--no-input-sanitization)
2. [Use of localStorage for Sensitive Data](#use-of-localstorage-for-sensitive-data)
3. [Potential User Enumeration via Error Messages](#potential-user-enumeration-via-error-messages)
4. [API Response Handling / Client-side Trust](#api-response-handling--client-side-trust)
5. [Redirect Handling](#redirect-handling)
6. [Other Minor Security Notes](#other-minor-security-notes)

---

## Details

### 1. Unvalidated Input / No Input Sanitization

**Issue:**
User inputs such as `name`, `email`, `phone`, `message`, and `customAmount` are passed to the backend (through `/api/cart/donation` and `/api/payment/cart`) without any client-side sanitization or validation.

**Risk:**

- **Injection attacks:** If the backend does not properly sanitize these inputs, this opens up risks of SQL/NoSQL/command injection, or stored XSS if data is later rendered in admin interfaces.
- **Abuse vector:** Malformed data may be submitted, leading to errors or abuse.

**Example(s) in Code:**

```tsx
<Input
  type="text"
  placeholder="Masukkan nama lengkap"
  value={donorData.name}
  onChange={(e) => handleDonorDataChange("name", e.target.value)}
/>
```

No validation is performed before sending this data to the API.

**Recommendation:**

- Implement client-side validation and sanitization for all user input (especially for email, phone, amount, etc.) before submitting.
- Ensure the backend **also** sanitizes and validates all such input.

---

### 2. Use of localStorage for Sensitive Data

**Issue:**
A `cartId` is generated and stored in `localStorage`. This ID is then used to identify the donation cart and is sent to the backend when making requests.

**Risk:**

- localStorage is not a secure storage – any malicious JavaScript executed in the browser (XSS attack) can access it.
- If cartId is used for sensitive operations or exposes donation details, it could be abused or leaked.

**Example of Code:**

```tsx
const cartId =
  localStorage.getItem("cartId") ||
  `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem("cartId", cartId);
```

**Recommendation:**

- Use HTTP-only cookies or server-side sessions for sensitive identifiers if possible.
- At the minimum, validate `cartId` and associate only to the context that created it, not letting it be used to access/modify others' donations.

---

### 3. Potential User Enumeration via Error Messages

**Issue:**
Display of backend error messages or potentially sensitive internal error details to the user via toast notifications.

**Risk:**

- Attackers may infer additional information about backend structure, which can lead to user enumeration or targeted attacks.

**Example:**

```tsx
addToast({
  type: "error",
  title: "Gagal Membuat Donasi",
  message: errorMessage,
});
```

Where `errorMessage` may originate from internal errors (e.g., from the backend).

**Recommendation:**

- Avoid displaying raw backend error messages to users. Instead, use generic error messages and log details privately.

---

### 4. API Response Handling / Client-side Trust

**Issue:**
The client trusts that data returned from the API (e.g., category data structure, payment URLs) is always safe and valid.

**Risk:**

- If API is compromised or data tampered with, malicious payloads (like XSS) could be injected (e.g., via category descriptions displayed in the UI).

**Example:**

```tsx
{category.description}
...
<p className="text-sm text-gray-600">
  {selectedCategoryData.description}
</p>
```

**Recommendation:**

- Treat all data from the backend as untrusted, and escape and sanitize before rendering (especially for any fields that could include user-generated or markdown/html content).

---

### 5. Redirect Handling

**Issue:**
After a donation/payment is created, the app redirects to the `paymentUrl` returned by the backend.

**Risk:**

- Open redirect attacks (phishing vector), if an attacker can influence the `paymentUrl` via backend compromise or API interception.

**Example:**

```tsx
window.location.href = result.data.paymentUrl;
```

**Recommendation:**

- On the backend, strict validation of the URLs returned to the frontend should be performed, allowing only trusted payment URLs (e.g., those pointing to a known payment processor).

---

### 6. Other Minor Security Notes

- **No CSRF protection (for forms):** As this is an SPA talking to its own API, this is likely less of an issue, but be aware if any API endpoints can be called cross-origin without CSRF protection.
- **Logging Sensitive Data:** Logging full objects (such as category data, payment info) to the browser console may leak donor or PII if someone’s browser is compromised.

---

## Summary Table

| Issue                              | Risk Level | Recommendation                                                         |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------- |
| User input not validated/sanitized | High       | Validate, sanitize all input client- and server-side                   |
| Sensitive ID in localStorage       | Medium     | Prefer cookies or server session. If not, validate and constrain usage |
| Display of raw backend errors      | Low-Med    | Show generic errors to users, log details for devs                     |
| Trusting API data in UI            | Med        | Escape/sanitize backend data before rendering                          |
| Unverified redirects               | High       | Backend: only allow known, trusted payment URLs                        |

---

## Overall Recommendation

While many of these vulnerabilities are also dependent on the implementation and validation on the server-side, it is always best for the frontend to:

- Validate and sanitize user input before sending to the backend.
- Treat all backend data as untrusted, escaping and sanitizing before rendering.
- Avoid using localStorage for sensitive data such as donation cart IDs.
- Never display raw error messages to users.
- Be mindful when redirecting users to URLs supplied by the backend.

**Addressing these issues will reduce the likelihood of XSS, open redirect, injection, and data leakage attacks.**
