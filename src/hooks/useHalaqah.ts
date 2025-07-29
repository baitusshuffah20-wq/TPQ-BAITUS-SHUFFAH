"use client";
import { useState, useEffect, useCallback } from "react";
import {
  apiRequest,
  handleError,
  showErrorToast,
  showSuccessToast,
} from "@/lib/errorHandler";

export interface HalaqahItem {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  level: string;
  status: string;
  type: string;
  musyrif?: {
    id: string;
    name: string;
  };
  santri?: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UseHalaqahOptions {
  type?: string;
  autoLoad?: boolean;
  showToast?: boolean;
}

interface UseHalaqahReturn {
  data: HalaqahItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: Partial<HalaqahItem>) => Promise<boolean>;
  update: (id: string, data: Partial<HalaqahItem>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useHalaqah(options: UseHalaqahOptions = {}): UseHalaqahReturn {
  const { type, autoLoad = true, showToast = true } = options;

  const [data, setData] = useState<HalaqahItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    let mounted = true;
    setLoading(true);
    setError(null);

    try {
      // Add timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const url = new URL("/api/halaqah", window.location.origin);

      if (type) {
        url.searchParams.set("type", type);
      }
      url.searchParams.set("_t", timestamp.toString());

      const result = await apiRequest<{
        success: boolean;
        halaqah: HalaqahItem[];
        message?: string;
      }>(url.toString());

      // Ensure data is always an array
      const halaqahData = Array.isArray(result.halaqah) ? result.halaqah : [];

      if (mounted) {
        setData(halaqahData);

        if (showToast) {
          if (halaqahData.length === 0) {
            showSuccessToast(
              "Belum ada data halaqah. Silakan tambahkan halaqah baru.",
            );
          } else {
            showSuccessToast(
              `Berhasil memuat ${halaqahData.length} data halaqah`,
            );
          }
        }
      }
    } catch (err) {
      const appError = handleError(err, "fetchHalaqah");

      if (mounted) {
        setError(appError.message);
        setData([]); // Fallback to empty array

        if (showToast) {
          showErrorToast(appError, "Gagal memuat data halaqah");
        }
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, [type, showToast]);

  const create = useCallback(
    async (newData: Partial<HalaqahItem>): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await fetch("/api/halaqah", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal membuat halaqah");
        }

        // Refresh data after successful creation
        await fetchData();

        if (showToast) {
          toast.success("Halaqah berhasil dibuat");
        }

        return true;
      } catch (err) {
        console.error("Error creating halaqah:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Gagal membuat halaqah";

        if (showToast) {
          toast.error(errorMessage);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, showToast],
  );

  const update = useCallback(
    async (id: string, updateData: Partial<HalaqahItem>): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await fetch(`/api/halaqah/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal memperbarui halaqah");
        }

        // Refresh data after successful update
        await fetchData();

        if (showToast) {
          toast.success("Halaqah berhasil diperbarui");
        }

        return true;
      } catch (err) {
        console.error("Error updating halaqah:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Gagal memperbarui halaqah";

        if (showToast) {
          toast.error(errorMessage);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, showToast],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await fetch(`/api/halaqah/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal menghapus halaqah");
        }

        // Refresh data after successful deletion
        await fetchData();

        if (showToast) {
          toast.success("Halaqah berhasil dihapus");
        }

        return true;
      } catch (err) {
        console.error("Error deleting halaqah:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Gagal menghapus halaqah";

        if (showToast) {
          toast.error(errorMessage);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, showToast],
  );

  // Auto-load data on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
  };
}
