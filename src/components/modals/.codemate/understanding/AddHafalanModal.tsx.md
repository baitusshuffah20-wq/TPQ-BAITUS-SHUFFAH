# High-Level Documentation: AddHafalanModal Component

## Purpose

`AddHafalanModal` is a modal dialog component for adding or editing the record of a student's Qur'an memorization evaluation ("hafalan"). It collects, validates, and saves data about a memorization session, including the student, surah, verses, type, evaluator, scores, evaluation notes, and more.

---

## High-Level Features

- **Dialog Modal:** Appears as an overlay; can be dismissed or saved.
- **Form Sections:**
  - **Basic Information:** Select student (santri), memorization type, surah, ayah range, musyrif (evaluator), date, and duration.
  - **Evaluation Scores:** Input and auto-calculate average scores for Tajwid, Kelancaran, and Fashahah.
  - **Status and Notes:** Pick evaluation status and add notes, corrections, and recommendations.
- **Field Validations:** Validates required fields and numeric ranges, provides inline error messages.
- **Edit Support:** Can be pre-filled for editing existing data or blank for new entries.
- **Auto-fill Logic:** Selecting a student or musyrif fills their corresponding names.
- **Score Averaging:** Calculates the overall grade when individual scores are entered.
- **Appearance:** Uses consistent UI components, appropriate iconography, and a responsive layout.
- **Actions:** Buttons for "Batal" (Cancel) and "Simpan/Update" (Save/Update).

---

## Props

| Prop     | Type             | Description                                   |
| -------- | ---------------- | --------------------------------------------- |
| isOpen   | `boolean`        | If true, shows the modal; otherwise, hidden.  |
| onClose  | `() => void`     | Callback to close the modal.                  |
| onSave   | `(data) => void` | Callback to save the form data.               |
| editData | `any`            | Optional. If present, loads data for editing. |

---

## Internal State and Logic

- **formData:** All the form's field values; initialized from `editData` or blank/defaults.
- **errors:** Validation errors for each field.
- **Mock Data Sets:** Hardcoded santri, surah, and musyrif lists for dropdowns (in real usage, would be fetched).
- **Input Handlers:** Update state, clear errors, and handle auto-filling names or calculating averages.
- **Validation:** Synchronous checks for required fields, valid numeric/range values, logical ayah range.
- **Save Logic:** On save, validates inputs, prepares data (adds computed fields), and calls `onSave` and `onClose`.
- **UI Feedback:** Highlights invalid fields, color-codes types and grades, displays errors.
- **Reset Logic:** Resets form after save or close.

---

## User Experience Flow

1. **Open Modal:** Either for new entry or to edit an evaluation.
2. **Fill Form:** Select student, surah, verses, evaluator, etc.
3. **Input Scores:** Enter per-aspect scores and see average calculated live.
4. **Enter Status & Notes:** Add status, comments, corrections, recommendations.
5. **Validation:** Required fields and score limits are enforced with clear error messages.
6. **Save or Cancel:** Save triggers validations and passes data up via `onSave`, then modal closes.

---

## Usage Context

Ideal for:

- Tahfidz (Qur'an memorization) tracking web applications
- Educational admin panels for Islamic institutions
- Any context requiring structured entry or editing of evaluation records for Qur'an recitation/memorization

---

## Technologies & Dependencies

- **React** (function component, hooks)
- **UI Components** (`Card`, `Button`)
- **Lucide-react** (for icons)
- **Tailwind CSS** (utility-first styling)

---

## Customization Notes

- Replace mock data (santriList, surahList, musyrifList) with dynamic data sources as required.
- Extend validation or form fields for additional memorization evaluation needs.
- Integrate with actual data storage or backend API for persistent saving.

---

## Summary

`AddHafalanModal` efficiently encapsulates all logic and UI for inputting or editing a Qur'an memorization evaluation within a modern, accessible, and well-validated modal form. It is user-friendly, robust, and highly adaptable to tahfidz educational systems.
