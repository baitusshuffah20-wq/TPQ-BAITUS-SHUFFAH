# VoiceRecorder - High-Level Documentation

## Overview

The `VoiceRecorder` component provides a complete client-side voice/audio recording, playback, file upload, and download feature for web applications using React. It allows users to:

- Record new audio directly from their microphone (with permissions)
- Pause, resume, and stop recordings
- Playback recorded or uploaded audio with volume and mute controls
- Download or delete recorded audio
- Upload existing audio files from their device

## Key Features

- **Microphone Recording**: Utilizes the browser's MediaRecorder and getUserMedia APIs to capture audio input.
- **Playback Controls**: Includes play/pause, mute/unmute, and volume adjustment for recorded/uploaded audio.
- **Time Display**: Shows elapsed and maximum recording time (default 5 minutes, configurable).
- **Recording Status**: Real-time visual feedback while recording, including paused and active states.
- **Audio File Management**: Supports download, delete (hapus/reset), and upload of audio files.
- **Permissions Management**: Handles microphone permission requests and related error messages gracefully.
- **UI**: Uses a Card-based layout with buttons and status messages for a user-friendly interface.
- **Customization**: Titles, descriptions, and CSS classes are customizable via props.

## Component Props

- `onRecordingComplete?`: Callback triggered when a recording is finished (returns the audio Blob and duration).
- `onUpload?`: Callback when an audio file is uploaded.
- `maxDuration?`: Maximum length of recording in seconds (defaults to 300s / 5 minutes).
- `className?`: Optional CSS class for styling the Card.
- `title?`: Customizable header for the recorder.
- `description?`: Customizable description.

## High-Level Flow

1. **Initial State**: Shows "Mulai Rekam" (Start Recording) button.
2. **Recording**:
   - Requests microphone permission.
   - Updates recording timer every second.
   - Allows pause/resume; automatically stops at max duration.
3. **On Stop**:
   - Combines audio data into a single Blob.
   - Makes the Blob available for playback, download, or deletion.
   - Calls the `onRecordingComplete` callback if provided.
4. **Playback**:
   - Built-in controls for play/pause, mute, and volume.
   - Respects audio ended events.
5. **File Upload**:
   - Accepts and verifies audio file type.
   - Triggers the `onUpload` callback if provided.
6. **Auxiliary Actions**:
   - Download: Offers the file as a webm download.
   - Reset: Clears current recording/audio.
   - Delete: Removes current audio.
7. **Error and Permission Handling**:
   - Error messages if permissions are denied or invalid files are selected.
   - Prompts user to allow microphone access if denied.

## UI Structure

- **Header**: Displays title & description.
- **Recording Controls**: Start, pause/resume, and stop buttons.
- **Recording Status**: Animated indicator & status text.
- **Playback Section**: Player with controls, volume/mute, and remaining time.
- **Action Buttons**: Download, reset, and delete.
- **Upload Section**: Hidden file input, visible label/button.
- **Messages**: Permission and error notifications, conditionally shown.

## Dependencies

- React (hooks API)
- [Lucide-react](https://lucide.dev/) icons
- Local Button and Card UI components

## Usage Example

```jsx
<VoiceRecorder
  onRecordingComplete={(blob, duration) => {
    /* handle blob */
  }}
  onUpload={(file) => {
    /* handle uploaded file */
  }}
  maxDuration={180}
  className="my-custom-style"
  title="Voice Note"
  description="Record something interesting"
/>
```

## Internationalization Note

- Some labels are in Indonesian (e.g., "Perekam Suara", "Mulai Rekam", "Hapus").
- All user-facing strings should be adjusted for your audience as needed.

---

This component is suitable for any feature requiring user voice notes, pronunciation checks, or recording assessments in web apps. It manages all typical states and error conditions, providing a robust user experience around audio capture and handling in modern browsers.
