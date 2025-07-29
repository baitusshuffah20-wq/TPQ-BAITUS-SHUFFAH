# QRCodeGenerator Component: High-Level Documentation

## Overview

`QRCodeGenerator` is a reusable React functional component that generates and displays a QR code from a given string of data. It features options for downloading, refreshing, and copying both the QR code image and its underlying data. The component leverages the QRCode library for QR code rendering, integrates UI controls, and is styled for integration with card-based layouts.

---

## Key Features

1. **Dynamic QR Code Generation**:
   - Renders a QR code from any provided string.
   - Regenerates automatically on data or size changes.
   - Can be triggered to regenerate manually by the user.

2. **Interactive Controls** (optional):
   - **Refresh**: Manually regenerate the QR code.
   - **Download**: Save the generated QR code image (PNG format) locally.
   - **Copy Data**: Copies the underlying data string to the clipboard.
   - **Copy Image**: Copies the QR code image to the clipboard.

3. **Data and Presentation**:
   - Shows the QR code, data string, title, and optional description.
   - Flexible size and style via props.
   - Supports a loading state during QR code generation.

4. **Customizability**:
   - Allows custom title, description, and styling class.
   - Control visibility of UI controls.
   - Supports a callback when the QR code image is (re)generated.

---

## Props Overview

- **data** `(string)` _(required)_: The string data to encode as a QR code.
- **title** `(string)` _(optional)_: The title for the card header.
- **description** `(string)` _(optional)_: An optional description shown under the title.
- **size** `(number)` _(optional)_: Width/height of the QR code in pixels (default: 256).
- **className** `(string)` _(optional)_: Additional CSS class names for the card container.
- **showControls** `(boolean)` _(optional)_: Show/hide download/copy/refresh controls (default: true).
- **onGenerate** `(function)` _(optional)_: Callback triggered with the data URL after QR generation.

---

## Internal Workflow

1. **Rendering**:
   - Initializes a canvas element for QR code drawing.
   - On component mount and `data`/`size` changes, regenerates the QR code into the canvas.

2. **Generating QR Code**:
   - Uses `QRCode.toCanvas()` to render the QR code.
   - Custom colors: teal for dark, white for light.
   - Extracts and stores a PNG data URL for further use.

3. **Download & Clipboard Operations**:
   - **Download PNG**: Creates a download link from the data URL.
   - **Copy Data**: Uses browser clipboard API to copy the data string.
   - **Copy Image**: Fetches image as a Blob and copies it as an image to the clipboard.
   - **User Feedback**: Shows confirmation/check mark when copy actions succeed.

4. **UI and Feedback**:
   - Card layout with title, description, and action controls.
   - Loading spinner overlays the QR code while generating.
   - Shows data string in a monospace, breakable area below the QR code.

---

## Design & Dependencies

- **React** for component structure and state.
- **qrcode** for encoding data and rendering QR to canvas.
- **lucide-react** icon set for visual controls/buttons.
- **Custom UI Components** (`Button`, `Card`, `CardContent`, etc.) for a cohesive look.
- Responsive and accessible (uses appropriate ARIA/button semantics).

---

## Usage Example

```jsx
<QRCodeGenerator
  data="https://example.com"
  title="Scan Me!"
  description="Quickly visit our site."
  size={300}
  showControls={true}
/>
```

---

## Summary

This component provides a polished, interactive, and self-contained QR code card suitable for web applications needing quick QR code generation, sharing, and download features. It is highly customizable and ready for integration into modern React projects.
