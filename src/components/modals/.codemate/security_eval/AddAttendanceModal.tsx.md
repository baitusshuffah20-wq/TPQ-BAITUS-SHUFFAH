# Security Vulnerability Report

**Component:** `AddAttendanceModal`  
**Type:** React Functional Component  
**Language/Framework:** TypeScript/React (Next.js/React Client Components)  
**Scope:** Review _only_ for security vulnerabilities

---

## 1. **Lack of Input Validation/Sanitization**

### **Risk**

- **Trusting User Input:**
  - All user inputs, including attendance notes, topic, location, and other free-text fields, are accepted and immediately placed into state and ultimately into an object that is output via `onSave`.
  - No client-side content validation or sanitization is performed on potentially unsafe input.

### **Potential Exploits**

- If `onSave` or subsequent API calls mishandle untrusted data, there's risk of XSS or backend injection.
- Attendance notes and other fields could contain malicious payloads, which, if improperly handled or rendered in an HTML context elsewhere (including via emails, PDFs, etc), could result in code execution.

### **Recommendation**

- Sanitize and validate all input client-side and **mandatory** on the server-side before storing or processing further.
- Consider using libraries like [`DOMPurify`](https://github.com/cure53/DOMPurify) for any HTML output (especially if notes may allow rich text later).

---

## 2. **Insecure Handling of Identifiers**

### **Risk**

- The code uses predictable and non-obfuscated IDs for attendance records:  
  `id: editData?.id || attendance_${Date.now()}`
  - This is not secure for _persisted_ data (potential enumeration, e.g. guessing object keys).
- IDs for santri, musyrif, halaqah are strings (`"1"`, `"2"`), presumably not sensitive, but if used elsewhere could be vulnerable to enumeration.

### **Potential Exploits**

- If these IDs are ever exposed via public APIs or URLs, attackers could infer/guess data.

### **Recommendation**

- Use cryptographically secure random IDs (e.g., UUIDs) for any persisted record.
- Ensure that IDs are not sequentially guessable if ever exposed via APIs.

---

## 3. **No Anti-Automation (Bot/Spam) Defenses**

### **Risk**

- The modal allows essentially unlimited entry and submission of attendance data.
- No mechanism (like CAPTCHA, rate limiting, or debounce) is in place to prevent script-based submission.

### **Potential Exploits**

- Automated attackers or mischievous users can spam attendance records by rapidly opening the modal and submitting.

### **Recommendation**

- Implement server-side rate-limiting.
- Optionally add anti-bot mechanisms for public-facing forms.

---

## 4. **No Access Control; All Operations in Client**

### **Risk**

- The component does not enforce any access control logic client-side, and there is no evidence of context-aware data restriction.

### **Potential Exploits**

- While actual security must be enforced server-side, relying solely on client checks is insecure.

### **Recommendation**

- Ensure server-side validation checks user identity/authorization before accepting data.

---

## 5. **Potential for Stored XSS via Notes/Topic Fields**

### **Risk**

- If these values (notes, topic, etc) are ever rendered as HTML or injected unsafely elsewhere, and are not sanitized, a stored XSS may be possible.

### **Potential Exploits**

- A malicious user could insert e.g., `<script>alert('XSS')</script>` in a note, which could be rendered on an attendance review page.

### **Recommendation**

- Escape or sanitize content on both storage and display.
- Never dangerously inject user input into the DOM.

---

## 6. **No Protection Against Overposting or Mass Assignment**

### **Risk**

- By sending `formData` (containing all fields), an attacker could modify the client-side code to add extraneous/unexpected fields to the attendanceData object.

### **Potential Exploits**

- If the backend does not strictly validate the posted schema, unexpected fields could be injected: e.g., privilege escalation, data clashes, etc.

### **Recommendation**

- On the server/API side, validate that only the allowed keys are accepted, and ignore/discard all others.
- Do not trust the shape of incoming objects from the client.

---

## 7. **No CSRF Protection**

### **Risk**

- While the modal itself is React-client only, if the API accepting attendance data is accessible via unauthenticated POST requests, there could be risk of Cross-Site Request Forgery.

### **Potential Exploits**

- If a user is authenticated elsewhere, a malicious site could submit data on their behalf.

### **Recommendation**

- Ensure proper CSRF protection is in place for all POST/PUT/PATCH endpoints.

---

## 8. **Race Condition / Double Submission Risk**

### **Risk**

- There are no protections against double-click/double submit on the "Simpan" button.

### **Potential Exploits**

- Multiple records could be created unintentionally by rapid clicking.

### **Recommendation**

- Debounce or disable the submit button once the operation is in progress.

---

## 9. **Session Management Not Addressed**

### **Note**

- This component does not handle user authentication/context; ensure at an app level that only authorized users may access/submit attendance.

---

## 10. **Data Exposure via Error Messages**

### **Risk**

- Field error messages are displayed directly to the user—the current implementation seems safe, but if server validation errors are ever passed directly, sensitive info could be leaked.

### **Recommendation**

- Always sanitize server error messages before displaying them client side.

---

# Summary Table

| Vulnerability                         | Risk Level | Recommendation                               |
| ------------------------------------- | :--------: | -------------------------------------------- |
| Lack of input validation/sanitization |    High    | Sanitize/validate all inputs (client/server) |
| Insecure ID generation                |   Medium   | Use UUID/random IDs                          |
| No bot/spam defenses                  |   Medium   | Add rate-limiting/checks server-side         |
| No access control                     |    High    | Enforce server validation/authorization      |
| Stored XSS (notes/topic)              |    High    | Escape/sanitize on save & render             |
| Overposting/mass assignment           |   Medium   | Server should accept only allowed props      |
| No CSRF protection                    |   Medium   | CSRF tokens/middleware for API endpoints     |
| Race condition/double submission      |    Low     | Debounce/disable submit button               |
| Session/auth not checked              |    High    | Server-side checks necessary                 |
| Potential error message data exposure |    Low     | Sanitize error messages client-side          |

---

# Final Notes

- While the component itself handles mostly UI logic, most security concerns stem from improper handling of input at the backend/API layer. This _frontend_ should be paired with API endpoints that properly validate, authenticate, and sanitize all data.
- The most severe risk lies in improper input validation/sanitization and relying on predictable identifiers.

**SECURITY IS A FULL STACK RESPONSIBILITY—DO NOT TRUST CLIENT DATA.**
