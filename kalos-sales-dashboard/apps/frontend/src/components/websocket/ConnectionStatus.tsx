"use client";

import { useConnectionStatus } from "@/lib/websocket";
import { cn } from "@/lib/utils";

/**
 * Connection status indicator props
 */
interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
  showDetails?: boolean;
}

/**
 * Connection status indicator component
 */
export function ConnectionStatus({
  className,
  showText = true,
  showDetails = false,
}: ConnectionStatusProps) {
  const {
    status,
    isConnected,
    statusColor,
    statusText,
    connectionTime,
    reconnectAttempts,
    lastError,
  } = useConnectionStatus();

  const getStatusDot = () => {
    const baseClasses = "h-2 w-2 rounded-full";
    const colorClasses = {
      green: "bg-green-500",
      yellow: "bg-yellow-500 animate-pulse",
      red: "bg-red-500",
      gray: "bg-gray-400",
    };

    return (
      <div
        className={cn(
          baseClasses,
          colorClasses[statusColor as keyof typeof colorClasses]
        )}
      />
    );
  };

  const formatConnectionTime = (time: Date | null) => {
    if (!time) return "";
    return time.toLocaleTimeString();
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Status dot */}
      <div className="flex items-center space-x-1">
        {getStatusDot()}
        {showText && (
          <span
            className={cn(
              "text-xs font-medium",
              isConnected ? "text-green-700" : "text-gray-600"
            )}
          >
            {statusText}
          </span>
        )}
      </div>

      {/* Connection details */}
      {showDetails && (
        <div className="text-xs text-gray-500">
          {isConnected && connectionTime && (
            <span>Connected at {formatConnectionTime(connectionTime)}</span>
          )}
          {status === "connecting" && reconnectAttempts > 0 && (
            <span>Attempt {reconnectAttempts}</span>
          )}
          {status === "error" && lastError && (
            <span className="text-red-600">Error: {lastError}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal connection status badge
 */
export function ConnectionBadge({ className }: { className?: string }) {
  const { isConnected, status } = useConnectionStatus();

  if (status === "disconnected") return null;

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        isConnected
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800",
        className
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-1.5",
          isConnected ? "bg-green-400" : "bg-yellow-400 animate-pulse"
        )}
      />
      {isConnected ? "Live" : "Connecting..."}
    </div>
  );
}

/**
 * Detailed connection info panel
 */
export function ConnectionInfo() {
  const {
    isConnected,
    statusText,
    connectionTime,
    reconnectAttempts,
    lastError,
  } = useConnectionStatus();

  return (
    <div className="bg-white rounded-lg shadow border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Connection Status</h3>
        <ConnectionStatus showText={false} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span
            className={cn(
              "font-medium",
              isConnected ? "text-green-600" : "text-gray-600"
            )}
          >
            {statusText}
          </span>
        </div>

        {connectionTime && (
          <div className="flex justify-between">
            <span className="text-gray-500">Connected at:</span>
            <span className="font-medium text-gray-900">
              {connectionTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {reconnectAttempts > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Reconnect attempts:</span>
            <span className="font-medium text-yellow-600">
              {reconnectAttempts}
            </span>
          </div>
        )}

        {lastError && (
          <div className="pt-2 border-t border-gray-200">
            <span className="text-red-600 text-xs">Error: {lastError}</span>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Real-time updates active</span>
          </div>
        </div>
      )}
    </div>
  );
}
