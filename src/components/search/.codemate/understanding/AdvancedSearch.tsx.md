# AdvancedSearch Component - High-Level Documentation

## Overview

This component (`AdvancedSearch`) is a fully featured advanced search interface designed for a web application, possibly an educational or administrative system managing students ("santri") and related data (memorization, attendance, payments, news, etc.). It allows users to search and filter records with various criteria, view search results, and perform actions such as exporting results.

---

## Main Features

### 1. Search Input

- Allows users to enter a search query.
- Search is triggered when the entered query has at least 3 characters.

### 2. Search Types

- Users can filter searches by predefined types: all, santri (students), hafalan (memorization), attendance, payments, news.
- Each type is represented by a distinct icon/tab.

### 3. Advanced Filters

- **Date Range:** Filter results by a date range.
- **Grade Range:** Specify minimum and maximum numeric grades.
- **Sort By:** Results can be sorted by relevance, date, name, grade, or status, in ascending or descending order.
- **Status Filters:** Depending on the selected search type, status filters are available (different options for each type).
- Display and remove active filters, and a single-click "clear all filters" option.

### 4. Results Display

- Dynamically shows results matching the search criteria.
- Displays total result count.
- Results are shown with:
  - Relevant icon and colored badge for type.
  - Title, subtitle, and description.
  - Metadata badges (e.g., student ID, grade, attendance rate, etc.).
  - Relevance score percentage.
- Handles "no results" & loading states with helpful UI feedback.

### 5. Export Functionality

- Placeholder for exporting results (e.g., CSV/Excel).
- Displays a toast notification (actual implementation pending).

---

## State Management

- **Filters:** Maintained as a single object representing all search/filter criteria.
- **Results:** Holds current search results (mock data in this code).
- **Loading state:** For displaying loading animation during search.
- **Show/Hide Filters:** Toggles the advanced filter UI panel.
- **TotalResults:** Number of search results found.

---

## Interactivity

- Changing any filter or the search query updates the results in real time (debounced by effect).
- UI dynamically adapts options (e.g., status filters depending on type).
- Active filters are clearly shown as badges and can be removed one-by-one.
- All filter settings can be cleared at once.

---

## Customization and Extensibility

- Designed to be hooked up to a real API; currently uses hardcoded/mock data.
- Easy to add more search types, filter options, or result fields.
- Includes interface definitions for type safety and clarity.
- Uses modular, reusable UI components (e.g., Card, Badge, Button, Input).

---

## Technologies Used

- **React** functional components with hooks for state/effect management.
- **TypeScript** interfaces for prop, filter, and result definitions.
- **Custom UI library components** for layout and inputs.
- **Lucide-react** for icons.
- **react-hot-toast** for user notifications.

---

## Usage Context

This component would typically be found in admin, dashboard, or reporting sections, especially in applications related to student management, religious schools, or organizations tracking a variety of member data with advanced querying and filtering needs.

---

## UI/UX Considerations

- Responsive, multi-column filter layout.
- Uses clear icons and color coding for result types.
- Interactive and accessible search/filter actions.
- Real-time search experience.
- Handles empty, loading, and normal result states gracefully.

---

**Summary:**  
`AdvancedSearch` provides an interactive, comprehensive, and extensible search/filter UI for multi-type datasets, with a clear approach to filtering, sorting, and displaying results, designed for integration in complex administrative user interfaces.
