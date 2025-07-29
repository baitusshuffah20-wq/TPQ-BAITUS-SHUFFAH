# HafalanDetailModal Component Documentation

## Overview

`HafalanDetailModal` is a React functional component that displays a detailed modal dialog presenting information and evaluation about a Quran memorization ("hafalan") entry. It is designed for use in educational or religious applications where users can review, edit, and manage the details of memorization records.

## Key Features

- **Displays all major details of a memorization entry:** Surah, ayah range, student (santri), supervisor (musyrif), evaluation results, feedback, and metadata.
- **Evaluation Summary:** Visual representation of evaluation scores (tajwid, kelancaran, fashahah, and average grade), including progress bars and qualitative labels.
- **Status & Type Labels:** Clearly shows the type of memorization (Setoran, Murajaah, Tasmi) and its current status (Approved, Pending, Needs Improvement) with context-specific coloring.
- **Feedback section:** Shows any notes, corrections, or recommendations provided in the evaluation.
- **Action Buttons:** Edit, Export (placeholder), Delete, and Close actions, with clear interface affordances.
- **Audio Section:** Placeholder for future audio recording playback/downloading functionality.
- **Responsive & accessible layout:** Intuitive sectioning for details, evaluations, and actions.

## Props

| Prop Name  | Type         | Description                                                                       |
| ---------- | ------------ | --------------------------------------------------------------------------------- |
| `isOpen`   | boolean      | Controls the modal's visibility. If `false`, modal is not rendered.               |
| `onClose`  | function     | Callback invoked when the user requests to close the modal.                       |
| `onEdit`   | function     | Callback for edit action (e.g., opens a form to edit entry).                      |
| `onDelete` | function     | Callback for delete action (e.g., confirms or triggers deletion).                 |
| `hafalan`  | any (object) | The memorization data to be displayed. Needs to have expected fields (see below). |

## Expected Structure of `hafalan`

The `hafalan` object is expected to have the following fields:

- `surah` (string): Name of the Surah
- `ayahRange` (string/number): Range of Ayahs (verses)
- `santriName` (string): Name of the student
- `musyrifName` (string): Name of the supervisor
- `date` (date string): Date of memorization
- `type` (string): Type identifier (e.g., SETORAN, MURAJAAH, TASMI)
- `status` (string): Review status (e.g., APPROVED, PENDING, NEEDS_IMPROVEMENT)
- `tajwid`, `kelancaran`, `fashahah` (number): Individual evaluation scores
- `grade` (number): Overall average score
- `duration` (number): Duration in minutes
- `updatedAt` (date string, optional): Date of last update/evaluation
- `notes` (string, optional): General evaluator notes
- `corrections` (string, optional): Correction and improvement comments
- `recommendations` (string, optional): Additional recommendations

## UI/UX Details

- **Top Action Bar:** Edit, Export (disabled/placeholder), and close (X) button.
- **Header:** Main information bubble with Surah name, colored "type", and colored "status".
- **Evaluation Section:** Shows Tajwid, Kelancaran, Fashahah, and the overall grade with progress bars.
- **Details Section:** Two columns (on large screens) for basic info (left) and evaluation breakdown (right).
- **Feedback/Notes:** If present, notes/corrections/recommendations show specialized boxes with relevant coloring.
- **Audio Section:** Grayed out, indicating upcoming feature.
- **Action row at the bottom:** Delete (prominent), Close, and Edit buttons.

## Internal Logic

- Helper functions map type, status, and grade to display text and color classes.
- Date values are shown in Indonesian format `toLocaleDateString("id-ID")`.
- The modal is overlayed (fixed, centered, with dimmed background) and scrollable if overflowing.

## Usage Example

```jsx
<HafalanDetailModal
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
  onEdit={handleEdit}
  onDelete={handleDelete}
  hafalan={selectedHafalan}
/>
```

## Extensibility

- Designed to be connected to a parent component managing state and API/mutation logic.
- Export and audio features are placeholders for future implementation.

---

**Note**: This component depends on custom `Card`, `Button`, and Lucide-react icons, as well as TailwindCSS or similar utility-first CSS for styling. Make sure related dependencies are installed and imported appropriately.
