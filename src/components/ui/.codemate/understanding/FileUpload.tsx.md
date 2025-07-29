---
# FileUpload Component — High-Level Documentation

## Overview

The `FileUpload` React component provides a user-friendly drag-and-drop interface for uploading files in a Next.js app. It supports image/document preview, file validation, asynchronous upload (with progress/status), error handling, and control of multiple files and file types.
---

## Main Features

- **File Drag-and-Drop and Click-to-Select:**  
  Users can add files by dragging them onto a dropzone or by clicking to select via a dialog.

- **File Validation:**  
  Checks each file’s size and type before upload. Displays an alert if a file is too large.

- **Multiple File Support:**  
  Supports uploading one or multiple files, based on `multiple` prop and maximum file count.

- **Image Preview:**  
  Shows a thumbnail preview for images before and after upload (if `preview` is enabled).

- **Document & Image Type Support:**  
  Accepts custom file types via the `accept` prop (default: images and PDFs).

- **Upload Process:**  
  Starts uploading immediately upon file selection, sending files to a given API endpoint via `fetch` POST requests.

- **File Status and Progress Display:**  
  Shows visual indicators for uploading, successful, and failed uploads. Displays file name, size, and any error messages.

- **Remove Files:**  
  Allows users to remove files from the upload list, with safe cleanup of preview object URLs to avoid memory leaks.

- **Event Callbacks:**
  - `onFileSelect`: Triggered with files accepted for upload.
  - `onUploadComplete`: Triggered with URLs of successfully uploaded files.

- **Accessibility & UX:**  
  Disables inputs and UI elements appropriately during upload or when the component is disabled.

---

## Key Props

| Prop               | Type                     | Description                                        | Default       |
| ------------------ | ------------------------ | -------------------------------------------------- | ------------- |
| `onFileSelect`     | (File[]) => void         | Callback with files selected/accepted for upload.  | Required      |
| `onUploadComplete` | (string[]) => void       | Callback with URLs of successfully uploaded files. | Optional      |
| `accept`           | Record<string, string[]> | Accepted MIME types/extensions.                    | Images, PDFs  |
| `maxFiles`         | number                   | Maximum number of files allowed per upload.        | 1             |
| `maxSize`          | number (bytes)           | Maximum single file size.                          | 5MB           |
| `className`        | string                   | Extra CSS class(es) for container.                 | None          |
| `disabled`         | boolean                  | Disables the file input and UI interactions.       | false         |
| `multiple`         | boolean                  | Allow selection of multiple files.                 | false         |
| `uploadEndpoint`   | string                   | API endpoint to POST files to.                     | `/api/upload` |
| `preview`          | boolean                  | Enable/disable image previews.                     | true          |

---

## Usage Example

```tsx
<FileUpload
  onFileSelect={(files) => {
    /* handle files */
  }}
  onUploadComplete={(urls) => {
    /* handle uploaded URLs */
  }}
  accept={{ "image/*": [".jpg", ".jpeg", ".png"] }}
  maxFiles={3}
  maxSize={2 * 1024 * 1024} // 2MB
  multiple={true}
/>
```

---

## Visual Feedback

- Highlights dropzone during drag.
- Displays upload progress and status.
- Shows icons for file type and success/error state.
- Allows removing uploaded or selected files before/after upload.

---

## Technical Notes

- Utilizes [`react-dropzone`](https://react-dropzone.js.org/) for file input.
- Handles state for file list, upload status, and uploading flag.
- Performs client-side validation (type, size) before upload.
- Uses native `fetch` for uploading files via FormData.
- Cleans up object URLs for images removed from preview.
- Relies on the API to return `{ success: boolean, url: string }` per file.

---

## Styling

- Uses TailwindCSS utility classes and the `cn` helper for styling and conditional classes.
- Includes iconography from `lucide-react` (for file, image, status, and action icons).

---

## Localization

- Some button/alert texts are in Indonesian (e.g., "Lepaskan file di sini...", "Maksimal ... MB", etc.).

---

## Extensibility

- Can be further customized for other file types, endpoints, advanced validation, or UI customizations through props.

---

**In summary:**  
This component encapsulates a complete user and developer-friendly file upload workflow suitable for modern web apps, abstracting the technical and usability complexities of file input, previews, validation, feedback, and server interaction.
