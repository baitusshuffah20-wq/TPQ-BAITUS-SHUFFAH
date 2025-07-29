# Security Vulnerability Report

**Component:** `SetTargetModal`  
**Language:** TypeScript / React (Next.js)  
**Scope:** Review of client-side code only

---

## Overview

This report highlights **security vulnerabilities** which may arise in the given code. The review focuses on:

- Data from untrusted sources
- Possible XSS, CSRF, information leaks
- Weak API/data handling
- Secure UI practices

---

## 1. **Unescaped User Content & XSS Risks**

- **Description:**  
  The UI displays user-determined values in JSX (e.g., `santriName`, `formData.description`, `formData.notes`). In modern React, JSX escapes data by default. However, be cautious if any inner HTML (`dangerouslySetInnerHTML`) or third-party rendering is added in the future.

- **Risk:**
  - Currently **Low**, due to React's auto-escaping.
  - **Potential risk** if rendering HTML from user-provided content is later introduced.

- **Recommendation:**
  - Ensure any future rendering of user input with `dangerouslySetInnerHTML` is avoided or sanitized on both input and output.
  - Maintain validation and/or sanitization for text fields such as `description` and `notes` if this behavior changes.

---

## 2. **Insecure Handling of API Data**

- **Description:**
  - Data from the `/api/santri?simple=true` endpoint is retrieved and mapped to UI directly.
  - No validation or sanitization of response data is performed.

- **Risk:**
  - If the API is compromised, or returns unexpected structure or malicious data, it could:
    - Cause UI errors or even potential prototype pollution (if objects are used carelessly).
    - In rare UI-library scenarios, be an XSS vector.

- **Recommendation:**
  - Implement schema validation (e.g., using [zod](https://zod.dev/)) on received data before passing it to state/UI.
  - Check that only expected fields (`id`, `name`, `nis`) are included.
  - Treat all server data as untrusted.

---

## 3. **Improper Use of Identifiers in DOM**

- **Description:**
  - The value of `<option>` in `<select>` (for santri) uses `santri.id`, which comes from API or mock data.
  - These IDs are assigned to `formData.santriId` and further used in application logic.

- **Risk:**
  - If IDs are not validated/escaped, and user can control them (e.g., through a compromised API), in edge cases it could confuse app logic, though not cause XSS in React.

- **Recommendation:**
  - Validate IDs are restricted to allowed format (e.g., alphanumeric), especially before including them in further requests (not present here, but good practice).

---

## 4. **Hardcoded Current User Data (Possible Spoofing)**

- **Description:**
  - On target creation, the `createdBy` and `createdByName` fields are **hardcoded** as `"current_user_id"` and `"Admin TPQ"` in the client.

- **Risk:**
  - If this information is not checked/overridden in the backend, users could **spoof who created the target** by manipulating client code.
  - Potential for privilege escalation, fraud, or tampering.

- **Recommendation:**
  - Treat all values supplied from client as untrusted.
  - **Enforce correct user identification in backend** (based on authenticated session, not on user-supplied data).

---

## 5. **No Server-Side Validation or Authorization Shown**

- **Description:**
  - All "create" logic (e.g., `onSuccess(newTarget)`) appears client-side; no server request is visible in this snippet.

- **Risk:**
  - If the `onSuccess` callback or downstream handling does not **perform server-side validation** and **authorization**, attacker could:
    - Assign targets to other users.
    - Bypass business rules.
    - Manipulate fields not intended to be user-controlled (e.g. `progress`, `status`, `createdAt`).

- **Recommendation:**
  - **ALWAYS enforce data integrity, authorization, and input validation in the backend**, not in client code.

---

## 6. **Error Handling Information Leak**

- **Description:**
  - Some errors are logged to `console.error` with details from exceptions.

- **Risk:**
  - In a production setting, verbose logging (especially with sensitive information) may leak details to the browser console, which could be inspected by malicious actors.

- **Recommendation:**
  - Avoid logging sensitive details client-side in production.
  - Ensure server/API error details are not leaked via error messages to the client.

---

## 7. **Potential for CSRF (Cross-Site Request Forgery)**

- **Description:**
  - The only observed fetch is a `GET`, but in typical Next.js apps, cookie-based auth is used.

- **Risk:**
  - If this or other components perform mutating operations via fetch using cookie auth, ensure CSRF protections are in place on the backend.

- **Recommendation:**
  - Use CSRF tokens for state-changing operations on the API.
  - Always implement server-side CSRF checks as needed.

---

## 8. **Lack of Security Headers for Modal**

- **Description:**
  - The modal uses standard HTML and does not attempt to prevent clickjacking, focus hijacking, or similar attacks.

- **Risk:**
  - Low for a modal, but application should set secure HTTP headers like `X-Frame-Options` and `Content-Security-Policy` globally to prevent clickjacking/XSS.

- **Recommendation:**
  - Set secure headers globally in the Next.js app.

---

## 9. **No Input Validation on Dates and Numbers**

- **Description:**
  - Fields like `targetDate`, `targetAyahs`, and others are accepted from user input with minimal client-side constraints.

- **Risk:**
  - Malicious or buggy clients may send invalid or out-of-range values, possibly leading to logic errors or exploits if not checked server-side.

- **Recommendation:**
  - Always validate all scalar/numeric/date fields both in client and especially server.

---

## 10. **Toast Messages and Social Engineering**

- **Description:**
  - Toast messages show creation/update success based entirely on client logic.

- **Risk:**
  - Not a direct vulnerability, but attackers may trick users into thinking actions succeeded when they in fact did not, if client/server are not tightly integrated.

- **Recommendation:**
  - Ensure toasts/errors reflect actual server state/response, not just client logic.

---

# **Summary Table**

| Vulnerability                       | Risk | Recommendation                                 |
| ----------------------------------- | ---- | ---------------------------------------------- |
| Unescaped user content (XSS)        | Low  | Avoid dangerouslySetInnerHTML; keep sanitizing |
| API data handling                   | Med  | Validate/sanitize server responses             |
| DOM identifiers from API            | Low  | Restrict IDs to safe format, validate          |
| Hardcoded user fields (spoofing)    | High | Assign real user data server-side              |
| No server-side validation           | High | Always validate/authorize on server            |
| Error info leakage                  | Low  | Do not log sensitive errors client-side        |
| CSRF considerations                 | Med  | Protect APIs with proper CSRF checks           |
| Modal/frame security headers        | Low  | Set X-Frame-Options, CSP globally              |
| Number/date input validation        | Med  | Always validate inputs on server               |
| Toast messages (social engineering) | Low  | Reflect true server result                     |

---

## **Critical Action Items**

- **NEVER trust client data for important fields (ID, user, status, timestamps).**
- **All sensitive fields must be set/validated on the server, based on authenticated context.**
- **Validate all API input and output strictly.**
- **Include CSRF protection for all state-changing API requests.**
- **Do not leak sensitive error information in client logs/messages.**

---

## **Overall Rating**:

No **direct** critical security vulnerabilities are present in the code, **but** there is substantial risk if the backend does not properly validate and enforce all business logic and authentication/authorization. Client-side code must always be considered untrusted.
