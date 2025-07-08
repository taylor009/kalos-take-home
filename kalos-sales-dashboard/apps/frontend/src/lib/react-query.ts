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

// Enhanced query keys with proper hierarchical structure
export const queryKeys = {
  // Base keys
  transactions: ["transactions"] as const,
  analytics: ["analytics"] as const,
  health: ["health"] as const,
  
  // Factory functions for dynamic keys
  transaction: (id: string) => ["transactions", id] as const,
  transactionsByCustomer: (customerName: string) => 
    ["transactions", "customer", customerName] as const,
  analyticsRange: (startDate: string, endDate: string) => 
    ["analytics", "range", startDate, endDate] as const,
} as const;

// Query configuration presets
export const queryConfig = {
  // Fast refetch for real-time data
  realTime: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 5, // 5 seconds
    refetchOnWindowFocus: true,
  },
  
  // Standard configuration for normal data
  standard: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  },
  
  // Long-term cache for static data
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
} as const;
