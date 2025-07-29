import { ThemeConfig } from "./theme-context";

/**
 * Applies the theme to all components in the application
 * @param theme The theme configuration to apply
 */
export function applyGlobalTheme(theme: ThemeConfig): void {
  // Ensure buttons field exists
  if (!theme.buttons) {
    theme.buttons = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      danger: theme.colors.error,
      info: "#3B82F6",
    };
  }
  // Apply CSS variables to the document root
  const root = document.documentElement;

  // Apply colors
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-success", theme.colors.success);
  root.style.setProperty("--color-warning", theme.colors.warning);
  root.style.setProperty("--color-error", theme.colors.error);

  // Apply button colors
  root.style.setProperty("--button-primary", theme.buttons.primary);
  root.style.setProperty("--button-secondary", theme.buttons.secondary);
  root.style.setProperty("--button-accent", theme.buttons.accent);
  root.style.setProperty("--button-danger", theme.buttons.danger);
  root.style.setProperty("--button-info", theme.buttons.info);

  // Apply fonts
  root.style.setProperty("--font-heading", theme.fonts.heading);
  root.style.setProperty("--font-body", theme.fonts.body);
  root.style.setProperty("--font-arabic", theme.fonts.arabic);

  // Apply layout
  root.style.setProperty("--border-radius", theme.layout.borderRadius);
  root.style.setProperty("--container-width", theme.layout.containerWidth);

  // Apply sidebar style
  document.body.dataset.sidebarStyle = theme.layout.sidebarStyle;

  // Update favicon
  const faviconLink = document.querySelector('link[rel="icon"]');
  if (faviconLink) {
    faviconLink.setAttribute("href", theme.logo.favicon);
  }

  // Apply theme to meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme.colors.primary);
  }

  // Apply theme to all buttons
  applyButtonStyles(theme);

  // Apply theme to all links
  applyLinkStyles(theme);

  // Apply theme to all headings
  applyHeadingStyles(theme);

  // Apply theme to all inputs
  applyInputStyles(theme);

  // Apply theme to all cards
  applyCardStyles(theme);

  // Apply theme to all tables
  applyTableStyles(theme);

  // Apply theme to all alerts
  applyAlertStyles(theme);

  // Apply theme to all badges
  applyBadgeStyles(theme);

  // Apply theme to all modals
  applyModalStyles(theme);

  // Apply theme to all tooltips
  applyTooltipStyles(theme);

  // Apply theme to all progress bars
  applyProgressStyles(theme);

  // Apply theme to all pagination
  applyPaginationStyles(theme);

  // Apply theme to all tabs
  applyTabStyles(theme);

  // Apply theme to all dropdowns
  applyDropdownStyles(theme);

  // Apply theme to all toasts
  applyToastStyles(theme);

  // Apply theme to all breadcrumbs
  applyBreadcrumbStyles(theme);

  // Apply theme to all lists
  applyListStyles(theme);

  // Apply theme to all spinners
  applySpinnerStyles(theme);

  // Apply theme to all switches
  applySwitchStyles(theme);

  // Apply theme to all checkboxes and radios
  applyCheckboxStyles(theme);

  // Apply theme to all range inputs
  applyRangeStyles(theme);

  // Apply theme to all file inputs
  applyFileStyles(theme);

  // Apply theme to all datepickers
  applyDatepickerStyles(theme);

  // Apply theme to all charts
  applyChartStyles(theme);

  // Apply theme to all icons
  applyIconStyles(theme);

  // Apply theme to all avatars
  applyAvatarStyles(theme);

  // Apply theme to all containers
  applyContainerStyles(theme);

  // Apply theme to all arabic text
  applyArabicStyles(theme);

  // Apply theme to all body text
  applyBodyStyles(theme);
}

