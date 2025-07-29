"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface ErrorState {
  hasError: boolean;
  message: string;
  details?: string;
  code?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: "",
    details: "",
    code: "",
  });

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      message: "",
      details: "",
      code: "",
    });
  }, []);

  const handleError = useCallback(
    (err: unknown, customMessage?: string) => {
      let errorMessage = customMessage || "Terjadi kesalahan";
      let errorDetails = "";
      let errorCode = "";

      if (err instanceof Error) {
        errorMessage = customMessage || err.message;
        errorDetails = err.stack || "";
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err && typeof err === "object") {
        // Handle API error responses
        if ("message" in err && typeof err.message === "string") {
          errorMessage = err.message;
        }
        if ("error" in err && typeof err.error === "string") {
          errorMessage = err.error;
        }
        if ("details" in err && typeof err.details === "string") {
          errorDetails = err.details;
        }
        if ("code" in err && typeof err.code === "string") {
          errorCode = err.code;
        }
      }

      setError({
        hasError: true,
        message: errorMessage,
        details: errorDetails,
        code: errorCode,
      });

      // Show toast notification
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Log error to console in development
      if (process.env.NODE_ENV !== "production") {
        console.error("Error caught by error handler:", err);
      }

      return { errorMessage, errorDetails, errorCode };
    },
    [toast],
  );

  const handleApiError = useCallback(
    async (response: Response, customMessage?: string) => {
      let errorData: any = {};

      try {
        // Try to parse error response as JSON
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use status text
        errorData = { error: response.statusText };
      }

      const errorMessage =
        customMessage ||
        errorData.error ||
        errorData.message ||
        `Error ${response.status}: ${response.statusText}`;

      handleError(
        {
          ...errorData,
          status: response.status,
          statusText: response.statusText,
        },
        errorMessage,
      );

      return errorData;
    },
    [handleError],
  );

  return {
    error,
    handleError,
    handleApiError,
    clearError,
    isError: error.hasError,
  };
};

export default useErrorHandler;
