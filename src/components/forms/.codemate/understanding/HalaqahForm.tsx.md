# Halaqah Form Component - High-Level Documentation

## Purpose

This React component provides a user interface to **create or edit a "Halaqah"** (a group/session for religious/Quranic study), with form fields such as name, description, level, type, capacity, supervised teacher (musyrif), and multiple schedule slots.

## Key Features

- **Supports Add and Edit Modes:** The form can create a new Halaqah or edit an existing one, based on the presence of the `halaqah` prop.
- **Field Validation:** Validates user input (name, level, capacity, musyrif, schedule times, at least one schedule), showing errors inline and with toasts.
- **Dynamic Schedules:** Allows users to dynamically add or remove schedule slots (with day, time, and room).
- **Musyrif Selection:** Loads a list of users with the "MUSYRIF" role from an API and allows users to select one as supervisor.
- **Type and Level Choices:** Offers predefined options for Halaqah type (Quran, Tahsin, Akhlak) and level (from beginner to advanced/tahfidz).
- **User Feedback:** Displays loading spinners and error messages as appropriate.
- **Submission:** Emits the entire Halaqah data structure on submit if validation passes.
- **Reusable UI Components:** Uses prebuilt UI components (Card, Input, Button, Badge) and icons for a consistent look.
- **UX Enhancements:** Highlights errors, disables fields/buttons during loading, and gives a pleasant and informative layout.

## Main Data Structures

- **HalaqahFormData:** Main object holding all the input data about the Halaqah, including schedules and musyrif.
- **Schedule:** Simple object for day-of-week, times, and room.
- **Musyrif:** User assigned as a supervisor.

## Component Breakdown

- **State Management:** Uses React hooks (`useState`, `useEffect`) to manage form data, validation errors, loading state, and musyrif list.
- **Lifecycle:** Loads musyrif list from backend API on mount.
- **Event Handlers:**
  - **handleChange:** Updates form data as user types/selects.
  - **addSchedule / removeSchedule / updateSchedule:** Manage schedules array.
  - **handleSubmit:** Runs validation, then emits data via `onSubmit`.
- **Render Logic:**
  - **Loading State:** Renders loading indicator while fetching data.
  - **Form Layout:** Organizes fields in sections — Basic Info, Schedules, and Actions.
  - **Dynamic Fields:** Schedules section allows multi-row editing.
  - **Action Buttons:** Save/Update and Cancel with loading indicators.

## Customization Points

- The form is **configurable by props**:
  - `halaqah`: (optional) for edit mode
  - `onSubmit`: submit handler
  - `onCancel`: cancel handler
  - `isLoading`: disables actions and shows spinner

## Dependencies

- **UI components**: @/components/ui (Card, Input, Button, Badge).
- **Icons**: lucide-react.
- **Toast notifications**: react-hot-toast.

## Usage Context

Intended for use in an admin/management dashboard where users set up or modify Quranic study groups, assigning mentors, times, and other attributes.

---

**Summary:**  
This component wraps the logic and UI for authoring or editing Halaqah entities, handling all the state, error, and UI management needed for a robust multi-section form with dynamic schedule rows and remote data loading for teachers.
