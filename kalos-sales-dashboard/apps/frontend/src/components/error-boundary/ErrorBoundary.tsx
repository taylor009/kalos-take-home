"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui";

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    retry: () => void
  ) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Main error boundary component
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.handleRetry
        );
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  variant?: "page" | "section" | "inline";
}

export function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  variant = "section",
}: ErrorFallbackProps) {
  const isProduction = process.env.NODE_ENV === "production";

  if (variant === "page") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>

            <div className="space-y-3">
              <Button onClick={onRetry} className="w-full">
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            {!isProduction && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Show Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-40">
                  <p>
                    <strong>Error:</strong> {error.message}
                  </p>
                  <p>
                    <strong>Stack:</strong>
                  </p>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-md p-4">
        <div className="flex">
          <div className="text-red-400 text-xl mr-3">⚠️</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Error loading content
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {isProduction
                ? "Something went wrong. Please try again."
                : error.message}
            </p>
            <div className="mt-3">
              <Button size="sm" onClick={onRetry}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default section variant
  return (
    <div className="bg-white rounded-lg shadow border border-red-200 p-8 text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-6">
        {isProduction
          ? "We encountered an unexpected error. Please try again."
          : error.message}
      </p>

      <div className="flex justify-center space-x-3">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>

      {!isProduction && (
        <details className="mt-6 text-left max-w-lg mx-auto">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Show Error Details
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
            <p>
              <strong>Error:</strong> {error.message}
            </p>
            <p>
              <strong>Component Stack:</strong>
            </p>
            <pre className="whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Specialized error boundaries for specific use cases
 */

// Page-level error boundary
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={retry}
          variant="page"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Section-level error boundary (for components)
export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={retry}
          variant="section"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Inline error boundary (for small components)
export function InlineErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={retry}
          variant="inline"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
