# Code Review Report

## General Observations

- The code is written in React (TypeScript), using functional components and hooks.
- The component is intended to be a parent-teacher communication interface.
- The code structure is reasonably clean, with plenty of UI components and proper use of state.

---

## **Critical Industry-Level Issues**

### 1. **Hardcoded User Data (Auth context is missing)**

**Issue:**  
User information such as `"Orang Tua Ahmad"` is hardcoded in the `sendMessage` function and the mock data.  
**Improvement:**  
Use authentication context to dynamically get the current user's information rather than hardcoding user names and roles.  
**Suggested Pseudocode Correction:**

```js
// Inside sendMessage()
const { currentUserName, currentUserRole } = useAuthContext(); // Example context usage
const message: Message = {
    ...
    from: currentUserName,
    fromRole: currentUserRole,
    ...
};
```

---

### 2. **Unnecessary use of useEffect for simple synchronous mock data**

**Issue:**  
The useEffect and `loadMessages` simulate an API call but always returns the same array.  
**Improvement:**  
For real implementation, connect to an API. For a mock, consider setting directly unless testing loading indicators.  
**Suggested Pseudocode Correction:**

```js
// For production: Replace with real API call
const loadMessages = async () => {
    try {
        setLoading(true);
        const data = await api.getMessages(); // pseudocode for fetching
        setMessages(data);
    } ...
```

---

### 3. **No Error Handling When Sending a Message**

**Issue:**  
The `sendMessage` function does not handle potential errors if message sending fails (e.g. API error).  
**Improvement:**  
Add try-catch and error toasts for realistic error feedback.  
**Suggested Pseudocode Correction:**

```js
const sendMessage = async () => {
    ...
    try {
        setMessages((prev) => [message, ...prev]);
        setNewMessage("");
        toast.success("Pesan berhasil dikirim!");
    } catch (error) {
        toast.error("Gagal mengirim pesan");
        // Consider rolling back optimistic update if implemented
    }
};
```

---

### 4. **Priority and Message Type Color Hardcoding**

**Issue:**  
Color classes are hardcoded in functions.  
**Improvement:**  
Extract to a constant map for easier maintenance and scalability.  
**Suggested Pseudocode Correction:**

```js
const MESSAGE_TYPE_COLORS = { ... }
const getMessageTypeColor = (type) => MESSAGE_TYPE_COLORS[type] || ...;
```

---

### 5. **Date Formatting Logic (Time Zone Issues, Humanization)**

**Issue:**  
`formatDate` uses local time but doesn’t account for locales/time zones or provide "Today"/"Yesterday" humanizations.  
**Improvement:**  
Use date-fns/moment.js and locale strings or utilities for robustness.  
**Suggested Pseudocode Correction:**

```js
import { format, isToday, isYesterday } from "date-fns";
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Kemarin";
  return format(date, "d MMM", { locale: id });
};
```

---

### 6. **Inefficient Filtering (Lowercase conversion per render)**

**Issue:**  
Calling `toLowerCase()` on every message and search term on every render is inefficient.  
**Improvement:**  
String comparisons and search terms should be normalized/cached before filter loop.  
**Suggested Pseudocode Correction:**

```js
const lowSearch = searchTerm.trim().toLowerCase();
const filteredMessages = messages.filter((message) => {
  // use lowSearch, message.subjectLower, etc.
});
```

---

### 7. **Selected Conversation - No UI/Functional Effect**

**Issue:**  
`selectedConversation` is set but not used for rendering any detailed view or selected state.  
**Improvement:**  
Show message details in a modal or side panel when selected, or at least visually highlight selected message in the list.  
**Suggested Pseudocode Correction:**

```jsx
className={`... ${selectedConversation === message.id ? "ring-2 ring-teal-400" : ""} ...`}
```

---

### 8. **Attachment Handling Is Not Implemented**

**Issue:**  
Button for attachments exists but doesn't trigger file input or modal.  
**Improvement:**  
Implement actual attachment logic (file picker/input).  
**Suggested Pseudocode Correction:**

```jsx
<Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
    <Paperclip className="h-4 w-4" />
</Button>
<input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleAttachment} />
```

---

### 9. **Unique Key Use for List Rendering**

**Issue:**  
Mock data is fine, but if real messages could ever change IDs (e.g., temp client IDs), use a truly unique ID versus timestamp as key.  
**Improvement:**  
Ensure a reliable unique identifier per message; prefer server-assigned IDs.  
**Suggested Pseudocode Correction:**

```js
id: uuidv4(), // When creating new messages (for offline mode, etc.)
```

---

### 10. **Type Safety/Scalability on Filter and Select "value"**

**Issue:**  
The filter/select values are compared directly to string literals. Consider using enums or strict types for better safety.  
**Improvement:**  
Define a union or enum for type strings.  
**Suggested Pseudocode Correction:**

```ts
type MessageType = "all" | "PROGRESS_UPDATE" | "BEHAVIOR_REPORT" | ...;
const [filterType, setFilterType] = useState<MessageType>("all");
```

---

## **Other Recommendations**

- **Accessibility:** Add aria-labels/roles to key buttons (attachment, send, filters).
- **Loading State:** Represent empty with a spinner, skeleton, or better UX feedback.
- **Optimize Re-renders:** Consider React.memo for heavy components if needed.
- **Test Coverage:** Add unit/integration tests for filtering, rendering, sending, and error conditions.

---

## **Summary Table**

|           Issue            |  Importance  |   Suggested Pseudocode Location   |
| :------------------------: | :----------: | :-------------------------------: |
|    Hardcoded user data     |   Critical   | `sendMessage`, mock data creation |
|    Error handling send     |     High     |      `sendMessage` function       |
|   Inefficient filtering    |     Med      |          Filtering logic          |
|    No attachment logic     |     Med      |        Message composer UI        |
|       Key stability        |     Med      |         Message creation          |
|       Date handling        |     Med      |           `formatDate`            |
|     Type safety select     |     Med      |           Filter/select           |
|       Accessibility        | Nice to have |                UI                 |
| Show selected conversation |  UI nicety   |      Message list rendering       |

---

## **Conclusion**

The code is good as a starter but requires authentication integration, proper error handling, code performance/maintainability tweaks, and enhancements for production readiness.  
**Implement the above changes before moving to real infrastructure or project scaling.**
