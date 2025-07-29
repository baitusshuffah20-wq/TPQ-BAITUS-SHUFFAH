**High-Level Documentation: Rumah Tahfidz AI Engine**

---

### Overview

The `AIEngine` class is a lightweight, custom-built artificial intelligence module designed to analyze, predict, and optimize the educational journey of Qur'an memorization students (santri) at a Rumah Tahfidz institution. It provides personalized predictions, smart recommendations, group analysis, and study optimization, leveraging classic machine learning techniques without depending on heavy external libraries.

---

### Core Functionalities

1. **Prediction of Hafalan (Memorization) Completion**
   - Uses student's historical memorization data to forecast the date by which they will complete their Qur’an targets, factoring in attendance, grades, and progression trends.
   - Employs linear regression for progress prediction and applies performance-based adjustments.
   - Returns not only a target date and confidence measure, but also risk factors and actionable suggestions.

2. **Personalized Smart Recommendations**
   - Generates actionable advice based on recent performance (grades, attendance, variability).
   - Suggestions span study plan adjustments, motivation strategies, overcoming learning difficulties, and schedule optimization.
   - Recommendations are tailored with a prioritized action list and expected impact analysis.

3. **Class & Group Performance Analysis**
   - Aggregates and analyzes trends across a cohort of students.
   - Computes class-wide averages, attendance, top/bottom performers, and highlights students needing extra attention.
   - Provides readable insights and class performance trends (improving/stable/declining).

4. **Study Schedule Optimization**
   - Suggests optimized weekly study schedules based on individual performance, attendance, and learning patterns.
   - Justifies recommendations with brief, context-based reasoning.

---

### Internal Algorithms and Models

- **Linear Regression**: To model and predict student progress using time-series memorization data.
- **Weighted Moving Average**: To smooth out trends and recent learning rates.
- **Variance Calculation**: To track performance consistency.
- **Simple Clustering (K-Means)**: For potential grouping/classification of students, though the implementation is basic.

---

### Data Structures

- **StudentData**, **HafalanRecord**, **AttendanceRecord**: Rich interfaces capturing student info, memorization progress, assessments, and attendance.
- **PredictionResult**, **SmartRecommendation**: Typed responses for predictions and recommendations, ensuring clarity and structure.

---

### Key Strengths

- **Actionable AI**: Focuses on _decisions_, not just raw predictions—each insight is paired with next steps and expected benefits.
- **Contextual Awareness**: Factors in domain-specific requirements (e.g., memorization difficulty, attendance punctuality).
- **Custom ML Implementation**: Fully self-contained logic, suitable for environments without heavy libraries or cloud dependencies.

---

### Typical Use-Cases

- Predict how soon a student will memorize a certain Surah or portion of the Qur’an.
- Identify students at risk and provide structured intervention plans.
- Deliver motivational or remedial plans to individuals and classes.
- Routinely optimize lesson schedules for maximum retention and engagement.
- Give real-time, meaningful feedback to teachers, parents, and students.

---

### Extensibility

Although basic, the AIEngine can be extended with:

- More sophisticated clustering and trend analysis.
- Integration with larger data sources or external APIs.
- Enhanced models for adaptive learning or curriculum planning.

---

**Note:** This AI engine provides decision support, not absolute judgments. Human oversight is recommended for contextual accuracy and continuous improvement.
