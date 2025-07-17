"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { fetchTransactions, fetchAnalytics } from "@/lib/api";
import { queryKeys, queryConfig } from "@/lib/react-query";
import { useWebSocket } from "@/lib/websocket";
import { AnalyticsDisplay, TransactionTable } from "@/components/features";
import { SectionErrorBoundary } from "@/components/error-boundary";
import { AnalyticsGridSkeleton, TableSkeleton } from "@/components/ui";
import type { GetTransactionsResponse, GetAnalyticsResponse, Transaction, Analytics } from "@shared";

// Page metadata would be set if this was a page.tsx with metadata export
// Since this is a client component, metadata is handled by layout.tsx

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { onTransactionAdded, onAnalyticsUpdated, isConnected } =
    useWebSocket();

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: fetchTransactions,
    ...queryConfig.realTime, // Use real-time configuration for live updates
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: fetchAnalytics,
    ...queryConfig.realTime, // Use real-time configuration for live updates
  });

  // Memoize the transaction update callback
  const handleTransactionAdded = useCallback((newTransaction: Transaction) => {
    console.log("🔴 Real-time: New transaction received", newTransaction);

    // Update transactions cache
    queryClient.setQueryData<GetTransactionsResponse>(
      queryKeys.transactions,
      (oldData) => {
        if (!oldData) return oldData;

        // Add new transaction to the beginning of the list
        const updatedTransactions = [newTransaction, ...oldData.transactions];

        return {
          transactions: updatedTransactions,
          total: updatedTransactions.length,
        };
      }
    );
  }, [queryClient]);

  // Memoize the analytics update callback
  const handleAnalyticsUpdated = useCallback((newAnalytics: Analytics) => {
    console.log("📈 Real-time: Analytics updated", newAnalytics);

    // Update analytics cache
    queryClient.setQueryData<GetAnalyticsResponse>(queryKeys.analytics, {
      analytics: newAnalytics,
    });
  }, [queryClient]);

  // Real-time transaction updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeTransactions = onTransactionAdded(handleTransactionAdded);

    return unsubscribeTransactions;
  }, [isConnected, onTransactionAdded, handleTransactionAdded]);

  // Real-time analytics updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeAnalytics = onAnalyticsUpdated(handleAnalyticsUpdated);

    return unsubscribeAnalytics;
  }, [isConnected, onAnalyticsUpdated, handleAnalyticsUpdated]);

  const transactions = transactionsData?.transactions || [];
  const analytics = analyticsData?.analytics;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Enhanced Page Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-6 lg:p-8 shadow-sm">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Sales Dashboard
            </h1>
            <p className="text-sm lg:text-base text-gray-600 max-w-2xl">
              Monitor your sales performance and track transactions in
              real-time. Stay connected to see live updates as they happen.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="mt-4 sm:mt-0 sm:ml-8">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-gray-600 font-medium">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Section */}
      <SectionErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Analytics Overview
            </h2>
            <div className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
              Updates every 5 seconds
            </div>
          </div>

          {analyticsLoading ? (
            <AnalyticsGridSkeleton />
          ) : analyticsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-red-800 mb-2">
                    Analytics Unavailable
                  </h3>
                                    <p className="text-sm text-red-700 mb-4">
                    We&apos;re having trouble loading your analytics data right now. 
                    This could be due to a network issue or server maintenance.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-red-800 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Try refreshing the page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AnalyticsDisplay
              analytics={analytics}
              isLoading={analyticsLoading}
            />
          )}
        </div>
      </SectionErrorBoundary>

      {/* Enhanced Transactions Section */}
      <SectionErrorBoundary>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                Real-time updates
              </div>
              <a
                href="/add"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Transaction
              </a>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <TableSkeleton rows={5} columns={4} />
              </div>
            </div>
          ) : transactionsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-red-800 mb-2">
                    Transactions Unavailable
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    We can&apos;t load your transaction data at the moment. Please
                    check your connection and try again.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-red-800 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    Retry loading
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <TransactionTable
              transactions={transactions}
              isLoading={transactionsLoading}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            />
          )}
        </div>
      </SectionErrorBoundary>
    </div>
  );
}