// Helper functions to apply styles to specific components
function applyButtonStyles(theme: ThemeConfig): void {
  // Primary buttons
  const primaryButtons = document.querySelectorAll(
    ".btn-primary, .bg-primary, .bg-teal-600, .bg-teal-700",
  );
  primaryButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.primary;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.primary,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.primary, -20)}`;
  });

  // Secondary buttons
  const secondaryButtons = document.querySelectorAll(
    ".btn-secondary, .bg-secondary",
  );
  secondaryButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.secondary;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.secondary,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.secondary, -20)}`;
  });

  // Accent buttons
  const accentButtons = document.querySelectorAll(".btn-accent, .bg-accent");
  accentButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.accent;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.accent,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.accent, -20)}`;
  });

  // Danger buttons
  const dangerButtons = document.querySelectorAll(
    ".btn-danger, .bg-danger, .bg-red-600, .bg-red-700",
  );
  dangerButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.danger;
    (button as HTMLElement).style.color = getContrastColor(
      theme.buttons.danger,
    );
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.danger, -20)}`;
  });

  // Info buttons
  const infoButtons = document.querySelectorAll(".btn-info, .bg-info");
  infoButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.info;
    (button as HTMLElement).style.color = getContrastColor(theme.buttons.info);
    (button as HTMLElement).style.border =
      `1px solid ${adjustColor(theme.buttons.info, -20)}`;
  });

  // Outline buttons
  const outlineButtons = document.querySelectorAll(".btn-outline");
  outlineButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = "white";
    (button as HTMLElement).style.color = theme.buttons.primary;
    (button as HTMLElement).style.border = `1px solid ${theme.buttons.primary}`;
  });

  // Ghost buttons
  const ghostButtons = document.querySelectorAll(".btn-ghost");
  ghostButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = "white";
    (button as HTMLElement).style.color = theme.colors.text;
    (button as HTMLElement).style.border = `1px solid #e2e8f0`;
  });
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#333333" : "#ffffff";
}

// Helper function to adjust color brightness
function adjustColor(hexColor: string, amount: number): string {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  // Adjust RGB values
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function applyLinkStyles(theme: ThemeConfig): void {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    (link as HTMLElement).style.color = theme.buttons.primary;
  });
}

function applyHeadingStyles(theme: ThemeConfig): void {
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    (heading as HTMLElement).style.fontFamily = theme.fonts.heading;
    (heading as HTMLElement).style.color = theme.colors.text;
  });
}

