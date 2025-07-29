# WaliPaymentsPage — High-Level Documentation

## Overview

`WaliPaymentsPage` is a React component designed for the dashboard of a parent/guardian ("Wali") within a school payment management system. Its primary function is to display, manage, and interact with a list of school fee and activity payments for their children. It provides payment summaries, filtering, searching, and actionable operations such as paying, downloading receipts, or viewing details.

---

## Layout & Structure

- **DashboardLayout**: The entire content is wrapped in a dashboard layout for consistent application structure.
- **Header**: Shows the page title ("Pembayaran") with a subtitle and offers quick action buttons for history download and immediate payment initiation.
- **Statistic Cards**: Four summary cards provide quick payment stats:
  - Pending payments ⏳
  - Overdue payments ⚠️
  - Paid payments ✔️
  - Total outstanding amount 💰

- **Quick Actions**: Four action buttons simplify common workflows, such as paying school fees (SPP), viewing bills, downloading receipts, and checking the payment schedule.

- **Tabs Navigation**: Allows users to filter the displayed payments by their status: Pending, Overdue, Paid, or All.

- **Search and Filter**: User can search payments by keyword (description or child's name) and, in the UI, potentially use additional filters.

- **Payment List**: Dynamic list rendering of all payments that match the current filter and search, showing:
  - Payment description, type, related child
  - Due date, amount, and status (with colored badges and icons)
  - Payment method and date if paid
  - Contextual actions: View details, download receipt, or pay

- **No Results State**: Friendly message and icon if no payments match the current filters.

---

## Data & State

- **Mock Payment Data**: Hardcoded sample payments array to represent what would typically come from an API.
- **Tabs & Search State**: `selectedTab` (current payment status being viewed) and `searchTerm` (active search keyword).
- **User Context**: User data accessed via `useAuth` (not expanded in the code, likely supplies current authenticated user's info).

---

## Utilities & UX Features

- **Dynamic Filtering**: Payments are filtered based on both the tab (status) and search input.
- **Currency Formatting**: Amounts are displayed as formatted Rupiah (IDR).
- **Status Color & Icons**: Statuses map to their respective icons and colored badges for intuitive display.
- **Totals Calculation**: Summary cards automatically count and sum relevant payments.

---

## Extensibility

- The component is heavily structured around mock data and static actions, but is clearly intended to hook up to real data sources, handle events, and communicate with backend APIs for real-world use.
- UI utilizes reusable components (`Card`, `Button`, etc.) and Lucide icons for modern, consistent visuals.

---

## Use Cases

- **Parents/Wali**: To monitor and manage the payments (school fees and activities) associated with their children.
- **School Admins** (with modification): To oversee and interact from an administrative perspective.

---

## Tech Stack

- **React** (with Hooks, Function Component)
- **TypeScript** (type annotations in utilities)
- **Tailwind CSS** (for styling/layout via classNames)
- **Lucide React** (for icons)
- **Custom UI Components** (Card, Button, DashboardLayout, etc.)

---

## Key Takeaways

- The page provides a responsive, interactive overview and management UI for payments.
- The structure encourages clarity (stats then details), ease of action (quick actions, contextual buttons), and user-friendly navigation (tabs, search, empty state).
- The design supports future expansion for real data, deeper user/account handling, and richer action workflows.
