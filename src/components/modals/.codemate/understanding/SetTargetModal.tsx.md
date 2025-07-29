# SetTargetModal Component - High-Level Documentation

## Overview

The `SetTargetModal` component is a modal dialog for creating or editing a "target" related to memorizing sections (surahs) of the Quran for students (santri) in a TPQ (Quran Learning Center) application.

It guides the user through a two-step process:

1. **Step 1**: Choose a memorization target template or opt for a custom target.
2. **Step 2**: Complete or edit the details of the memorization target, such as the surah selection, number of verses (ayahs), timeframe, reminders, priority, and notes.

---

## Main Features

- **Displays as a Modal**: Appears as an overlay when `isOpen` is true.
- **Template Selection**: Lets users pick from predefined target templates with various difficulties and configurations.
- **Custom Target Option**: Users can choose to set a fully custom target instead of using a template.
- **Form-Based Details**: Step 2 presents a form to select the student, surah, number of verses, target dates, priority, description, notes, and reminder frequency.
- **Santri (Student) Support**: Loads and lists students for selection, including support for both example data and fetching from an API.
- **Summary Section**: Shows a calculated summary (e.g., estimated duration, surah info, priority) when a surah is selected.
- **Reminders Configuration**: Allows enabling/disabling reminders and picking frequencies.
- **Form Validation**: Requires key fields to be filled before submitting.
- **Edit Mode**: Supports editing an existing target by filling the form with its data.
- **Actions**: Submit (create or update target), cancel, navigate back to Step 1.
- **Integration with Parent**: On successful submission, calls the `onSuccess` callback with the created/updated target for further processing outside the modal.

---

## Props

- `isOpen`: (boolean) Controls whether the modal is shown.
- `onClose`: (function) Called when the modal is closed (via button or cancel).
- `santriId`: (optional, string) Prefills the student if known.
- `santriName`: (optional, string) Prefills the student name if known.
- `onSuccess`: (function) Called with the created/updated HafalanTarget object.
- `existingTarget`: (optional) If present, modal works in edit mode, pre-filling values.

---

## Key Implementation Points

- **State Management**: Uses multiple React states for tracking the current step, selected template, form data, available student (santri) list, and whether the user is customizing the target.
- **Data Fetching**: Loads student data, prioritizing API if available, otherwise uses mock data.
- **Template/Custom Flow**: Handles selection of a target template or the switch to a custom configuration.
- **Form Data Handling**: Updates form values in response to user input for all target parameters.
- **Utility Methods**:
  - Surah details and estimations (duration, validations).
  - Conversion for dates and handling priorities/descriptions.
- **Submission**: Validates required fields, constructs a new HafalanTarget object, and sends it back via `onSuccess`. Handles both creation and update flows.
- **UI Components**: Uses custom Button, Card, and icons from `lucide-react` for a modern, visually distinct UI.

---

## User Flow (Summary)

1. **Open Modal**: Modal opens when `isOpen` is set to `true`.
2. **Step 1: Template/Custom Selection**
   - User selects a suggested template or chooses to create a custom target.
3. **Step 2: Target Details**
   - User fills out (or reviews/edits) all relevant fields for the memorization target.
   - A summary box provides feedback on selections.
   - Reminder options and additional notes can be set.
   - The target can be saved ("Buat Target" / "Update Target") or cancelled.
4. **On Success**
   - Target is passed back to the parent context.
   - Modal closes and form resets.

---

## Extensibility

- Handles both creation and updating of targets.
- Designed for integration with larger Quran learning or student management systems.
- Easily extendable for additional fields, new template types, or reminders logic.

---

## Usage Example (Simplified)

```jsx
<SetTargetModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  santriId="santri_123"
  santriName="Fulan"
  onSuccess={(target) => {
    // Save or update the target
  }}
/>
```

---

## Typical Use Cases

- **Admin or Teacher**: Sets personalized or template-based memorization goals for one or more students.
- **Progress Tracking**: Sets up reminders and milestones to encourage consistent memorization.
- **Editing Targets**: Enables modification of existing targets if a student's needs change.

---

## What It's Not

- Not responsible for actual scheduling, notification dispatch, or saving to backend/database (though it prepares all necessary target data).
- Does not cover detailed surah/ayah content selection beyond surah and number of verses.

---

**In summary**, this is a flexible, modern, and user-friendly modal UI component for managing Quran memorization targets for students, supporting templates, custom entries, reminders, and both creation and editing workflows.
