# High-Level Documentation: AIInsights Class

## Overview

The `AIInsights` class is a service designed to generate analytical insights related to students ("santri"), classes ("halaqah"), and the educational system as a whole. It interfaces with a database layer (via Prisma ORM) and analyzes data such as memorization scores ("hafalan"), attendance, and payments to provide actionable insights, risk assessments, and recommendations for improvement.

---

## Main Features

### 1. Student Insights

- **Method:** `generateStudentInsights(studentId: string)`
- **Purpose:** Generates a detailed profile report for a student.
- **Outputs:**
  - Overall score (aggregated from memorization grades and attendance)
  - Current academic and attendance trends (improving, declining, or stable)
  - Strengths, weaknesses, and actionable recommendations
  - Risk assessment (low, medium, high) based on defined thresholds
  - Identification of overdue payments and suggested follow-up

---

### 2. Class (Halaqah) Insights

- **Method:** `generateClassInsights(halaqahId: string)`
- **Purpose:** Generates a summary report for a class group.
- **Outputs:**
  - Average student performance and attendance rates within the class
  - Completion rate for recent memorization submissions
  - Identification of top performers and students requiring additional attention
  - Targeted recommendations for class-level improvements (e.g., recruitment, pedagogical methods)

---

### 3. System-Wide Insights

- **Method:** `generateSystemInsights()`
- **Purpose:** Produces aggregate analytics and health indicators for the entire educational system.
- **Outputs:**
  - Student population statistics (total, active)
  - Average attendance and performance metrics across the system
  - Trends on a monthly basis (attendance, performance, new enrollments for the last 6 months)
  - Alerts for emergent issues: low attendance, poor performance, overdue payments, or over-capacity classes

---

### 4. Predictive Student Insights

- **Method:** `generatePredictiveInsights(studentId: string)`
- **Purpose:** Provides risk prediction and foresight regarding student outcomes.
- **Outputs:**
  - Likelihood of dropout (risk percentage)
  - Expected future grade based on recent trends
  - Specific recommended interventions based on risk factors (e.g., counseling, increased parental communication, academic support)

---

## Supporting Algorithm

- **Trend Calculation:**
  - Utilizes simple statistical methods (like least-squares slope) to determine improvement or decline across sequential grade or attendance data.

---

## Error Management

- Each method captures and logs exceptions, returning either null or safe default values if errors occur.

---

## Intended Use

- **Context:** For administrators or educators in an Islamic schooling context (pesantren, tahfiz, etc.) to track and improve student and institutional performance.
- **Integration:** To be used as part of a backend Node.js application connected to a relational database via Prisma.

---

## Export

- `aiInsights`: Singleton export for direct use.
- `AIInsights`: Class export for further extension or direct instantiation.

---

## Summary

`AIInsights` offers a modular and extensible analytics service turning raw educational data into actionable insights broadly categorized for students, classes, and the overall institution, with additional predictive capability grounded in simple trend analysis and risk modeling.
