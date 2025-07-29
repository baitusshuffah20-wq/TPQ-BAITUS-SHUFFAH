High-Level Documentation

Overview
This configuration file defines the build and submission settings for a project, specifying different behaviors for various environments (development, preview, production) and controlling command-line interface (CLI) requirements.

Key Sections

1. CLI Configuration

- Requires a CLI version of 16.11.0 or higher.
- Specifies that the application's version number should be determined from a remote source.

2. Build Configuration

- Specifies environment-specific build settings:
  - development: Enables a development client and sets distribution to "internal", allowing internal testing.
  - preview: Uses "internal" distribution for test releases prior to production.
  - production: Automates version incrementing on each production build.

3. Submission Configuration

- Outlines that production builds should be submitted (details are left as defaults or empty in this configuration).

Intended Usage
This configuration is intended for a project that undergoes multiple build stages (development, preview, production) and utilizes automation and version control to streamline the release process. It ensures that builds and CLI tooling remain consistent across different environments.
