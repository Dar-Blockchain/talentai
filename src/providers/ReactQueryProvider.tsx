import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import type { AxiosError } from "axios";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 2-minute stale window. Auth and profile data changes infrequently;
        // keeping this higher avoids background refetches on every navigation.
        staleTime: 2 * 60 * 1000,

        // Don't re-fetch just because the user switched tabs and came back.
        refetchOnWindowFocus: false,

        // Retry once for transient network errors, but never retry:
        // - Aborted/cancelled requests (ERR_CANCELED) — these are intentional
        //   (e.g. logout flow aborts in-flight requests). Retrying after the
        //   abort window closes triggers spurious "session expired" toasts.
        // - 4xx responses — auth/validation failures that won't self-heal.
        retry: (failureCount, error: AxiosError) => {
          if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return false;
          if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) return false;
          return failureCount < 1;
        },

        // Inactive query data lives in cache for 5 minutes after the last
        // subscriber unmounts, matching the Next.js page navigation pattern
        // (going back to a page within 5 min should feel instant).
        gcTime: 5 * 60 * 1000,
      },
    },
  });

// Named export for tests that need to create an isolated client.
export { createQueryClient as createTeamChatQueryClient };

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(createQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
