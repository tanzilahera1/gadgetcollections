"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Wrapper component for client-only rendering to prevent hydration mismatches
 * Usage: <ClientOnly><DynamicComponent /></ClientOnly>
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export default ClientOnly;
