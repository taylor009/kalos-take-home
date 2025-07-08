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

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Transactions
              {newTransactionIds.size > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1"></div>
                  Live
                </span>
              )}
            </h3>
            <div className="text-sm text-gray-500">
              {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search by customer name..."
              className="max-w-md"
            />
          </div>
        </div>

        {/* Empty State */}
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h4>
            <p className="text-gray-500 mb-4">
              Get started by creating your first transaction.
            </p>
            <a
              href="/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Your First Transaction
            </a>
          </div>
        ) : filteredTransactions.length === 0 ? (
          // No search results
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h4>
            <p className="text-gray-500">
              Try adjusting your search to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          // Transaction Table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const isNew = newTransactionIds.has(transaction.id);
                const isHighlighted = highlightedId === transaction.id;

                return (
                  <TableRow
                    key={transaction.id}
                    className={cn(
                      "transition-all duration-500 ease-in-out",
                      isNew && "bg-green-50 border-l-4 border-l-green-400",
                      isHighlighted && "bg-green-100 scale-[1.02] shadow-md",
                      !isNew && !isHighlighted && "hover:bg-gray-50"
                    )}
                  >
                    <TableCell className="relative">
                      {isNew && (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "transition-all duration-300",
                          isNew && "font-medium text-green-900"
                        )}
                      >
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-medium transition-all duration-300",
                        isNew && "text-green-900 font-semibold"
                      )}
                    >
                      {transaction.customerName}
                      {isNew && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          New
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "transition-all duration-300",
                        isNew && "text-green-900 font-semibold"
                      )}
                    >
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-gray-500 transition-all duration-300",
                        isNew && "text-green-700"
                      )}
                    >
                      {transaction.currency}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
