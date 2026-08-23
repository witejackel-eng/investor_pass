"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { installClientErrorReporting } from "@/lib/client-error-reporter";

/**
 * App-wide React Query provider.
 * staleTime/gcTime tuned for instant back-navigation within a session;
 * window-focus refetch off — data is revalidated per view mount instead.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // In-house error monitoring — installs once per page load (never throws).
  useEffect(() => {
    installClientErrorReporting();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
