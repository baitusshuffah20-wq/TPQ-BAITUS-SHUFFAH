# Seed Hafalan Progress Page - High-Level Documentation

## Purpose

This React component provides an admin/testing interface for seeding and monitoring mock "hafalan progress" data in a database, typically used in an educational or religious institution's web app. It checks for active students (santri), displays current data status, enables seeding of test progress records, and provides navigation to related pages.

---

## Main Features

### 1. Data Status Checks (on Page Load)

- **Checks count of active students (santri)**
  - Fetches from `/api/santri?status=ACTIVE`
  - Displays number of active students found
- **Checks existing hafalan progress records**
  - Fetches from `/api/check-hafalan-progress`
  - Shows how many records currently exist

### 2. Seeding Data

- **Seed Button**
  - Sends POST to `/api/seed-hafalan-progress` to simulate creating sample progress data for students
  - Disabled if loading or if there are no active students
- **Result Display**
  - Shows success or error feedback after attempting to seed data
  - Error details shown if the seeding fails

### 3. User Feedback & States

- **Loading Indicators**
  - Shows spinner while initial checks are running or while seeding
- **Warning Messages**
  - Displays warning if there are no active students (blocking seed action)
- **Success/Error Messages**
  - Displays result or error from seeding operation

### 4. Navigation

- **Check Data Page**
  - Button navigates to `/check-hafalan-progress`
- **Go to Progress Page**
  - Button navigates to `/dashboard/musyrif/progress-hafalan`

---

## Usage Context

- Intended for admin/test users to set up or reset test data for development/testing purposes.
- Ensures no accidental seeding when there are no active students.
- Allows checking both student and progress records’ existence before seeding.

---

## Key State Variables

- `loading`: Whether seeding is in progress
- `result`: Result or error feedback from the seeding process
- `santriCount`: Number of active students
- `existingRecords`: Number of existing hafalan progress records
- `isChecking`: Whether initial data status checks are running

---

## Summary

This page is a controlled interface for safe, test-friendly seeding of "hafalan progress" data. It emphasizes checks and feedback to prevent data errors and guide the user through the seeding and validation process, with navigation options to related data overview pages.
