# Code Review Report

## 1. Use of "use client"

**Assessment**: Correct usage for Next.js app with client-side interactivity.

---

## 2. Data Handling – Mock Data in Component

**Issue**: The mock data for `santriList` lives inside the component function, so it's re-created on every render. This is inefficient and breaks referential equality, making memoization impossible if needed in the future.

**Suggestion (Pseudocode)**:

```javascript
// Move mock data outside the component function:
const santriList = [ ... ]; // define outside of MusyrifSantriPage

// Inside the component
// const santriList = ...   <-- remove this line
```

---

## 3. Filter Implementation – Static Filter Options and Matching

**Issue**: The filter dropdown options use hardcoded values (`"fatihah"`, `"baqarah"`, `"imran"`), but the `halaqah` values in santriList are "Al-Fatihah", "Al-Baqarah", etc. The filter comparison is case-insensitive includes, which can accidentally match wrong halaqah.

**Best Practice**: Use exact match and dynamically collect halaqah options from the data.

**Suggestion (Pseudocode)**:

```javascript
// Collect unique halaqah options outside render:
const uniqueHalaqah = Array.from(new Set(santriList.map((s) => s.halaqah)));

// In select options:
<option value="all">Semua Halaqah</option>;
{
  uniqueHalaqah.map((h) => <option value={h}>{h}</option>);
}

// Filtering logic:
const matchesFilter =
  selectedFilter === "all" || santri.halaqah === selectedFilter;
```

---

## 4. Unnecessary Filter Button

**Issue**: The filter button `<Button><Filter /> Filter</Button>` is always present and doesn't trigger any action; filtering is performed instantly on select/input change.

**Suggestion**: Remove the Filter button unless you want to add advanced filtering later.

**Suggestion (Pseudocode)**:

```javascript
// Remove these lines:
<Button variant="outline">
  <Filter className="h-4 w-4 mr-2" />
  Filter
</Button>
```

---

## 5. Statistics Hardcoding ("Halaqah Aktif")

**Issue**: "Halaqah Aktif" is hardcoded to "2". This should be programmatically derived from the data.

**Suggestion (Pseudocode)**:

```javascript
// Replace:
<p className="text-2xl font-bold text-gray-900">2</p>

// With:
<p className="text-2xl font-bold text-gray-900">
  {uniqueHalaqah.length}
</p>
```

---

## 6. UI – Accessibility Improvements

**Issue**: No aria-labels or semantic role on action buttons like "Tambah Santri", Eye, Edit, etc. This can reduce accessibility.

**Suggestion (Pseudocode)**:

```javascript
// For Button "Tambah Santri"
<Button className="mt-4 sm:mt-0" aria-label="Tambah Santri">

// For action buttons in santri list:
<Button variant="outline" size="sm" aria-label="Lihat Detail">
  <Eye className="h-4 w-4" />
</Button>
<Button variant="outline" size="sm" aria-label="Edit Santri">
  <Edit className="h-4 w-4" />
</Button>
<Button variant="outline" size="sm" aria-label="Opsi Lain">
  <MoreVertical className="h-4 w-4" />
</Button>
```

---

## 7. Defensive Checks – Display Initials

**Issue**: `santri.name.split(" ").map((n) => n[0]).join("")` assumes every word has at least one character. If a name is malformed (empty string, leading/trailing/multiple spaces), this could throw.

**Suggestion (Pseudocode)**:

```javascript
// Replace:
{
  santri.name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

// With:
{
  santri.name
    .split(" ")
    .filter(Boolean) // remove empty
    .map((n) => n[0])
    .join("");
}
```

---

## 8. Edge Case: Math.round with Empty Array

**Issue**: If `santriList.length === 0`, division by zero gives `NaN` on average calculations.

**Suggestion (Pseudocode)**:

```javascript
// Example for average progress:
const avgProgress =
  santriList.length > 0
    ? Math.round(
        santriList.reduce((acc, s) => acc + s.progress, 0) / santriList.length,
      )
    : 0;

// Use avgProgress instead of direct calculation
```

---

## 9. State Initialization – Unused "user" Variable

**Issue**: The fetched `user` from `useAuth()` is never used. This is confusing and may be forgotten code.

**Suggestion**: Remove the destructuring if not used.

```javascript
// Remove:
const { user } = useAuth();
```

---

## 10. Prop Types / Interface Enforcement (TypeScript)

**Issue**: No TypeScript type or interface for `santri` objects. This reduces type safety and editor support.

**Suggestion (Pseudocode)**:

```typescript
interface Santri {
  id: string;
  name: string;
  nis: string;
  age: number;
  halaqah: string;
  progress: number;
  lastHafalan: string;
  attendanceRate: number;
  phone: string;
  address: string;
  parentName: string;
  status: string;
  joinDate: string;
}

// santriList: Santri[]
```

---

## 11. Miscellaneous – Formatting consistency

**Assessment**: JSX uses a good className and prop naming style. No duplicate keys observed (good).

---

## 12. Unused Imports

**Issue**: `Mail` icon is imported but never used.

**Suggestion**:

```javascript
// Remove from import list:
Mail,
```

---

## Summary Table

| Issue                                | Severity | Suggestion                          |
| ------------------------------------ | -------- | ----------------------------------- |
| Mock data repeated on render         | Medium   | Move outside the component          |
| Filter not matching correctly        | Medium   | Use exact match and dynamic options |
| Static "Halaqah Aktif" count         | Low      | Derive programmatically             |
| Filter button not functional         | Low      | Remove unless used                  |
| Poor accessibility for buttons       | Medium   | Add aria-labels                     |
| Name initial extraction fragile      | Low      | Use .filter(Boolean)                |
| Average calculation can be NaN       | Medium   | Add length check before dividing    |
| Unused variables (user, Mail import) | Info     | Remove if not needed                |
| Lacking TypeScript interfaces        | Medium   | DefineSantri interface              |

---

## Conclusion

**Overall, the code is functional and clear, but lacks defensive checks, introduces inefficiency with mock data initialization, and needs basic data-driven and accessibility improvements. Addressing these will boost maintainability and production quality.**

---

**Citations / Further Reading:**

- [React performance: avoiding inline object/array/functions](https://react.dev/learn/optimizing-performance#avoid-defining-components-in-components)
- [MDN aria-label](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
- [Array.from, Set uniqueness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