function applyInputStyles(theme: ThemeConfig): void {
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    (input as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyCardStyles(theme: ThemeConfig): void {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    (card as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyTableStyles(theme: ThemeConfig): void {
  const tables = document.querySelectorAll("table");
  tables.forEach((table) => {
    (table as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyAlertStyles(theme: ThemeConfig): void {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    (alert as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });

  const successAlerts = document.querySelectorAll(".alert-success");
  successAlerts.forEach((alert) => {
    (alert as HTMLElement).style.backgroundColor = theme.colors.success;
  });

  const warningAlerts = document.querySelectorAll(".alert-warning");
  warningAlerts.forEach((alert) => {
    (alert as HTMLElement).style.backgroundColor = theme.colors.warning;
  });

  const errorAlerts = document.querySelectorAll(".alert-error");
  errorAlerts.forEach((alert) => {
    (alert as HTMLElement).style.backgroundColor = theme.colors.error;
  });
}

function applyBadgeStyles(theme: ThemeConfig): void {
  const badges = document.querySelectorAll(".badge");
  badges.forEach((badge) => {
    (badge as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });

  const primaryBadges = document.querySelectorAll(".badge-primary");
  primaryBadges.forEach((badge) => {
    (badge as HTMLElement).style.backgroundColor = theme.buttons.primary;
  });

  const secondaryBadges = document.querySelectorAll(".badge-secondary");
  secondaryBadges.forEach((badge) => {
    (badge as HTMLElement).style.backgroundColor = theme.buttons.secondary;
  });

  const successBadges = document.querySelectorAll(".badge-success");
  successBadges.forEach((badge) => {
    (badge as HTMLElement).style.backgroundColor = theme.colors.success;
  });

  const warningBadges = document.querySelectorAll(".badge-warning");
  warningBadges.forEach((badge) => {
    (badge as HTMLElement).style.backgroundColor = theme.colors.warning;
  });

  const dangerBadges = document.querySelectorAll(".badge-danger");
  dangerBadges.forEach((badge) => {
    (badge as HTMLElement).style.backgroundColor = theme.colors.error;
  });
}

function applyModalStyles(theme: ThemeConfig): void {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    (modal as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });

  const modalHeaders = document.querySelectorAll(".modal-header");
  modalHeaders.forEach((header) => {
    (header as HTMLElement).style.backgroundColor = theme.colors.primary;
  });
}

function applyTooltipStyles(theme: ThemeConfig): void {
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach((tooltip) => {
    (tooltip as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyProgressStyles(theme: ThemeConfig): void {
  const progressBars = document.querySelectorAll(".progress");
  progressBars.forEach((progress) => {
    (progress as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });

  const progressBarFills = document.querySelectorAll(".progress-bar");
  progressBarFills.forEach((fill) => {
    (fill as HTMLElement).style.backgroundColor = theme.buttons.primary;
  });
}

function applyPaginationStyles(theme: ThemeConfig): void {
  const activePageLinks = document.querySelectorAll(
    ".pagination .page-item.active .page-link",
  );
  activePageLinks.forEach((link) => {
    (link as HTMLElement).style.backgroundColor = theme.buttons.primary;
    (link as HTMLElement).style.borderColor = theme.buttons.primary;
  });

  const pageLinks = document.querySelectorAll(".pagination .page-link");
  pageLinks.forEach((link) => {
    (link as HTMLElement).style.color = theme.buttons.primary;
  });
}

function applyTabStyles(theme: ThemeConfig): void {
  const activeTabs = document.querySelectorAll(".nav-tabs .nav-link.active");
  activeTabs.forEach((tab) => {
    (tab as HTMLElement).style.color = theme.buttons.primary;
    (tab as HTMLElement).style.borderColor = theme.buttons.primary;
  });

  const tabs = document.querySelectorAll(".nav-tabs .nav-link");
  tabs.forEach((tab) => {
    (tab as HTMLElement).addEventListener("mouseover", () => {
      (tab as HTMLElement).style.borderColor = theme.buttons.primary;
    });

    (tab as HTMLElement).addEventListener("mouseout", () => {
      if (!(tab as HTMLElement).classList.contains("active")) {
        (tab as HTMLElement).style.borderColor = "";
      }
    });
  });
}

function applyDropdownStyles(theme: ThemeConfig): void {
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    (item as HTMLElement).addEventListener("mouseover", () => {
      (item as HTMLElement).style.backgroundColor = theme.buttons.primary;
      (item as HTMLElement).style.color = "white";
    });

    (item as HTMLElement).addEventListener("mouseout", () => {
      (item as HTMLElement).style.backgroundColor = "";
      (item as HTMLElement).style.color = "";
    });
  });
}

function applyToastStyles(theme: ThemeConfig): void {
  const toasts = document.querySelectorAll(".toast");
  toasts.forEach((toast) => {
    (toast as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyBreadcrumbStyles(theme: ThemeConfig): void {
  const activeBreadcrumbs = document.querySelectorAll(
    ".breadcrumb-item.active",
  );
  activeBreadcrumbs.forEach((breadcrumb) => {
    (breadcrumb as HTMLElement).style.color = theme.buttons.primary;
  });
}

function applyListStyles(theme: ThemeConfig): void {
  const listItems = document.querySelectorAll(".list-group-item");
  listItems.forEach((item) => {
    (item as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applySpinnerStyles(theme: ThemeConfig): void {
  const spinners = document.querySelectorAll(".spinner-border");
  spinners.forEach((spinner) => {
    (spinner as HTMLElement).style.color = theme.buttons.primary;
  });
}

function applySwitchStyles(theme: ThemeConfig): void {
  const switches = document.querySelectorAll(
    ".form-switch .form-check-input:checked",
  );
  switches.forEach((switchEl) => {
    (switchEl as HTMLElement).style.backgroundColor = theme.buttons.primary;
    (switchEl as HTMLElement).style.borderColor = theme.buttons.primary;
  });
}

function applyCheckboxStyles(theme: ThemeConfig): void {
  const checkboxes = document.querySelectorAll(".form-check-input:checked");
  checkboxes.forEach((checkbox) => {
    (checkbox as HTMLElement).style.backgroundColor = theme.buttons.primary;
    (checkbox as HTMLElement).style.borderColor = theme.buttons.primary;
  });
}

function applyRangeStyles(theme: ThemeConfig): void {
  const ranges = document.querySelectorAll(".form-range");
  if (ranges.length > 0) {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .form-range::-webkit-slider-thumb {
        background-color: ${theme.buttons.primary};
      }
      .form-range::-moz-range-thumb {
        background-color: ${theme.buttons.primary};
      }
    `;
    document.head.appendChild(styleEl);
  }
}

function applyFileStyles(theme: ThemeConfig): void {
  const fileButtons = document.querySelectorAll(".form-file-button");
  fileButtons.forEach((button) => {
    (button as HTMLElement).style.backgroundColor = theme.buttons.primary;
  });
}

function applyDatepickerStyles(theme: ThemeConfig): void {
  const datepickerCells = document.querySelectorAll(
    ".datepicker-cell.selected",
  );
  datepickerCells.forEach((cell) => {
    (cell as HTMLElement).style.backgroundColor = theme.buttons.primary;
  });
}

function applyChartStyles(theme: ThemeConfig): void {
  const primaryCharts = document.querySelectorAll(".chart-primary");
  primaryCharts.forEach((chart) => {
    (chart as HTMLElement).style.backgroundColor = theme.buttons.primary;
  });

  const secondaryCharts = document.querySelectorAll(".chart-secondary");
  secondaryCharts.forEach((chart) => {
    (chart as HTMLElement).style.backgroundColor = theme.buttons.secondary;
  });

  const successCharts = document.querySelectorAll(".chart-success");
  successCharts.forEach((chart) => {
    (chart as HTMLElement).style.backgroundColor = theme.colors.success;
  });

  const warningCharts = document.querySelectorAll(".chart-warning");
  warningCharts.forEach((chart) => {
    (chart as HTMLElement).style.backgroundColor = theme.colors.warning;
  });

  const dangerCharts = document.querySelectorAll(".chart-danger");
  dangerCharts.forEach((chart) => {
    (chart as HTMLElement).style.backgroundColor = theme.colors.error;
  });
}

function applyIconStyles(theme: ThemeConfig): void {
  const primaryIcons = document.querySelectorAll(".icon-primary");
  primaryIcons.forEach((icon) => {
    (icon as HTMLElement).style.color = theme.buttons.primary;
  });

  const secondaryIcons = document.querySelectorAll(".icon-secondary");
  secondaryIcons.forEach((icon) => {
    (icon as HTMLElement).style.color = theme.buttons.secondary;
  });

  const successIcons = document.querySelectorAll(".icon-success");
  successIcons.forEach((icon) => {
    (icon as HTMLElement).style.color = theme.colors.success;
  });

  const warningIcons = document.querySelectorAll(".icon-warning");
  warningIcons.forEach((icon) => {
    (icon as HTMLElement).style.color = theme.colors.warning;
  });

  const dangerIcons = document.querySelectorAll(".icon-danger");
  dangerIcons.forEach((icon) => {
    (icon as HTMLElement).style.color = theme.colors.error;
  });
}

function applyAvatarStyles(theme: ThemeConfig): void {
  const avatars = document.querySelectorAll(".avatar");
  avatars.forEach((avatar) => {
    (avatar as HTMLElement).style.borderRadius = theme.layout.borderRadius;
  });
}

function applyContainerStyles(theme: ThemeConfig): void {
  const containers = document.querySelectorAll(".container");
  containers.forEach((container) => {
    (container as HTMLElement).style.maxWidth = theme.layout.containerWidth;
  });
}

function applyArabicStyles(theme: ThemeConfig): void {
  const arabicTexts = document.querySelectorAll(".arabic-text");
  arabicTexts.forEach((text) => {
    (text as HTMLElement).style.fontFamily = theme.fonts.arabic;
  });
}

function applyBodyStyles(theme: ThemeConfig): void {
  const bodyTexts = document.querySelectorAll("body, p, div, span");
  bodyTexts.forEach((text) => {
    (text as HTMLElement).style.fontFamily = theme.fonts.body;
  });
}
