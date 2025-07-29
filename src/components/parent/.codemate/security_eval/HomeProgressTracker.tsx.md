# Security Vulnerability Report

## File: HomeProgressTracker React Component

This report focuses **only** on security vulnerabilities present in the provided code sample and does **not** concern itself with issues of functionality, style, or performance. Only directly relevant vulnerabilities are listed.

---

## 1. **Improper Handling of User-Supplied Data in Rendering**

### **a. Potential for XSS (Cross-Site Scripting) via Direct Rendering of Untrusted Data**

**Findings:**  
Many fields from objects such as `activity.activity`, `activity.description`, `activity.parentNotes`, `activity.musyrifFeedback`, `goal.title`, `goal.description`, `goal.parentNotes`, and others are rendered directly into the HTML. In the current mock-data scenario, this risk is not exposed, but if in production these values are sourced from user input or untrusted APIs, an attacker could inject malicious HTML (scripts, event handlers, etc.), leading to an XSS vulnerability.

**Affected lines (examples, not exhaustive):**

```jsx
<h4 className="font-medium text-gray-900">{activity.activity}</h4>
<p className="text-sm text-gray-600 mb-2">{activity.description}</p>
{activity.parentNotes && ( <div><strong>Catatan:</strong> {activity.parentNotes}</div> )}
{activity.musyrifFeedback && ( <div><strong>Feedback Musyrif:</strong>{" "}{activity.musyrifFeedback}</div> )}
<p className="text-sm text-gray-600">{goal.description}</p>
{goal.parentNotes && ( <div><strong>Catatan Orang Tua:</strong> {goal.parentNotes}</div> )}
```

**Risk:** **High** if any of these fields can contain user-supplied or third-party data. Modern React escapes HTML by default, but care must be taken if `dangerouslySetInnerHTML` is used elsewhere or if input sanitization is not performed.

**Mitigation:**

- Always treat user-originated content as untrusted and, if rendering user input, ensure it is properly escaped or sanitized.
- Never use `dangerouslySetInnerHTML` with such fields unless strictly necessary and only after robust HTML sanitization.
- For particularly sensitive applications, consider additional runtime validation or sanitization on all fields displayed.

---

## 2. **Improper Exposure of Internal Identifiers**

### **a. Exposure of Raw IDs in the UI and DOM**

**Findings:**  
Fields like `activity.id`, `goal.id` are used directly as React `key` values and may show up in DOM inspection or automated scraping of the page.

**Risk:**

- Leaking internal identifiers can aid an attacker in API enumeration, object spoofing, or horizontal privilege escalation if APIs are keyed off these IDs and lack adequate backend authorization.

**Mitigation:**

- Use opaque identifiers where possible and never use predictable or incremental IDs for sensitive resources.
- Always ensure backend APIs enforce strict authorization on all resource access.

---

## 3. **Unvalidated User Actions (No CSRF/Authorization Checks)**

**Findings:**  
The `addActivity` and `shareWithTPQ` functions manipulate in-memory data in this mockup, but in full implementation would correspond to actions with side effects (such as POST requests to an API). There is no evidence of:

- CSRF protection (where relevant).
- Authentication/authorization checks.
- Validation of action parameters.

**Risk:**

- If connected to backend APIs, failure to implement these controls could allow unauthorized manipulation of data through forged requests.

**Mitigation:**

- Always protect state-modifying routes with CSRF tokens (for cookie-authenticated apps).
- Require proper authentication for all state changes.
- Validate all inputs server-side.

---

## 4. **Lack of URL Validation for Evidence Fields**

**Findings:**  
The `evidence.url` field (currently only displaying description, not URL) is not rendered in this code. However, if in the future you render a user-supplied URL as a link or media source, ensure you validate its protocol (deny `javascript:` and data-URIs except for known-safe types).

---

## 5. **Client-Side Date and Time Use**

**Findings:**  
The application uses client-side date/time for defaults and for activity records:

```js
const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0],
);
```

While not a direct security vulnerability now, relying on client clock alone can cause integrity issues and can be spoofed by an attacker (CAUTION: if time/date are used as "evidence" for certification, etc.).

**Mitigation:**

- Important timestamps should always be generated and validated server-side.

---

## 6. **Potential for Insecure Direct Object Reference (IDOR)**

**Findings:**  
Manipulation by activity/goal ID (`activity.id`, `goal.id`) for share/edit actions. In this mockup data, all state is local, so this isn't an issue, but in a fully implemented application, if the backend allows fetching or mutating records by ID without confirming that the current user has rights to the object, attackers may access/modify peer records.

**Mitigation:**

- Always perform authorization checks server-side using authenticated user/session context, not client-supplied IDs.

---

## **Summary Table**

| Vulnerability Category                  | Risk Level | Notes/Fixes                                            |
| --------------------------------------- | ---------- | ------------------------------------------------------ |
| XSS Potential (user-supplied rendering) | High       | Sanitize/escape all rendered user-supplied content     |
| Internal ID leakage                     | Moderate   | Use opaque IDs & backend auth                          |
| Unvalidated user actions (CSRF/Authz)   | High       | Require proper authentication and CSRF where necessary |
| URL validation for evidence             | Moderate   | Validate URLs if rendered/linked                       |
| Local-only date/time (integrity risk)   | Low        | Store/validate timestamps server-side                  |
| Susceptibility to IDOR                  | High       | Enforce server-side object-level authorization         |

---

## **Conclusion**

- While the current code uses only mock data and has no backend, if you adapt it to production, **you must ensure that all user-supplied content is properly escaped**, and **authorization is enforced on all APIs**.
- Avoid leaking sensitive identifiers and do not trust the client for important security decisions.
- Proactively sanitize, validate, and authorize all actions and displayed data.
