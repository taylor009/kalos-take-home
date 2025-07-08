"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import type { Transaction, Analytics } from "@shared";
import { showSuccess, handleError } from "./error-handling";

/**
 * WebSocket connection states
 */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * WebSocket context interface
 */
interface WebSocketContextType {
  socket: Socket | null;
  status: ConnectionStatus;
  isConnected: boolean;
  lastError: string | null;
  connect: () => void;
  disconnect: () => void;
  // Event handlers
  onTransactionAdded: (
    callback: (transaction: Transaction) => void
  ) => () => void;
  onAnalyticsUpdated: (callback: (analytics: Analytics) => void) => () => void;
  // Connection info
  connectionTime: Date | null;
  reconnectAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

/**
 * WebSocket provider props
 */
interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * WebSocket provider component
 */
export function WebSocketProvider({
  children,
  url = "http://localhost:3001",
  autoConnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 2000,
}: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (socket?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    setStatus("connecting");
    setLastError(null);

    console.log("🔌 Connecting to WebSocket server:", url);

    const newSocket = io(url, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: false, // We'll handle reconnection manually
    });

    // Connection successful
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected successfully");
      setStatus("connected");
      setConnectionTime(new Date());
      setSocket(newSocket);
      reconnectAttemptsRef.current = 0;
      setReconnectCount(0);

      // Join the room/namespace
      newSocket.emit("client:join");

      showSuccess("Connected to real-time updates");
    });

    // Connection error
    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setStatus("error");
      setLastError(error.message);
      handleError(error, "WebSocket connection failed");

      // Attempt reconnection if within limits
      if (reconnectAttemptsRef.current < reconnectAttempts) {
        reconnectAttemptsRef.current++;
        setReconnectCount(reconnectAttemptsRef.current);

        console.log(
          `🔄 Attempting reconnection ${reconnectAttemptsRef.current}/${reconnectAttempts} in ${reconnectDelay}ms`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      } else {
        console.error("🔴 Max reconnection attempts reached");
        handleError(
          new Error("Unable to connect to real-time updates"),
          "Connection failed"
        );
      }
    });

    // Disconnection
    newSocket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
      setStatus("disconnected");
      setConnectionTime(null);
      setSocket(null);

      // Only attempt reconnection for unexpected disconnections
      if (
        reason !== "io client disconnect" &&
        reconnectAttemptsRef.current < reconnectAttempts
      ) {
        reconnectAttemptsRef.current++;
        setReconnectCount(reconnectAttemptsRef.current);

        console.log(
          `🔄 Attempting reconnection ${reconnectAttemptsRef.current}/${reconnectAttempts} in ${reconnectDelay}ms`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      }
    });

    // Server events
    newSocket.on("server:connected", (data) => {
      console.log("📡 Server connection confirmed:", data.message);
    });

    newSocket.on("server:error", (error) => {
      console.error("🔴 Server error:", error);
      handleError(new Error(error.message), "Server error");
    });

    // Set socket reference immediately to prevent multiple connections
    setSocket(newSocket);
  }, [url, reconnectAttempts, reconnectDelay, socket?.connected]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting WebSocket...");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socket) {
      socket.emit("client:leave");
      socket.disconnect();
    }

    setSocket(null);
    setStatus("disconnected");
    setConnectionTime(null);
    setLastError(null);
    reconnectAttemptsRef.current = 0;
    setReconnectCount(0);
  }, [socket]);

  /**
   * Subscribe to transaction added events
   */
  const onTransactionAdded = useCallback(
    (callback: (transaction: Transaction) => void) => {
      if (!socket) return () => {};

      const handler = (transaction: Transaction) => {
        console.log("📊 New transaction received:", transaction);
        callback(transaction);
      };

      socket.on("server:transaction-added", handler);

      return () => {
        socket.off("server:transaction-added", handler);
      };
    },
    [socket]
  );

  /**
   * Subscribe to analytics updated events
   */
  const onAnalyticsUpdated = useCallback(
    (callback: (analytics: Analytics) => void) => {
      if (!socket) return () => {};

      const handler = (analytics: Analytics) => {
        console.log("📈 Analytics updated:", analytics);
        callback(analytics);
      };

      socket.on("server:analytics-updated", handler);

      return () => {
        socket.off("server:analytics-updated", handler);
      };
    },
    [socket]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Context value
  const contextValue: WebSocketContextType = {
    socket,
    status,
    isConnected: status === "connected",
    lastError,
    connect,
    disconnect,
    onTransactionAdded,
    onAnalyticsUpdated,
    connectionTime,
    reconnectAttempts: reconnectCount,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to use WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

/**
 * Connection status indicator hook
 */
export function useConnectionStatus() {
  const { status, isConnected, lastError, connectionTime, reconnectAttempts } =
    useWebSocket();

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "green";
      case "connecting":
        return "yellow";
      case "error":
        return "red";
      case "disconnected":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return reconnectAttempts > 0
          ? `Reconnecting (${reconnectAttempts})...`
          : "Connecting...";
      case "error":
        return "Connection Error";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return {
    status,
    isConnected,
    lastError,
    connectionTime,
    reconnectAttempts,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
  };
}

/**
 * Real-time transaction updates hook
 */
export function useRealtimeTransactions() {
  const { onTransactionAdded } = useWebSocket();
  const [latestTransaction, setLatestTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    const unsubscribe = onTransactionAdded((transaction) => {
      setLatestTransaction(transaction);
    });

    return unsubscribe;
  }, [onTransactionAdded]);

  return { latestTransaction };
}

/**
 * Real-time analytics updates hook
 */
export function useRealtimeAnalytics() {
  const { onAnalyticsUpdated } = useWebSocket();
  const [latestAnalytics, setLatestAnalytics] = useState<Analytics | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = onAnalyticsUpdated((analytics) => {
      setLatestAnalytics(analytics);
    });

    return unsubscribe;
  }, [onAnalyticsUpdated]);

  return { latestAnalytics };
}
