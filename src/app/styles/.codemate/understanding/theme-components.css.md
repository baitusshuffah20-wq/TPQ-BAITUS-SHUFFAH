## High-Level Documentation for Theme CSS

### Purpose

This stylesheet establishes a unified theming system for a web application's UI components, using CSS custom properties (`var(--...)`) for easy customization of colors, border-radii, fonts, and other style aspects.

### Key Features

- **Color Theming:**  
  All major components use CSS variables for color, enabling quick and consistent theme changes across headings, links, buttons, alerts, badges, icons, etc.

- **Border Radius Unification:**  
  Components like cards, inputs, tables, alerts, and progress bars receive a standard border radius from a variable, creating cohesive rounded appearances throughout the UI.

- **Font Customization:**  
  Headings, body text, and Arabic text are assigned font families via variables, ensuring typographic consistency and support for different languages.

- **Component-Specific Styling:**
  - **Buttons:** Backgrounds, text, border, and focus rings themed with primary color variables.
  - **Cards, Modals, Tooltips, Toasts, Lists, Avatars:** Use rounded corners and background color variables.
  - **Forms (Inputs, Selects, TextAreas):** Unify border radius and apply colors for checked states (switches, checkboxes, radios, ranges, file inputs).
  - **Badges & Alerts:** Each status type (primary, secondary, success, warning, danger/error) mapped to a variable for background and text color.
  - **Navigation (Links, Tabs, Pagination):** Active/hover states themed; color/border reflect active status.
  - **Tables, Progress Bars, Spinners:** Themed with variable colors and rounded edges.
  - **Sidebar & Dashboard:** Consistent background-color via variables.
  - **Miscellaneous:** BreadCrumbs, Lists, Charts, Icons get theme-specific colors; containers have max width set by variable.

### Extensibility

- Changing theme colors, border radius, or fonts globally can be done by modifying the respective CSS variable, promoting scalability and maintainability.
- Easily adaptable to light/dark modes or branding needs by overriding variable values.

### Accessibility & Internationalization

- Includes support for Arabic text with a dedicated font variable.
- Status colors (success, warning, error) and states (active, hover) are differentiated, enhancing usability and accessibility.

---

This stylesheet provides a scalable, maintainable foundation for consistent and easily-adjustable UI theming across all application components.
