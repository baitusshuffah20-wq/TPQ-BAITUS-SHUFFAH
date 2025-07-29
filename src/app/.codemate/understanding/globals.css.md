# High-Level Documentation of the CSS Code

---

## Overview

This CSS code defines a custom design system for a web application with an Islamic/teal-gold visual theme. It includes:

- Modern font stacks and custom fonts.
- Theme color variables, with dark/light mode support.
- Tailwind CSS integration for utility classes.
- Specific button and component overrides for consistent appearance.
- Custom utility classes, gradients, and animation effects.
- Global accessibility and cursor style settings.

---

## 1. Font and Variable Imports

- **Google Fonts:** Loads 'Inter' (a clean sans-serif) and 'Amiri' (Arabic Naskh style) fonts for Latin and Arabic text.
- **Tailwind Integration:** Imports Tailwind CSS for utility-first styling.

---

## 2. CSS Variables / Custom Properties

- **Color Palette:** Defines background, foreground, primary, secondary, accent, and muted colors, including card/popover/destructive states.
- **Typography:** Sets base sans-serif and Arabic font families.
- **Dynamic Theming:** Variables cascade into specialized theme variables (e.g., `--color-primary`).

#### **Dark Mode Support**

- At `prefers-color-scheme: dark`, variables are adjusted for dark backgrounds and light text.

---

## 3. Base Styles

- **Body:** Uses background/foreground from variables, applies 'Inter' font, and sets readable line height.

---

## 4. Custom Utilities and Theme Classes

- **Background Gradients:** `.bg-teal-gold`, `.bg-gold-teal`, `.bg-islamic-gradient` for rich, directional gradients.
- **Text Effects:** `.text-gradient` creates a gold-teal gradient text effect.
- **Arabic Support:** `.text-arabic` applies the 'Amiri' font and right-to-left alignment for Arabic content.
- **Islamic Card:** `.card-islamic` applies a subtle glassmorphic card effect with Islamic theme colors.
- **Islamic Pattern:** `.islamic-pattern` overlays a subtle geometric dot pattern reflecting traditional Islamic design motifs.

---

## 5. Button Styling and Variants

- **Global Button Styling:** Ensures all buttons have visible borders, layering, and shadows.
- **White and Color-specific Buttons:** Overrides for buttons with common background classes (e.g., `.bg-white`, `.bg-teal-50`, etc.) to ensure readability.
- **Solid Color Variants:** `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-danger`, `.btn-info` for core action buttons, each with consistent padding, font-weight, border-radius, and hover transitions.
- **Button States:** Refined hover states for color transitions and subtle lift effects.

---

## 6. Animations

- **Fade-in & Slide-up:** `.animate-fade-in` and `.animate-slide-up` for smooth entry transitions, using keyframe animations.
- **Hover-lift:** Slight upward translation on hover for interactive elements.

---

## 7. Accessibility: Cursors and Pointer States

- **General Interactivity:** Sets pointer cursor for all interactive elements (`button`, `a`, `[role=button]`, inputs, etc.), including custom selectors.
- **Disabled States:** Applies `not-allowed` cursor for disabled elements.
- **Text Inputs:** Sets `text` cursor for input fields.
- **Custom Clickable Class:** Forces pointer cursor on custom clickable elements.

---

## 8. Summary

**This stylesheet establishes a unique, accessible, and visually cohesive theme optimized for modern, Islamic-inspired web interfaces.** It combines custom CSS variables, modern fonts, utility classes, color variants, and interaction states for a unified user experience, while retaining flexibility via Tailwind CSS. It ensures both aesthetic appeal (through gradients, cards, patterns, and Arabic typography) and usability (via cursor management, clear button states, and responsive animations).
