# Security Vulnerabilities Report

## Code Overview

The code is a React functional component implementing a "Santri Achievements" dashboard. It utilizes mock data for the current user, their achievements, and a leaderboard. It supports badge filtering, sharing achievements via the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) or clipboard, and certificate download functionality via window.open.

This review highlights **only security vulnerabilities** identified in the code.

---

## Identified Vulnerabilities

### 1. **Insecure Use of `window.open` for Certificate Download**

**Relevant code:**

```jsx
const handleDownloadCertificate = (achievement: SantriAchievement) => {
  if (achievement.certificateUrl) {
    window.open(achievement.certificateUrl, "_blank");
  } else {
    toast.error("Sertifikat belum tersedia");
  }
};
```

#### **Issue**

- Using `window.open` with a possibly user-influenced or insufficiently-validated URL can introduce [Open Redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) and [tab-nabbing](https://mathiasbynens.github.io/rel-noopener/) attacks.
- The `certificateUrl` is trusted as-is; if it can be manipulated, a malicious user could provide an external link.

#### **Risk**

- Redirecting users to a malicious site or enabling phishing attacks.
- If the URL opens in a new tab without rel="noopener noreferrer", the opened page can access the `window.opener` property and potentially control the original window/tab.

#### **Mitigation**

- Ensure `certificateUrl` is strictly validated (e.g., only allows site-relative URLs or vetted hosts).
- If using external URLs, always append `rel="noopener noreferrer"` or use alternative secure window open methods.

---

### 2. **Trusting Untrusted or Untyped Data in URL and Share APIs**

**Relevant code:**

```jsx
if (badge && navigator.share) {
  navigator.share({
    title: `Achievement: ${badge.name}`,
    text: badge.shareMessage,
    url: window.location.href,
  });
}
```

#### **Issue**

- Using `badge.name` and `badge.shareMessage` directly in user-facing APIs (including the clipboard write function).
- If these fields are not strictly controlled and can contain arbitrary user input, there is the risk of [Social Engineering](https://owasp.org/www-community/social_engineering_attack) attacks or [XSS via Social](https://cwe.mitre.org/data/definitions/79.html) if these are rendered unsanitized elsewhere.

#### **Risk**

- Users could be tricked into sharing misleading or malicious content if badge content is user-generated.
- **Note:** In this code, the data is from mock constants; however, in real applications, these would likely be from a database/ API and may be user-controlled.

#### **Mitigation**

- Sanitize all user-controlled strings before use in APIs or rendering.
- Apply filters or validation to badge display texts and share messages.

---

### 3. **Clipboard API Abuse**

**Relevant code:**

```jsx
navigator.clipboard.writeText(message);
```

- `message` may come from badge shareMessage or achievement.badgeName.

#### **Issue**

- If badge shareMessage or achievement.badgeName can be controlled by a user (e.g., cross-tenant or cross-user badge sharing), this could lead to the copying of misleading or malicious content.

#### **Risk**

- Indirect phishing by encouraging users to paste or use malicious or manipulative content elsewhere.

#### **Mitigation**

- Ensure message content comes from trusted input only or is sanitized.
- Apply context-specific output encoding if rendering anywhere in DOM.

---

### 4. **Unvalidated Enum/Filter Values May Allow Logic Abuse**

**Relevant code:**

```jsx
<select
  ...
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  <option value="all">Semua Kategori</option>
  {/* ... */}
</select>
```

- Similar for `rarityFilter`, `statusFilter`.

#### **Issue**

- If a user can manipulate the filter values (e.g., via DOM manipulation or crafted requests), unhandled or unexpected string values could result in logic bugs or potential filtering bypass.

#### **Risk**

- Not a critical security vulnerability but could allow information disclosure (badges from other categories, etc.) if the filtering logic is not robust.

#### **Mitigation**

- Always validate and restrict filter values to allowed enum lists before applying them in logic.

---

### 5. **Potential for User Enumeration in Leaderboard**

**Relevant code:**

```jsx
const achievements = MOCK_SANTRI_ACHIEVEMENTS.filter(
  (a) => a.santriId === CURRENT_SANTRI.id,
);
// and in leaderboard
```

#### **Issue**

- While not a direct technical vulnerability, exposing all user names, NIS (student numbers), halaqah, ranks, etc., in the leaderboard can create a privacy risk and facilitate user enumeration, especially if used with real data.

#### **Risk**

- Facilitates social engineering, phishing, or privacy breaches.

#### **Mitigation**

- In production, restrict exposure of sensitive data. Only expose necessary fields and only for authorized users.

---

## Noted Security Best Practices Absence

- **Input Validation**: No input validation or sanitization is visible on user-provided data.
- **Output Encoding**: Not observable in this code segment, but be aware if rendering user-provided or externally-loaded data in HTML attributes or as HTML content.
- **Error Logging**: Errors are logged to the console. Do not leak sensitive information in production environments.

---

## Summary Table

| Issue                                   | Risk Level | Description                                | Recommended Mitigation                  |
| --------------------------------------- | :--------: | ------------------------------------------ | --------------------------------------- |
| Insecure window.open & unvalidated URL  |    High    | Phishing, Open Redirect, Tab-nabbing       | Validate/limit URLs, use rel="noopener" |
| Unsanitized badge/share message content |    Med     | Social/phishing via clipboard or share API | Sanitize/validate fields                |
| Clipboard API (malicious copy possible) |  Low-Med   | Indirect phishing/data leakage             | Sanitize clipboard data                 |
| Enum/filter logic abuse                 |    Low     | Potential filtering bypass or logic bugs   | Validate allowed filter values          |
| User enumeration in leaderboard         |  Low-Med   | User privacy, social engineering           | Limit exposed identity data             |

---

## Conclusion

While the demo code uses only mock/static data, in real applications:

- Always **validate and sanitize all user-controlled or external data**, both on the backend and before rendering or sharing via APIs.
- Restrict **URLs and user actions** to trusted sources.
- Limit **information disclosure** to only what is needed for the current user’s context.

**Remediation is highly recommended** before moving code like this into a production environment.
