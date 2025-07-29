# High-Level Documentation: AttendanceChart Module

## Overview

This module provides a set of React components and data generator utilities designed to visualize attendance data using various chart types via the Chart.js library (integrated through `react-chartjs-2`). It supports dynamic chart rendering (bar, line, doughnut) and customized tooltip/display logic, specifically for attendance management cases (e.g., tracking student or participant presence).

## Main Features

### 1. React AttendanceChart Component

- **Purpose**:  
  Displays an attendance chart (bar, line, or doughnut) with custom appearance, tooltip logic, and options.

- **Props**:
  - `type`: Chart type ("bar", "line", or "doughnut").
  - `data`: Chart data object as required by Chart.js.
  - `title` (optional): Chart title to be displayed.
  - `height` (optional): Height in pixels for the chart.

- **Features**:
  - Registers all necessary Chart.js elements for bar, line, and doughnut charts.
  - Responsive chart rendering with controlled aspect ratio.
  - Custom tooltips that show the number of "santri" (attendees) and, for doughnut charts, their percentage.
  - Tooltip styling (background color, text color, border).
  - For bar/line charts, Y axis always starts at zero and each value is suffixed with "santri" for clarity.

### 2. Data Generator Functions

The following helper functions process raw attendance data (arrays of attendance records, optionally grouped by class, etc.) and aggregate them into chart-friendly data structures:

#### A. `generateWeeklyAttendanceData(attendances)`

- **Purpose**:  
  Generates time-series data showing daily attendance breakdown ("present", "late", "absent") for the past 7 days.

- **Returns**:  
  Chart.js-compatible data object with labels for each of the last 7 days and corresponding datasets.

#### B. `generateMonthlyAttendanceTrend(attendances)`

- **Purpose**:  
  Calculates monthly attendance rates (as percentages) across the months of a calendar year.

- **Returns**:  
  Data for a line chart where each point is the percentage of attendance for that month ("Tingkat Kehadiran (%)").

#### C. `generateAttendanceStatusData(attendances)`

- **Purpose**:  
  Creates a breakdown of attendance status counts (e.g., present, absent, late, sick, permission) for use in a doughnut chart.

- **Returns**:  
  Pie/doughnut chart data: labels and values for each attendance status, colored appropriately.

#### D. `generateClassAttendanceData(attendances, halaqahs)`

- **Purpose**:  
  Compares attendance rates across different classes/groups.

- **Parameters**:
  - `attendances`: List of attendance records (with status and class identifiers).
  - `halaqahs`: List of class/group objects.

- **Returns**:  
  Bar chart data comparing attendance rates (%) per class.

---

## Summary Table

| Component/Function               | Purpose/Role                                             |
| -------------------------------- | -------------------------------------------------------- |
| `AttendanceChart`                | Generic chart rendering based on props and data          |
| `generateWeeklyAttendanceData`   | Weekly breakdown of attendance (3 statuses)              |
| `generateMonthlyAttendanceTrend` | Monthly trend of overall attendance rates                |
| `generateAttendanceStatusData`   | Distribution of attendance status for doughnut/pie chart |
| `generateClassAttendanceData`    | Attendance comparison between multiple groups/classes    |

---

## Typical Use Case

- Import `AttendanceChart` and relevant data generator.
- Process raw attendance data via a generator function.
- Pass the resulting data (and chart type) to the `AttendanceChart` component for display.

---

## Flexibility

- Handles different attendance statuses and extends to new ones easily.
- Accepts custom height and titles for charts.
- Adaptable to a variety of attendance data sources and groupings.

---

## Technology Stack

- **React (function components)**
- **Chart.js** (via `react-chartjs-2`)

---

_This documentation provides a high-level abstraction for developers intending to visualize attendance data using pre-built, configurable charts within a React application._
