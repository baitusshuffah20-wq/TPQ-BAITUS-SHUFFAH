# AI Insights Dashboard - High-Level Documentation

## Overview

The **AI Insights Dashboard** is a React functional component designed to provide a comprehensive, AI-powered overview of an educational system's performance, focusing on student metrics, attendance, performance, alerts, and trends. It provides interactive, data-driven insights for administrators or educators via a tabbed interface.

---

## Key Features

### 1. System Insights Fetching

- Fetches summarized data of the school/madrasah system (students, attendance, performance, alerts, trends) from the `/api/insights/system` endpoint on component mount.
- Handles loading and error states using toast notifications.

### 2. Student Insights (Preparation for Individual Analysis)

- Provides structure and UI placeholders to later fetch and display individual student analysis from `/api/insights/student/{id}` (not yet fully implemented in UI).

### 3. Data Visualization Components

#### a. System Overview Cards

- Displays key metrics:
  - Total students and active students
  - Average attendance (last 30 days)
  - Average performance (latest scores)
  - Active system alerts

#### b. Tabs Interface

- Four main analytical tabs:
  - **Overview:** Monthly trends (e.g., enrollment, attendance, performance) and a static performance distribution breakdown.
  - **Alerts & Recommendations:** Lists current system alerts with severity, badges, and context, or confirms all is clear.
  - **Trends Analysis:** Placeholder for upcoming deep AI-driven trend analysis.
  - **Student Insights:** Placeholder encouraging user to select a student for detailed analytics.

### 4. Refresh Mechanism

- Includes a "Refresh" button to manually reload system insights; uses a spinner and toast for UI feedback.

### 5. Iconography and Visual Indicators

- Utilizes Lucide React icons for metrics, trends, and alerts.
- Color-coded badges and progress indicators to signal alert severity and student risk levels.

### 6. Utility & Helper Functions

- Dynamically determines:
  - Alert icons and color badges based on alert type and severity.
  - Trend indicators (improving, declining, etc.).
  - Student risk badges.

### 7. Robust Loading & Error Handling

- Shows a spinner and friendly message while AI analysis is in progress.
- All network errors are caught and surfaced with toast notifications.

---

## Technology Stack

- **React** (Functional Components & Hooks)
- **TypeScript** for type safety (interfaces for system & student insights)
- **Lucide-react** icons for visuals
- **Toast notifications** for user feedback
- **Custom UI components** (Card, Badge, Button, Tabs)

---

## User Flow Summary

1. **Landing:** Shows loading spinner while fetching data.
2. **System Overview:** User sees a dashboard of key metrics.
3. **Tab Navigation:** User browses system trends, alerts, or prepares to drill into individual student analytics.
4. **Refresh:** User can refresh insights to trigger a new data fetch and re-analysis.
5. **Error Handling:** All failures provide real-time, actionable feedback.

---

## Extensibility

- Placeholders for deeper AI analyses (e.g., trend analytics).
- Structure ready for per-student insights implementation.
- Easily adaptable for additional metrics, charts, or drilling down into alerts/students.

---

## Intended Users

- School/Madrasah administrators
- Educators
- Data analysts focused on educational performance

---

**Summary:**  
This code implements a professional, user-friendly, and extendable dashboard for AI-powered educational insights, with real-time interaction, robust error handling, and a clean UI based on custom and third-party components.
