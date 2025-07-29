# High-Level Documentation: RawHafalanProgressPage Component

## Overview

This React component provides an administrative interface for managing and viewing "Raw Hafalan Progress Data." It allows users to:

- View current records found in the **hafalan_progress** table.
- Seed (populate) the table with dummy or default data using a raw SQL API endpoint.
- Refresh or check the current state of the data.
- Navigate to another related page within the application.

## Major Features

### 1. Data Loading and Display

- Upon component load, it automatically fetches and displays current progress data using the `/api/raw-hafalan-progress` endpoint.
- Shows loading indicators during asynchronous actions.
- If data is found, displays a table with key fields: ID, student name (Santri), Surah, progress (memorized vs total), and status (e.g., COMPLETED, IN_PROGRESS).
- If no data is found, or on API error, displays an appropriate message.

### 2. Seeding Data

- Provides a button to trigger data seeding via a POST request to `/api/raw-hafalan-progress`.
- On success, refreshes the displayed data and shows the result (including number of created records).
- Handles errors and displays them to the user.

### 3. User Interactivity

- Allows users to manually refresh the table by clicking a button.
- Easily navigates to a related progress page via a button.

### 4. UI/UX

- Uses modern, clean, and responsive design principles.
- Important status, error, and informational messages are color-coded for clarity.

## Technical Implementation

- **State hooks** are used to manage loading state, fetched data, the result of seeding, and error handling.
- **Side Effects**: Uses `useEffect` to load data on initial render.
- **API Calls**: Relies on the `/api/raw-hafalan-progress` endpoint for both fetching and seeding data.
- **Routing**: Utilizes Next.js router for client-side navigation.

## Intended Audience

- **Administrators** or technical staff who need to inspect, initialize, or troubleshoot the hafalan progress data store.
- **Developers** who need to verify the results of backend seeding or raw SQL operations.

---

**Summary:**  
The `RawHafalanProgressPage` component is a utility/admin UI for checking and populating memorization progress data using raw SQL operations, providing detailed status reporting and ease of use for technical users managing backend table content.
