# ReportGenerator Class Documentation

## Overview

The `ReportGenerator` class is a modular utility for generating PDF reports in a Node.js or browser environment, using the [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://github.com/niklasvh/html2canvas) libraries. It creates well-formatted, multi-section PDF documents from structured data, with built-in support for headers, footers, tables, text, summary metrics, and chart images. It is flexible for generating different report types like student progress, class summary, and financial reports.

---

## Data Models

- **ReportData**: Top-level structure for the entire report (title, subtitle, period, generator info, and sections).
- **ReportSection**: Represents a single report section. Supports `table`, `chart`, `summary`, `text`, and `image` types.
- **TableData**: Used for `table` sections (column headers, row data).
- **SummaryData**: Used for `summary` sections (array of labeled metrics, values, and trends).

---

## Key Features

- **Header & Footer**: Automatically formats header (with optional logo placeholder, title, subtitle, metadata) and footer (fixed text and page numbers) on every page.
- **Dynamic Content**: Supports sections of types: Table, Summary Metric, Text, and Chart (as image).
- **Page Management**: Pagination and layout calculations ensure clean breaks and consistent margins.
- **Customizable Sections**: Report is assembled by providing sections describing the content and its type.
- **Chart Capture**: Uses `html2canvas` to render a DOM element as an image and embed it in the PDF for charts.
- **Reusable Report Types**: Methods for generating typical institution reports—student, class, and financial—with dummy/sample data mapping.

---

## Main Methods

### General PDF Generation

- `generateReport(data: ReportData): Promise<Blob>`
  - Orchestrates the report creation: header, each section, footer, and returns the PDF as a Blob.

### Section Renderers

- `addHeader(data: ReportData)`
  - Adds a stylized header with branding, title, subtitle, and meta info.
- `addSection(section: ReportSection)`
  - Adds a section based on its type (calls the appropriate handler).
- `addTable(data: TableData)`
  - Displays tabular data styled with alternating row backgrounds and header.
- `addSummary(data: SummaryData)`
  - Draws metrics in a grid, each showing value, label, and optional trend/change indicator.
- `addText(text: string)`
  - Wraps and places multi-line text into the PDF.
- `addChart(elementId: string)`
  - Captures a DOM element by ID, draws as an image in the PDF section.

### Layout and Helpers

- `addLine()`
  - Draws a horizontal line to separate parts of the document.
- `checkPageBreak(requiredSpace: number)`
  - Manages automatic page breaks when content will exceed the current page.
- `addFooter()`
  - Adds a footer to every page, including page numbers.

### Predefined Report Flows

- `generateStudentReport(studentData: any): Promise<Blob>`
- `generateClassReport(classData: any): Promise<Blob>`
- `generateFinancialReport(financialData: any): Promise<Blob>`
  - Accept structured data, convert to a matching `ReportData` structure, and generate the appropriate report.

---

## Usage Workflow

1. **Instantiate the Generator**
   ```js
   const generator = new ReportGenerator();
   ```
2. **Invoke a report method**
   ```js
   const pdfBlob = await generator.generateStudentReport(studentData);
   // or
   const pdfBlob = await generator.generateClassReport(classData);
   ```
3. **Download or Display**
   You can trigger a download or display the PDF blob as needed in your application.

---

## Extensibility

- Easily create new section types by expanding `ReportSection.type` and implementing a new handler.
- The data-driven section layout allows for highly flexible PDF content authoring.

---

## Dependencies

- **jsPDF**: PDF generation for browser/Node.js.
- **html2canvas**: For rendering charts or arbitrary HTML elements as image data in the PDF.

---

## Intended Use Cases

- Educational institutions needing printable progress or summary reports.
- Applications that require automated, branded, well-structured PDF output.
- Scenarios needing dynamically assembled reports from backend or frontend data.

---

## Limitations and Notes

- Chart sections rely on the presence of a rendered DOM element in the page (for html2canvas to capture).
- Styling is limited to what jsPDF supports—complex layouts may require further customization.
- Data should be sanitized and validated before providing it to the generator for best results.

---

**In summary:**  
`ReportGenerator` abstracts away the complexity of PDF formatting and pagination, letting you generate sophisticated, multi-sectioned institution reports with minimal integration effort, supporting tables, metrics, charts, and rich branding.
