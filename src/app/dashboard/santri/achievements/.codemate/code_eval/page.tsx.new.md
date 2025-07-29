# Code Review Report

Below is a **critical professional review** of your `SantriAchievementsPage` code, listing all identified issues, unoptimized patterns, and non-standard practices, along with **suggestions and code fixes** in _pseudo code_ (please insert these into the appropriate places):

---

## 1. **Hard-Coded Mock Data**

**Finding:**  
All data, including achievements, santri info, and leaderboard are hard-coded.  
**Industry standard:** API-driven or injectable data, with mocks only in test/dev.

**Suggestion:**  
Replace direct use with API calls or context-injected data in production code.

**Pseudo Code:**

```js
// Replace MOCK_SANTRI_ACHIEVEMENTS usage:
const achievements = await api.getSantriAchievements(CURRENT_SANTRI.id);
// And similar for leaderboard, santri, etc.
```

---

## 2. **Async useEffect (Anti-Pattern)**

**Finding:**  
`loadData` is `async` but invoked directly inside `useEffect` (which doesn't expect a promise).

**Suggestion:**  
Wrap `loadData` call in an async IIFE or define the `useEffect` callback as follows.

**Pseudo Code:**

```js
useEffect(() => {
  (async () => {
    await loadData();
  })();
}, []);
```

---

## 3. **Unnecessary Double Filtering For Badges**

**Finding:**  
Filters are **duplicated** inside both JSX render and below it to show the "no badges" message.  
**Unoptimized** — the expression is repeated, leading to duplicated logic and wasted computation.

**Suggestion:**  
Store filtered badges in a variable before returning JSX, then re-use.

**Pseudo Code:**

```js
const filteredBadges = availableBadges.filter((badge) => {
  // ...same filter logic here
});

// use filteredBadges everywhere
```

---

## 4. **Inefficient Array `find` In Render**

**Finding:**  
In multiple places, does `.find()` inside render (`ACHIEVEMENT_BADGES.find` for each achievement, and `leaderboard.find` for rank).

**Suggestion:**  
Build a lookup map for badges and the leaderboard outside the render.

**Pseudo Code:**

```js
const badgesById = Object.fromEntries(
  ACHIEVEMENT_BADGES.map((badge) => [badge.id, badge]),
);
const leaderboardById = Object.fromEntries(
  leaderboard.map((entry) => [entry.santriId, entry]),
);

const myRank = leaderboardById[CURRENT_SANTRI.id]?.rank ?? "-";

// In render: use badgesById[achievement.badgeId]
```

---

## 5. **useState Type "any"**

**Finding:**  
`const [leaderboard, setLeaderboard] = useState<any[]>([]);`  
**Suggestion:**  
Specify the typed shape for state for maintainability/safety.

**Pseudo Code:**

```js
type LeaderboardEntry = {
  santriId: string;
  santriName: string;
  santriNis: string;
  halaqahName: string;
  totalPoints: number;
  totalAchievements: number;
  rank: number;
};
const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
```

---

## 6. **Race Condition With Stale Closures**

**Finding:**  
If (in the future) filters, badge data, etc. are loaded from API concurrently, possible race conditions if using older data in setState.

**Suggestion:**  
Consider using functional `setState` or React Query/SWR in scaling systems.

**Pseudo Code:**

```js
// On setting state with possibly stale dependencies:
setAvailableBadges(prevBadges => /* calculate new based on latest "prevBadges" */);
```

---

## 7. **No Loading State For Share/Download**

**Finding:**  
No indication to user if download or share is in progress.

**Suggestion:**  
Add local loading state for those UI operations and disable buttons while pending.

**Pseudo Code:**

```js
const [downloading, setDownloading] = useState(false);
const handleDownloadCertificate = async (achievement) => {
  setDownloading(true);
  // ...rest
  setDownloading(false);
};
// Then disable the button when downloading
```

---

## 8. **Clipboard API Fallback Handling**

**Finding:**  
No user notification on clipboard API failure (permissions, etc).

**Suggestion:**  
Handle and notify errors using `.catch()` on `writeText`.

**Pseudo Code:**

```js
navigator.clipboard.writeText(message)
  .then(() => toast.success(...))
  .catch(() => toast.error('Gagal menyalin ke clipboard'));
```

---

## 9. **Missing Accessibility For Inputs**

**Finding:**  
Search and filter inputs do not have proper `aria-label` or associated `<label>`.

**Suggestion:**  
Add accessibility labels.

**Pseudo Code:**

```js
<input aria-label="Cari badge" ... />
<select aria-label="Filter kategori" ... />
```

---

## 10. **Magic Strings/Numbers Spread Throughout**

**Finding:**  
Criteria types, filter strings, category values, etc, are hard-coded/"magic".

**Suggestion:**  
Use enums or consts.

**Pseudo Code:**

```js
const CATEGORY_QURAN = "QURAN";
// ...then use CATEGORY_QURAN everywhere instead of 'QURAN'
```

---

## 11. **Default Case Handling, Defensive Programming**

**Finding:**  
In `calculateBadgeProgress`, a missing/invalid criteria type or badge structure may break the logic, but no warning or fallback is issued.

**Suggestion:**  
Add console warning and default progress for unexpected badge shape.

**Pseudo Code:**

```js
default:
  console.warn(`Unknown criteria type for badge:`, badge);
  return 0;
```

And similarly for other default cases.

---

## 12. **Repetitive Card Structure**

**Finding:**  
Repeated code for card layouts (statistics section).

**Suggestion:**  
Abstract card creation to a small render-function or component for re-use.

**Pseudo Code:**

```js
// function renderStatCard(icon, title, value, color)
<StatCard icon={...} title="Total Poin" value={totalPoints} color="purple" />
```

---

## 13. **No Error Boundary**

**Finding:**  
If any component throws, page will crash with ugly error.

**Suggestion:**  
Wrap with React error boundary.

**Pseudo Code:**

```js
<ErrorBoundary>
  <SantriAchievementsPage />
</ErrorBoundary>
```

---

## 14. **Potential Non-Unique Key In Lists**

**Finding:**  
List keys are badge IDs or achievement IDs which are probably unique (OK), but if duplicated or using index, would be an issue. Watch this if extending logic.

**Suggestion:**  
Continue to ensure keys are globally unique.

---

## 15. **Performance: Calculating/Filtering In-Render**

**Finding:**  
`availableBadges.filter(...)` is recalculated on every render.

**Suggestion:**  
Use `useMemo` to memoize filtered badges.

**Pseudo Code:**

```js
const filteredBadges = useMemo(() => {
  return availableBadges.filter(...);
}, [availableBadges, searchTerm, categoryFilter, rarityFilter, statusFilter]);
```

---

## 16. **Unused Imports**

**Finding:**  
Several icons are imported (e.g. Plus, BookOpen, Download, Share2, Bell, Crown, Calendar) but not used.

**Suggestion:**  
Remove unused imports to reduce bundle size and noise.

**Pseudo Code:**

```js
// Remove unused icon imports
```

---

## 17. **Uncontrolled Input Warning**

**Finding:**  
No default values/handlers for select/input fields if props or state changes.

**Suggestion:**  
Ensure always controlled components.

---

## 18. **Repetitive Filter Logic Between JSX and Badge Calculation**

**Finding:**  
Filter logic to apply filters to badges is duplicated in multiple places.

**Suggestion:**  
Consolidate filter logic into a utility function.

**Pseudo Code:**

```js
function filterBadges(badges, searchTerm, category, rarity, status) {
  // ...all logic here
}
```

---

## 19. **No PropTypes Or Interface For Component Props**

**Finding:**  
No explicit interface or PropTypes for complex components like `<AchievementBadge>` etc.

**Suggestion:**  
Define and export interfaces/types for all major components.

**Pseudo Code:**

```js
interface AchievementBadgeProps { ... }
```

---

### Overall Remarks

- Code is clean and follows a good degree of modularization, but it lacks efficiency in filtering and mapping, is too reliant on mock data for a production-level codebase, and should optimize for performance and maintainability.
- Careful with duplicated logic for maintainability.
- Enums/consts are needed for magic strings.
- Memoization and type safety should be improved.
- Accessibility and user feedback/error handling should be enhanced.

---

Please incorporate the above **pseudo code snippets** and suggestions into your base code for best industrial practices. If you need this inlined into your file or further explanations, let me know!
