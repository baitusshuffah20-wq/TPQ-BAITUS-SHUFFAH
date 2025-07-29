# ShoppingCart Component – High-Level Documentation

## Overview

`ShoppingCart` is a React component that displays and manages a shopping cart UI for a web application. It provides capabilities for users to view, modify, and clear the items in their shopping cart, as well as to proceed to checkout. It integrates with backend APIs for data persistence and sync, and provides user feedback through toast notifications.

## Main Features

- **Cart Data Loading:** On mount or when the `cartId` prop changes, fetches the current cart summary and item list from the backend via `/api/cart`.
- **Item Management:**
  - **Update Quantity:** Increment, decrement, or set item quantities directly. Communicates updates to `/api/cart` (PUT).
  - **Remove Item:** Remove individual items from the cart (`/api/cart` DELETE).
  - **Clear Cart:** Remove all items from the cart in one action.
- **UI Feedback and States:**
  - Loading spinners and “empty cart” messages while fetching or updating.
  - Per-item disable states during server interactions.
  - Toast notifications for success or error feedback after cart operations.
- **Cart Summary:** Displays detailed cost breakdown (subtotal, tax, discount, total) and updates dynamically with cart changes.
- **Checkout:**
  - Shows a prominent button to trigger the checkout process.
  - Calls the `onCheckout` callback (if provided) with the current cart summary.
- **Visuals:**
  - Uses card layout with icons reflecting item types (e.g., SPP, DONATION).
  - Shows badges for item types.
  - Indicates available payment methods with icons.
  - Price formatting for Indonesian Rupiah (IDR).

## Props

- **cartId (required):** The unique identifier for the current cart.
- **userId (optional):** User identifier (not internally used).
- **onCheckout (optional):** Callback invoked when proceeding to checkout, receives the `cartSummary`.
- **className (optional):** Allows styling customization via additional CSS class names.

## State Variables

- **cartSummary:** The loaded state of the cart (list of items and cost calculations).
- **loading:** Indicates if the cart data is currently being fetched.
- **updating:** Holds the ID of the item currently being updated or removed, for disabling relevant controls and showing spinners.

## API Integration

- **GET /api/cart?cartId={cartId}:** Loads cart summary and item details.
- **PUT /api/cart:** Updates quantity of items in the cart.
- **DELETE /api/cart?cartId={cartId}&itemId={itemId}:** Removes a single item.
- **DELETE /api/cart?cartId={cartId}&action=clear:** Clears all items from the cart.

## User Experience Flow

1. **Load Cart:** On initial load, the cart is fetched and displayed. Loading spinner is shown if waiting for data.
2. **Add or Remove Items:** Users can adjust quantities, remove, or clear all items. Each operation triggers server sync and displays a toast notification.
3. **Cart Summary & Checkout:** The updated cart summary is shown. Proceeding to checkout invokes a provided callback.
4. **Visual Cues:** Intuitive icons, immediate feedback on operations, and visual separation between item and summary zones.

## Extensibility

- The `onCheckout` callback allows integration with further payment or order processing logic.
- The component is adaptable to different cart item types and easily updatable for further features (e.g., loyalty points, promotions).
- UI can be styled via the `className` prop and integrates reusable design elements.

---

This documentation provides a comprehensive overview of the component’s purpose, functionality, structure, and integration points.
