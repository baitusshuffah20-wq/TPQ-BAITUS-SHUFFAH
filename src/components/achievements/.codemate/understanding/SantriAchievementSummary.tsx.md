# SantriAchievementSummary Component - High-Level Documentation

## Overview

`SantriAchievementSummary` is a React functional component designed to visually summarize the achievement statistics of a student ("santri" in Indonesian) within an educational or gamified platform. It presents a concise card view featuring personal information, key achievement metrics, and recent accomplishments, with an option to view more details.

---

## Features

1. **Student Information Header**
   - Displays the student’s name, ID (NIS), and group/halaqah using visually distinct badges and icons.

2. **Achievement Statistics**
   - Shows the total points accumulated and the number of achievement badges unlocked by the student, each with colored icon visuals.

3. **Recent Achievement**
   - Highlights the student’s latest unlocked badge including badge visuals, name, and the achievement date.

4. **Detail View Callback**
   - Provides a button that, when clicked, triggers a callback to view detailed achievement history.

---

## Key Props

- `santriId`, `santriName`, `santriNis`  
  Basic identity and metadata of the student.

- `halaqahName`  
  The group or cohort to which the student belongs.

- `totalPoints`  
  The cumulative points reflecting progress or performance.

- `unlockedBadges`  
  The total number of badges the student has obtained.

- `recentAchievements`  
  An ordered array of recent achievement records; the latest one is highlighted.

- `badges`  
  The definitions and details of possible badges, for lookup and rendering badge visuals/details.

- `onViewDetails`  
  Optional. A callback function triggered when the "Lihat Detail Pencapaian" (View Achievement Details) button is clicked.

---

## UI Summary

- Renders a card using `Card` and `CardContent` components for structure.
- Displays:
  - Santri data in a gradient header with icons.
  - Two side-by-side achievement stats (points & badges), each with an accompanying themed icon.
  - Most recent achievement with badge image and timestamp, if one exists.
  - An actionable button at the bottom if a detail view is possible.

---

## Supporting Utilities

- **`formatDate`**: Formats date strings into a short, readable format in Indonesian locale.
- **`getBadgeDetails`**: Looks up complete badge info from the badge list using a badge identifier.

---

## Integration Points

- The component depends on visual components and icons from libraries (like `lucide-react` for icons, custom `Card`, `Button`, and `AchievementBadge` components).
- Relies on external data models (`SantriAchievement`, `AchievementBadgeType`) for correct typing and data structure.

---

## Intended Use

- As a dashboard widget or a summary card within a larger application focused on student progress tracking or gamified learning achievements.
- To provide teachers, parents, or students themselves with a quick, visually-appealing summary of key achievements and progress metrics.

---

**Note:** Customization and expanded detail rendering can be handled by using the provided `onViewDetails` callback for navigation or modal display.
