# High-Level Documentation: TPQ Management System – Behavior Data Models

## 1. Purpose

This code defines comprehensive TypeScript data models and utility functions for managing, recording, analyzing, and evaluating student (santri) behaviors within an Islamic educational setting, typically a TPQ (Taman Pendidikan Al-Qur’an). It supports both positive and negative behaviors, tracking incidents, trends, character development, alerts, and templates based on defined criteria.

---

## 2. Core Data Structures

### **A. Enumerations & Types**

- **BehaviorCategory**: Classifies behaviors into six areas: AKHLAQ (morality), IBADAH (worship), ACADEMIC, SOCIAL, DISCIPLINE, and LEADERSHIP.
- **BehaviorType**: POSITIVE, NEGATIVE, NEUTRAL.
- **BehaviorSeverity**: LOW, MEDIUM, HIGH, CRITICAL.
- **BehaviorStatus**: ACTIVE, RESOLVED, FOLLOW_UP, ESCALATED.

---

### **B. Interfaces (Models)**

- **BehaviorCriteria**: Defines specific behavior aspects (e.g., honesty) with metadata such as category, severity, points, age group, references to Islamic sources, examples, consequences, and rewards.
- **BehaviorRecord**: Represents a single recorded incident or observation of behavior for an individual, capturing rich details including when, who, status, witnesses, context, and any attached media.
- **BehaviorSummary**: Aggregated evaluation of a student’s behavior over a time period (daily, weekly, etc.), including statistics, category breakdowns, behavioral trends, grades, strengths, and improvement areas.
- **CharacterGoal**: Captures individualized character/behavior improvement plans, with status tracking, milestones, progress, and parent/guardian involvement.
- **BehaviorAlert**: Automated or manual notifications for behavioral concerns, risks, or improvements (e.g., recurring negative patterns, severity thresholds breached), along with their handling lifecycle.
- **BehaviorTemplate**: Bundles of behavior criteria grouped for reuse or assignment, tailored by age group, category, and use-case (e.g., default templates for new students).
- **TrendableRecord**: Minimal structure supporting trend analytics (date and points).

---

## 3. Predefined Data Sets

- **BEHAVIOR_CRITERIA**: Example behaviors—positive (e.g., honesty, respect) and negative (e.g., lateness, fighting)—with detailed fields geared toward actionable classroom and Islamic teaching.
- **BEHAVIOR_TEMPLATES**: Sets of criteria grouped by category and age, enabling quick assignment for structured evaluations.

---

## 4. Helper & Utility Functions

- **Display Functions**: Convert codes for category/type/severity/status/grade into user-friendly text (and Indonesian translations) and coloring for UI (e.g., badge colors for categories).
- **Score/Grade Calculations**:
  - `calculateBehaviorScore`: Computes a normalized (0–100) score from behavioral data.
  - `getCharacterGrade`: Maps behavior score to grade letters (A+, B, C-, E, etc.).
  - `getGradeColor`: UI color mapping for grade badges.
- **Date & Time Formatting**:
  - `formatBehaviorDate`, `formatBehaviorTime`: Human-readable, locale-specific output.
- **Trend Calculation**:
  - `calculateTrend`: Assesses whether behavior is improving, stable, or declining based on points across selected time windows.

---

## 5. Key Features Enabled

- Comprehensive and detailed **tracking of student behavior incidents** (who, what, when, how severe, who witnessed, etc.).
- **Categorization and severity scoring** allow nuanced aggregation, analysis, and rewarding/disciplining strategies.
- **Behavioral analytics**: Summaries, scores, trends, and personalized goals for character development.
- **Template and criteria reuse** for efficient management and uniformity.
- **Alerts and risk detection** system to identify patterns or concerning behaviors.
- **Rich Islamic references** for educational relevance and motivation.
- **Localization support** (e.g., Indonesian texts and date/time formats).

---

## 6. Intended Usage

These models and utilities are the backbone for TPQ or Islamic educational management system features like:

- Teacher and admin data entry (incident recording, follow-up).
- Automated evaluation dashboards for students’ character/performance development.
- Feedback and communication with parents/guardians.
- Classroom-wide, individual, and period-based evaluation/reporting.
- Intervention and goal management for students requiring special attention.

---

**In Summary:**  
This codebase provides a scalable, extensible, and educationally/contextually aware data backbone for managing behavioral development in an Islamic education environment, supporting both granular event-level logging and high-level analytics and intervention.
