# High-Level Documentation: `seedSubscriptionPlans`

## Overview

This module defines and executes a database seeding routine for subscription plans using Prisma ORM. It is intended to initialize a set of predefined subscription plans in the database, each with specific attributes such as name, description, pricing, billing cycle, features, and applicable discounts. The seeding only runs if no plans currently exist.

---

## Key Functionalities

### 1. Prevent Duplicate Seeding

- **Checks the existence of subscription plans** in the database before proceeding.
- **Skips seeding** if any plans are found, ensuring no duplicate entries.

### 2. Define Subscription Plans

- **Six plans are predefined**, differentiated by billing period (monthly, quarterly, yearly) and plan type (basic, premium).
- **Each plan includes**:
  - Name and description
  - Price (in IDR)
  - Billing cycle (monthly, quarterly, yearly)
  - Trial period (in days)
  - Features (list of plan features, stored as a JSON string)
  - Activation status
  - Sort order (for display/ordering)

### 3. Seed Database

- **Iterates over the plans list**, constructs each plan, and creates it in the `subscriptionPlan` table of the database.

### 4. Logging and Output

- **Logs progress and outcomes** including:
  - When seeding starts
  - Skipped seed notification
  - Success message with the number of plans created
  - A formatted list of all created plans with their prices and billing cycles

### 5. Error Handling

- **Catches and logs any errors** encountered during the process.
- Throws errors for higher-level handling if needed.

### 6. Script Entrypoint

- If run directly from the command line, **executes the seeding routine** and exits with appropriate status (0 for success, 1 for failure).

---

## Usage

- **As a module:** Import and call `seedSubscriptionPlans()` in application scripts or test runners.
- **As a script:** Run directly (e.g., `node seedSubscriptionPlans.js`) to perform one-time seeding of subscription plans.

---

## Dependencies

- **Prisma ORM**: For database access and manipulation.
- **Node.js**: Script is intended for a Node execution environment.

---

## Customization

- **To add or edit plans:** Modify the `plans` array in the file.
- **To update features:** Adjust the `features` array for each plan.
- **To extend behavior:** Consider parameterizing the seeding process or adding CLI options.

---

## Typical Use Case

This script is typically used during project setup, development, or deployment to ensure the subscription plans are initialized and available in the system for further use (e.g., plan selection, billing logic).
