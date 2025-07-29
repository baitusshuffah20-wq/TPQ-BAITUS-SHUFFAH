# Santri Achievements Page: High-Level Documentation

## Overview

This React component implements a comprehensive "Santri Achievements" dashboard for a dashboard application (likely for an educational or gamified system). It displays the logged-in user's achievement statistics, unlocked badges, available badges to unlock, and their ranking among peers. There is support for searching, filtering, sharing, and downloading achievement certificates.

---

### **Major Features**

#### **1. Data Handling & State Management**

- **Uses React state hooks** to manage:
  - User's unlocked achievements and available badges
  - Statistics (total points, badges, ranking)
  - Loading state
  - User-input filters for searching and filtering badges
  - Leaderboard data

- **Uses mock data** for demo purposes (can be replaced with API calls).

#### **2. Achievement Data Processing**

- Determines which badges the user has unlocked and which are still available.
- Calculates progress toward each available badge based on the user's stats.
- Identifies the "next badge" the user is closest to unlocking.

#### **3. UI Layout**

Divided into the following main sections:

- **Header**: Title and subtitle.
- **Statistics Cards**: Show total points, total obtained badges, and leaderboard ranking.
- **Next Badge to Unlock**: Shows the user's current progress toward their next achievable badge.
- **My Badges**: Visual grid of badges already earned, each with options to share or download certificates if available.
- **Leaderboard**: Shows top users and highlights the current user's ranking.
- **Available Badges**: List of badges not yet unlocked, supporting search and several filters (category, rarity, status). Unavailable results trigger a "No badges found" state with a reset filter option.

#### **4. Badge Filtering & Search**

- Provides text search of badges by name/description.
- Allows filtering available badges by:
  - **Category** (e.g., Quran, Attendance, Academic, Social, Special)
  - **Rarity** (e.g., Common, Uncommon, Rare, etc.)
  - **Status** (progressing, not started)

#### **5. Achievement Actions**

- **Share Achievement**: Uses the Web Share API if available, falling back to clipboard copy with a toast notification.
- **Download Certificate**: Opens the PDF certificate in a new tab if available.

#### **6. Component Integration**

- Uses several reusable components for:
  - **Layout** (`DashboardLayout`)
  - **Cards** (`Card`, `CardContent`, `CardHeader`, `CardTitle`)
  - **Badge Display** (`AchievementBadge`)
  - **Progress Meter** (`AchievementProgress`)
  - **Leaderboard** (`AchievementLeaderboard`)
  - **Buttons** and **icons**

---

## **Key Functions**

### **`loadData`**

- Filters and aggregates achievement and badge data.
- Sets the points, badge count, available badges, progress for each.
- Identifies the next badge to unlock.
- Sets leaderboard data.

### **`calculateBadgeProgress`**

- For each badge, computes how close the user is to meeting the requirements to unlock it (based on different stat types and conditions).

### **`handleShareAchievement` / `handleDownloadCertificate`**

- Provides interactive actions for each achieved badge, with appropriate user feedback.

---

## **Tech and Practices**

- Uses **React functional components and hooks** for interactivity.
- Relies heavily on **component composition** for modular and reusable UI.
- Uses **Lucide icons** for visual cues.
- Employs **TailwindCSS utility classes** for responsive layout & styling.
- User interactions and edge cases are handled gracefully (e.g., loading state, no results, error toasts).

---

## **Usage**

This page is used as part of a user dashboard to view:

- The user's current achievement progress
- A leaderboard of users
- Earned and available badges
- Provides sharing and downloading options for achievements

---

## **Replaceable Mock Data**

- **CURRENT_SANTRI**: The logged-in user's simplest representation.
- **MOCK_SANTRI_ACHIEVEMENTS**: A sample set of unlocked achievements.
- **MOCK_LEADERBOARD**: Example leaderboard entries.

---

## **Extensibility**

- **Can plug into real APIs** for up-to-date achievement, user, and leaderboard data.
- Filters and search are easily expandable.
- Badge and achievement logic is encapsulated and composable.

---

**In summary:**  
This is a robust, user-focused achievement tracking interface with progress visualization, social features, filterable badge galleries, and leaderboard gamification, tailored for a modern dashboard/web app context.
