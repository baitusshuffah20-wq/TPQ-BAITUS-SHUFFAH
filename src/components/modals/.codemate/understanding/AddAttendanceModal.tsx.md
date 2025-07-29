## High-Level Documentation: AddAttendanceModal Component

### Overview

**AddAttendanceModal** is a React functional component implemented for the purpose of recording and editing attendance for a religious education context (e.g., Islamic boarding school). It serves as a modal dialog with a dynamic form that allows the user to select class sessions, assign supervisors, choose Quran recitation (halaqah) groups, and mark detailed attendance entries for each student (santri).

---

### Key Features

- **Modal Dialog**: Renders as a centered overlay modal when `isOpen` is true. Blockable by backdrop. Closes via close button or cancel action (`onClose`).
- **Form Sections**:
  - **Basic Session Information**: Input for date, session time (morning/afternoon/evening), halaqah class, supervising teacher (musyrif), location, topic, and general notes.
  - **Attendance Table**: Once a halaqah is selected, lists students in that group. For each student, allows marking status (present, absent, late, sick, with permission), arrival time, and notes.
  - **Quick Statistics**: Displays summary counts based on attendance status.
- **Data Handling**:
  - Pre-populates form if `editData` is provided (edit mode).
  - Uses local mock data for halaqah, teachers, and students.
  - On halaqah selection, filters students relevant to that group and initializes entries for each.
- **Validation**:
  - Requires date, halaqah, musyrif, and non-empty attendance list before allowing save.
  - Shows inline validation errors.
- **Save Logic**:
  - Assembles a normalized attendance data object with statistics and timestamps.
  - Calls `onSave` callback with the final object, then resets and closes.

---

### Component API

#### Props

| Name     | Type                          | Description                                  |
| -------- | ----------------------------- | -------------------------------------------- |
| isOpen   | boolean                       | Controls visibility of the modal             |
| onClose  | () => void                    | Callback to close the modal                  |
| onSave   | (attendanceData: any) => void | Called with compiled attendance data on save |
| editData | any (optional)                | Existing data to edit (enables edit mode)    |

---

### State

- **formData**: Holds all user input and attendance details for the session.
  - date, session, halaqah, musyrifId, musyrifName, location, topic, notes, attendanceList (array per-student)
- **errors**: Tracks validation messages by field.

---

### Interactions

- **Input Handlers**: Dynamically update state and clear per-field errors. Selecting a halaqah or musyrif auto-populates related fields.
- **Attendance List**: For each student, allows changing status, editing arrival time (unless absent), and adding notes.
- **Save/Cancel**: Bottom buttons. Validate & process data on save, cancelling simply closes.

---

### UI and Visualization

- Built with UI components (`Card`, `Button`), clear labeling, and a grid layout.
- Icons for visual context (sessions, statuses, etc.) using Lucide.
- Attendance status options color-coded and accompanied by icon.
- Responsive and scrollable modal for large content.

---

### Extensibility / Integration

- Intended to be integrated within Next.js / React projects.
- Relies on external Button, Card UI, and Lucide icons.
- Easily adaptable for real/remote data sources (currently uses mock data).

---

### Error Handling

- Displays validation errors under relevant fields.
- Prevents submission with missing required information.

---

### Example Usage

```jsx
<AddAttendanceModal
  isOpen={isAttendanceModalOpen}
  onClose={() => setAttendanceModalOpen(false)}
  onSave={handleSaveAttendance}
  editData={attendanceToEdit} // optional
/>
```

---

### Summary of Responsibilities

- Collects and validates attendance session data.
- Enables both attendance creation and editing.
- Summarizes attendance at a glance.
- Modular UI for integration into management systems.
