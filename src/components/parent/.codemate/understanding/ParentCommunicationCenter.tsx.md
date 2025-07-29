# ParentCommunicationCenter Component – High-Level Documentation

## Overview

The `ParentCommunicationCenter` is a React functional component designed as a messaging dashboard for parents to communicate with mosque school staff (Musyrif) and administrators, focused on their child ("Santri"). It provides a conversational interface with features for reading, filtering, and sending messages, enriched with support for different message types, priorities, and context.

---

## Main Features

### 1. Messaging Dashboard

- **Displays messages** between parent, Musyrif, and admin, using a clear card-based layout.
- **Indicates unread messages** and total count of new/incoming (unread) messages in the header.
- **Highlights message types** (progress, report, announcement, etc.) and their priority levels.
- **Shows related achievement or goal** if associated with the message.
- **Marks messages as read** on selection/click.

### 2. Filtering and Search

- Allows text-based search across message subject, sender, and content.
- Enables filtering messages by message type (e.g., announcement, question, progress update).

### 3. Sending Messages

- Parents can compose new messages to the Musyrif.
- Selectable message type (general, question, progress update).
- Can add content via a textarea; message send disables when empty.
- Option/button to add attachments (UI only).
- Shows a toast notification on send or error.

### 4. Message Metadata and UI Details

- **Sender/recipient roles** are indicated (parent, Musyrif, admin).
- **Timestamp formatting:** recent (today/yesterday) or explicit date.
- **Priority levels** and types are stylized for quick identification.
- Each message can show if/when it was read.

### 5. Loading and Empty States

- While messages are "loading", uses animated skeletons.
- Displays an appropriate message when no messages are present or when filters/search yield no results.

### 6. Ancillary Actions

- Buttons for initiating a phone call or video call are present in the header (UI only).

---

## Technical Notes

- **Data Source:** Currently uses a static set of mock message data, mimicking an API delay.
- **State Management:** Utilizes `useState` and `useEffect` for local state and message initialization.
- **UI Library:** Employs custom Card and Button UI components, iconography via Lucide React, and notifications using `react-hot-toast`.
- **TypeScript:** Strongly typed message interface and component props for code safety.
- **Styling:** Consistent Tailwind CSS usage for layout, spacing, and coloring.
- **Accessibility:** Basic role and label usage, focus ring on search/filter inputs.

---

## Intended Usage

This component is intended as a communication tool for parent users within an educational or religious institution dashboard, specifically tailored for use in an Islamic context (messages/instructions are in Indonesian and reference Quranic memorization).

---

## Extensibility

- Can be connected to a backend API for real/read messages.
- Easy to extend for more message types, attachment handling, or richer conversation threading.
- Suited for further role-based extensions (e.g., Musyrif/Admin-specific interfaces).

---

## Limitations

- All data is currently mock; real authentication and back-end logic are needed for production.
- Attachment handling and call actions are UI stubs with no underlying functionality.
- Not mobile-focused; UI is desktop-oriented but likely adapts with additional CSS.

---

**Summary:**  
`ParentCommunicationCenter` is a robust, ready-to-extend React component that forms the communication backbone for parent–school/staff interaction with filtering, searching, and message composition capabilities, all presented within an intuitive card-based UI.
