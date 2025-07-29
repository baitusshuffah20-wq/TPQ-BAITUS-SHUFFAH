# High-Level Documentation

## Overview

This code defines a **TypeScript data model and a set of utility functions** for an attendance management system tailored to a TPQ context (likely an Islamic educational setting). The solution covers all aspects of attendance tracking, summarizing, scheduling, QR-based check-ins, statistics, and alerting.

---

## Data Types & Models

### Enumerated Types

- **AttendanceStatus:** Captures the state of attendance, e.g., "PRESENT", "LATE", "ABSENT".
- **AttendanceMethod:** The method used for check-in, like "MANUAL", "QR_CODE", "RFID".
- **SessionType:** Distinguishes class sessions by time, e.g., "MORNING", "EVENING".

### Core Interfaces

- **AttendanceRecord:** Represents a single attendance entry per student per session, with identification information, session detail, timing, method, and optional metadata.
- **AttendanceSummary:** Aggregates attendance data over a period for a student, tracking session counts, streaks, and rates.
- **AttendanceSchedule:** Describes planned attendance sessions for groups (halaqah), with session timing, requirements (e.g., QR check-in), and locations.
- **AttendanceAlert:** Represents a system alert for attendance anomalies (e.g. absenteeism, streaks, etc.).
- **QRCodeSession:** Manages QR attendance sessions, including code generation, expiration, and usage.
- **AttendanceStats:** Provides statistical aggregates over an attendance period, both overall and broken down by various criteria (status, halaqah, trends, etc.).

---

## Helper/Utility Functions

### Status & Session Display

- **getAttendanceStatusColor, getSessionTypeColor:** Map statuses and session types to color classes for UI presentation.
- **getAttendanceStatusText, getSessionTypeText:** Map statuses/session types to human-readable or localized descriptions.

### Attendance Calculations

- **calculateAttendanceRate:** Computes percentage of present sessions.
- **calculatePunctualityRate:** Computes percentage of sessions attended on time.
- **isLate:** Checks if a check-in is considered late given thresholds.
- **calculateLateMinutes:** Determines the number of late minutes based on check-in.
- **getAttendanceStreak:** Calculates both current and longest attendance streaks (consecutive presence).

### QR Code Utilities

- **generateQRCode:** Creates a QR code (as base64-encoded JSON) for attendance sessions.
- **validateQRCode:** Verifies a QR code against expected session information.

### Alert Utilities

- **getAlertSeverityColor:** Provides a color for alert severity levels for UI.

### Formatting Utilities

- **formatTime:** Formats a time string as HH:mm in a specified locale.
- **formatDuration:** Converts minutes to a "Xh Ym" string.

---

## Use-Cases Supported

- **Daily check-in (manual/QR/RFID/etc.)**
- **Centralized and summarized reporting**
- **Automated alerts for attendance anomalies**
- **Statistics for students/groups and over time**
- **Configurable scheduling and requirements per session**
- **User interface-friendly display of statuses, sessions, and alerts**
- **Integration with hardware for QR, RFID, and biometrics**

---

## Extensibility

- New attendance methods, session types, statuses, and requirements can be added easily.
- The helper functions and statistical analysis can be expanded for further reporting and analytics.
- The modularity supports use in both backend services and frontend applications (e.g., React apps).

---

**In summary:**  
This code enables a rich attendance management workflow, complete with records, summaries, schedule management, statistics, alerts, and QR integrations, supporting a robust and extensible system for educational environments.
