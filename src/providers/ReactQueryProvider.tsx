import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 2-minute stale window. Auth and profile data changes infrequently;
        // keeping this higher avoids background refetches on every navigation.
        staleTime: 2 * 60 * 1000,

        // Don't re-fetch just because the user switched tabs and came back.
        refetchOnWindowFocus: false,

        // Retry once for transient network errors, but never retry a 4xx
        // response — those indicate auth / validation failures that won't
        // self-heal on a second attempt.
        retry: (failureCount, error: any) => {
          if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
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
