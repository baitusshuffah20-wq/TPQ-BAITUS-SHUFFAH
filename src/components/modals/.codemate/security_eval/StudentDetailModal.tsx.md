# Security Vulnerabilities Report

## Target Component

**Component:** `StudentDetailModal`  
**Language/Framework:** React (likely Next.js with TypeScript)

---

## 1. **Untrusted User Data Rendered Without Sanitization**

### Issue

Throughout the code, values from the `student` object (and its nested objects, e.g., `student.wali`, `student.hafalan`) are rendered directly in the JSX markup.

**Examples:**

```jsx
<img
  src={student.avatar}
  alt="Avatar"
  className="w-full h-full object-cover"
/>
// ...
<p className="text-gray-900">{student.name || "-"}</p>
```

### Impact

If any of these fields can contain user-submitted data, an attacker could inject JavaScript or malformed values designed for cross-site scripting (XSS) or injection attacks. While React escapes most string data by default, certain props and attributes can be dangerous, especially URLs (e.g., `img src`).

### Recommendations

- Validate and sanitize all user data, particularly for `img src`, email, phone, and address fields.
- Consider implementing content security policies (CSP).
- When using URLs from user data (e.g., `student.avatar`):
  - Validate the URL is safe (`http(s)://`, no `javascript:`, no `data:` unless you trust the source).
  - Consider using a regex or whitelist for allowed domains.
- Never use `dangerouslySetInnerHTML` with untrusted content.

### Example Mitigation

```js
const isSafeUrl = (url) =>
  /^https?:\/\/[a-zA-Z0-9\.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url);

<img
  src={isSafeUrl(student.avatar) ? student.avatar : "/placeholder.png"}
  alt="Avatar"
  className="w-full h-full object-cover"
/>;
```

---

## 2. **No Type Safety / Validation for `student` Prop**

### Issue

All access to `student` data is done using the `any` type – which disables compile-time checks and enables a wide class of runtime vulnerabilities (e.g., accessing undefined properties, unexpected data structures, and prototype pollution).

**Example:**

```ts
student: any;
...
{student.wali?.name}
```

### Impact

- Type confusion could allow attackers to inject unexpected structures or objects, leading to application logic issues or even vulnerabilities if data is interpreted in an unsafe way.
- Lack of validation could lead to rendering problems or missed XSS vectors.

### Recommendations

- Define a TypeScript `Student` interface and validate incoming data (either before passing to the component or within it).
- Consider using a schema validation library (e.g., `zod`, `yup`) at API boundaries.
- Never trust frontend data coming from client or server API responses.

---

## 3. **User-Supplied Image URL (`student.avatar`)**

### Issue

The avatar is rendered as:

```js
<img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
```

If `student.avatar` is not validated, attackers can provide URLs to arbitrary sites, redirecting to malicious locations or attempting to load scripts via crafted `data:` or `javascript:` URLs.

### Recommendations

- Strictly validate accepted image URLs.
- For internal avatars, proxy/serve avatars from your own backend or CDN.
- Forbid `data:` URIs and block `javascript:`.

---

## 4. **Potential Information Disclosure**

### Issue

Sensitive personal data (full name, NIS, gender, address, guardian's phone/email, academic status, etc.) is rendered directly.

### Impact

If the modal is accidentally opened for the wrong user or user access controls are not enforced at a higher level:

- An unauthorized user may see another user's private information (privacy violation/data leak).

### Recommendations

- Always enforce access control at all levels: API, server, and UI.
- Ensure this modal **cannot be invoked by unauthorized users**.
- Mask or redact sensitive data for users without permission.

---

## 5. **No Action Rate Limiting, Confirmation, or Audit on `onDelete`**

### Issue

The "Hapus Santri" (Delete Student) button calls `onDelete` directly. If this deletes the student record:

- There is no built-in confirmation dialog here (beyond the button).
- There is no visible CSRF protection, audit log, or rate limiting in this UI.

### Recommendations

- Confirm destructive actions with a secondary modal or prompt.
- Ensure backend APIs for deletions use proper authentication, authorization, and CSRF protection.
- Track and audit deletions.

---

## Summary Table

| Issue # | Vulnerability          | Location/Finding                                       | Severity | Recommendation                           |
| ------- | ---------------------- | ------------------------------------------------------ | -------- | ---------------------------------------- |
| 1       | Untrusted Data in JSX  | Direct rendering of `student.*` fields, notably URLs   | High     | Validate and sanitize all rendered data  |
| 2       | No Type Safety         | `student: any` type disables safety and validation     | Medium   | Use strict types and validate structures |
| 3       | User-Supplied URLs     | `student.avatar` img `src`                             | High     | Validate URLs, proxy or use own sources  |
| 4       | Information Disclosure | Rendering sensitive PII without access guards          | High     | Enforce authentication/authorization     |
| 5       | Unconfirmed Deletes    | `onDelete` is called directly, no visible confirmation | Medium   | Require confirmation, use secure API     |

---

# **Overall Risk**

This component is **at moderate to high risk** for security vulnerabilities, especially XSS via unvalidated URLs, PII leaks, and improper management of sensitive actions. **Mitigations and input validation should be prioritized before use in production.**

---

## **References**

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/reference/react-dom/components/common#security)
