## ProgressTrackingDashboard Component - High Level Documentation

### **Purpose**

The `ProgressTrackingDashboard` React component provides a dashboard modal for visualizing and interacting with a student's (santri's) goal and behavior progress. It allows educators (musyrif) and parents to track progress toward character development goals, see milestones, mark them as completed, and review relevant notes and feedback.

---

### **Key Features**

#### 1. **Modal Dialog**

- Acts as a modal overlay.
- Triggered open via the `isOpen` prop.
- Can be closed with a button (`onClose`).

#### 2. **Goal Overview**

- Displays basic goal info (title, description, category, student, status, start/end dates).
- Shows current progress as a percentage, total milestones, completed milestones, and days left.
- Progress bar colored according to completion percentage.

#### 3. **Milestones List & Completion**

- Lists all milestones with completion status.
- `Selesaikan` button allows progress on incomplete milestones; triggers a mini-modal for confirming and providing evidence ("bukti") before marking them done.
- Completed milestones display confirmation and evidence.

#### 4. **Recent Activities Log**

- Lists recent progress activities (e.g., milestone completions, positive behavior, parent feedback).
- Each activity has an icon, color code, description, actor, date, and time.
- Displays in reverse chronological order.

#### 5. **Sidebar Sections**

- **Goal Info:** Category, status, start/end date.
- **Target Behaviors:** Specific expected behaviors for achieving the goal.
- **Musyrif Notes:** Notes or strategies from the educator, with an "Edit" button (note: actual edit functionality not included here).
- **Parent Feedback:** Channel for parent involvement and displaying feedback, available if `parentInvolved` is true.

#### 6. **Action Functions**

- **Complete Milestone:** Marks a milestone as complete, records evidence and updates progress, shows a toast notification.
- **Add Parent Feedback:** Updates parent feedback, shows a toast.
- **Add Musyrif Note:** Updates educator notes, shows a toast.

---

### **Data & State Management**

- **Local Mock Data:** For demonstration; simulates API fetching for goals and recent activities.
- **Component State:**
  - `goal`: Current goal info and its milestones.
  - `recentActivities`: Last actions related to the goal.
  - `loading`: UI state for simulated data loading.
  - `selectedMilestone`: The milestone currently being marked as completed.
  - `newMilestoneEvidence`: Evidence string for milestone completion.

---

### **Visual & UI Elements**

- Styled using utility-first classes (Tailwind CSS).
- Icons use the "lucide-react" library.
- Modular card layout: main dashboard on the left, sidebar on the right.
- Responsive design: adjusts layout for large screens.

---

### **Integration & Usage**

- Typically part of a larger application for character/behavior progress monitoring in an educational (Islamic boarding school/TPQ) context.
- Utilizes custom UI components (`Card`, `Button`).
- Assumes some utility functions are provided externally (date formatting, color assignment, etc.).

---

### **Key Props**

- **`goalId`**: ID of the goal to track (used for data loading).
- **`isOpen`**: Boolean to control the modal's visibility.
- **`onClose`**: Function to close the modal.

---

### **Side Effects**

- `useEffect` hook loads goal/activity data when the modal opens or the goalId changes.

---

### **Error Handling**

- Errors during data loading trigger toast error notifications.
- Actions (marking milestone complete, editing notes/feedback) show toast feedback on success.

---

### **Not Covered**

- Real API integration (currently uses mock data).
- Editing musyrif notes/parent feedback in real-time (UI present, backend not implemented).
- Activity logging for changes (the main log is mock/static).

---

### **Intended Audience**

- Developers building educational tracking apps for Islamic boarding schools or similar settings.
- Users (teachers, admins) monitoring student character progress.

---

**Summary:**  
The `ProgressTrackingDashboard` is a feature-rich UI modal dashboard for progress tracking in educational behavior programs, emphasizing easy milestone management, visual progress, and integrated roles for both educators and parents.
