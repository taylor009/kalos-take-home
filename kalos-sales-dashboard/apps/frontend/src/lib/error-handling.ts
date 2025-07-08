import { ApiError } from "./api";
import { toast } from "react-hot-toast";

/**
 * Error message mappings for user-friendly display
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",

  // Authentication errors
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You do not have permission.",

  // Validation errors
  VALIDATION_ERROR: "Please check your input and try again.",
  INVALID_DATA: "The data provided is invalid.",

  // Business logic errors
  DUPLICATE_TRANSACTION: "A transaction with similar details already exists.",
  INSUFFICIENT_FUNDS: "Insufficient funds for this transaction.",

  // Server errors
  SERVER_ERROR: "A server error occurred. Please try again later.",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable.",

  // Default fallback
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Maps API error codes to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      ERROR_MESSAGES[error.errorCode as keyof typeof ERROR_MESSAGES] ||
      error.message ||
      ERROR_MESSAGES.UNKNOWN_ERROR
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Enhanced error handler with automatic toast notifications
 */
export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const contextMessage = context ? `${context}: ${message}` : message;

  console.error("Error occurred:", error);

  // Show toast notification
  toast.error(contextMessage, {
    duration: 5000,
    position: "top-right",
  });
}

/**
 * Retry configuration for different error types
 */
export function shouldRetry(error: unknown, attemptNumber: number): boolean {
  // Don't retry after 3 attempts
  if (attemptNumber >= 3) return false;

  if (error instanceof ApiError) {
    // Don't retry client errors (4xx)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }

    // Retry server errors (5xx) and network errors
    return true;
  }

  // Retry unknown errors
  return true;
}

/**
 * Error boundary helper for React Query
 */
export const queryErrorHandler = {
  onError: (error: unknown) => {
    handleError(error, "Data loading failed");
  },

  retry: (failureCount: number, error: unknown) => {
    return shouldRetry(error, failureCount);
  },
};

/**
 * Mutation error handler
 */
export const mutationErrorHandler = {
  onError: (error: unknown, variables: unknown, context: unknown) => {
    handleError(error, "Operation failed");
  },
};

/**
 * Success notification helper
 */
export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
  });
}

/**
 * Loading notification helper
 */
export function showLoading(message: string): string {
  return toast.loading(message, {
    position: "top-right",
  });
}

/**
 * Dismiss notification helper
 */
export function dismissNotification(toastId: string): void {
  toast.dismiss(toastId);
}
