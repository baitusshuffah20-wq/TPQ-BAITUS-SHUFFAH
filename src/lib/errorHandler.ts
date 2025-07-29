import toast from "react-hot-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Enhanced error handler for API responses
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData.details || errorData;
    } catch {
      // If response is not JSON, use status text
    }

    throw new AppError(
      errorMessage,
      response.status,
      "API_ERROR",
      errorDetails,
    );
  }

  try {
    const data = await response.json();
    // Check if API returned success: false
    if (data && typeof data === "object" && data.success === false) {
      throw new AppError(
        data.message || "API returned error",
        response.status,
        data.code || "API_ERROR",
        data.details,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Invalid JSON response from server",
      response.status,
      "PARSE_ERROR",
      undefined,
    );
  }
}

/**
 * Generic error handler for try-catch blocks
 */
export function handleError(error: unknown, context?: string): AppError {
  console.error(`Error in ${context || "unknown context"}:`, error);

  if (error instanceof AppError) {
    return error;
  }

  // The `details` parameter in AppError constructor is `never`, so we can't pass an object.
  // We should only pass `undefined` or `never` for `details`.
  // If we want to include `originalError` and `context`, we need to change the AppError constructor.
  // For now, we'll just pass `undefined` for `details`.
  return new AppError(
    error instanceof Error ? error.message : "An unknown error occurred",
    500,
    "UNKNOWN_ERROR",
    error,
  );
}

/**
 * Show error toast with proper formatting
 */
export function showErrorToast(error: unknown, fallbackMessage?: string) {
  const appError = handleError(error);
  const message = appError.message || fallbackMessage || "Terjadi kesalahan";
  toast.error(message, {
    duration: 5000,
    style: {
      maxWidth: "500px",
    },
  });
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
  });
}

/**
 * Show loading toast
 */
export function showLoadingToast(message: string = "Memproses...") {
  return toast.loading(message);
}

/**
 * Dismiss toast
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Enhanced fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // Network or other fetch errors
    throw new AppError(
      "Network error or server unavailable",
      0,
      "NETWORK_ERROR",
      error,
    );
  }
}

/**
 * Retry wrapper for functions that might fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error = new Error("Unknown error during retry");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new AppError(
    `Failed after ${maxRetries} attempts: ${lastError.message}`,
    500,
    "RETRY_FAILED",
    lastError,
  );
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missing.join(", ")}`,
      500,
      "ENV_VAR_MISSING",
      missing,
    );
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return fallback;
  }
}

/**
 * Database error handler
 */
export function handleDatabaseError(error: unknown): AppError {
  console.error("Database error:", error);

  if (error && typeof error === "object" && "code" in error) {
    const dbError = error as { code: string; message?: string; meta?: unknown };
    switch (dbError.code as string) {
      case "P2002":
        return new AppError(
          "Data sudah ada (duplikat)",
          409,
          "DUPLICATE_ERROR",
          dbError.meta,
        );
      case "P2025":
        return new AppError(
          "Data tidak ditemukan",
          404,
          "NOT_FOUND",
          dbError.meta,
        );
      case "P2003":
        return new AppError(
          "Tidak dapat menghapus data karena masih digunakan",
          409,
          "FOREIGN_KEY_CONSTRAINT",
          dbError.meta,
        );
      default:
        return new AppError(
          "Terjadi kesalahan database",
          500,
          "DATABASE_ERROR",
          dbError,
        );
    }
  }

  return handleError(error, "database");
}

// Default export object with all functions
const errorHandler = {
  AppError,
  handleApiResponse,
  handleError,
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
  apiRequest,
  withRetry,
  validateEnvVars,
  safeJsonParse,
  handleDatabaseError,
  showSuccess: showSuccessToast,
  showError: showErrorToast,
  showLoading: showLoadingToast,
};

export default errorHandler;
