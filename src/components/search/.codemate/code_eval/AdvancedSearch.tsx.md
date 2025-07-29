# AdvancedSearch Code Review Report

---

## General Assessment

The component is clean, well-segregated, and follows React and TypeScript conventions. However, several areas do **not adhere to industry standards**, contain **unoptimized** code, or have **minor logical errors**. Below is a critical review with suggestions and error corrections using pseudo code-style modifications.

---

## 1. **Unoptimized `useEffect` Dependency**

### Issue

```js
useEffect(() => {
  if (filters.query.length >= 3) {
    performSearch();
  } else {
    setResults([]);
    setTotalResults(0);
  }
}, [filters]);
```

- **Problem**: The effect **runs for every filter change** (including sort, status, etc.), which is inefficient. Debouncing/throttling for the search query is also **missing**.

### Recommendation

- Use a stricter dependency (`filters.query`, not the entire object).
- Use debounce for real-life applications to avoid too many API calls.

#### Suggested code:

```pseudo
useEffect(() => {
  // add debounce here for real usage, e.g., using lodash.debounce or custom
  if (filters.query.length >= 3) {
    performSearch();
  } else {
    setResults([]);
    setTotalResults(0);
  }
}, [
  filters.query,        // Only listen for query change
  filters.type,
  filters.status,
  filters.dateRange.start,
  filters.dateRange.end,
  filters.grade.min,
  filters.grade.max,
  filters.sortBy,
  filters.sortOrder,
  filters.halaqah    // Add each key individually instead of filters object
]);
```

_(For a real app, consider a debounce as well. Example: `debouncedPerformSearch(filters)`)_

---

## 2. **Improper Search Filtering/Condition**

#### Code:

```js
if (filters.status.length && !filters.status.includes(result.metadata.status))
  return false;
```

- **Problem**: Not all result types have a `metadata.status` key. For types with no status, this will filter out valid results.

#### Suggested code:

```pseudo
if (
  filters.status.length &&
  (
    typeof result.metadata.status !== "string" ||
    !filters.status.includes(result.metadata.status)
  )
)
  return false;
```

---

## 3. **Sorting Bug in String vs. Number**

#### Code:

```js
case "name":
  aValue = a.title;
  bValue = b.title;
  break;
...
if (filters.sortOrder === "asc") {
  return aValue > bValue ? 1 : -1;
} else {
  return aValue < bValue ? 1 : -1;
}
```

- **Problem**: `"name"` (title) — comparing strings with >, < is fine but can produce locale-unaware ordering and doesn't account for case.

#### Suggested code:

```pseudo
case "name":
  aValue = a.title.toLowerCase();
  bValue = b.title.toLowerCase();
  break;
...
if (filters.sortOrder === "asc") {
  return aValue.localeCompare
    ? aValue.localeCompare(bValue)
    : aValue > bValue ? 1 : -1;
} else {
  return bValue.localeCompare
    ? bValue.localeCompare(aValue)
    : aValue < bValue ? 1 : -1;
}
```

---

## 4. **Potential Bug: Invalid Numeric Input Handling**

#### Code:

```js
onChange={(e) =>
  updateFilter("grade", {
    ...filters.grade,
    min: parseInt(e.target.value) || 0,
  })
}
```

- **Problem**: If the input is empty (`""`), `parseInt("") === NaN` leading to `0` - which may not be the desired UX.

#### Suggested code (handle blank input correctly):

```pseudo
onChange={(e) =>
  updateFilter("grade", {
    ...filters.grade,
    min: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10) || 0)
  })
}
...
onChange={(e) =>
  updateFilter("grade", {
    ...filters.grade,
    max: e.target.value === "" ? "" : Math.min(100, parseInt(e.target.value, 10) || 100)
  })
}
```

- Additionally, you may want to validate before `performSearch`. If blank, don't include that parameter.

---

## 5. **Missing Key Prop Safety in Render**

- In mapping `result.metadata`, using the metadata key as the React key is risky if any duplication/array mutation happens.

#### Suggested code:

```pseudo
Object.entries(result.metadata).map(([key, value], idx) => (
  <span key={key + idx} ...>
    ...
  </span>
))
```

---

## 6. **Export Button Visibility Performance**

- The following is fine for limited mock results, but with large lists, toggling the presence of the Export button on every render may cause unnecessary re-renders.

#### Suggested (memoize results):

```pseudo
const hasResults = useMemo(() => results.length > 0, [results]);
...
{hasResults && (
  <Button ...>...</Button>
)}
```

---

## 7. **Type Handling for `halaqah` Filter**

- Filters include a `halaqah` array, but there is **no UI** or code shown about adding/removing halaqah filters.
- This may be an **incomplete feature**.

#### Suggested code (remind or add input/select for halaqah):

```pseudo
// Add a MultiSelect or Input for halaqah, then updateFilter('halaqah', value)
```

---

## 8. **Missing Accessibility**

- Buttons used for filters do **not have an `aria-pressed`** or `role="tab"` semantics for tabs.

#### Suggested code:

```pseudo
<button
  ...
  aria-pressed={filters.type === type.value}
  role="tab"
  ...
>
```

---

## 9. **Potential SSR/Client-Side React Hook Violation**

- `use client` is appropriately used at the top; there are no direct SSR-only constructs. 👍

---

## 10. **Minor: Consistency in Button Elements**

- Some buttons use `<button>` (unstyled), others use `<Button>` (component). For consistency and accessibility, use a button component everywhere.

#### Suggested:

```pseudo
// Replace <button> with <Button> if style or accessibility needed:
<Button ...>...</Button>
```

---

## Summary Table

| Issue                     | Level         | Suggestion (see code sections above)              |
| ------------------------- | ------------- | ------------------------------------------------- |
| useEffect dependencies    | Optimization  | List dependencies individually, consider debounce |
| Filtering status          | Bug/Safety    | Check existence of `metadata.status`              |
| String sorting            | Bug           | Use `.localeCompare`, change sort predicate       |
| Numeric input handling    | UX/Bug        | Handle `""` (empty) case for inputs               |
| React key in map          | Best Practice | Add unique fallback, e.g., `${key}${idx}`         |
| Export button performance | Optimization  | Use `useMemo` for length checks                   |
| Halaqah filter UI         | Feature/UX    | Add filter UI or remove if unused                 |
| Accessibility (tabs)      | A11y          | Add `aria-pressed` and `role`                     |
| Button usage consistency  | A11y/Style    | Use `<Button>` where possible                     |

---

**Implementing the above suggestions will bring your code closer to industry best practices, improve user experience, and future-proof it for scale and accessibility.**
