# PaymentChart Component Documentation

## Overview

This module provides a reusable React component, `PaymentChart`, designed for rendering different types of data visualizations (Bar, Line, and Doughnut charts) related to payment information using `react-chartjs-2` and Chart.js. Alongside the component, utility functions are provided for generating chart data suited to various payment analytics, such as revenue trends, status breakdown, payment types, and weekly trends.

---

## Main Component

### `PaymentChart`

- **Purpose**: Display a Bar, Line, or Doughnut chart based on payment data.
- **Props**:
  - `type`: `"bar" | "line" | "doughnut"`  
    Determines the type of chart to render.
  - `data`: `any`  
    Chart.js dataset and labels configuration.
  - `title`: `string` (optional)  
    Chart title.
  - `height`: `number` (optional, default: 300)  
    Chart container height in pixels.
- **Features**:
  - Responsive and auto-resizing.
  - Customized tooltips displaying currencies in Indonesian format (Rp).
  - Conditional formatting of chart axes (y-axis for non-doughnut charts).
  - Chart legend and title management.
  - Custom styling for different chart types.

---

## Data Generator Utilities

The module provides several utility functions to transform raw payment data into Chart.js-compatible structures for common financial analytics use cases:

### 1. `generatePaymentRevenueData(payments)`

- **Purpose**: Generates monthly revenue totals for the current year.
- **Input**: Array of payment objects (expects `paymentDate`, `amount`, and `status`).
- **Output**: Bar/Line chart data with:
  - Labels for each month ("Jan", "Feb", ..., "Dec").
  - Dataset showing revenue totals per month (restricted to `"PAID"` status).
  - Predefined color and style.

### 2. `generatePaymentStatusData(payments)`

- **Purpose**: Generates totals per payment status for use in visualizations like Doughnut charts.
- **Input**: Array of payment objects (expects `status` and `amount`).
- **Output**: Chart data with:
  - Labels mapped to user-friendly status names (e.g., "Lunas", "Menunggu", "Terlambat").
  - Dataset showing the sum of all payments for each status.
  - Predefined color coding by status.

### 3. `generatePaymentTypeData(payments)`

- **Purpose**: Displays totals for different payment types (e.g., SPP, Registration, Uniform).
- **Input**: Array of payment objects (expects `paymentType` and `amount`).
- **Output**: Chart data with:
  - Labels mapped to user-friendly payment type names.
  - Dataset showing total payments for each type.
  - Distinct color per type.

### 4. `generateWeeklyTrendData(payments)`

- **Purpose**: Visualizes daily revenue trends over the past 7 days.
- **Input**: Array of payment objects (expects `paymentDate`, `amount`, and `status`).
- **Output**: Line chart data with:
  - Labels for the last 7 days ("Sen 25", "Sel 26", ...).
  - Dataset showing total revenue per day (restricted to `"PAID"` status).
  - Visualization emphasizes trend (curved line, point highlights).

---

## Usage Example

```jsx
import PaymentChart, { generatePaymentRevenueData } from './PaymentChart';

const payments = [...]; // Your payments array

const chartData = generatePaymentRevenueData(payments);

<PaymentChart
  type="bar"
  data={chartData}
  title="Pendapatan Bulanan"
  height={400}
/>
```

---

## Notes

- This component and the helpers are tailored for Indonesian currency formatting and naming conventions.
- Payments should have at least the following properties: `paymentDate`, `amount`, `status`, and (for type data) `paymentType`.
- Chart customization leverages the rich option set provided by Chart.js.
- The module is client-side only (`"use client"`).

---

**Intended audience**: Developers implementing financial dashboards or payment analytics visualizations in React applications.
