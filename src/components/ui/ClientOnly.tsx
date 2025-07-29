"use client";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders its children on the client-side
 * Useful for components that use browser APIs or cause hydration issues
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use suppressHydrationWarning to prevent hydration warnings
  if (!isMounted) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
}
