# SantriAchievementsPage Code Review

A critical review of the code with checks for industry standards, unoptimized sections, anti-patterns, and potential bugs. Where needed, suggested corrected code lines are given in **pseudocode**.

---

## 1. Unoptimized Double Filter Mapping

**Issue**:  
In the "Available Badges" section, there is a **duplicate filter operation** on `availableBadges`. This causes repeated evaluation of filter (including for the case where it just determines empty state), negatively impacting performance if data grows.

**Problem Area:**

```jsx
{availableBadges
  .filter((badge) => { ... })
  .map((badge) => (
    <AchievementBadge ... />
  ))}

{availableBadges.filter((badge) => { ... }).length === 0 && (
  // ...
)}
```

**Suggested Improvement**:  
Compute filtered results once, store in variable, and reuse:

```pseudo
let filteredBadges = availableBadges.filter(badge => /* filtering logic as above */)
// ...then, in render:
filteredBadges.map(badge => <AchievementBadge ... />)

if (filteredBadges.length === 0) { ... }
```

---

## 2. Async Function in useEffect

**Issue**:  
`loadData` is declared as `async`, but in `useEffect`, you simply call `loadData()`.  
React recommends not passing async functions directly to `useEffect`. This does not break in practice but is considered a code smell.

**Problem Area:**

```js
useEffect(() => {
  loadData();
}, []);
```

**Suggested Correction:**

```pseudo
useEffect(() => {
  (async () => {
    await loadData();
  })();
}, []);
```

---

## 3. Hardcoded/Deeply Nested Ternaries

**Issue:**  
There’s a deep chain of conditional expressions to choose the `currentValue` for `nextBadge` in the AchievementProgress:

```jsx
currentValue={
  nextBadge.criteriaType === "SURAH_COUNT"
    ? CURRENT_SANTRI.stats.surahsCompleted
    : nextBadge.criteriaType === "AYAH_COUNT"
      ? CURRENT_SANTRI.stats.ayahsMemorized
      : nextBadge.criteriaType === "PERFECT_SCORE"
        ? CURRENT_SANTRI.stats.perfectScores
        : nextBadge.criteriaType === "STREAK"
          ? CURRENT_SANTRI.stats.streakDays
          : CURRENT_SANTRI.stats.customData?.[nextBadge.id] || 0
}
```

**Suggested Refactor:**  
Abstract to a function for better readability (pseudocode):

```pseudo
function getCurrentValueForBadge(badge) {
  switch (badge.criteriaType) {
    case "SURAH_COUNT": return CURRENT_SANTRI.stats.surahsCompleted;
    case "AYAH_COUNT": return CURRENT_SANTRI.stats.ayahsMemorized;
    case "PERFECT_SCORE": return CURRENT_SANTRI.stats.perfectScores;
    case "STREAK": return CURRENT_SANTRI.stats.streakDays;
    case "CUSTOM": return CURRENT_SANTRI.stats.customData?.[badge.id] || 0;
    default: return 0;
  }
}
...
currentValue={getCurrentValueForBadge(nextBadge)}
```

---

## 4. Inconsistent Filtering Logic in "Status" Filter

**Issue:**  
The status filtering for `'progress'` (`progress > 0`) and `'available'` (`progress === 0`) can cause confusion if progress can be negative or over 100%. Also, for badges with undefined progress, `progress || 0` may hide data issues.

**Suggested Correction:**  
Use more explicit checks and document assumptions:

```pseudo
if (statusFilter === "progress" && badge.progress > 0 && badge.progress < 100) { ... }
if (statusFilter === "available" && (!badge.progress || badge.progress <= 0)) { ... }
```

Or even better, handle undefined progress explicitly.

---

## 5. Error Handling in handleShareAchievement

**Issue:**  
You assume `navigator.clipboard` is always available. On insecure origins or non-supporting browsers, it would fail.

**Problem:**

```js
navigator.clipboard.writeText(message);
toast.success("Pesan berhasil disalin ke clipboard!");
```

**Suggested Correction:**

```pseudo
if (navigator.clipboard) {
  navigator.clipboard.writeText(message)
    .then(() => toast.success(...))
    .catch(() => toast.error("Tidak dapat menyalin ke clipboard"));
} else {
  toast.error("Clipboard API tidak didukung di browser ini");
}
```

---

## 6. Magic Strings, Enums and Type Safety

**Issue:**  
Some filters and category comparisons use magic strings, which can lead to typos and hard-to-maintain code.

