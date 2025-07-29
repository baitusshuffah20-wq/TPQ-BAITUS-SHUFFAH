# Security Vulnerability Report

**Target Code:** React Notification Provider Context  
**Review Focus:** Security Vulnerabilities  
**Date:** 2024-06

---

## Summary

This code provides notification functionality in a React application. It uses the browser's `localStorage` to persist notifications and user information. The implementation includes mock notification injection and notification management methods within a context provider.

Below are all identified security vulnerabilities within this code.

---

## 1. Untrusted Data Parsing from LocalStorage

### Location(s)

- `useEffect(() => { ... }, [])`
  - `const userData = localStorage.getItem("user");`
  - `setUser(JSON.parse(userData));`
- `useEffect(() => { ... }, [])`
  - `const savedNotifications = localStorage.getItem("notifications");`
  - `setNotifications(JSON.parse(savedNotifications));`

### Issue

**Risk:**  
**High** – The code reads and directly parses values from `localStorage` using `JSON.parse()` without validation or try/catch error handling.

**Explanation:**  
If an attacker manages to poison the application's `localStorage`, for example via XSS exploitation elsewhere, they could inject malicious or malformed objects into the `user` or `notifications` keys. Unchecked `JSON.parse()` calls can crash the app (denial of service) or cause attacks down the line when tainted data is used.

**Recommendation:**

- Always wrap `JSON.parse()` with try/catch.
- Validate the structure of parsed objects before use.
- Consider sanitizing or clearing suspicious data.

---

## 2. Storing Sensitive Data in LocalStorage

### Location(s)

- The code reads user data from `localStorage`:
  - `const userData = localStorage.getItem("user");`
- Notifications are persistently stored in `localStorage`.

### Issue

**Risk:**  
**Medium–High** – `localStorage` is accessible by any JavaScript running in the page's context, including malicious 3rd-party scripts introduced via XSS.

**Explanation:**  
Storing sensitive user information in `localStorage` exposes it to attacks like XSS, session hijacking, or user impersonation. While the notification contents may not always be sensitive, user information in the `"user"` key (depending on what is stored under that label) is likely to be sensitive.

**Recommendation:**

- Do not store sensitive user details (tokens, emails, permissions, IDs, etc.) in `localStorage`. Use more secure alternatives (e.g. httpOnly cookies for authentication).
- If persistence of non-sensitive notifications is needed, encrypt or at least validate/sanitize the notifications before storage and after retrieval.

---

## 3. Unsafe Handling of Notification Content

### Location(s)

- The notification messages are directly shown via `toast(...)` with content derived from notification objects, e.g.:
  - `const toastMessage = `${notification.title}: ${notification.message}`;`
  - Later, passed to various `toast.*()` calls.

### Issue

**Risk:**  
**Medium** – If notification inputs (`title` or `message`) can be user-controlled or originate from untrusted sources (e.g., external APIs, administrative panels), this code may be vulnerable to DOM-based XSS if the toast or its underlying library injects HTML directly.

**Explanation:**  
Even though `react-hot-toast` generally escapes content, allowing user input to enter the UI without sanitization is risky, particularly if library updates or “dangerouslySetInnerHTML” is ever used in customizations.

**Recommendation:**

- Only allow trusted sources to inject notification content.
- Sanitize or carefully validate notification values before rendering.
- Audit usage of notification fields throughout the app for possible HTML injection.

---

## 4. Type and Data Validation

### Location(s)

- The code allows arbitrary data via the `data?: any` field in notifications and largely trusts all the object shapes received (especially when loaded from localStorage).

### Issue

**Risk:**  
**Medium** – The absence of structural validation exposes the provider to integrity issues or possible prototype pollution attacks if maliciously crafted objects are inserted into localStorage.

**Explanation:**  
Attacks exploiting poor type validation can lead to logic errors, application crashes, and—depending on notification rendering—security problems.

**Recommendation:**

- Strictly validate notification object structure after loading from localStorage.
- Replace `any` types with strict interfaces or types.
- Use libraries like `zod` or `io-ts` for schema validation on loaded data.

---

## 5. Denial of Service via Large Storage or Corrupt Data

### Location(s)

- The code slices notification arrays to 50 items, but does not handle extremely large or corrupt payloads inside `localStorage`.

### Issue

**Risk:**  
**Low–Medium** – Malicious actors could stuff oversized or broken notification data in `localStorage`, potentially causing performance issues or crashes (DoS).

**Recommendation:**

- Limit the total serialized size of notifications in localStorage.
- Catch parsing errors and gracefully recover / reset stored data when invalid.

---

## 6. Potential Information Disclosure via Notification Data

### Location(s)

- The notifications and their payloads may include data such as financial transactions, donor names, event dates, and possibly PII in `data`.

### Issue

**Risk:**  
**Contextual** – If notifications expose sensitive personal data, it could be leaked to scripts with localStorage access or via browser developer tools.

**Recommendation:**

- Avoid storing notification data containing PII, payment details, or sensitive event data, unless absolutely necessary.
- Periodically clear or encrypt notification storage.
- Inform users about data stored in browser.

---

# Summary Table

| Issue                                         | Severity | Remediation                                                                  |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Untrusted data parsing from localStorage      | High     | Wrap JSON.parse in try/catch, validate structure                             |
| Storing sensitive data in localStorage        | Med-High | Avoid storing user data; use cookies or more secure storage                  |
| Unsafe handling of notification content       | Medium   | Sanitize content, trust only known sources                                   |
| Lack of type/data validation                  | Medium   | Implement schema validation, avoid `any` for notification data fields        |
| DoS via large/corrupt notification data       | Med-Low  | Validate size, catch parsing errors, reset if invalid                        |
| Potential PII/financial info in notifications | Context  | Avoid sensitive data, encrypt, educate users, restrict data retention period |

---

# Recommendations

1. **Always validate and sanitize any data loaded from `localStorage`.**
2. **Use try/catch with all `JSON.parse()` operations.**
3. **Do NOT store sensitive user information (or API tokens) in `localStorage`.**
4. **Strictly validate notification payloads and avoid unsafe types.**
5. **Sanitize user-facing content, particularly when shown in toasts or any HTML context.**
6. **Log and monitor anomalous or corrupted data, and wipe/restore safe state when detected.**
7. **Educate application users and developers about risks of localStorage.**

---

**End of Security Vulnerability Report**
