"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { subscribeToCmsContentChanges } from "@/lib/cms-content-events";
import { useEffect, useState } from "react";

export const PUBLIC_QUERY_DEFAULTS = {
  staleTime: 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnMount: "always" as const,
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...PUBLIC_QUERY_DEFAULTS,
          },
        },
      }),
  );

  useEffect(
    () =>
      subscribeToCmsContentChanges(() => {
        void queryClient.invalidateQueries();
      }),
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
