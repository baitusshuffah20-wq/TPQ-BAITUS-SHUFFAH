/**
 * Utility functions for API handling with better error management
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Safe JSON fetch with proper error handling
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Check if response is ok
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'Server returned non-JSON response',
      };
    }

    // Parse JSON safely
    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse JSON response',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Fetch with retry mechanism
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await safeFetch<T>(url, options);
    
    if (result.success) {
      return result;
    }

    lastError = result.error || 'Unknown error';
    
    // Don't retry on client errors (4xx)
    if (lastError.includes('4')) {
      break;
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
  };
}

/**
 * Handle API response with fallback data
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  fallbackData: T,
  onError?: (error: string) => void
): T {
  if (response.success && response.data) {
    return response.data;
  }

  if (onError && response.error) {
    onError(response.error);
  }

  return fallbackData;
}

/**
 * Create mock data for development/fallback
 */
export function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Validate API response structure
 */
export function validateApiResponse(data: any): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.success === 'boolean'
  );
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  if (error?.details) {
    return error.details;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: string): boolean {
  const networkErrorKeywords = [
    'network',
    'connection',
    'timeout',
    'fetch',
    'cors',
    'refused',
  ];

  return networkErrorKeywords.some(keyword =>
    error.toLowerCase().includes(keyword)
  );
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: string): boolean {
  return error.includes('5') || error.toLowerCase().includes('server');
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: string): boolean {
  return error.includes('4') || error.toLowerCase().includes('unauthorized');
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: string): string {
  if (isNetworkError(error)) {
    return 'Koneksi bermasalah. Silakan periksa internet Anda.';
  }

  if (isServerError(error)) {
    return 'Server sedang bermasalah. Silakan coba lagi nanti.';
  }

  if (isClientError(error)) {
    return 'Akses ditolak. Silakan login kembali.';
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
}
