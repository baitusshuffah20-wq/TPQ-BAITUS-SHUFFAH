# AchievementLeaderboard Component – High-Level Documentation

## Overview

`AchievementLeaderboard` is a reusable React functional component for displaying a list of user achievements in a "leaderboard" style card. It visually ranks users (santri) based on their point totals, highlights the top three with icons, and shows associated achievements and details. This component is suitable for gamified applications, educational dashboards, or any scenario where ranked achievement display is desired.

---

## Main Features

- **Display Leaderboard:** Shows a list of users, ordered by total points, and limited to a configurable maximum (default: 10).
- **Medal & Rank Visualization:** Top ranks receive distinctive icons and colors for quick visual distinction (e.g., crown for 1st, medals for 2nd/3rd).
- **User Data Presentation:** For each user, it displays their:
  - Profile photo (or a placeholder icon)
  - Name and ID (NIS)
  - Group/Halaqah affiliation
  - Total points
  - Badge/achievement count
- **Period and Custom Title Support:** Optionally show the leaderboard’s period and a custom title.
- **Interactivity:** Optionally allows clicking a user entry to perform an action (e.g., view details).
- **Empty State Handling:** Gracefully informs if there are no leaderboard entries.

---

## Props/API

**Props:**

- `entries: LeaderboardEntry[]` (required) – An array of entries containing user/achievement data.
- `title?: string` – Optional custom title for the leaderboard card.
- `period?: string` – Optional time period displayed below the title.
- `limit?: number` – Optional max number of entries to show (default: 10).
- `onViewSantri?: (santriId: string) => void` – Optional callback invoked when a user is clicked.

**LeaderboardEntry structure:**

- `santriId: string` – Unique user identifier.
- `santriName: string` – Name of the user.
- `santriNis: string` – User's ID number.
- `halaqahName: string` – User's group name.
- `totalPoints: number` – User’s score, used for ranking.
- `totalAchievements: number` – Number of badges/achievements user has.
- `rank: number` – User's rank for medal visuals.
- `photo?: string` – Optional user photo URL.

---

## Visual and UX Details

- **Card Layout:** All content is wrapped in a styled Card UI.
- **Icons:** Uses lucide-react icons for trophies, medals, crowns, users, and awards.
- **Highlighting:** Top 3 entries have subtle background highlights; first place uses a crown icon.
- **Responsive:** Entries are flex- and spacing-based for consistent layout.
- **Accessibility:** Falls back to placeholder icons when photos are absent.

---

## Usage Example

```jsx
<AchievementLeaderboard
  entries={myEntries}
  title="Top Santri of the Month"
  period="March 2024"
  limit={5}
  onViewSantri={(id) => openSantriDetails(id)}
/>
```

---

## Customization Points

- Adjust icon colors, icons, and badge displays as needed via component logic.
- Style and structure can be further tuned by modifying/overriding provided classes.

---

## Summary

This component efficiently presents ranked achievement data with strong visual cues, clear hierarchy, and optional interactivity. It is easy to integrate, extend, and style for leaderboard use cases in web apps.
