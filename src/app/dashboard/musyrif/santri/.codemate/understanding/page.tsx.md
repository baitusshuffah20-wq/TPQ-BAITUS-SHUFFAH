# High-Level Documentation: MusyrifSantriPage Component

## Overview

This React component represents a "Musyrif Santri" dashboard page, intended for a musyrif (mentor/teacher) to manage and monitor their students (santri) within an organization, such as a Pesantren or Islamic learning center.

## Main Features

- **Dashboard Layout:** Uses a shared dashboard layout wrapper for consistent page structure.
- **Data Loading:** Uses mock data for a list of santri (students) managed by the musyrif.
- **Search and Filter:** Provides input fields and controls to search students by name/NIS and filter by active halaqah (groups).
- **Santri Statistics:** Displays key summary cards with:
  - Total number of santri
  - Average progress percentage
  - Average attendance rate
  - Number of active halaqah
- **Santri List:** Shows a detailed, filterable/sortable list of santri, including:
  - Name, NIS, age, halaqah
  - Progress and attendance rates, color-coded for quick visual assessment
  - Last memorized section, phone, address
  - Action buttons for view, edit, and more options
- **Add Santri:** UI button for adding new santri (functionality not implemented in this mock).

## Key UI Components and Technologies

- **Cards/CardContent/CardHeader/CardTitle:** Reusable UI card components for grouping stats and content sections.
- **Button:** Custom button component for actions and interactivity.
- **Icons:** Rich set of icons for visual clarity, using Lucide React icons.
- **Responsive Design:** Uses Tailwind CSS for styling and is responsive for mobile and desktop presentation.
- **Auth Integration:** Uses the `useAuth` hook/provider to determine logged-in musyrif.

## State Management

- **searchTerm:** Local state for handling text search input.
- **selectedFilter:** Local state for selected halaqah filter.
- **filteredSantri:** Derived data, dynamically updated based on search and filter selections.

## Data Handling

- Filtering and searching are performed client-side on mock data.
- Utility functions determine color styling for progress and attendance rates.

## Extensibility

- The structure allows for easy integration with real API data sources.
- Search, filtering, and sorting can be expanded.
- Placeholder buttons allow for extension of CRUD operations.

## Purpose

Designed to improve efficiency, insight, and control for a musyrif managing their students—enabling them to monitor progress and attendance, maintain contact, and quickly take action as needed.
