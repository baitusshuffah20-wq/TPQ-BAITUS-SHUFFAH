# HomeProgressTracker Component — High-Level Documentation

## Overview

`HomeProgressTracker` is a React component designed to help parents and educators monitor, record, and manage a child's (Santri's) progress and activities at home. It provides a dashboard-like UI to view daily activities, target goals, and track progress using a combination of summary cards, lists, and tab-based navigation. The component leverages mock data for demonstration, but is structured for future API integration.

---

## Main Features

### 1. Activity Tracking

- **Displays daily activities** for a specific child, including completion status, category (e.g., religious, academic, chores), points awarded, quality assessment, parent notes, evidence, and feedback.
- Allows **adding new activities** to the list (simulated).
- Activities can be **shared with TPQ** (an external platform/institution) for further monitoring.

### 2. Goal Management

- Lists **home goals** (e.g., daily prayer on time, helping at home), each with target date, progress percentage, daily/weekly targets, notes, and sharing status.
- Encourages **setting new goals**.

### 3. Daily & Progress Summary

- Shows key metrics for the selected date:
  - Completed activity count.
  - Total earned points.
  - Number of active goals.

### 4. Date and Tab Navigation

- **Date picker** to navigate and display records for any chosen day.
- **Tabs** to switch between:
  - Today's Activities
  - Home Goals
  - (Placeholder) Weekly Summary

### 5. Visual Feedback

- Uses cards, color-badges, icons (Lucide icons), and progress bars for intuitive status communication.
- Provides toast notifications for success/error on certain actions.

---

## State & Data Management

- **Data State:** Holds arrays for activities and home goals, as well as UI states for loading status, selected date, and current tab.
- **Mock Data:** Simulated data used in place of real API calls (but structure supports easy API integration).
- **Utility Functions:** For mapping category/quality to display text and colors.

---

## UI Components & Design

- **Card Components:** For summary, activity, and goal display.
- **Buttons:** For adding/logging activities and goals, sharing, and editing.
- **Progress Bars:** To visualize goal achievement.
- **Badges:** Category and quality indicators.
- **Conditional Messaging:** Empty states and feedback messages present when no data exists for a given view.

---

## Extensibility

- The component is built to easily support actual backend integration.
- Can be extended to include forms for editing/adding activities and goals.
- Helper functions allow easy theming (colors, text) based on data type.

---

## Use Case

**Target Audience:** Parents, guardians, or educators tracking child development outside of formal education (mainly at home).

**Main Benefits:**

- Centralized tracking and motivation for positive behavior.
- Continuous feedback & parent-teacher/mentor collaboration.
- Clear progress visualization for both daily tasks and long-term goals.

---

## Integration & Usage

```jsx
<HomeProgressTracker santriId="..." santriName="..." />
```

- Pass the child's unique ID and name as props.

---

## Summary

This component acts as a Home Progress Tracker, offering a highly visual, organized way to monitor and motivate a child's development across daily activities and ongoing goals, with strong potential for real-time updates and external sharing.
