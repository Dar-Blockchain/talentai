import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export const createTeamChatQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => createTeamChatQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
