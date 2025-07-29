"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="rounded-lg bg-red-50 p-4 border border-red-100">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {showRetry && onRetry && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
