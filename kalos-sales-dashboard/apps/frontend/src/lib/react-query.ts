import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

// Create React Query client with configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (
          error instanceof ApiError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  transactions: ["transactions"] as const,
  analytics: ["analytics"] as const,
  health: ["health"] as const,
} as const;
