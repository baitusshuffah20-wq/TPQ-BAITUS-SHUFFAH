"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import useErrorHandler from "./useErrorHandler";

interface ApiOptions extends RequestInit {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  });

  const { toast } = useToast();
  const { handleApiError } = useErrorHandler();

  const request = useCallback(
    async (url: string, options: ApiOptions = {}) => {
      const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "Operasi berhasil",
        errorMessage,
        ...fetchOptions
      } = options;

      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          isError: false,
          error: null,
        }));

        // Handle network errors
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
          ...fetchOptions,
        }).catch((networkError) => {
          throw new Error(
            "Koneksi jaringan terputus. Silakan periksa koneksi internet Anda.",
          );
        });

        // Handle HTTP errors
        if (!response.ok) {
          await handleApiError(response, errorMessage);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        let data: any;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Show success toast if requested
        if (showSuccessToast) {
          toast({
            title: "Berhasil",
            description: successMessage,
          });
        }

        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
        });

        return data;
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        // Error toast is handled by handleApiError
        throw error;
      }
    },
    [toast, handleApiError],
  );

  const get = useCallback(
    <R = T>(url: string, options?: ApiOptions) => {
      return request(url, { method: "GET", ...options }) as Promise<R>;
    },
    [request],
  );

  const post = useCallback(
    <R = T>(url: string, data?: any, options?: ApiOptions) => {
      return request(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      }) as Promise<R>;
    },
    [request],
  );

  const put = useCallback(
    <R = T>(url: string, data?: any, options?: ApiOptions) => {
      return request(url, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      }) as Promise<R>;
    },
    [request],
  );

  const del = useCallback(
    <R = T>(url: string, options?: ApiOptions) => {
      return request(url, { method: "DELETE", ...options }) as Promise<R>;
    },
    [request],
  );

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
  };
}

export default useApi;
