# Logo Component - High Level Documentation

## Purpose

The `Logo` component is a customizable, theme-aware logo display widget for Next.js projects. It integrates with application settings, provides an elegant loading/pulse skeleton, and gracefully handles cases where no custom logo is provided.

## Features

- **Logo Rendering:**  
  Displays a custom system logo from application settings, with automatic alt text and performance optimizations.

- **Theme Awareness:**  
  Responds to a `variant` prop (`"light"` or `"dark"`), reflecting the appropriate color scheme for the fallback logo.

- **Loading State:**  
  Shows an animated placeholder (pulse) during loading, sized to match expected logo dimensions.

- **Fallback Handling:**  
  If no logo is set, renders a stylized SVG icon with background colors adjusted for the theme.

- **Responsiveness:**  
  Accepts customizable width and height, adapting its appearance accordingly and ensuring appropriate sizing of logos and fallback icons.

- **Navigation:**  
  The entire logo functions as a link to the site’s homepage using Next.js `<Link>`.

## API

```ts
interface LogoProps {
  className?: string;
  width?: number; // Default: 150
  height?: number; // Default: 50
  variant?: "light" | "dark"; // Default: "light"
}
```

- `className`: Additional utility classes for styling.
- `width`/`height`: Control rendered logo dimensions.
- `variant`: Alters fallback colors for light/dark backgrounds.

## Usage Overview

- Import and use `<Logo />` anywhere in your Next.js application.
- It automatically retrieves site branding details from your global settings provider.
- Pass width, height, or theme variant as needed to fit your layout or design system.

## Extensibility

- Easy to integrate with dynamic theming or advanced branding strategies.
- Handles all scenarios: loading, custom logo, and fallback branding.

---

**Summary:**  
This component robustly manages brand logo display with graceful degradation, skeleton loading, and theme adaptability, making it suitable for modern, dynamic Next.js apps.
