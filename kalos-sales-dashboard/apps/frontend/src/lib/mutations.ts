import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "./api";
import { queryKeys } from "./react-query";
import { handleError, showSuccess } from "./error-handling";
import type {
  Transaction,
  CreateTransactionRequest,
  GetTransactionsResponse,
  GetAnalyticsResponse,
} from "@shared";

/**
 * Enhanced mutation hook for creating transactions with optimistic updates
 * This immediately updates the UI before the API call completes
 */
export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,

    // Optimistic update: immediately add to cache before API call
    onMutate: async (newTransaction: CreateTransactionRequest) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions });
      await queryClient.cancelQueries({ queryKey: queryKeys.analytics });

      // Snapshot the previous values for rollback
      const previousTransactions =
        queryClient.getQueryData<GetTransactionsResponse>(
          queryKeys.transactions
        );
      const previousAnalytics = queryClient.getQueryData<GetAnalyticsResponse>(
        queryKeys.analytics
      );

      // Create optimistic transaction with temporary ID
      const optimisticTransaction: Transaction = {
        id: `temp-${Date.now()}`, // Temporary ID
        date: new Date().toISOString(),
        customerName: newTransaction.customerName,
        amount: newTransaction.amount,
        currency: newTransaction.currency,
      };

      // Optimistically update transactions
      if (previousTransactions) {
        const newTransactions = [
          optimisticTransaction,
          ...previousTransactions.transactions,
        ];
        queryClient.setQueryData<GetTransactionsResponse>(
          queryKeys.transactions,
          {
            transactions: newTransactions,
            total: newTransactions.length,
          }
        );
      }

      // Optimistically update analytics
      if (previousAnalytics) {
        const newAnalytics = {
          totalRevenue:
            previousAnalytics.analytics.totalRevenue + newTransaction.amount,
          transactionCount: previousAnalytics.analytics.transactionCount + 1,
          currency: "USD", // Default currency for analytics
        };
        queryClient.setQueryData<GetAnalyticsResponse>(queryKeys.analytics, {
          analytics: newAnalytics,
        });
      }

      // Return context with previous values for rollback
      return { previousTransactions, previousAnalytics, optimisticTransaction };
    },

    // On error: rollback optimistic update and show notification
    onError: (error, newTransaction, context) => {
      // Rollback to previous state
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          queryKeys.transactions,
          context.previousTransactions
        );
      }
      if (context?.previousAnalytics) {
        queryClient.setQueryData(
          queryKeys.analytics,
          context.previousAnalytics
        );
      }

      // Show error notification
      handleError(error, "Failed to create transaction");
    },

    // On success: update with real server data and show notification
    onSuccess: (newTransaction, variables, context) => {
      // Get current data
      const currentTransactions =
        queryClient.getQueryData<GetTransactionsResponse>(
          queryKeys.transactions
        );

      if (currentTransactions && context?.optimisticTransaction) {
        // Replace optimistic transaction with real one
        const updatedTransactions = currentTransactions.transactions.map(
          (transaction) =>
            transaction.id === context.optimisticTransaction.id
              ? newTransaction
              : transaction
        );

        queryClient.setQueryData<GetTransactionsResponse>(
          queryKeys.transactions,
          {
            transactions: updatedTransactions,
            total: updatedTransactions.length,
          }
        );
      }

      // Show success notification
      showSuccess(
        `Transaction for ${variables.customerName} created successfully!`
      );

      // Invalidate to ensure we have the latest analytics from server
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },

    // Always run: cleanup
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

/**
 * Enhanced query invalidation helper
 * Intelligently invalidates related queries
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateTransactions: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
    invalidateAnalytics: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
    refetchAll: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.transactions });
      queryClient.refetchQueries({ queryKey: queryKeys.analytics });
    },
  };
}
