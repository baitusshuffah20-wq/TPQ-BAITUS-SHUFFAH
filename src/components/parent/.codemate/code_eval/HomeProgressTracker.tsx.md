# Code Review Report

### Component: `HomeProgressTracker`

---

## General Review

- **Modularization:** The component contains a lot of logic and state in a single file. Consider refactoring (extract forms, tabs, card details, helper functions).
- **Mock Data:** Mock data is in the component function, preventing future connection with real APIs and causing data reset on each render.
- **Industry Practice:** Several industry best practices are not followed (error handling, unoptimized rerenders, missing keys, magic values).
- **Efficiency:** The logic for mock data, filters, and effect dependencies can be improved.

---

## Detailed Issues & Recommendations

### 1. **Unoptimized useEffect Dependency**

```js
useEffect(() => {
  loadHomeProgress();
}, [selectedDate]);
```

**Problem:**

- `mockActivities` and `mockHomeGoals` depend on `selectedDate`, but they are redefined on every render, which is not optimal for real implementations.

**Recommendation (pseudo code):**

```pseudo
// Move mock data definition outside of the component
const mockActivities = [ ... ];
const mockHomeGoals = [ ... ];
// Or use useMemo if must stay in component
```

---

### 2. **Redundant Mock Data Initialization**

**Problem:**

- Mock data is defined inside the component. Each render redefines these arrays. State updates have no persistent effect.

**Recommendation:**

```pseudo
// Place all mock data outside the component function
// OR use useRef/useMemo to memoize them.
const mockActivities = useMemo(() => [...], []);
const mockHomeGoals = useMemo(() => [...], []);
```

---

### 3. **Missing Icon Import**

```js
{ id: "summary", name: "Ringkasan Mingguan", icon: BarChart3 },
```

**Problem:**

- `BarChart3` icon is used in tabs, but `BarChart3` is not imported from "lucide-react".

**Recommendation:**

```pseudo
import { ..., BarChart3 } from "lucide-react";
```

---

### 4. **Potentially Null Evidence**

```js
{
  activity.evidence && <span>Bukti: {activity.evidence.description}</span>;
}
```

**Problem:**

- There are activity objects without `evidence` property, which may cause errors if deeply accessed elsewhere (not here directly, but in more complex scenarios).

**Recommendation:**

```pseudo
// Ensure safe access when referencing nested properties.
// If need to access media URL or similar, use optional chaining:
activity.evidence?.description
```

---

### 5. **Hardcoded Magic Strings**

**Problem:**

- Multiple places use magic strings for categories, quality, tab ids, etc., which can lead to typos/maintenance bugs.

**Recommendation:**

```pseudo
// Use enums/constants for category, quality, and tabs ids.
const CATEGORY = {
  IBADAH: "IBADAH",
  HAFALAN: "HAFALAN",
  ...
};
```

---

### 6. **No Error Handling for Activity Add/Share**

**Problem:**

- `addActivity` and `shareWithTPQ` have no async error handling. In future API-based implementations, this will fail silently.

**Recommendation:**

```pseudo
const addActivity = async (...) => {
  try {
    // API call here
    setActivities([...]);
    toast.success(...);
  } catch (e) {
    toast.error("Gagal menambah aktivitas.");
  }
}
```

---

### 7. **Uncontrolled Input For Date**

```js
<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="..."
/>
```

**Problem:**

- If selectedDate is ever set to an invalid value, no validation/blocking is present.

**Recommendation:**

```pseudo
onChange={e => {
  const nextDate = e.target.value;
  if (isValidDate(nextDate)) setSelectedDate(nextDate);
}}
```

---

### 8. **Recompute Filtered Arrays on Each Render**

```js
const todayActivities = activities.filter((a) => a.date === selectedDate);
const todayPoints = todayActivities.reduce((sum, a) => sum + a.points, 0);
const completedActivities = todayActivities.filter((a) => a.isCompleted).length;
```

**Problem:**

- Filtering and reducing arrays every render is inefficient for large datasets.

**Recommendation:**

```pseudo
const todayActivities = useMemo(
  () => activities.filter(a => a.date === selectedDate),
  [activities, selectedDate]
);
const todayPoints = useMemo(
  () => todayActivities.reduce((sum, a) => sum + a.points, 0),
  [todayActivities]
);
const completedActivities = useMemo(
  () => todayActivities.filter(a => a.isCompleted).length,
  [todayActivities]
);
```

---

### 9. **Repetitive Helper Functions**

**Problem:**

- Repeated color mapping for both category and quality. Could use a single mapping object instead of switch-case for easier maintenance.

**Recommendation:**

```pseudo
const CATEGORY_COLORS = {
  IBADAH: "...",
  ...
};
const getCategoryColor = cat => CATEGORY_COLORS[cat] || "...";
```

---

### 10. **Keys on List Elements**

**Problem:**

- Some arrays (e.g., `[1,2].map`) use the index as a key instead of unique id.

**Recommendation:**

```pseudo
key={`skeleton-${i}`}
```

Or, if mapping real data, always ensure `key={item.id}`.

---

### 11. **Component Size and Complexity**

**Problem:**

- The component is too large (>300 lines), with periods of deeply nested UI. Hard to test, debug, or maintain.

**Recommendation:**

- Split code:
  - Activity Card (used in today tab)
  - Goal Card (used in goals tab)
  - Forms
  - Tab Navigation
  - Utility helpers

---

### 12. **Accessibility and Lint**

**Problem:**

- Buttons may lack descriptive aria-labels or roles, making it less accessible.
- Lint warning for missing dependencies in useEffect is likely.

**Recommendation:**

- Add aria-labels as appropriate to all interactive elements.
- Use ESLint and a11y tools.

---

## Summary of Code Suggestions

```pseudo
// 1. Move mock data outside the component or memoize it
const mockActivities = useMemo(() => [...], []);
const mockHomeGoals = useMemo(() => [...], []);

// 2. Add missing icon import
import { ..., BarChart3 } from "lucide-react";

// 3. Use useMemo for filtered/reduced values
const todayActivities = useMemo(() => activities.filter(...), [activities, selectedDate]);
const todayPoints = useMemo(() => todayActivities.reduce(...), [todayActivities]);
const completedActivities = useMemo(() => todayActivities.filter(...), [todayActivities]);

// 4. Use constants/enums for magic strings
const CATEGORY = { IBADAH: "IBADAH", ... };

// 5. (Optional) Replace switch-case with mapping objects for colors/text
const CATEGORY_COLORS = { IBADAH: "...", ... };
const getCategoryColor = cat => CATEGORY_COLORS[cat] || "...";

// 6. Add async error handling for mutating functions
try { ... } catch (e) { toast.error("..."); }
```

---

## Conclusion

- **Refactor for maintainability, performance, error tolerance.**
- **Modularize the large component into sub-components.**
- **Prepare the codebase for real API integration.**
- **Adopt best practices (constants, mapping objects, useMemo, error handling, accessibility, correct imports).**

**Following these suggestions will make the code closer to industry standards, more robust, and easier to maintain and scale.**
