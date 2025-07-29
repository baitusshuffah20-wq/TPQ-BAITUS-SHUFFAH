# Santri Achievements Page – High-Level Documentation

## Purpose

This React component renders an interactive dashboard where a "santri" (student) can view their Islamic learning achievements (badges), progress, and ranking within their halaqah (study group). It provides features to review earned badges, see progress towards new achievements, filter/search available badges, view a leaderboard, and share/download achievement certificates.

---

## Key Features

1. **Statistics Overview**
   - Displays summary cards for:
     - Total points earned from achievements.
     - Number of badges unlocked.
     - Current ranking on the leaderboard.

2. **Next Badge Progress**
   - Highlights the badge closest to being unlocked with a progress indicator based on the student's learning stats.

3. **My Badges**
   - Shows a grid of badges the santri has earned, along with:
     - Unlock status and date.
     - Action options: Share achievement and download certificate (if generated).

4. **Leaderboard**
   - Shows top-ranking santri within the halaqah, highlighting the current user's position.

5. **Available Badges**
   - Displays all remaining badges that can be earned.
   - Powerful search and filter controls:
     - By name/description (search box).
     - By badge category (QURAN, ATTENDANCE, etc.).
     - By rarity (COMMON–LEGENDARY).
     - By unlock status (not started, in progress).
   - If no badges match the filter, offers a “Reset Filter” button.
   - Shows progress bar for each available badge.

---

## Data Handling

- **Mock Data** is used for:
  - Current santri profile and stats.
  - List of earned achievements.
  - Leaderboard standings.
- **Badge definitions and utilities** are imported from a dedicated library.

---

## Core Logic

- **Data Loading:** On mount, loads user achievements, calculates stats and progress, determines the next badge target, and sets up leaderboard data.
- **Badge Progress Calculation:** Determines the percentage toward unlocking each badge based on the santri's stats and the badge's criterion.
- **Filtering & Search:** Quickly filters available badges client-side using multiple criteria.
- **Sharing/Certificate Download:** Enables sharing achievements via browser APIs or copying to clipboard and downloads certificates if available.

---

## UI/UX Notes

- Built using reusable UI components (Cards, Buttons, Icons, etc.)
- Provides loader/spinner while data is loading.
- Error feedback via toast notifications.
- Responsive, card-based design adapts for mobile/desktop.
- Accessibility: Uses semantic elements and clear focus indicators.

---

## Extensibility

- Easily adapted to use real API endpoints for data.
- Designed to plug in additional badge types or categories.
- Suitable for any gamified achievement system with progression and sharing features.

---

**Summary**:  
This code creates a feature-rich "Achievements" page for students, combining motivational analytics, badge collecting, peer competition, progress tracking, and social/shareable recognition, all within an accessible and filterable dashboard interface.
