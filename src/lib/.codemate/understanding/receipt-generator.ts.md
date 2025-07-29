# High-Level Documentation

## Overview

This code provides a way to generate a printable HTML receipt for SPP payments (school tuition fees), mainly for TPQ Baitus Shuffah. It defines a TypeScript interface for the receipt data structure, a function to create the receipt's HTML content, and a function to generate unique receipt numbers.

---

## Components

### 1. **Data Structure: `ReceiptData` Interface**

Defines the structure of the receipt data required to produce a receipt. It includes:

- **Receipt Info:** Number, date
- **Santri Info:** Name, NIS (student ID)
- **SPP Info:** Period, amount, paid amount, possible discount, fine
- **Payment Info:** Method, account
- **Optional Notes**

---

### 2. **Receipt HTML Generation: `generateReceiptHTML` Function**

#### **Purpose:**

Generates a styled, printable HTML receipt using the data provided via the `ReceiptData` object.

#### **Workflow:**

- Formats currency values and dates appropriated for Indonesian locale ("id-ID").
- Embeds the student, payment, and SPP details in a visually styled HTML template.
- Dynamically shows or hides discount and fine rows depending on their values.
- Optionally displays a notes section if notes are present.
- Adds space for signatures and a receipt footer with auto-generated print date.
- Includes print-optimized CSS styling and an auto-print script.

---

### 3. **Receipt Number Generation: `generateReceiptNumber` Function**

#### **Purpose:**

Generates a unique receipt number based on the current timestamp and a random two-digit suffix.

#### **Format:**

`SPP<yy><MM><dd><hhmm><random>`

- Example: `SPP240604134507`

---

## Main Features

- **Localized Formatting:** All currency and dates are formatted for Indonesian standards.
- **Print-Ready:** Generated HTML is styled for professional physical receipts and set to invoke the print dialogue automatically on load.
- **Customization:** Optional discount, fines, and notes are included dynamically based on data.
- **Visual Consistency:** Includes comprehensive CSS for modern and clean layout both for screen and printed output.
- **Unique Receipt Tracking:** Ensures every receipt has a unique, timestamp-based identifier.

---

## Usage Context

- Suitable for TPQ/madrasa/school management systems to generate and print SPP (tuition) payment receipts for students ("santri").
- Can be used in web applications (e.g., admin portals) for easy print/export functionality.

---

## Not Covered

- No external dependencies except browser's JavaScript/TypeScript and standard browser APIs.
- No backend logic or database connectivity is present—this component only formats and renders receipt information provided to it.

---

**Summary:**  
This codebase offers a robust and flexible solution to automatically generate and print professional, locale-aware payment receipts for educational institutions in Indonesia. It focuses on data-driven, customizable, and visually structured output.
