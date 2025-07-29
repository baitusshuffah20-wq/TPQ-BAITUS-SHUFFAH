# Achievement Badge System - High-Level Documentation

This code defines a **TypeScript-based Achievement Badge system** for a learning platform, likely focused on Islamic educational programs. It allows defining, granting, and displaying various achievement badges to students ("santri") based on specific criteria.

---

## 1. **Core Data Structures**

### a. `AchievementBadge`

- Represents **each type of badge** that a student can earn.
- **Fields:**
  - `id`, `name`, `nameArabic`, `description`, `icon`, `color`
  - `category`: Badge group (e.g., Hafalan/Memorization, Attendance, Behavior, Academic, Special)
  - `criteriaType`: What the badge is awarded for (e.g., Surah count, streak, perfect score)
  - `criteriaValue` & `criteriaCondition`: Numeric value and logical condition for earning the badge
  - `timeframe`: Relevant period (e.g., all-time, monthly)
  - `rarity`, `points`, `isActive`
  - Messaging: `unlockMessage`, `shareMessage`

### b. `SantriAchievement`

- Represents a **badge actually earned or being worked towards** by a student.
- **Tracks:**
  - `santriId` & name, badge references, achievement date (`achievedAt`)
  - Progress (0–100), unlock status, notification/certificate status
  - Optional metadata for detailed tracking (e.g., surahs or ayahs completed, streak days, custom values)

---

## 2. **Sample Badges**

- Predefined examples (e.g., "Surah Pertama", "Juz Amma Master", "Hafidz Sempurna").
- Each example details requirements, look & feel, messages, and point/rating value.

---

## 3. **Helper Functions**

### a. **Formatting & Display Helpers**

- **`getRarityColor(rarity)`**  
  Returns color classes for different badge rarities.
- **`getRarityText(rarity)`**  
  Friendly text/translation for rarity.
- **`getCategoryColor(category)`**  
  Returns color classes based on badge category.
- **`getCategoryText(category)`**  
  Friendly category text/translation.

### b. **Badge Filtering Helpers**

- **`getBadgesByCategory(category)`**  
  Returns all badges in a given category or all badges if "all".
- **`getBadgesByRarity(rarity)`**  
  Returns all badges of a certain rarity or all badges if "all".

### c. **Criteria Evaluation**

- **`checkAchievementCriteria(badge, santriData)`**  
  Evaluates if a student's current statistics meet the criteria to unlock a specific badge:
  - Uses badge criteria type and condition ("GREATER_THAN", "EQUAL", "LESS_THAN")
  - Checks corresponding values in the student data

---

## 4. **Usage Flow Overview**

1. **Define Badges:** Administrators configure badges in the `ACHIEVEMENT_BADGES` array.
2. **Track Santri Progress:** Each student's progress and earned badges are recorded in `SantriAchievement`.
3. **Award Badges:**
   - When relevant stats update, use `checkAchievementCriteria` to determine if a badge is earned.
   - Upon earning, trigger messages, notifications, and option for certificate generation.
4. **Display/UI:** Use the helper functions for rendering badges, categories, and rarities with consistent colors and labels.
5. **Filtering:** Show badges filtered by category or rarity when needed.
6. **Social/Certificate Sharing:** Includes unlock and share messages for students to celebrate or broadcast achievements.

---

## 5. **Extensibility**

- **Add new badge types** by expanding the enum values, criteria logic, and adding to the badge array.
- **Internationalization** is supported via fields like `nameArabic`.

---

## 6. **Potential Application Areas**

- Islamic education platforms (TPQ, Madrasas, Online Memorization Schools)
- Any educational app that tracks and rewards progress with badges

---

**Summary:**  
This system elegantly models customizable achievement badges, defines how they are granted, and handles their visual and textual representation for students in a multicultural, progress-driven educational setting.
