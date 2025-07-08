"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, fetchAnalytics } from "@/lib/api";
import { queryKeys, queryConfig } from "@/lib/react-query";
import { AnalyticsDisplay, TransactionTable } from "@/components/features";
import { SectionErrorBoundary } from "@/components/error-boundary";
import { AnalyticsGridSkeleton, TableSkeleton } from "@/components/ui";

// Page metadata would be set if this was a page.tsx with metadata export
// Since this is a client component, metadata is handled by layout.tsx

export default function DashboardPage() {
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

    const transactions = transactionsData?.transactions || [];
  const analytics = analyticsData?.analytics;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor your sales performance and track transactions in real-time.
        </p>
      </div>

      {/* Analytics Section */}
      <SectionErrorBoundary>
        {analyticsLoading ? (
          <AnalyticsGridSkeleton />
        ) : analyticsError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load analytics
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to fetch analytics data. Please try refreshing the page.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AnalyticsDisplay 
            analytics={analytics} 
            isLoading={analyticsLoading}
          />
        )}
      </SectionErrorBoundary>

      {/* Transactions Table */}
      <SectionErrorBoundary>
        {transactionsLoading ? (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div className="p-6">
              <TableSkeleton rows={5} columns={4} />
            </div>
          </div>
        ) : transactionsError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load transactions
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to fetch transaction data. Please try refreshing the page.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <TransactionTable 
            transactions={transactions} 
            isLoading={transactionsLoading}
          />
        )}
      </SectionErrorBoundary>
    </div>
  );
}
