# AchievementCard Component — High-Level Documentation

## Purpose

The `AchievementCard` React component displays a visual representation of an achievement badge for a user, showing badge details, lock/unlock status, progress, and actionable buttons such as sharing or downloading a certificate. It's designed for applications that implement a gamified achievements or rewards system.

## Key Props

- **badge**: The core data for the achievement (icon, title, description, rarity, category, points, etc.).
- **santriAchievement** (optional): User-specific achievement data, such as whether it's unlocked, when it was earned, and if a certificate is available.
- **isUnlocked** (optional): Boolean indicating if the achievement is unlocked.
- **progress** (optional): Number (percentage) showing progress towards unlocking the achievement.
- **onShare** (optional): Handler for "share" action.
- **onDownloadCertificate** (optional): Handler for certificate download.
- **showActions** (optional): Boolean to toggle display of action buttons.
- **size** (optional): Controls the card's size (`sm`, `md`, `lg`).

## Core Features

1. **Visual Representation** (Badge)
   - Shows the badge's icon, name, Arabic name, description, rarity, category, and points.
   - Rarity and category are highlighted using special colors and icons.

2. **Lock/Unlock State**
   - Locked achievements display a lock overlay with a "Terkunci" (Locked) message.
   - Unlocked achievements show their icons in color and may display a "newly unlocked" message.

3. **Progress Bar**
   - If an achievement is locked but in progress, a progress bar and percentage are shown.

4. **Date & Actions** (if unlocked)
   - Shows the unlock/achieved date.
   - Button actions to share or download a certificate (if provided by props).

5. **Responsive Sizing**
   - The card, icon, and text sizes change based on the provided `size` prop.

6. **Conditional Styling**
   - Uses gradients, border styles, and opacity adjustments to visually indicate achievement states.

## Design Notes

- Uses modular UI components (`Card`, `Button`) and Lucide icons for consistent design.
- Utility functions handle mapping data fields (e.g., rarity/category) to colors, icons, and text.
- Handles all major badge states: locked, in progress, just unlocked, and fully unlocked.
- Built for extensibility and easy integration into a wider achievement/reward system.

---

**Intended Usage:**  
Place `<AchievementCard ... />` in a list of user achievements to provide users with visually engaging feedback about their progress and accomplishments within an application.
