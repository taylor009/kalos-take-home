"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { WebSocketProvider } from "@/lib/websocket";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider 
        url="http://localhost:3001"
        autoConnect={true}
        reconnectAttempts={5}
        reconnectDelay={2000}
      >
        {children}
        {/* Only show devtools in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </WebSocketProvider>
    </QueryClientProvider>
  );
}
