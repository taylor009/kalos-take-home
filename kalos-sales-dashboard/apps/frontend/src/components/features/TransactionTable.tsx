"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Transaction } from "@shared";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
}

// Helper function to highlight search matches
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.trim()})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200/80 text-yellow-900 rounded-sm px-1 py-0.5 font-medium"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

// Enhanced currency formatter
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Enhanced date formatter
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  // Show relative time for recent transactions
  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    // Show full date for older transactions
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function TransactionTable({
  transactions,
  isLoading,
  className,
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newTransactionIds, setNewTransactionIds] = useState<Set<string>>(
    new Set()
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const prevTransactionsRef = useRef<Transaction[]>([]);

  // Detect new transactions and add visual indicators
  useEffect(() => {
    const prevTransactions = prevTransactionsRef.current;
    const prevIds = new Set(prevTransactions.map((t) => t.id));

    // Find newly added transactions
    const newTransactions = transactions.filter((t) => !prevIds.has(t.id));

    if (newTransactions.length > 0) {
      console.log(
        "🎨 Visual indicator: New transactions detected",
        newTransactions
      );

      // Add to new transactions set
      setNewTransactionIds((prev) => {
        const newSet = new Set(prev);
        newTransactions.forEach((t) => newSet.add(t.id));
        return newSet;
      });

      // Highlight the most recent transaction briefly
      const mostRecentTransaction = newTransactions[0];
      if (mostRecentTransaction) {
        setHighlightedId(mostRecentTransaction.id);

        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedId(null);
        }, 2000);

        // Remove from new transactions set after a delay
        newTransactions.forEach((t) => {
          setTimeout(() => {
            setNewTransactionIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(t.id);
              return newSet;
            });
          }, 5000); // Keep the "new" indicator for 5 seconds
        });
      }
    }

    // Update ref for next comparison
    prevTransactionsRef.current = transactions;
  }, [transactions]);

  // Enhanced filter function with case-insensitive search and whitespace handling
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transactions;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const customerName = transaction.customerName.toLowerCase();
      return customerName.includes(normalizedQuery);
    });
  }, [transactions, searchQuery]);

  // Track search statistics for better UX
  const searchStats = useMemo(() => {
    const hasActiveSearch = searchQuery.trim().length > 0;
    const resultCount = filteredTransactions.length;
    const totalCount = transactions.length;

    return {
      hasActiveSearch,
      resultCount,
      totalCount,
      hasResults: resultCount > 0,
      isShowingAll: resultCount === totalCount,
    };
  }, [filteredTransactions.length, transactions.length, searchQuery]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="mt-4">
              <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="p-6 bg-white/40">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      {/* Enhanced Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            {newTransactionIds.size > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                Live Updates
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {searchStats.hasActiveSearch ? (
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "font-medium",
                      searchStats.hasResults
                        ? "text-green-600"
                        : "text-amber-600"
                    )}
                  >
                    {searchStats.resultCount}
                  </span>
                  <span className="text-gray-400">of</span>
                  <span className="font-medium text-gray-700">
                    {searchStats.totalCount}
                  </span>
                  <span className="text-gray-500">found</span>
                </div>
              ) : (
                <span>
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mt-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search by customer name... (⌘K)"
            className="max-w-sm"
            showCount={true}
            totalCount={searchStats.totalCount}
            filteredCount={searchStats.resultCount}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white/40 backdrop-blur-sm">
        {/* Empty State */}
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 text-gray-400 mb-6">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              No transactions yet
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first transaction. You'll see
              real-time updates here as they come in.
            </p>
            <a
              href="/add"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Add Your First Transaction
            </a>
          </div>
        ) : filteredTransactions.length === 0 && searchStats.hasActiveSearch ? (
          // No search results
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 text-amber-400 mb-6">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              No transactions match your search
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any transactions matching "{searchQuery.trim()}".
              Try a different search term or clear your search.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Clear Search
              </button>
              <a
                href="/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Transaction
              </a>
            </div>
          </div>
        ) : (
          // Enhanced Transaction Table
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="text-left font-semibold text-gray-900">
                    Date
                  </TableHead>
                  <TableHead className="text-left font-semibold text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900">
                    Currency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => {
                  const isNew = newTransactionIds.has(transaction.id);
                  const isHighlighted = highlightedId === transaction.id;

                  return (
                    <TableRow
                      key={transaction.id}
                      className={cn(
                        "group transition-all duration-500 ease-in-out border-b border-gray-100",
                        isNew &&
                          "bg-green-50/80 border-l-4 border-l-green-400 shadow-sm",
                        isHighlighted &&
                          "bg-green-100/80 scale-[1.01] shadow-md ring-2 ring-green-200",
                        !isNew && !isHighlighted && "hover:bg-gray-50/60",
                        index % 2 === 0 ? "bg-white/20" : "bg-white/40"
                      )}
                    >
                      <TableCell className="relative py-4">
                        {isNew && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg"></div>
                          </div>
                        )}
                        <div
                          className={cn(
                            "transition-all duration-300 text-sm",
                            isNew
                              ? "font-medium text-green-900"
                              : "text-gray-600"
                          )}
                        >
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>

                      <TableCell
                        className={cn(
                          "py-4 transition-all duration-300",
                          isNew
                            ? "text-green-900 font-semibold"
                            : "text-gray-900 font-medium"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span>
                            {searchStats.hasActiveSearch
                              ? highlightMatch(
                                  transaction.customerName,
                                  searchQuery
                                )
                              : transaction.customerName}
                          </span>
                          {isNew && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 animate-pulse">
                              New
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell
                        className={cn(
                          "py-4 text-right transition-all duration-300 font-mono",
                          isNew
                            ? "text-green-900 font-bold"
                            : "text-gray-900 font-semibold"
                        )}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "py-4 text-center transition-all duration-300",
                          isNew ? "text-green-700 font-medium" : "text-gray-500"
                        )}
                      >
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {transaction.currency}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
