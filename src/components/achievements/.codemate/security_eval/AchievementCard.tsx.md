# Security Vulnerability Report

## Component: `AchievementCard`

### File: _(not specified)_

---

This report identifies **security vulnerabilities** present in the provided code. Non-security concerns (performance, maintainability, UI/UX, etc.) are **not addressed**.

---

## 1. **Potential XSS via Unescaped User Data**

### Description

There are several points at which the following `badge` properties are directly rendered:

- `badge.icon`
- `badge.name`
- `badge.nameArabic`
- `badge.description`
- `badge.unlockMessage`

If any of these values are user-controlled or may contain unsafe HTML/JS, this can introduce Cross-Site Scripting (XSS) vulnerabilities, especially if used with `dangerouslySetInnerHTML` or if `badge.icon` might itself be a raw HTML node (not clear from the code).

#### Example:

```jsx
<div className={`${getIconSize()} ...`}>
  {badge.icon}
</div>
...
<h3>{badge.name}</h3>
...
<p>{badge.nameArabic}</p>
...
<p>{badge.description}</p>
...
<p>{badge.unlockMessage}</p>
```

- **Risk:** If `badge.icon` is not a sanitized/component value (but instead allows raw HTML or SVG), it could allow XSS.
- **Risk:** If the data for `badge.name`, `badge.description`, etc. is not properly sanitized/escaped at the source, an attacker may inject HTML or scripts.

### Severity: **High**

**If** any of the above inputs are user-controllable or can be set by an attacker.

### Recommendations

- Ensure that all data rendered (`badge.*`) is either hardcoded, sanitized on the server, or comes from a trusted source.
- If `badge.icon` is allowed to be any React node, ensure it **cannot** be arbitrary user HTML.
- Never use `dangerouslySetInnerHTML` on unsanitized data.
- Prefer to encode/escape any possible user input before rendering.

---

## 2. **Sensitive Data Exposure via Date Formatting**

### Description

The code displays the date a badge was achieved:

```jsx
{new Date(santriAchievement.achievedAt).toLocaleDateString("id-ID", ...) }
```

If `santriAchievement.achievedAt` can be tampered with by the user or attacker, it could potentially be used to display misleading information. However, unless this is sent back to a server or relied upon for authentication/business logic, **this is not a major security risk.**

**No direct vulnerability in the usage shown.**

---

## 3. **Unvalidated or Uncontrolled Function Props**

### Description

Two props, `onShare` and `onDownloadCertificate`, are passed through and ultimately called as event handlers.

```jsx
<Button ... onClick={onShare}>...</Button>
<Button ... onClick={onDownloadCertificate}>...</Button>
```

- **Risk:** If these are passed in from untrusted sources, or could somehow be replaced by attacker logic (e.g., via prototype pollution or indirect object reference), they may execute unexpected code.

**In properly written React apps, this vector is generally controlled and not a security risk, unless the component is exported globally to different origins, or you use unsafe runtime code evaluation.**

### Recommendation

- Ensure only intended event handler functions are passed (by TypeScript and component boundaries).
- **Not a practical risk in local-scope, trusted code**.

---

## 4. **No Server-Side Trust Enforced via this Component**

### Observation

This component solely displays data and allows UI actions (share, download). **It does not authorize or validate any user actions or permissions**.

- The download button visibility is toggled solely via `santriAchievement?.certificateGenerated`, which is just a prop.
- An attacker could potentially manipulate client-side state or props and force rendering of UI elements they should not see. However, unless the `onDownloadCertificate` function is also gated server-side, this is an **application-level concern**.

**Reminder:** Always gate actual actions (downloads, sharing, etc.) on the server side, not by component logic alone.

---

## 5. **No Evidence of Insecure Direct Object Reference (IDOR)**

The code does not make direct references to achievement IDs, resource IDs, or data that could be used in an IDOR attack. **No issue found here**.

---

# Summary Table

| Vulnerability                   | Severity | Recommendation                                            |
| ------------------------------- | -------- | --------------------------------------------------------- |
| XSS via unescaped user data     | High     | Sanitize/escape all badge prop data, especially icon/name |
| Unvalidated event handler calls | Low      | Ensure only trusted functions passed as props             |
| Trust/UI gating by props only   | Medium   | Gate all actions server-side, not just in UI              |

---

# Recommendations

1. **Audit all sources of `badge.*` and `santriAchievement.*` for user-controllability.**
   - Sanitize inputs and ensure only valid React nodes, strings, or trusted values are rendered.

2. **Ensure no use of `dangerouslySetInnerHTML` on unsanitized data.**

3. **Gate sensitive actions (like certificate download) server-side, not just in UI logic.**

4. **Enforce strong typing and prop validation to ensure no `onShare` or similar is ever attacker-controlled.**

---

# Conclusion

The primary security risk in the provided code is **potential XSS** from unsanitized or untrusted user data rendered in the component.  
All other issues are typical in client-heavy apps and should be addressed as part of overall secure development lifecycle.
