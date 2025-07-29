# Character Goal Form Component - High-Level Documentation

## Overview

This code defines a React component for a modal form used to **create or edit a "Character Goal"** for a student ("santri"). It's designed for an education context, probably a pesantren or Islamic boarding school, where teachers or mentors (musyrif) manage and track students' character development.

The form appears as a modal overlay and is displayed or hidden based on an `isOpen` prop. It supports managing complex data, including goals, behaviors, milestones, and feedback, with both creation and editing modes.

---

## Main Functionalities

### 1. **Student Selection**

- Dropdown to select a student from a mocked list.
- Updates the form state with both the selected ID and name.

### 2. **Goal Details**

- Enter the goal's **title** and **description**.
- Choose a **category** for the goal (Akhlaq, Ibadah, Academic, Social, Discipline, Leadership).
- Select a **start date** and a **target completion date**.

### 3. **Target Behaviors**

- Users can list one or more **target behaviors** the student should develop.
- Add or remove behaviors dynamically.
- Requires at least one behavior.

### 4. **Milestones**

- Track progress via one or more **milestones**.
- Each milestone has a title, description, and a target date.
- Milestones can be added or removed dynamically.
- Requires at least one milestone.

### 5. **Other Metadata**

- Checkbox to indicate **parental involvement**.
- Text area for **musyrif’s notes** (mentor's feedback or strategy).
- Text area for **parental feedback** (not shown in the form, but exists in data).
- Status, progress, and other system-managed fields (auto-handled).

### 6. **Validation & Feedback**

- Checks that all required fields are filled before submission.
- Displays error messages via toast notifications if validations fail.
- On successful save (create or edit), displays a success message.

### 7. **Form Operations**

- **Submit**: Passes processed goal data to a given `onSave` handler.
- **Reset**: Resets the form to its initial state.
- **Cancel**: Calls the provided `onClose` handler.

---

## State & Data Handling

- Uses React's `useState` to manage all form fields, supporting partial and full updates.
- If editing (`editData` is provided), pre-populates fields with existing data.
- Handles dynamic form arrays (behaviors, milestones) with functions to add, remove, and update.
- Processes and sanitizes the form data before submission (e.g., strips out blank behaviors/milestones).

---

## UI Structure

- **Header:** Shows form title, and a close button.
- **Content:**
  - Student and category selectors
  - Title, description inputs
  - Start and end dates
  - Dynamic lists for target behaviors and milestones
  - Parent involvement checkbox
  - Musyrif notes
- **Footer:** Reset, cancel, and submit buttons

All UI elements use appropriate classes and some are built on reusable UI components (`Card`, `Button`), and Lucide icons.

---

## Customization Points

- **Student Data**: Uses a mock; replace with real student lookup/integration.
- **onSave**: Flexible callback for parent component to handle save logic (API call, data store, etc.).
- **Validation**: Can be extended for more thorough checks as needed.
- **Initial/Default Data**: Easily customizable.

---

## Integration

To use this form:

- Provide the `isOpen`, `onClose`, and `onSave` props.
- Optionally, pass `editData` for editing behavior.
- Handle saving, success/error notifications, and any extra business logic in the parent component.

---

## Technical Stack/Dependencies

- React (with hooks)
- Lucide-react icons
- Custom UI components (Card, Button)
- `react-hot-toast` for notifications
- TypeScript for type safety

---

## Summary

**This component provides a modular, reusable, and dynamic modal form for managing character development goals for students, featuring complex inputs, validation, customizable state, and integration points for a larger educational management system.**
