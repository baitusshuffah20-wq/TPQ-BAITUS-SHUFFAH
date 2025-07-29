# Security Vulnerability Report

**Component:** `QuickLoginPage` (React, Next.js)<br>
**Reviewed:** June 2024

---

## Summary

This component provides a "Quick Login" feature with hardcoded accounts for different user roles. It is intended for testing purposes. The code is reviewed for security vulnerabilities that may introduce risks if used incorrectly, exposed to production, or not well-safeguarded.

---

## Identified Security Vulnerabilities

### 1. **Hardcoded Credentials**

#### Details

```js
const accounts = [
  { role: "Admin", email: "admin@rumahtahfidz.com", password: "admin123" },
  // ...
];
```

- **Severity:** Critical
- **Description:**  
  Credential pairs, including those for an administrative account, are hardcoded into the front-end source code and exposed as plaintext in the client bundle. These can be easily discovered by anyone with access to the JavaScript source (browsers, devtools, etc.).
- **Impact:**  
  If this code is ever deployed to a production environment, it grants attackers immediate access to privileged accounts, resulting in complete system compromise.
- **Recommendation:**
  - Remove hardcoded credentials from ALL code intended for production.
  - Use secure, environment-dependent mechanisms to handle test account logins (such as environment variables only loaded in local development).
  - Clearly segregate test and production code.

---

### 2. **Potential Insecure Feedback**

#### Details

```js
setLoginStatus(`Logging in as ${email}...`);
setLoginStatus(`Login successful! Redirecting...`);
setLoginStatus("Login failed. Invalid credentials.");
```

- **Severity:** Medium
- **Description:**  
  Feedback strings may leak which accounts are being used for login attempts. If error messages are made more specific (e.g. later changed to "No user found with this email"), this can assist attackers in enumerating valid account emails.
- **Impact:**  
  In production, verbose login status feedback can be abused for account enumeration attacks.
- **Recommendation:**
  - Ensure error messages do not divulge whether the email or password was incorrect.
  - Use generic login failure messages in production.

---

### 3. **Client-Side Authentication Bypass Risk (via Test Login Feature)**

#### Details

The quick login mechanism allows a user to trigger login as privileged users with a single click (client-side).

- **Severity:** Critical
- **Description:**  
  Any user can login as _any_ role, including Admin, from the browser interface, bypassing all access controls. If this feature is exposed in production, no authentication or authorization is enforced.
- **Impact:**  
  Complete breakdown of your authentication model & privilege system.
- **Recommendation:**
  - Ensure this feature is completely removed from production builds.
  - Place test-only pages behind feature flags, dev environment checks, or strong authentication barriers.
  - Audit deployment processes for accidental inclusion.

---

### 4. **Sensitive Data Exposure in Browser**

#### Details

All account emails and passwords are shipped directly to the browser bundle.

- **Severity:** High
- **Description:**  
  The full credential set is visible to anyone inspecting the source, increasing the attack surface and facilitating credential stuffing attacks against other platforms.
- **Impact:**  
  Leaked secrets and potential for cross-site attacks if real credentials are used elsewhere.
- **Recommendation:**
  - Never expose real or reusable credentials, even in "test" environments.
  - Prefer mocks, stubs, or ephemeral test users generated server-side.

---

### 5. **Lack of Brute-Force Protection on Login**

#### Details

The login mechanism exposed through `handleLogin` provides no form of brute-force or rate limiting.

- **Severity:** Moderate (depending on backend protections)
- **Description:**  
  Attackers can script automated login attempts without restriction.
- **Recommendation:**
  - Ensure backend login logic rate-limits requests.
  - Implement frontend throttling in high-risk testing environments.

---

## **Summary Table**

| Vulnerability                   | Severity | Recommendation        |
| ------------------------------- | -------- | --------------------- |
| Hardcoded Credentials           | Critical | Remove from prod/test |
| Verbose Login Feedback          | Medium   | Use generic messages  |
| Test Login Feature Accessible   | Critical | Remove from prod      |
| Client-side Credential Exposure | High     | Never expose secrets  |
| No Brute-force Protection       | Medium   | Throttle/Rate-limit   |

---

## **Conclusion**

This code introduces multiple severe security vulnerabilities. It is **imperative** that this quick-login/testing feature and _all hardcoded credentials_ are never included in production, staging, or demo environments exposed to untrusted users. Restrict to local development only, behind clear environment checks.

**If shipped to production as-is, this code constitutes a total security breakdown.**

---

**Action Required:**

- Remove or disable this quick login mechanism outside development.
- Never commit real credentials to public/private repositories.
- Educate team members on the criticality of separating test and production code.
