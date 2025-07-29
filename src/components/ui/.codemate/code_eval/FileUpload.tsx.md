# Critical Code Review Report

### For: File Upload React Component

## **Reviewed for: Industry standards, errors, unoptimized/bad practices, security and resource leaks**

## **1. Memory Leak on Preview URL Handling**

**Issue:**  
When removing a file, you revoke _all_ object URLs for every file, not only the removed one. That will break previews for remaining files.  
Also, you do not revoke preview URLs on component unmount, so there is a risk of memory leaks.

**Correction (Pseudo code):**

```
// In removeFile, only revoke the preview of the file being removed
if (fileToRemove.type.startsWith("image/") && uploadedFile.preview) {
  URL.revokeObjectURL(uploadedFile.preview);
}

// Add the following in a useEffect for cleanup
useEffect(() => {
  return () => {
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }
}, [uploadedFiles]);
```

---

## **2. File List Key**

**Issue:**  
Using `index` as the `key` prop leads to bugs for dynamic lists (removal/reordering).

**Correction (Pseudo code):**

```
// Replace
key={index}

// With (example using file.name and file.size for uniqueness)
key={`${uploadedFile.file.name}-${uploadedFile.file.size}-${uploadedFile.file.lastModified}`}
```

---

## **3. Async State Updates and Race Conditions**

**Issue:**  
Using `prev` in multiple nested async updates can cause race conditions; multiple uploads concurrently updating progress/status may overwrite each other's state.

**Suggestion (Pseudo code):**

- Use callback version of `setUploadedFiles`, or consider batching all upload results before a single state update if possible.
- Alternatively, use a state reducer or `immer`.

**Best-practice recommendation:**  
Consider using a reducer (`useReducer`) to handle complex state logic for files.

---

## **4. Error Handling for Fetch**

**Issue:**  
If the server returns a non-200 HTTP status but without JSON, calling `response.json()` can throw and is not caught, resulting in a crash.

**Correction (Pseudo code):**

```
const response = await fetch(...);
let result = {};
try {
  result = await response.json();
} catch (err) {
  // handle invalid/missing JSON response
  result = { success: false, error: 'Invalid server response' };
}

if (!response.ok) {
  throw new Error(result.error || response.statusText);
}
```

---

## **5. Lack of Progress Feedback Per Upload**

**Issue:**  
There’s a `progress` field in UploadedFile, but you never update it, so UI doesn’t show per-file progress (unless fetch supports `onUploadProgress`, which it doesn't natively).  
**Alternative**: Use Axios or XHR for true upload progress, or remove the unused field.

**Correction (Pseudo code, if not implemented):**

```
// If not supporting progress, remove progress from UploadedFile to prevent confusion
// If supporting, change upload to use axios/xhr and update progress in setUploadedFiles
```

---

## **6. File Type Acceptance Mapping**

**Issue:**  
`accept` prop is used as-is, but react-dropzone expects a slightly different structure for MIME types. This might cause browser behavior that doesn’t fit your UI's restriction display.

**Correction (Pseudo code):**

```
// Consider normalizing 'accept' to a proper string or object format as required by react-dropzone
accept: Object.keys(accept)
```

---

## **7. UX: Disabled Prop and Button Click**

**Issue:**  
The remove button should be disabled when the component is `disabled` or during upload.

**Correction (Pseudo code):**

```
<button
  onClick={...}
  disabled={disabled || isUploading}
  ...
>
```

---

## **8. Upload on File Selection Only (No Remove On Success/Failure)**

**Issue:**  
After upload, files remain in the list (with error or success). Some UIs auto-remove successful uploads for cleanliness; consider your UX.

**Suggestion:**

- Offer optional auto-remove on success.
- Alternatively, limit file list count.

---

## **9. Poor Handling of Edge Cases for Duplicate Files**

**Issue**:  
Users can re-upload the same file repeatedly, bloating the UI.

**Correction (Pseudo code):**

```
// Before adding validFiles to uploadedFiles, filter out duplicates
validFiles = validFiles.filter(f =>
  !uploadedFiles.some(u => u.file.name === f.name && u.file.size === f.size)
);
```

---

## **10. Alert for Files Too Large Is Blocking**

**Issue:**  
Calling `alert()` for every file over size is disruptive.

**Suggestion:**  
Batch errors or display error in the component UI near the dropzone.

---

## **Summary of Corrections and Suggestions**

- Only revoke preview URL for the removed file.
- On component unmount, revoke all preview URLs.
- Use a unique file identifier for list key.
- Improve async update safety for uploadedFiles.
- Add robust error handling for failed or malformed server responses.
- Remove or properly implement progress feedback.
- Map `accept` prop properly for react-dropzone.
- Disable remove buttons while uploading or when component is disabled.
- Optionally auto-remove successful uploads or manage file list size.
- Prevent duplicates in uploadedFiles.
- Avoid browser alert() for user-facing errors—display errors inline instead.

---

### **Sample Critical Corrections (Pseudo code)**

```js
// 1. In removeFile():
if (fileToRemove.type.startsWith("image/") && uploadedFile.preview) {
  URL.revokeObjectURL(uploadedFile.preview);
}

// 2. On component unmount:
useEffect(() => {
  return () => {
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }
}, [uploadedFiles]);

// 3. In file list mapping:
key={`${uploadedFile.file.name}-${uploadedFile.file.size}-${uploadedFile.file.lastModified}`}

// 4. Enhanced error handling:
let result = {};
try { result = await response.json(); }
catch { result = {success:false, error:'Invalid server response'}; }

if (!response.ok) {
  throw new Error(result.error || response.statusText);
}

// 5. Remove unused 'progress' field if not updating it.
```

---

**Please make the above critical corrections to raise this file to strong industry standards!**
