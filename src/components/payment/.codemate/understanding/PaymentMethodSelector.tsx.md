# PaymentMethodSelector Component - High-Level Documentation

## Overview

`PaymentMethodSelector` is a React functional component designed for selecting a payment method in a payment flow. It provides a user interface for displaying, filtering, and selecting supported payment options based on transaction amount and user preferences. The component uses various UI subcomponents and iconography to enhance usability and clarity.

---

## Key Features

- **Payment Method Listing**: Displays a set of payment methods (e.g., credit card, bank transfers, e-wallets, QRIS), each with attributes like name, icon, description, processing time, applicable fees, and special badges (e.g., "Popular" or "Recommended").
- **Category Filtering**: Users can filter payment methods by category (All, Card, Bank, E-Wallet, QRIS) via a row of selectable buttons.
- **Amount-based Filtering**: Only payment methods supporting the current transaction amount are shown, considering method-specific min/max thresholds.
- **Fee Calculation**: For methods with fees, the component calculates and displays the extra costs and updated total.
- **Selection State**: The user can select a payment method; the selected option is visually highlighted, and a callback is triggered to communicate the selection to parent components.
- **Responsive & Accessible UI**: Utilizes design system components for layout, buttons, badges, and cards for consistent UX. The UI adapts with important details like payment security notices.
- **Fallback UI**: Displays a friendly message when no payment methods are available for the amount chosen.
- **Security Notice**: At the bottom, the component highlights transaction security (encryption, certified gateways).

---

## Props

- **amount**: (number, required) - The payment amount; used to filter available payment options.
- **onSelect**: (function, required) - Callback invoked when a payment method is selected. Receives the selected method as an argument.
- **selectedMethod**: (optional, PaymentMethod) - The currently selected payment method, for visual feedback and state preservation.
- **className**: (optional, string) - Additional classnames for the top-level card.

---

## Data Structure

- **PaymentMethod**: Payment methods are objects with fields:
  - `id`, `name`, `code`, `gateway`, `icon`, `description`
  - `fees` (optional, % of amount)
  - `processingTime`: Displayed string
  - `isPopular`, `isRecommended` (optional, for badges)
  - `minAmount`, `maxAmount` (optional, for filtering)

- **categories**: List of payment method categories, each with id, name, and icon, used for filtering.

---

## Main Functional Flow

1. **Render Header**: Card shows the component title and the total payment amount.
2. **Show Categories**: Renders category filter buttons, with active highlighting and click handling.
3. **Display Methods**:
   - Filters payment methods:
     - By amount constraints.
     - By current category.
   - For each filtered method:
     - Shows details, icon, description, processing time.
     - Displays badges for popularity/recommendation.
     - Shows calculated fee (if present) and total.
     - Shows a radio-style selection indicator.
     - Clicking a method calls `onSelect`.
4. **Handle Empty State**: If no methods are available, shows an informative message.
5. **Security Section**: Emphasizes that all payments are secured and processed by certified gateways.

---

## Usage Context

This component is ideal for a checkout or payments page in a web app, particularly for businesses operating in Indonesia (as suggested by languages and payment providers). It abstracts method filtering, fee calculation, and security assurance in a plug-and-play interface.

---

## External Dependencies

- **UI components**: `Card`, `Button`, `Badge` from your design system.
- **Icons**: From the `lucide-react` library.
- **Formatting**: Utilizes `Intl.NumberFormat` for currency formatting.

---

## Extensibility

- **Adding Methods**: New payment options can be inserted into the methods list.
- **Custom Filtering**: Filtering logic can be adapted for new categories or more complex criteria.
- **UX Customization**: Easily styled with className props and design system overrides.

---

**Summary**:  
This component is a comprehensive, extensible, and user-friendly payment method selector, suitable for modern e-commerce/transaction flows, emphasizing clarity, security, and flexibility.
