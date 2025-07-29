# SystemMonitoring Component: High-Level Documentation

## Overview

The `SystemMonitoring` React component provides a user interface for monitoring the health, performance, and test status of a system and its services. It combines periodic health checks, manual refresh, and comprehensive tests, with visual feedback for the user through cards, badges, icons, and real-time notifications.

---

## Key Features

### 1. **Data Fetching and State Management**

- **Health Data Fetching**: On mount and optionally on an interval (auto-refresh), fetches system health status from `/api/health`.
- **Comprehensive Testing**: On demand, triggers a system-wide test suite via `/api/test/comprehensive` and displays results.
- **State Management**: Manages component state for health data, test results, loading and testing status, and whether auto-refresh is enabled.

### 2. **User Controls**

- **Auto Refresh Toggle**: Enable or disable periodic health checking (every 30 seconds).
- **Manual Refresh**: Fetch the latest system health data on demand.
- **Run Tests**: Trigger a comprehensive system test suite.

### 3. **Visual Summary Cards**

- **System Overview**: Shows cards for Overall Status, Response Time, Uptime, and Memory Usage with icons and values.
- **Services Health**: For each service (e.g., database, email, payment), displays health status, response time, additional details, and errors if any, along with relevant icons and badges.
- **Test Results**: Displays summary statistics (total, passed, failed, skipped, success rate) and a detailed list of individual test results, each with status, duration, and errors.
- **System Information**: Shows environment details (version, Node.js version, platform) and performance metrics (last check, healthy services, memory usage percent).

### 4. **Dynamic Visual Feedback**

- **Icons**: Represents statuses and types (healthy, unhealthy, degraded, pass, fail, etc.) with icons (from lucide-react).
- **Badges**: Uses colored badges to denote status or result.
- **Notifications**: Uses toast notifications for loading, errors, and results feedback.

### 5. **Responsive Design**

- Uses grid layouts and responsive classes to ensure the UI adapts to screen size.

### 6. **Utility Functions**

- **Icon/Badge/Variant Helpers**: Functions to select icons and badges appropriate to service types and health/test statuses.
- **Formatting**: Functions to format uptime and memory usage values.

---

## Data Structures

- **SystemHealth**: Information about the overall system health, environment, uptime, memory, services summary, and individual health checks.
- **HealthCheck**: Status and metrics for each individual service/component.
- **TestSummary & TestResult**: Test statistics and results for comprehensive testing.

---

## UI Components & Libraries Used

- **Custom Components**: Button, Card, Badge (from internal UI library)
- **Icons**: Lucide-react for various health and status indicators
- **Notifications**: react-hot-toast for user messages

---

## Error Handling

- Provides user feedback using toast notifications if data fetching or test triggers fail.

---

## Intended Usage

- Embedded in an admin or dashboard page for live system monitoring, troubleshooting, and validation of system health.

---

## Extensibility

- New services, test types, or metrics can be added by extending the health or test endpoints, and augmenting the mapping logic within the component's helpers.

---

**In summary**, this component turns live system health and test data into an interactive, visually rich interface for monitoring, testing, and understanding the status of backend services and performance.