**Suggested Fix:**  
Where possible, define enums/constants for category, rarity, status values.

```pseudo
const Category = { QURAN: ..., ATTENDANCE: ..., etc };
const Rarity = { COMMON: ..., UNCOMMON: ..., ... };
const Status = { ALL: ..., PROGRESS: ..., AVAILABLE: ... };
```

---

## 7. No Dependency Array Update in useEffect

**Observation:**  
If `CURRENT_SANTRI` could ever be dynamic, `useEffect` should include [CURRENT_SANTRI.id] as dependency.  
At the moment, it's static, but if this code is ever adapted for multiple users, this will be important.

**Suggested Line:**

```pseudo
useEffect(() => { ... }, [CURRENT_SANTRI.id]);
```

---

## 8. Usage of Any

**Issue:**  
`const [leaderboard, setLeaderboard] = useState<any[]>([]);` -- using `any` is discouraged.

**Suggestion:**  
Define a type or interface for leaderboard entries.

```pseudo
type LeaderboardEntry = {
  santriId: string;
  santriName: string;
  // ...other fields
}
const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
```

---

## 9. Minor: User Feedback in Loading State

**Suggestion:**  
The `min-h-96` is non-standard. In Tailwind, `min-h-96` would mean `min-height: 24rem`, which may or may not exist depending on Tailwind config.

**Suggested Correction:**  
Confirm you’re using a valid class, e.g., `min-h-[24rem]` or `min-h-screen` as needed.

---

## 10. Missing Accessibility for Inputs

**Suggestion:**  
Add `aria-label` to search and filter `<input>`/`<select>` for accessibility.

```pseudo
<input aria-label="Cari badge" ... />
<select aria-label="Filter kategori" ... />
```

---

## Summary Table

| Issue                        | Type         | Suggestion                                    |
| ---------------------------- | ------------ | --------------------------------------------- |
| Double filter/map pattern    | Optimization | Precompute filteredBadges                     |
| `async` in useEffect         | Code smell   | Wrap async call in IIFE                       |
| Deep ternary logic           | Readability  | Abstract logic to helper function             |
| Filtering logic on status    | Bug/UX       | More explicit checks, handle undefined        |
| Navigator.clipboard fallback | Error BG     | Check for clipboard existence, error fallback |
| Magic strings                | Maintain     | Use enums/constants                           |
| useEffect dependencies       | Bug-prone    | Add dependency if user changes                |
| useState<any>                | Type safe    | Use actual TypeScript type                    |
| Loading state styling        | UX/CSS       | Confirm valid Tailwind class                  |
| Accessibility                | UX/A11y      | Add aria-labels                               |

---

## Most Important Corrected Code (Pseudocode Only):

```pseudo
// Pre-compute filtered badges (replace duplicate filtering in render)
let filteredBadges = availableBadges.filter(badge => {
  // ...same filtering logic as current implementation
});

// In JSX
filteredBadges.map(badge => <AchievementBadge ... />);
if (filteredBadges.length === 0) { ... }

// Async IIFE in useEffect
useEffect(() => {
  (async () => { await loadData(); })();
}, []);

// Refactor deep ternary logic:
function getCurrentValueForBadge(badge) {
  switch (badge.criteriaType) {
    case "SURAH_COUNT": return CURRENT_SANTRI.stats.surahsCompleted;
    case "AYAH_COUNT": return CURRENT_SANTRI.stats.ayahsMemorized;
    case "PERFECT_SCORE": return CURRENT_SANTRI.stats.perfectScores;
    case "STREAK": return CURRENT_SANTRI.stats.streakDays;
    case "CUSTOM": return CURRENT_SANTRI.stats.customData?.[badge.id] || 0;
    default: return 0;
  }
}

// Clipboard fallback
if (navigator.clipboard) {
  navigator.clipboard.writeText(message)
    .then(() => toast.success(...))
    .catch(() => toast.error("Tidak dapat menyalin ke clipboard"));
} else {
  toast.error("Clipboard API tidak didukung di browser ini");
}

// Use interface/type for leaderboard
type LeaderboardEntry = { ... };
const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

// Add aria-label to filter/select inputs for accessibility
<input aria-label="Cari badge" ... />
<select aria-label="Filter kategori" ... />
```

---

**General Note**:  
This code is well-structured for a React+TypeScript+Tailwind+Component UI stack, but the above patterns will make it more robust, readable, and scalable in a professional/industry environment.
