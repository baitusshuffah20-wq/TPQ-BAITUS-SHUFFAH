# High-Level Documentation: Theme and Component CSS

This CSS code defines a configurable design system and applies consistent styling to primary UI components. Here is an overview of its structure and purpose:

## 1. Theme Variables

- Uses CSS custom properties (`:root`) to define the color palette, fonts, sizing, and layout variables.
- Variables include primary/secondary/accent colors, semantic colors (success, warning, error), button colors, fonts (default + Arabic), border radius, and maximum container width.

## 2. Button & Background Styles

- Classes like `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-danger`, and `.btn-info` use theme variables for background color and white (or theme-defined) text.
- Same color logic applies to background utility classes (e.g., `.bg-primary`).

## 3. Alert Styles

- Alert classes (`.alert-success`, `.alert-warning`, `.alert-error`) use semantic colors from the theme and set readable foreground (text) colors.

## 4. Typography

- Heading tags (`h1`-`h6`) use a heading font; body uses the body font.
- The `.arabic-text` class applies a different (serif) font, suitable for Arabic.

## 5. Layout and Utilities

- `.container` uses a max-width from the theme and centers content.
- `.rounded` applies a global border radius variable for consistent rounded corners.

## 6. Sidebar Responsive Styles

- The sidebar’s width adapts based on the `data-sidebar-style` attribute on the `<body>`. It supports three styles: default, compact, and expanded, each with a different width.

---

**Purpose:**  
This CSS enables centralized customization and consistent styling for a web UI, allowing rapid theming and standardized component design by adjusting variables. It provides foundational styles for buttons, alerts, typography, containers, and responsive layouts.
