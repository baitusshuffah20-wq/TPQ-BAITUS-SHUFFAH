# Switch Component Documentation

## Overview

This code defines a custom `Switch` React component by wrapping the [Radix UI](https://www.radix-ui.com/) Switch Primitives, allowing for a toggle-switch UI element with enhanced styling and behavior. The component is designed for use with React (including Next.js "use client" environments) and supports forwarding refs, custom class names, and accessibility features.

---

## Key Features

- **Based on Radix UI Switch:** Leverages `@radix-ui/react-switch` for accessible, headless switch logic.
- **Custom Styling:** Incorporates Tailwind CSS utility classes for appearance, sizing, interaction states, and transitions.
- **Class Name Composition:** Uses a utility (`cn`) to merge custom class names with default ones.
- **Thumb Animation:** Animates the switch thumb as it toggles between checked and unchecked states.
- **Disabled/Focus Support:** Handles disabled state and focus-visible outlines for better accessibility.
- **Ref Forwarding:** Supports `ref` to allow parent components to access the DOM node.

---

## Props

All properties supported by `@radix-ui/react-switch`'s Root component, plus:

- `className` (optional): Additional classes to customize root element styling.

---

## Usage

```jsx
import { Switch } from "@/components/Switch";

<Switch
  checked={isToggled}
  onCheckedChange={setIsToggled}
  className="my-custom-classes"
  disabled={isDisabled}
/>;
```

---

## Structure

- **Switch:** The main component, wrapping `SwitchPrimitives.Root`. Applies merged styles and passes props down.
- **SwitchPrimitives.Thumb:** The handle of the toggle; its position animates based on state (checked/unchecked).

---

## Accessibility

- Keyboard navigable
- Focus-visible ring for improved accessibility
- Full support for disabled state

---

## Customization

- **Styling:** Extend or override styles using the `className` prop.
- **Behavior:** All standard Switch props (checked, onCheckedChange, disabled, etc.) are supported.

---

## Export

Exports a single named component:

```js
export { Switch };
```

Use as a drop-in, stylable toggle switch component in your React application.
