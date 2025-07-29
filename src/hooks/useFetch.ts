"use client";

import { useState, useCallback } from "react";
import errorHandler from "@/lib/errorHandler";

interface UseFetchOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useFetch<T = unknown>(initialState: T | null = null) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialState,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(
    async (
      url: string,
      options: RequestInit & UseFetchOptions = {},
    ): Promise<T | null> => {
      const {
        showSuccessToast = false,
        successMessage = "Operasi berhasil",
        ...fetchOptions
      } = options;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
          ...fetchOptions,
        });

        if (!response.ok) {
          const errorMessage = errorHandler.handleError(
            new Error(`HTTP ${response.status}: ${response.statusText}`),
            `useFetch - ${url}`,
          ).message;
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
          return null;
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        // Show success toast if requested
        if (showSuccessToast) {
          errorHandler.showSuccess(successMessage);
        }

        setState({
          data,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (error) {
        const errorMessage = errorHandler.handleError(
          error,
          `useFetch - ${url}`,
        ).message;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [],
  );

  const get = useCallback(
    (url: string, options?: RequestInit & UseFetchOptions) => {
      return fetchData(url, { method: "GET", ...options });
    },
    [fetchData],
  );

  const post = useCallback(
    (url: string, data?: unknown, options?: RequestInit & UseFetchOptions) => {
      return fetchData(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },
    [fetchData],
  );

  const put = useCallback(
    (url: string, data?: unknown, options?: RequestInit & UseFetchOptions) => {
      return fetchData(url, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },
    [fetchData],
  );

  const del = useCallback(
    (url: string, options?: RequestInit & UseFetchOptions) => {
      return fetchData(url, { method: "DELETE", ...options });
    },
    [fetchData],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearData = useCallback(() => {
    setState((prev) => ({ ...prev, data: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialState, isLoading: false, error: null });
  }, [initialState]);

  return {
    ...state,
    fetchData,
    get,
    post,
    put,
    delete: del,
    clearError,
    clearData,
    reset,
  };
}

export default useFetch;
