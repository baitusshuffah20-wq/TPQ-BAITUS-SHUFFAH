# Security Vulnerability Report

**Component:** `PaymentGatewayModal`  
**Source:** Provided React/TypeScript code

---

## 1. Dynamic Script Injection Vulnerability

**Description:**  
The code dynamically injects a `<script>` tag into the document's `<head>` using a URL returned from the backend API (`result.data.snap_url`). This introduces the risk of **arbitrary script execution** (XSS) if the backend is ever compromised or tricked into returning an attacker-controlled URL.

```js
const script = document.createElement("script");
script.src = result.data.snap_url;
script.setAttribute(
  "data-client-key",
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
);
document.head.appendChild(script);
```

**Risks:**

- **Remote Code Execution**: If `snap_url` is not strictly validated by the backend, an attacker can inject malicious scripts.
- **Pivot for further attacks**: A successful injection could compromise user sessions, steal payment data, or manipulate the UI.

**Recommendation:**

- Ensure the backend only ever returns _static, expected_ URLs.
- Whitelist and validate all loaded script URLs both on the server and client.
- Consider using a Content Security Policy (CSP) to restrict the sources of executable scripts.
- Ideally, load scripts statically or from trusted domains, and consider alternatives to dynamic script injection.

---

## 2. Use of Environment Variable in the Browser

**Description:**  
Sensitive environment variables may be exposed to the browser:

```js
process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
```

Although `NEXT_PUBLIC_` variables are by design meant to be exposed, use caution for any secret or sensitive configuration.

**Risks:**

- Exposure of keys can allow attackers to interact with the same payment provider as a registered client.
- May aid in phishing or fraud against the payment system.

**Recommendation:**

- Confirm the client key is meant to be public and cannot be abused independently of authentication or other controls.
- Avoid leaking unnecessary configuration to the client.

---

## 3. Insufficient Validation/Sanitization of External Data

**Description:**  
The component accepts and renders various data (e.g., `paymentData`, values from the API), but does not sanitize or validate them before display. This includes:

- Payment method names
- Descriptions
- Amounts

**Risks:**

- **Stored/Reflected XSS**: If any displayed data is not fully under your control, especially if it might include HTML or JavaScript, you risk XSS attacks.

**Recommendation:**

- Always sanitize and/or encode all external data before rendering, especially if it could include user input or be manipulated from the backend.

---

## 4. Lack of Error Handling on Network Calls

**Description:**
No specific error handling or request timeouts are implemented for network calls to the backend.

**Risks:**

- Application may hang or expose more data in errors than intended.
- Lack of rate-limiting or error handling could be abused for Denial of Service (DoS) attacks.

**Recommendation:**

- Implement robust error handling, and avoid displaying sensitive error information to the end user.
- Use request timeouts.

---

## 5. Usage of Global Window Object

**Description:**
Direct use of `window.snap.pay` and `window.location.reload()` without checks or controls.

**Risks:**

- Calling global objects without checks could interfere with future changes and polyfill attacks.

**Recommendation:**

- Add guards before using global objects and consider ways to avoid direct manipulation.

---

## 6. No CSRF Protection Shown for Sensitive Endpoints

**Description:**
POST requests are made to `/api/payment/create` with no indication of CSRF protection. While this might be less relevant for SPAs with proper authentication and CORS, it is still a significant concern for payments.

**Risks:**

- If not protected, could allow attacker to trigger unwanted payments on behalf of users.

**Recommendation:**

- Ensure CSRF mitigation is in place for all state-changing endpoints (server-side).
- Validate authentication and origin server-side for payment-related actions.

---

## 7. No Clickjacking Protection

**Description:**
As a modal for making payments, if the app/page is not protected by X-Frame-Options or CSP headers, an attacker could frame and overlay UI elements to trick users into interacting with the application (UI redress/UI spoofing).

**Risks:**

- Could result in unauthorized actions by tricking users (clickjacking).

**Recommendation:**

- Set appropriate headers (`X-Frame-Options: DENY` or CSP `frame-ancestors 'none';`).
- Consider visual anti-clickjacking measures if relevant.

---

## 8. Refresh Status Triggers Full Reload

**Description:**
The "Refresh Status" button triggers a full page reload:

```js
<Button onClick={() => window.location.reload()}>Refresh Status</Button>
```

While not directly a traditional security issue, this could allow for state loss or exposure of transient sensitive information if the page contains query parameters or POST data.

**Recommendation:**

- Consider fetching only the required data to refresh status instead of full reload.

---

# Summary Table

| Issue                          | Severity | Recommendation                                              |
| ------------------------------ | -------- | ----------------------------------------------------------- |
| Dynamic Script Injection       | High     | Whitelist script URLs, CSP, do not use backend URLs blindly |
| Public client key exposure     | Medium   | Confirm necessity, limit public data                        |
| Lack of data sanitization      | High     | Encode/sanitize before rendering                            |
| No CSRF protection             | High     | Add CSRF protection to backend                              |
| No error handling/timeout      | Medium   | Add error handling, request timeouts                        |
| Use of global window object    | Low      | Add guards, avoid direct usage if possible                  |
| No clickjacking protection     | Medium   | Set X-Frame-Options, CSP frame-ancestors                    |
| Page reload for refresh status | Low      | Use state/data fetching instead                             |

---

# Conclusion

This payment modal's biggest security risks are around **dynamic script injection** and **unsanitized external data rendering**. There is also potential risk around **CSRF**, **information exposure**, and **lack of proper HTTP/UI security headers**.

## Recommended Next Steps:

- **Secure dynamic script injection** immediately.
- **Review all backend and frontend data flows** for possible injection/XSS.
- **Harden the server-side API** and add CSRF, authentication, and request validation.
- **Add strict CSP and X-Frame-Options headers** at the application/service level.
- **Validate all externally loaded resources** and never trust data or URLs from the backend.

---

_If you need detailed assistance for specific fixes or want code-level recommendations for any vulnerability, please clarify which area to prioritize._
