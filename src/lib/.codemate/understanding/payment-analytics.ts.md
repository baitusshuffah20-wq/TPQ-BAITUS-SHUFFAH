# Payment Analytics Service - High-Level Documentation

## Overview

The `PaymentAnalyticsService` class provides a comprehensive set of methods to generate payment analytics data from the application's database (using Prisma ORM). This service supports various analytic dimensions, including overall revenue, payment trends, categorical breakdowns, customer statistics, and supports data exporting in multiple formats.

---

## Data Model

The output analytics are structured according to the `PaymentAnalytics` interface which includes:

- **Overview statistics** (revenue, transactions, growth)
- **Revenue grouped by period** (e.g., month)
- **Statistics by payment method**
- **Breakdown by payment category**
- **Top-paying students**
- **Recent transactions**
- **Revenue/transaction trends** (e.g., daily)

---

## Key Functionality

### 1. getPaymentAnalytics

- **Purpose:** Entry point for generating a full analytics report.
- **Parameters:**
  - Optional date range (start/end)
  - Optional filters (by payment method, status, category)
- **Returns:** All payment analytics data, grouped/aggregated and formatted as per interface
- **How:** Calls multiple private static methods in parallel to collect all analytic components.

---

### 2. Statistical Calculations

#### a. getOverviewStats

- Produces key metrics (total revenue, total/pending transactions, success rate, AVG value, MoM growth).
- Compares current to previous month for growth calculations.

#### b. getRevenueByPeriod

- Aggregates and groups paid order data by month (with growth comparisons period-over-period).
- Adaptable for other period grouping.

#### c. getPaymentMethodStats

- Groups transactions by payment method.
- Calculates revenue, count, revenue share, success rate per method.

#### d. getCategoryBreakdown

- Parses order items to group revenue and transactions by item category (e.g., SPP, donations).
- Yields category-wise share of overall revenue.

#### e. getTopStudents

- Aggregates transactions per student to rank top payers.
- Reports total paid and last payment date.

#### f. getRecentTransactions

- Fetches most recent orders, including item details.

#### g. getTrends

- Generates time-series data for revenue and transaction count, currently on a daily basis (stubbed for weekly/monthly).

---

### 3. Data Export

#### a. exportAnalytics

- Accepts a format (`CSV` or `PDF`).
- Returns the analytics data exported as a CSV string, or a PDF placeholder.

#### b. generateCSVReport

- Converts core analytic stats to a well-formatted CSV string.

#### c. generatePDFReport

- Placeholder for future PDF generation (not implemented).

---

## Usage

- **Generating analytics:** `PaymentAnalyticsService.getPaymentAnalytics(...)`
- **Exporting data:** `PaymentAnalyticsService.exportAnalytics('CSV', filters)`

---

## Extensibility

- Each analytic aspect is encapsulated in a private static method (facilitating future upgrades).
- Easily supports new groupings (weekly, category types, etc.).
- Designed for plug-and-play integration with exporting libraries.

---

## Dependencies

- **Prisma ORM** for database access
- Data references entities: `order`, `transaction`, `santri` (students)

---

## Intended Use-Cases

- Admin dashboard payment analytics
- Payment history and monitoring
- Custom reporting and downloads for finance teams

---

## Security/Performance Notes

- All data is fetched from DB with appropriate filters for high performance.
- Uses parallel fetching (`Promise.all`) for analytic segments to minimize API response time.

---

**Note:** PDF exporting is a placeholder and would need an external library (e.g., jsPDF or Puppeteer) for implementation.
