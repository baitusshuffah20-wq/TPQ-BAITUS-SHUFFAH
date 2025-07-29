# Security Vulnerability Report

## Codebase: SantriAchievementsPage (React/Next.js)

---

## 1. **Unvalidated & Unsafe File Download**

### Location

```js
const handleDownloadCertificate = (achievement: SantriAchievement) => {
  if (achievement.certificateUrl) {
    window.open(achievement.certificateUrl, '_blank');
  } else {
    toast.error('Sertifikat belum tersedia');
  }
};
```

#### **Vulnerability**

**Open Redirect and Arbitrary File Download/Script Execution**  
The function opens whatever URL is supplied in `achievement.certificateUrl` in a new browser tab. If the `certificateUrl` is not strictly controlled (could be attacker-controlled or untrusted), this opens up the risk for:

- Malicious sites being opened (phishing, malware, etc.)
- Downloading or executing malicious files
- Bypassing Content Security Policy (CSP)/SameSite policies depending on context

#### **Recommendation**

- Only allow URLs from known, trusted domains (ideally, only within your server/CSP domain).
- Use an allow-list or regex check to validate URLs.
- Prefer downloading files by proxying their content via a trusted backend, rather than opening raw URLs on the client.

---

## 2. **Clipboard Injection via `navigator.clipboard.writeText`**

### Location

```js
const handleShareAchievement = (achievement: SantriAchievement) => {
  const badge = ACHIEVEMENT_BADGES.find(b => b.id === achievement.badgeId);

  if (badge && navigator.share) {
    navigator.share({
      title: `Achievement: ${badge.name}`,
      text: badge.shareMessage,
      url: window.location.href
    });
  } else {
    const message = badge?.shareMessage || `Saya telah mendapatkan badge ${achievement.badgeName}!`;
    navigator.clipboard.writeText(message);
    toast.success('Pesan berhasil disalin ke clipboard!');
  }
};
```

#### **Vulnerability**

**Clipboard Injection**  
Values written to the clipboard (`message`) depend on badge data or user data. If any of these values can be manipulated (server-side or via future programming mistakes), untrusted content could be written to the clipboard. In certain browser/OS combinations, this may be abused by phishing or social engineering.

#### **Recommendation**

- Ensure `badge.name`, `badge.shareMessage`, and `achievement.badgeName` can't be set to arbitrary (potentially malicious) content.
- Prefer limiting clipboard content to controlled templates/sanitized strings.
- Consider additional user confirmation before writing to the clipboard.

---

## 3. **Potential XSS in Unescaped User Data**

### Location

While the main rendered output of the page appears to display data such as `CURRENT_SANTRI.name`, `badge.name`, `badge.description`, etc., **React escapes most values by default**. However, there may be a risk if any of the components (`AchievementBadge`, `AchievementProgress`, etc.) use `dangerouslySetInnerHTML` or otherwise introduce unescaped HTML.

#### **Vulnerability**

**Cross-Site Scripting (XSS)**  
If any of the data (`badge.name`, `badge.description`, `achievement.badgeName`, etc.) can contain untrusted input and is rendered with `dangerouslySetInnerHTML` or interpolated into raw HTML, an attacker could inject scripts.

#### **Recommendation**

- Verify all nested components escape user content.
- Avoid or tightly control any usage of `dangerouslySetInnerHTML`.
- Sanitize any server-provided content.

---

## 4. **Lack of Authorization Check**

### Location

```js
// Using mock data for CURRENT_SANTRI and achievements.
```

#### **Vulnerability**

**Horizontal Privilege Escalation**  
The function assumes CURRENT_SANTRI cannot be tampered with; however, in a real application, if achievement data or user IDs are supplied from client-side state or APIs without server-side access controls, a malicious user could query or manipulate another user's data.

#### **Recommendation**

- Enforce backend-side session and access controls for any sensitive data.
- Never trust client-provided identifiers.
- Filter and authorize access to resources on the server.

---

## 5. **Information Disclosure via Leaderboard**

### Location

```js
const MOCK_LEADERBOARD = [ ... ];
```

#### **Vulnerability**

Displaying other users' names and NIS numbers in a leaderboard may lead to:

- **Personal information exposure** if data is sensitive or not public.

#### **Recommendation**

- Limit displayed PII as much as possible.
- Provide settings for users to opt-in/-out of leaderboard exposure.
- Mask or pseudonymize information if required by privacy policy.

---

## 6. **No Input Validation on Filters/Search**

### Location

```js
<input ... value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
// Category/selects on filter
```

#### **Vulnerability**

- Although values are stored in state, if the filter or search values are used directly in queries (in serverside code) without validation, it may introduce **injection attacks** (e.g. SQL Injection, NoSQL Injection).

#### **Recommendation**

- Always validate and sanitize inputs before using in database/API queries.
- For this mock/client scenario, risk is low, but it is an important consideration for future API or backend integration.

---

## 7. **External Files/Images with No CSP or Validation**

### Location

```js
photo: '/images/santri/ahmad.jpg',
certificateUrl: '/certificates/ahmad_first_surah.pdf',
```

#### **Vulnerability**

If remote/user-uploaded images or files are not validated, could allow upload or serving of malicious scripts/content.

#### **Recommendation**

- Strictly validate file uploads.
- Enforce MIME type checking.
- Use strong Content Security Policies (CSP) to prevent attacks via malicious files.

---

# Summary Table

| Vulnerability                        | Risk       | Remediation                                             |
| ------------------------------------ | ---------- | ------------------------------------------------------- |
| Unvalidated certificate URL download | High       | Restrict to allowed domains, validate URLs, proxy files |
| Clipboard injection                  | Medium     | Sanitize, template content, user confirmation           |
| XSS in user/badge data               | High       | Escape all user-controlled input                        |
| No authz on user data                | Critical   | Enforce backend access control                          |
| PII in leaderboard                   | Medium     | Limit/mask PII, enable privacy controls                 |
| No input validation for filters      | Low-Medium | Validate/sanitize all user input                        |
| Unsafe file/image outputs            | High       | Validate all uploads, enforce CSP, sanitize names       |

---

# **Security Recommendations**

1. **Never trust client-side data or input**—all access control must be enforced by the backend.
2. **Whitelist and sanitize all file URLs and user-facing data.**
3. **Escape all output** and avoid any use of `dangerouslySetInnerHTML` unless strictly necessary and safely handled.
4. **Implement privacy controls** for any public views of user data.
5. **Validate all form/filter input** before using with backend/API/database.
6. **Enforce strong CSP** in your Next.js app to mitigate XSS and content injection.

---

**Note:**  
While this analysis is focused on security vulnerabilities, other code quality, architectural, or privacy issues may be present in the larger codebase or dependencies. Always perform regular security audits as features and integrations are added.
